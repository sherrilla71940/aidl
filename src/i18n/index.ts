import { en, type Locale } from './en.js';
import { zhTW } from './zh-TW.js';
import { readConfig } from '../config.js';

const locales: Record<string, Locale> = {
  en,
  'zh-TW': zhTW,
};

let cached: Locale | null = null;

export function t(): Locale {
  if (cached) return cached;
  const config = readConfig();
  cached = locales[config.lang] ?? en;
  return cached;
}

export function resetLocaleCache(): void {
  cached = null;
}

export type { Locale };
