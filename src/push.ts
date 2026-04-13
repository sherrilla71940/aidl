import { join, relative, dirname } from 'node:path';
import { mkdirSync, copyFileSync, symlinkSync, unlinkSync, readFileSync } from 'node:fs';
import chalk from 'chalk';
import { isWindows, getSyncRoots, findRepoRoot, mapToTarget } from './paths.js';
import { readManifest, writeManifest, hasTarget, addEntry, removeByTarget } from './manifest.js';
import { walk, shouldSkip, pathExists, findAbsoluteMarkdownLinkTargets, ask } from './util.js';
import { readConfig } from './config.js';
import { t } from './i18n/index.js';

export type CleanupMode = 'report' | 'ask' | 'delete';

function getSyncRelative(syncDir: string, path: string): string {
  const syncPrefix = `${syncDir.replace(/\\/g, '/')}/`;
  const normalized = path.replace(/\\/g, '/');
  return normalized.startsWith(syncPrefix) ? normalized.slice(syncPrefix.length) : normalized;
}

export async function push(options: { yes: boolean; cleanup: CleanupMode }): Promise<void> {
  const config = readConfig();
  if (config.syncMode === 'pull-only' || config.syncMode === 'none') {
    console.log(chalk.yellow(t().syncModeDisabled('push', config.syncMode)));
    return;
  }

  const repoRoot = findRepoRoot();
  const syncDir = join(repoRoot, 'sync');
  const manifestPath = join(repoRoot, '.sync-manifest.json');
  const roots = getSyncRoots();
  const manifest = readManifest(manifestPath);

  const strategy: 'symlink' | 'copy' = isWindows ? 'copy' : 'symlink';
  const strategyLabel = isWindows ? 'copied' : 'linked';

  console.log(chalk.green(t().pushHeading(`${roots.vscodeUserDir} + ${roots.copilotUserDir}`)));

  const files = await walk(syncDir);
  let linked = 0;
  let skipped = 0;

  for (const file of files) {
    const rel = relative(syncDir, file).replace(/\\/g, '/');
    if (shouldSkip(rel)) continue;

    const absoluteLinkTargets = findAbsoluteMarkdownLinkTargets(readFileSync(file, 'utf-8'));
    for (const absoluteLinkTarget of absoluteLinkTargets) {
      console.log(chalk.yellow(t().pushAbsolutePathWarning(rel, absoluteLinkTarget)));
    }

    const target = mapToTarget(rel, roots);
    if (!target) continue;

    mkdirSync(dirname(target), { recursive: true });

    if (pathExists(target)) {
      if (hasTarget(manifest, target)) {
        unlinkSync(target);
      } else {
        // If content matches, adopt the target into the manifest instead of skipping
        const srcContent = readFileSync(file, 'utf-8');
        let tgtContent: string | null = null;
        try { tgtContent = readFileSync(target, 'utf-8'); } catch { /* unreadable */ }
        if (tgtContent !== null && srcContent === tgtContent) {
          addEntry(manifest, { source: file, target, strategy, timestamp: new Date().toISOString() });
          console.log(chalk.green(t().pushAdopted(rel)));
          linked++;
          continue;
        }
        console.log(chalk.yellow(t().pushSkipNotManaged(rel)));
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

    const actionMsg = isWindows ? t().pushCopied(rel, target) : t().pushLinked(rel, target);
    console.log(chalk.green(actionMsg));
    linked++;
  }

  console.log('');
  console.log(chalk.green(t().pushComplete(linked, strategyLabel, skipped)));

  const effectiveCleanup = options.yes && options.cleanup === 'ask' ? 'report' : options.cleanup;
  const staleEntries = manifest.synced.filter(entry => !pathExists(entry.source));
  if (staleEntries.length > 0) {
    console.log('');
    console.log(chalk.yellow(t().pushStaleHeading(staleEntries.length)));
    for (const entry of staleEntries) {
      const rel = getSyncRelative(syncDir, entry.source);
      console.log(chalk.yellow(t().pushStaleEntry(rel, entry.target)));

      let shouldDelete = effectiveCleanup === 'delete';
      if (effectiveCleanup === 'ask') {
        const answer = await ask(t().pushStalePrompt(rel));
        shouldDelete = /^[yY]$/.test(answer);
      }

      if (shouldDelete) {
        if (pathExists(entry.target)) {
          try {
            unlinkSync(entry.target);
          } catch { /* target already gone */ }
        }
        removeByTarget(manifest, entry.target);
        console.log(chalk.green(t().pushStaleDeleted(rel)));
      } else if (effectiveCleanup === 'ask') {
        console.log(chalk.green(t().pushStaleKept(rel)));
      }
    }
  }

  writeManifest(manifestPath, manifest);
}
