#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';
import chalk from 'chalk';
import { push } from './push.js';
import { pull } from './pull.js';
import { status } from './status.js';
import { clean } from './clean.js';
import { translate } from './translate.js';
import { init } from './init.js';
import { readConfig, writeConfig, isValidLang, SUPPORTED_LANGS } from './config.js';
import { t, resetLocaleCache } from './i18n/index.js';
import { ask } from './util.js';
import type { PullDestination } from './pull.js';

type CleanupMode = 'report' | 'ask' | 'delete';

const program = new Command();

function parsePullDestination(value: string): PullDestination {
  if (value === 'local' || value === 'sync') {
    return value;
  }

  throw new InvalidArgumentError('Pull destination must be "local" or "sync".');
}

function parseCleanupMode(value: string): CleanupMode {
  if (value === 'report' || value === 'ask' || value === 'delete') {
    return value;
  }

  throw new InvalidArgumentError('Cleanup mode must be "report", "ask", or "delete".');
}

program
  .name('cam')
  .description('Git-backed Copilot assets with optional bidirectional VS Code sync')
  .version('0.1.0');

program
  .command('push')
  .description('Sync sync/ files to VS Code user config')
  .option('--yes', 'Skip confirmation prompts')
  .option('--cleanup <mode>', 'Handle stale user-level files: report, ask, or delete', parseCleanupMode, 'report')
  .action((opts) => push({ yes: opts.yes ?? false, cleanup: opts.cleanup }));

program
  .command('pull')
  .description('Import untracked VS Code files into sync/ or local/ (default: sync/)')
  .argument('[destination]', 'Import destination: sync or local', parsePullDestination, 'sync')
  .option('--yes', 'Import all without prompting')
  .option('--cleanup <mode>', 'Handle stale repo files when destination is sync: report, ask, or delete', parseCleanupMode, 'report')
  .action((destination: PullDestination, opts) => pull({ yes: opts.yes ?? false, destination, cleanup: opts.cleanup }));

program
  .command('status')
  .description('Show synced, new, and orphaned files')
  .action(() => status());

program
  .command('clean')
  .description('Remove orphaned synced files and update manifest')
  .action(() => clean());

program
  .command('translate <file>')
  .description('Detect language and show translation target path')
  .action((file: string) => translate(file));

program
  .command('init')
  .description('Initialize language and sync preferences')
  .action(() => init());

const configCmd = program
  .command('config')
  .description('View or update cam settings');

configCmd
  .command('lang [locale]')
  .description(`Set CLI language (${SUPPORTED_LANGS.join(', ')})`)
  .action(async (locale?: string) => {
    const config = readConfig();

    if (!locale) {
      // Interactive: prompt user to pick
      const answer = await ask(t().langPrompt);
      const picked = answer.trim();

      if (!isValidLang(picked)) {
        console.log(t().configUsage);
        return;
      }
      config.lang = picked;
      writeConfig(config);
      resetLocaleCache();
      console.log(chalk.green(t().langSet(picked)));
      return;
    }

    if (!isValidLang(locale)) {
      console.log(t().configUsage);
      return;
    }

    config.lang = locale;
    writeConfig(config);
    resetLocaleCache();
    console.log(chalk.green(t().langSet(locale)));
  });

configCmd
  .command('show')
  .description('Show current config')
  .action(() => {
    const config = readConfig();
    console.log(t().langCurrent(config.lang));
    console.log(t().syncModeCurrent(config.syncMode));
  });

program.parse();
