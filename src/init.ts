import chalk from 'chalk';
import { execFileSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig, writeConfig, isValidLang, isValidSyncMode } from './config.js';
import type { SyncMode } from './config.js';
import { t, resetLocaleCache } from './i18n/index.js';
import { ask, pathExists } from './util.js';

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
  console.log(t().initSyncModeList);
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

  // Activate tracked git hooks
  const hookScript = join('.github', 'hooks', 'pre-commit');
  try {
    execFileSync('git', ['config', 'core.hooksPath', '.github/hooks'], { stdio: 'ignore' });
    if (pathExists(hookScript)) {
      chmodSync(hookScript, 0o755);
    }
    console.log(chalk.green(t().initHooksActivated));
  } catch {
    console.log(chalk.yellow(t().initHooksFailed));
  }

  console.log('');
  console.log(chalk.green(t().initComplete(config.lang, config.syncMode)));
}
