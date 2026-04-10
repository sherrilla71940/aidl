import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { findRepoRoot } from './paths.js';

export interface CamConfig {
  lang: string;
  syncMode: SyncMode;
}

export type SyncMode = 'both' | 'push-only' | 'pull-only' | 'none';

const SUPPORTED_LANGS = ['en', 'zh-TW'];
const SUPPORTED_SYNC_MODES: SyncMode[] = ['both', 'push-only', 'pull-only', 'none'];

function configPath(): string {
  return join(findRepoRoot(), '.cam-config.json');
}

export function readConfig(): CamConfig {
  const p = configPath();
  if (!existsSync(p)) return { lang: 'en', syncMode: 'both' };
  try {
    const raw = readFileSync(p, 'utf-8').replace(/^\uFEFF/, '');
    const data = JSON.parse(raw);
    return {
      lang: SUPPORTED_LANGS.includes(data.lang) ? data.lang : 'en',
      syncMode: SUPPORTED_SYNC_MODES.includes(data.syncMode) ? data.syncMode : 'both',
    };
  } catch {
    return { lang: 'en', syncMode: 'both' };
  }
}

export function writeConfig(config: CamConfig): void {
  writeFileSync(configPath(), JSON.stringify(config, null, 2) + '\n');
}

export function isValidLang(lang: string): boolean {
  return SUPPORTED_LANGS.includes(lang);
}

export function isValidSyncMode(mode: string): mode is SyncMode {
  return (SUPPORTED_SYNC_MODES as string[]).includes(mode);
}

export { SUPPORTED_LANGS, SUPPORTED_SYNC_MODES };
