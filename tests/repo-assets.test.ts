import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  extractBody,
  extractFrontmatter,
  findMissingFrontmatterFields,
  findPersonalContentPaths,
  getLastCommitTimestamp,
  getTranslationCounterpart,
  hasUncommittedChanges,
  listTranslationSources,
} from '../src/repo-checks.js';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, '..');

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf-8');
}

function listFiles(relativeDir: string, suffix: string): string[] {
  return readdirSync(join(repoRoot, relativeDir))
    .filter(name => name.endsWith(suffix))
    .map(name => join(relativeDir, name).replace(/\\/g, '/'));
}

describe('workspace prompt assets', () => {
  it('all slash command prompts have description and agent frontmatter', () => {
    const promptFiles = listFiles('.github/prompts', '.prompt.md');

    expect(promptFiles.length).toBeGreaterThan(0);

    for (const promptFile of promptFiles) {
      const content = read(promptFile);
      const fm = extractFrontmatter(content);
      expect(findMissingFrontmatterFields(fm, ['description', 'agent']), promptFile).toEqual([]);
      expect(fm, promptFile).toMatch(/^agent:\s*agent$/m);
      expect(extractBody(content).length, promptFile).toBeGreaterThan(40);
    }
  });
});

describe('workspace agent assets', () => {
  it('all agent files have required frontmatter', () => {
    const agentFiles = listFiles('.github/agents', '.agent.md');

    expect(agentFiles.length).toBeGreaterThan(0);

    for (const agentFile of agentFiles) {
      const content = read(agentFile);
      const fm = extractFrontmatter(content);
      expect(findMissingFrontmatterFields(fm, ['description', 'tools']), agentFile).toEqual([]);
      expect(extractBody(content).length, agentFile).toBeGreaterThan(100);
    }
  });
});

describe('workspace skill assets', () => {
  it('all skills have frontmatter and substantial body content', () => {
    const skillDirs = readdirSync(join(repoRoot, '.github/skills'));
    const skillFiles = skillDirs
      .map(name => join('.github/skills', name, 'SKILL.md').replace(/\\/g, '/'))
      .filter(relativePath => existsSync(join(repoRoot, relativePath)));

    expect(skillFiles.length).toBeGreaterThan(0);

    for (const skillFile of skillFiles) {
      const content = read(skillFile);
      const fm = extractFrontmatter(content);
      expect(findMissingFrontmatterFields(fm, ['description']), skillFile).toEqual([]);
      expect(extractBody(content).length, skillFile).toBeGreaterThan(100);
    }
  });
});

describe('hook contract', () => {
  it('translation pre-commit hook declares expected event and workflow', () => {
    const content = read('.github/hooks/translation-check.md');
    const fm = extractFrontmatter(content);

    expect(findMissingFrontmatterFields(fm, ['description', 'event'])).toEqual([]);
    expect(fm).toMatch(/^event:\s*preCommit$/m);
    expect(content).toContain('repo root and `docs/`');
    expect(content).toContain('`*.zh-TW.md`');
    expect(content).toContain('`docs/TODO.md`');
    expect(content).toContain('`LICENSE`');
    expect(content).toContain('use the `translate` skill');
  });
});

describe('translation parity', () => {
  const sourceFiles = listTranslationSources(repoRoot);

  it('all root/docs markdown sources have zh-TW counterparts', () => {
    for (const sourceFile of sourceFiles) {
      const translatedFile = getTranslationCounterpart(sourceFile);
      expect(existsSync(join(repoRoot, translatedFile)), `${translatedFile} missing for ${sourceFile}`).toBe(true);
    }
  });

  it('zh-TW counterparts are not older than their English source in git history', () => {
    for (const sourceFile of sourceFiles) {
      const translatedFile = getTranslationCounterpart(sourceFile);
      if (hasUncommittedChanges(repoRoot, translatedFile)) {
        continue;
      }
      const sourceTime = getLastCommitTimestamp(repoRoot, sourceFile);
      const translatedTime = getLastCommitTimestamp(repoRoot, translatedFile);
      expect(translatedTime, `${translatedFile} may be stale for ${sourceFile}`).toBeGreaterThanOrEqual(sourceTime);
    }
  });
});

describe('no-personal-content CI policy', () => {
  it('flags sync/local changes but ignores .gitkeep placeholders', () => {
    expect(findPersonalContentPaths([
      'src/cli.ts',
      'sync/prompts/test.prompt.md',
      'sync/prompts/.gitkeep',
      'local/copilot-instructions.md',
    ])).toEqual([
      'sync/prompts/test.prompt.md',
      'local/copilot-instructions.md',
    ]);
  });
});

describe('CI workflow coverage', () => {
  it('CI still includes the asset-validation and translation-parity jobs', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).toContain('validate-workspace-agents:');
    expect(workflow).toContain('validate-slash-commands:');
    expect(workflow).toContain('translation-parity:');
    expect(workflow).toContain("Run 'cam translate <file>' or use the translate skill in Copilot Chat to fix.");
  });
});
