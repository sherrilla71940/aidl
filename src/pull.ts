import { join, relative, dirname } from 'node:path';
import { existsSync, mkdirSync, copyFileSync, readFileSync, readlinkSync, unlinkSync } from 'node:fs';
import chalk from 'chalk';
import { getSyncRoots, getPullSourceDirs, findRepoRoot, normalizePath } from './paths.js';
import { readManifest, writeManifest, addEntry, removeBySource } from './manifest.js';
import { walk, shouldSkip, ask } from './util.js';
import { readConfig } from './config.js';
import { t } from './i18n/index.js';

export type PullDestination = 'sync' | 'local';
export type CleanupMode = 'report' | 'ask' | 'delete';

function isSymlinkIntoSync(file: string, syncDir: string): boolean {
  try {
    const target = readlinkSync(file);
    return normalizePath(target).startsWith(normalizePath(syncDir));
  } catch {
    return false;
  }
}

function filesMatch(a: string, b: string): boolean {
  try {
    return readFileSync(a, 'utf-8') === readFileSync(b, 'utf-8');
  } catch {
    return false;
  }
}

export async function pull(options: { yes: boolean; destination: PullDestination; cleanup: CleanupMode }): Promise<void> {
  const config = readConfig();
  if (config.syncMode === 'push-only' || config.syncMode === 'none') {
    console.log(chalk.yellow(t().syncModeDisabled('pull', config.syncMode)));
    return;
  }

  const repoRoot = findRepoRoot();
  const syncDir = join(repoRoot, 'sync');
  const importDir = join(repoRoot, options.destination);
  const manifestPath = join(repoRoot, '.sync-manifest.json');
  const roots = getSyncRoots();
  const manifest = options.destination === 'sync' ? readManifest(manifestPath) : null;

  console.log(chalk.green(t().pullScanning(options.destination)));

  const candidates: Array<{ file: string; rel: string }> = [];

  for (const { subdir, dir: srcDir } of getPullSourceDirs(roots)) {
    if (!existsSync(srcDir)) continue;

    const files = await walk(srcDir);
    for (const file of files) {
      const rel = `${subdir}/${relative(srcDir, file).replace(/\\/g, '/')}`;
      if (shouldSkip(rel)) continue;
      if (isSymlinkIntoSync(file, syncDir)) continue;

      const dest = join(importDir, rel);

      if (existsSync(dest)) {
        if (filesMatch(file, dest)) continue;

        if (options.yes) {
          console.log(chalk.yellow(t().pullSkipDiffers(rel)));
          continue;
        }

        console.log('');
        console.log(chalk.yellow(t().pullConflict(rel)));
        const choice = await ask(t().pullConflictPrompt);
        switch (choice.toLowerCase()) {
          case 'v':
            copyFileSync(file, dest);
            console.log(chalk.green(t().pullUpdated(rel)));
            break;
          case 'k':
            console.log(chalk.green(t().pullKept(rel)));
            break;
          default:
            console.log(t().pullSkipped(rel));
        }
        continue;
      }

      candidates.push({ file, rel });
    }
  }

  if (manifest) {
    const effectiveCleanup = options.yes && options.cleanup === 'ask' ? 'report' : options.cleanup;
    const staleEntries = manifest.synced.filter(entry => existsSync(entry.source) && !existsSync(entry.target));
    if (staleEntries.length > 0) {
      console.log('');
      console.log(chalk.yellow(t().pullStaleHeading(staleEntries.length, options.destination)));
      for (const entry of staleEntries) {
        const rel = relative(importDir, entry.source).replace(/\\/g, '/');
        console.log(chalk.yellow(t().pullStaleEntry(rel, entry.target)));

        let shouldDelete = effectiveCleanup === 'delete';
        if (effectiveCleanup === 'ask') {
          const answer = await ask(t().pullStalePrompt(rel));
          shouldDelete = /^[yY]$/.test(answer);
        }

        if (shouldDelete) {
          try {
            unlinkSync(entry.source);
          } catch { /* source already gone */ }
          removeBySource(manifest, entry.source);
          console.log(chalk.green(t().pullStaleDeleted(rel)));
        } else if (effectiveCleanup === 'ask') {
          console.log(chalk.green(t().pullStaleKept(rel)));
        }
      }
    }
  }

  if (candidates.length === 0) {
    if (manifest) {
      writeManifest(manifestPath, manifest);
    }
    console.log(chalk.green(t().pullNothingNew));
    return;
  }

  console.log('');
  console.log(chalk.green(t().pullFound(candidates.length, options.destination)));
  candidates.forEach((candidate, i) => {
    console.log(`  ${i + 1}. ${candidate.rel}`);
  });

  let toImport: Array<{ file: string; rel: string }>;

  if (options.yes) {
    toImport = candidates;
  } else {
    console.log('');
    const answer = await ask(t().pullImportPrompt(options.destination));
    if (/^[yY]$/.test(answer)) {
      toImport = candidates;
    } else if (/^[\d\s]+$/.test(answer)) {
      toImport = answer
        .split(/\s+/)
        .map(Number)
        .filter(n => n >= 1 && n <= candidates.length)
        .map(n => candidates[n - 1]);
    } else {
      console.log(chalk.green(t().pullNothingImported));
      return;
    }
  }

  let imported = 0;
  for (const { file, rel } of toImport) {
    const dest = join(importDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(file, dest);

    if (manifest) {
      addEntry(manifest, {
        source: dest,
        target: file,
        strategy: 'copy',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(chalk.green(t().pullImported(rel, options.destination)));
    imported++;
  }

  if (manifest) {
    writeManifest(manifestPath, manifest);
  }
  console.log('');
  console.log(chalk.green(t().pullComplete(imported, options.destination)));
}
