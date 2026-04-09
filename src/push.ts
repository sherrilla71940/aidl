import { join, relative, dirname } from 'node:path';
import { mkdirSync, copyFileSync, symlinkSync, unlinkSync } from 'node:fs';
import chalk from 'chalk';
import { isWindows, getVscodeUserDir, findRepoRoot, mapToTarget } from './paths.js';
import { readManifest, writeManifest, hasTarget, addEntry } from './manifest.js';
import { walk, shouldSkip, pathExists } from './util.js';

export async function push(options: { yes: boolean }): Promise<void> {
  const repoRoot = findRepoRoot();
  const syncDir = join(repoRoot, 'sync');
  const manifestPath = join(repoRoot, '.sync-manifest.json');
  const vscodeDir = getVscodeUserDir();
  const manifest = readManifest(manifestPath);

  const strategy: 'symlink' | 'copy' = isWindows ? 'copy' : 'symlink';
  const actionLabel = isWindows ? 'Copied' : 'Linked';

  console.log(chalk.green(`Pushing sync/ → ${vscodeDir}`));

  const files = await walk(syncDir);
  let linked = 0;
  let skipped = 0;

  for (const file of files) {
    const rel = relative(syncDir, file).replace(/\\/g, '/');
    if (shouldSkip(rel)) continue;

    const target = mapToTarget(rel, vscodeDir);
    if (!target) continue;

    mkdirSync(dirname(target), { recursive: true });

    if (pathExists(target)) {
      if (hasTarget(manifest, target)) {
        unlinkSync(target);
      } else {
        console.log(chalk.yellow(`SKIP ${rel} — exists at target but not managed by cam`));
        skipped++;
        continue;
      }
    }

    if (isWindows) {
      copyFileSync(file, target);
    } else {
      symlinkSync(file, target);
    }

    addEntry(manifest, {
      source: file,
      target,
      strategy,
      timestamp: new Date().toISOString(),
    });

    console.log(chalk.green(`  ${actionLabel}: ${rel} → ${target}`));
    linked++;
  }

  console.log('');
  console.log(chalk.green(`Push complete: ${linked} ${isWindows ? 'copied' : 'linked'}, ${skipped} skipped.`));

  if (!manifest.agent_notice_shown) {
    console.log('');
    console.log(chalk.yellow('ACTION REQUIRED: Add to your VS Code settings.json:'));
    console.log(chalk.yellow(`  "chat.agentFilesLocations": ["${syncDir.replace(/\\/g, '/')}/agents"]`));
    manifest.agent_notice_shown = true;
  }

  writeManifest(manifestPath, manifest);
}
