import { join, relative, dirname } from 'node:path';
import { existsSync, mkdirSync, copyFileSync, readFileSync, readlinkSync } from 'node:fs';
import chalk from 'chalk';
import { getVscodeUserDir, findRepoRoot, normalizePath } from './paths.js';
import { readManifest, writeManifest, addEntry } from './manifest.js';
import { walk, shouldSkip, ask } from './util.js';
import { t } from './i18n/index.js';

const PULL_SUBDIRS = ['prompts', 'skills', 'instructions', 'hooks'];

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

export async function pull(options: { yes: boolean }): Promise<void> {
  const repoRoot = findRepoRoot();
  const syncDir = join(repoRoot, 'sync');
  const manifestPath = join(repoRoot, '.sync-manifest.json');
  const vscodeDir = getVscodeUserDir();
  const manifest = readManifest(manifestPath);

  console.log(chalk.green(t().pullScanning));

  const candidates: string[] = [];

  for (const subdir of PULL_SUBDIRS) {
    const srcDir = join(vscodeDir, subdir);
    if (!existsSync(srcDir)) continue;

    const files = await walk(srcDir);
    for (const file of files) {
      const rel = relative(vscodeDir, file).replace(/\\/g, '/');
      if (shouldSkip(rel)) continue;
      if (isSymlinkIntoSync(file, syncDir)) continue;

      const dest = join(syncDir, rel);

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

      candidates.push(file);
    }
  }

  if (candidates.length === 0) {
    console.log(chalk.green(t().pullNothingNew));
    return;
  }

  console.log('');
  console.log(chalk.green(t().pullFound(candidates.length)));
  candidates.forEach((f, i) => {
    console.log(`  ${i + 1}. ${relative(vscodeDir, f).replace(/\\/g, '/')}`);
  });

  let toImport: string[];

  if (options.yes) {
    toImport = candidates;
  } else {
    console.log('');
    const answer = await ask(t().pullImportPrompt);
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
  for (const file of toImport) {
    const rel = relative(vscodeDir, file).replace(/\\/g, '/');
    const dest = join(syncDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(file, dest);

    addEntry(manifest, {
      source: dest,
      target: file,
      strategy: 'copy',
      timestamp: new Date().toISOString(),
    });

    console.log(chalk.green(t().pullImported(rel)));
    imported++;
  }

  writeManifest(manifestPath, manifest);
  console.log('');
  console.log(chalk.green(t().pullComplete(imported)));
}
