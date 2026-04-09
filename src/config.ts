import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface CamConfig {
  lang: string;
}

const SUPPORTED_LANGS = ['en', 'zh-TW'];

function configPath(): string {
  // Walk up to find repo root (sync/ dir), same logic as paths.ts but avoids circular import
  let dir = process.cwd();
  while (true) {
    if (existsSync(join(dir, 'sync'))) {
      return join(dir, '.cam-config.json');
    }
    const parent = join(dir, '..');
    if (parent === dir) return join(process.cwd(), '.cam-config.json');
    dir = parent;
  }
}

export function readConfig(): CamConfig {
  const p = configPath();
  if (!existsSync(p)) return { lang: 'en' };
  try {
    const raw = readFileSync(p, 'utf-8').replace(/^\uFEFF/, '');
    const data = JSON.parse(raw);
    return { lang: SUPPORTED_LANGS.includes(data.lang) ? data.lang : 'en' };
  } catch {
    return { lang: 'en' };
  }
}

export function writeConfig(config: CamConfig): void {
  writeFileSync(configPath(), JSON.stringify(config, null, 2) + '\n');
}

export function isValidLang(lang: string): boolean {
  return SUPPORTED_LANGS.includes(lang);
}

export { SUPPORTED_LANGS };
