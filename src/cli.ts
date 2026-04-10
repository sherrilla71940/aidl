#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { push } from './push.js';
import { pull } from './pull.js';
import { status } from './status.js';
import { clean } from './clean.js';
import { translate } from './translate.js';
import { readConfig, writeConfig, isValidLang, SUPPORTED_LANGS } from './config.js';
import { t, resetLocaleCache } from './i18n/index.js';
import { ask } from './util.js';

const program = new Command();

program
  .name('cam')
  .description('Git-backed Copilot assets with bidirectional VS Code sync')
  .version('0.1.0');

program
  .command('push')
  .description('Sync sync/ files to VS Code user config')
  .option('--yes', 'Skip confirmation prompts')
  .action((opts) => push({ yes: opts.yes ?? false }));

program
  .command('pull')
  .description('Import untracked VS Code files into sync/')
  .option('--yes', 'Import all without prompting')
  .action((opts) => pull({ yes: opts.yes ?? false }));

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
  });

program.parse();
