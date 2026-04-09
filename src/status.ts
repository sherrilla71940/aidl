import { join, relative } from 'node:path';
import { existsSync } from 'node:fs';
import chalk from 'chalk';
import { getVscodeUserDir, findRepoRoot, normalizePath } from './paths.js';
import { readManifest, hasSource } from './manifest.js';
import { walk, shouldSkip, pathExists } from './util.js';

export async function status(): Promise<void> {
  const repoRoot = findRepoRoot();
  const syncDir = join(repoRoot, 'sync');
  const manifestPath = join(repoRoot, '.sync-manifest.json');
  const manifest = readManifest(manifestPath);

  console.log('');
  console.log(chalk.green('=== copilot-asset-manager sync status ==='));
  console.log('');

  console.log(`Synced (${manifest.synced.length}):`);
  for (const entry of manifest.synced) {
    const srcExists = existsSync(entry.source);
    const tgtExists = pathExists(entry.target);
    const label = srcExists && tgtExists ? 'OK' : 'ORPHANED';
    const syncNorm = normalizePath(syncDir);
    const srcNorm = normalizePath(entry.source);
    const display = srcNorm.startsWith(syncNorm + '/')
      ? entry.source.replace(/\\/g, '/').slice(syncDir.replace(/\\/g, '/').length + 1)
      : entry.source;
    console.log(`  [${label}] ${display}`);
  }

  console.log('');

  const files = await walk(syncDir);
  const newFiles: string[] = [];
  for (const f of files) {
    const rel = relative(syncDir, f).replace(/\\/g, '/');
    if (shouldSkip(rel)) continue;
    if (!hasSource(manifest, f)) {
      newFiles.push(rel);
    }
  }

  if (newFiles.length > 0) {
    console.log('New (not yet synced to VS Code):');
    for (const f of newFiles) {
      console.log(`  [NEW] ${f}`);
    }
    console.log('');
    console.log(chalk.green('Run cam push to sync new files.'));
  }
}
