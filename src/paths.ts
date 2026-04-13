import { homedir, platform } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

export const isWindows = platform() === 'win32';

export interface SyncRoots {
  vscodeUserDir: string;
  copilotUserDir: string;
}

const SYNC_SUBDIRS = ['prompts', 'skills', 'instructions', 'hooks', 'agents'] as const;
type SyncSubdir = typeof SYNC_SUBDIRS[number];

export function getVscodeUserDir(): string {
  if (isWindows) {
    const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'Code', 'User');
  }
  if (platform() === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Code', 'User');
  }
  const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
  return join(configHome, 'Code', 'User');
}

export function getCopilotUserDir(): string {
  return join(homedir(), '.copilot');
}

export function getSyncRoots(): SyncRoots {
  return {
    vscodeUserDir: getVscodeUserDir(),
    copilotUserDir: getCopilotUserDir(),
  };
}

export function findRepoRoot(from: string = process.cwd()): string {
  let dir = resolve(from);
  while (true) {
    if (existsSync(join(dir, 'sync'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      console.error('Not inside a copilot-asset-manager repo. Run cam from anywhere inside the repo.');
      process.exit(1);
    }
    dir = parent;
  }
}

export function normalizePath(p: string): string {
  const normalized = p.replace(/\\/g, '/');
  return isWindows ? normalized.toLowerCase() : normalized;
}

function isSyncSubdir(value: string): value is SyncSubdir {
  return (SYNC_SUBDIRS as readonly string[]).includes(value);
}

export function mapToTarget(relPath: string, roots: SyncRoots): string | null {
  const topDir = relPath.split('/')[0];
  if (!isSyncSubdir(topDir)) return null;
  const baseDir = topDir === 'prompts' ? roots.vscodeUserDir : roots.copilotUserDir;
  return join(baseDir, relPath);
}

export function getPullSourceDirs(roots: SyncRoots): Array<{ subdir: SyncSubdir; dir: string }> {
  return SYNC_SUBDIRS.map(subdir => ({
    subdir,
    dir: join(subdir === 'prompts' ? roots.vscodeUserDir : roots.copilotUserDir, subdir),
  }));
}
