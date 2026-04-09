import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import chalk from 'chalk';
import { findRepoRoot } from './paths.js';
import { readManifest, writeManifest } from './manifest.js';
import { pathExists } from './util.js';

export async function clean(): Promise<void> {
  const repoRoot = findRepoRoot();
  const manifestPath = join(repoRoot, '.sync-manifest.json');
  const manifest = readManifest(manifestPath);
  let removed = 0;

  console.log(chalk.green('Cleaning orphaned entries...'));

  manifest.synced = manifest.synced.filter(entry => {
    if (existsSync(entry.source)) return true;

    console.log(chalk.yellow(`  Removing orphaned: ${entry.target}`));
    if (pathExists(entry.target)) {
      try {
        unlinkSync(entry.target);
      } catch { /* target already gone */ }
    }
    removed++;
    return false;
  });

  writeManifest(manifestPath, manifest);
  console.log(chalk.green(`Clean complete: ${removed} orphaned ${removed === 1 ? 'entry' : 'entries'} removed.`));
}
