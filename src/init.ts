import chalk from 'chalk';
import { readConfig, writeConfig, isValidLang, isValidSyncMode } from './config.js';
import type { SyncMode } from './config.js';
import { t, resetLocaleCache } from './i18n/index.js';
import { ask } from './util.js';

export async function init(): Promise<void> {
  const config = readConfig();

  console.log('');
  console.log(chalk.green(t().initHeading));
  console.log('');

  // Language preference
  console.log(t().initLangCurrent(config.lang));
  const langAnswer = await ask(t().initLangPrompt);
  const langPicked = langAnswer.trim();
  if (langPicked && isValidLang(langPicked)) {
    config.lang = langPicked;
    resetLocaleCache();
  }

  // Sync mode preference
  console.log('');
  console.log(t().initSyncModeOptions);
  console.log('  1. both       — push and pull enabled');
  console.log('  2. push-only  — only push (repo → VS Code)');
  console.log('  3. pull-only  — only pull (VS Code → repo)');
  console.log('  4. none       — no sync (organize only)');
  console.log('');
  console.log(t().initSyncModeCurrent(config.syncMode));
  const modeAnswer = await ask(t().initSyncModePrompt);
  const modePicked = modeAnswer.trim();

  const modeMap: Record<string, SyncMode> = {
    '1': 'both', '2': 'push-only', '3': 'pull-only', '4': 'none',
    'both': 'both', 'push-only': 'push-only', 'pull-only': 'pull-only', 'none': 'none',
  };

  if (modePicked && (modePicked in modeMap)) {
    config.syncMode = modeMap[modePicked];
  } else if (modePicked && isValidSyncMode(modePicked)) {
    config.syncMode = modePicked;
  }

  writeConfig(config);
  console.log('');
  console.log(chalk.green(t().initComplete(config.lang, config.syncMode)));
}
