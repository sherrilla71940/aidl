import { join, relative, dirname } from 'node:path';
import { existsSync, mkdirSync, copyFileSync, readFileSync, readlinkSync } from 'node:fs';
import chalk from 'chalk';
import { getVscodeUserDir, findRepoRoot, normalizePath } from './paths.js';
import { readManifest, writeManifest, addEntry } from './manifest.js';
import { walk, shouldSkip, ask } from './util.js';

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

  console.log(chalk.green('Scanning VS Code config for untracked files...'));

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
          console.log(chalk.yellow(`SKIP ${rel} — content differs (repo copy kept)`));
          continue;
        }

        console.log('');
        console.log(chalk.yellow(`CONFLICT: ${rel}`));
        const choice = await ask('  Keep repo version (k), use VS Code version (v), skip (s)? [k/v/s] ');
        switch (choice.toLowerCase()) {
          case 'v':
            copyFileSync(file, dest);
            console.log(chalk.green(`  Updated: ${rel} (VS Code version accepted)`));
            break;
          case 'k':
            console.log(chalk.green(`  Kept: ${rel} (repo version kept)`));
            break;
          default:
            console.log(`  Skipped: ${rel}`);
        }
        continue;
      }

      candidates.push(file);
    }
  }

  if (candidates.length === 0) {
    console.log(chalk.green('Nothing new to import.'));
    return;
  }

  console.log('');
  console.log(chalk.green(`Found ${candidates.length} untracked file(s):`));
  candidates.forEach((f, i) => {
    console.log(`  ${i + 1}. ${relative(vscodeDir, f).replace(/\\/g, '/')}`);
  });

  let toImport: string[];

  if (options.yes) {
    toImport = candidates;
  } else {
    console.log('');
    const answer = await ask('Import all? [y/N] or enter numbers (e.g. 1 3): ');
    if (/^[yY]$/.test(answer)) {
      toImport = candidates;
    } else if (/^[\d\s]+$/.test(answer)) {
      toImport = answer
        .split(/\s+/)
        .map(Number)
        .filter(n => n >= 1 && n <= candidates.length)
        .map(n => candidates[n - 1]);
    } else {
      console.log(chalk.green('Nothing imported.'));
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

    console.log(chalk.green(`  Imported: ${rel} → sync/${rel}`));
    imported++;
  }

  writeManifest(manifestPath, manifest);
  console.log('');
  console.log(chalk.green(`Pull complete: ${imported} imported.`));
}
