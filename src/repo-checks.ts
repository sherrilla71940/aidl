import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ?? null;
}

export function extractBody(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return match?.[1]?.trim() ?? '';
}

export function findMissingFrontmatterFields(frontmatter: string | null, requiredFields: string[]): string[] {
  if (!frontmatter) return requiredFields;
  return requiredFields.filter(field => !new RegExp(`^${field}:`, 'm').test(frontmatter));
}

export function listTranslationSources(repoRoot: string): string[] {
  return readdirSync(repoRoot)
    .filter(name => name.endsWith('.md'))
    .filter(name => !name.includes('.zh-TW.'))
    .filter(name => name !== 'LICENSE')
    .map(name => name.replace(/\\/g, '/'))
    .concat(
      readdirSync(join(repoRoot, 'docs'))
        .filter(name => name.endsWith('.md'))
        .filter(name => !name.includes('.zh-TW.'))
        .filter(name => name !== 'TODO.md')
        .map(name => join('docs', name).replace(/\\/g, '/')),
    );
}

export function getTranslationCounterpart(relativePath: string): string {
  return relativePath.replace(/\.md$/, '.zh-TW.md');
}

export function getLastCommitTimestamp(repoRoot: string, relativePath: string): number {
  const output = execFileSync('git', ['log', '-1', '--format=%ct', '--', relativePath], {
    cwd: repoRoot,
    encoding: 'utf-8',
  }).trim();
  return Number(output || '0');
}

export function hasUncommittedChanges(repoRoot: string, relativePath: string): boolean {
  const output = execFileSync('git', ['status', '--porcelain', '--', relativePath], {
    cwd: repoRoot,
    encoding: 'utf-8',
  }).trim();
  return output.length > 0;
}

export function findPersonalContentPaths(changedPaths: string[]): string[] {
  return changedPaths
    .map(path => path.replace(/\\/g, '/'))
    .filter(path => /^(sync|local)\//.test(path))
    .filter(path => !path.endsWith('.gitkeep'));
}

export function getCurrentBranch(repoRoot: string): string {
  try {
    return execFileSync('git', ['symbolic-ref', '--short', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf-8',
    }).trim();
  } catch {
    return '';
  }
}

const TRUNK_BRANCHES = new Set(['master', 'main', 'develop', 'dev', 'trunk']);

export function isTrunkBranch(branch: string): boolean {
  return TRUNK_BRANCHES.has(branch.toLowerCase());
}