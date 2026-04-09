#!/usr/bin/env node

import { Command } from 'commander';
import { push } from './push.js';
import { pull } from './pull.js';
import { status } from './status.js';
import { clean } from './clean.js';

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

program.parse();
