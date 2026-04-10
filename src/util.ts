import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { lstatSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

export function shouldSkip(relPath: string): boolean {
  const name = relPath.split('/').pop() || '';
  return name === '.gitkeep' || name.endsWith('.agent.md');
}

export function pathExists(p: string): boolean {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

export async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

export function findAbsoluteMarkdownLinkTargets(content: string): string[] {
  const matches = [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)];
  const targets = matches
    .map(match => match[1].trim().replace(/^<|>$/g, ''))
    .filter(target => {
      if (!target) return false;
      if (target.startsWith('http://') || target.startsWith('https://')) return false;
      if (target.startsWith('#') || target.startsWith('mailto:')) return false;
      return target.startsWith('/') || /^[A-Za-z]:[\\/]/.test(target) || target.startsWith('file://');
    });

  return [...new Set(targets)];
}
