import { join, relative, dirname } from 'node:path';
import { mkdirSync, copyFileSync, symlinkSync, unlinkSync, readFileSync } from 'node:fs';
import chalk from 'chalk';
import { isWindows, getSyncRoots, findRepoRoot, mapToTarget, normalizePath } from './paths.js';
import { readManifest, writeManifest, hasTarget, addEntry, removeByTarget } from './manifest.js';
import { walk, shouldSkip, pathExists, findAbsoluteMarkdownLinkTargets, ask } from './util.js';
import { readConfig } from './config.js';
import { t } from './i18n/index.js';
import type { Manifest, SyncEntry } from './manifest.js';

export type CleanupMode = 'report' | 'ask' | 'delete';

function getSyncRelative(syncDir: string, path: string): string {
  const syncPrefix = `${syncDir.replace(/\\/g, '/')}/`;
  const normalized = path.replace(/\\/g, '/');
  return normalized.startsWith(syncPrefix) ? normalized.slice(syncPrefix.length) : normalized;
}

function pruneLegacyTargetsForSource(manifest: Manifest, source: string, target: string): void {
  const normalizedSource = normalizePath(source);
  const normalizedTarget = normalizePath(target);
  const legacyEntries = manifest.synced.filter(entry => (
    normalizePath(entry.source) === normalizedSource && normalizePath(entry.target) !== normalizedTarget
  ));

  for (const entry of legacyEntries) {
    if (pathExists(entry.target)) {
      try {
        unlinkSync(entry.target);
      } catch {
        // ignore missing or already-removed legacy targets
      }
    }
    removeByTarget(manifest, entry.target);
  }
}

function groupStaleEntriesBySource(syncDir: string, entries: SyncEntry[]): Array<{ source: string; rel: string; entries: SyncEntry[] }> {
  const groups = new Map<string, { source: string; rel: string; entries: SyncEntry[] }>();

  for (const entry of entries) {
    const key = normalizePath(entry.source);
    const existing = groups.get(key);
    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    groups.set(key, {
      source: entry.source,
      rel: getSyncRelative(syncDir, entry.source),
      entries: [entry],
    });
  }

  return Array.from(groups.values());
}

function deleteStaleEntryGroup(manifest: Manifest, group: { entries: SyncEntry[] }): void {
  for (const entry of group.entries) {
    if (pathExists(entry.target)) {
      try {
        unlinkSync(entry.target);
      } catch {
        // target already gone
      }
    }
    removeByTarget(manifest, entry.target);
  }
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

    pruneLegacyTargetsForSource(manifest, file, target);

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
  const staleEntryGroups = groupStaleEntriesBySource(syncDir, manifest.synced.filter(entry => !pathExists(entry.source)));
  if (staleEntryGroups.length > 0) {
    console.log('');
    console.log(chalk.yellow(t().pushStaleHeading(staleEntryGroups.length)));
    if (effectiveCleanup === 'ask') {
      const decisions: Array<{ group: typeof staleEntryGroups[number]; shouldDelete: boolean }> = [];

      for (const group of staleEntryGroups) {
        for (const entry of group.entries) {
          console.log(chalk.yellow(t().pushStaleEntry(group.rel, entry.target)));
        }

        const answer = await ask(t().pushStalePrompt(group.rel));
        decisions.push({ group, shouldDelete: /^[yY]$/.test(answer) });
      }

      for (const decision of decisions) {
        if (decision.shouldDelete) {
          deleteStaleEntryGroup(manifest, decision.group);
          console.log(chalk.green(t().pushStaleDeleted(decision.group.rel)));
        } else {
          console.log(chalk.green(t().pushStaleKept(decision.group.rel)));
        }
      }
    } else {
      for (const group of staleEntryGroups) {
        for (const entry of group.entries) {
          console.log(chalk.yellow(t().pushStaleEntry(group.rel, entry.target)));
        }

        if (effectiveCleanup === 'delete') {
          deleteStaleEntryGroup(manifest, group);
          console.log(chalk.green(t().pushStaleDeleted(group.rel)));
        }
      }
    }
  }

  writeManifest(manifestPath, manifest);
}
