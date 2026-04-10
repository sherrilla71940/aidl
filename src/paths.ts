import { homedir, platform } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

export const isWindows = platform() === 'win32';

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

export function findRepoRoot(from: string = process.cwd()): string {
  let dir = resolve(from);
  while (true) {
    if (existsSync(join(dir, 'sync'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      console.error('Not inside a copilot-asset-manager repo. Terminal commands must be run from inside the repo directory.');
      process.exit(1);
    }
    dir = parent;
  }
}

export function normalizePath(p: string): string {
  const normalized = p.replace(/\\/g, '/');
  return isWindows ? normalized.toLowerCase() : normalized;
}

const SYNC_SUBDIRS = new Set(['prompts', 'skills', 'instructions', 'hooks']);

export function mapToTarget(relPath: string, vscodeDir: string): string | null {
  const topDir = relPath.split('/')[0];
  if (!SYNC_SUBDIRS.has(topDir)) return null;
  return join(vscodeDir, relPath);
}
