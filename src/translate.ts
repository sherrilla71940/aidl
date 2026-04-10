import { resolve, basename, dirname, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import chalk from 'chalk';
import { t } from './i18n/index.js';

interface TranslateInfo {
  source: string;
  target: string;
  direction: 'en→zh-TW' | 'zh-TW→en';
}

function resolveTranslatePaths(filePath: string): TranslateInfo {
  const abs = resolve(filePath);
  const dir = dirname(abs);
  const name = basename(abs);

  if (name.includes('.zh-TW.')) {
    // zh-TW → en: README.zh-TW.md → README.md
    const enName = name.replace('.zh-TW.', '.');
    return { source: abs, target: join(dir, enName), direction: 'zh-TW→en' };
  }

  // en → zh-TW: README.md → README.zh-TW.md
  const dotIdx = name.lastIndexOf('.');
  const zhName = dotIdx > 0
    ? name.slice(0, dotIdx) + '.zh-TW' + name.slice(dotIdx)
    : name + '.zh-TW';
  return { source: abs, target: join(dir, zhName), direction: 'en→zh-TW' };
}

export async function translate(filePath: string): Promise<void> {
  const abs = resolve(filePath);

  if (!existsSync(abs)) {
    console.error(chalk.red(t().translateNotFound(filePath)));
    process.exit(1);
  }

  const info = resolveTranslatePaths(abs);

  console.log('');
  console.log(chalk.green(t().translateHeading));
  console.log('');
  console.log(t().translateSource(info.source));
  console.log(t().translateTarget(info.target));
  console.log(t().translateDirection(info.direction));
  console.log('');

  if (existsSync(info.target)) {
    console.log(chalk.yellow(t().translateTargetExists(info.target)));
    console.log('');
  }

  console.log(t().translateHint);
}
