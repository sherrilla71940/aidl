import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalCwd = process.cwd();

interface TempLayout {
  rootDir: string;
  repoDir: string;
  vscodeDir: string;
}

function createTempLayout(): TempLayout {
  const rootDir = mkdtempSync(join(tmpdir(), 'cam-sync-test-'));
  const repoDir = join(rootDir, 'repo');
  const vscodeDir = join(rootDir, 'vscode-user');
  mkdirSync(join(repoDir, 'sync'), { recursive: true });
  mkdirSync(vscodeDir, { recursive: true });
  return { rootDir, repoDir, vscodeDir };
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

describe('sync command integration', () => {
  let layout: TempLayout;

  beforeEach(() => {
    layout = createTempLayout();
    process.chdir(layout.repoDir);
    vi.resetModules();
    vi.doMock('chalk', () => ({
      default: {
        green: (value: string) => value,
        yellow: (value: string) => value,
        red: (value: string) => value,
      },
    }));
    vi.doMock('../src/paths.js', async () => {
      const actual = await vi.importActual<typeof import('../src/paths.ts')>('../src/paths.ts');
      return {
        ...actual,
        getVscodeUserDir: () => layout.vscodeDir,
      };
    });
  });

  afterEach(() => {
    vi.doUnmock('chalk');
    vi.doUnmock('../src/paths.js');
    process.chdir(originalCwd);
    rmSync(layout.rootDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('push syncs files into the VS Code user directory and records them in the manifest', async () => {
    const sourceFile = join(layout.repoDir, 'sync', 'prompts', 'hello.prompt.md');
    writeFile(sourceFile, '---\ndescription: hello\nagent: agent\n---\n\nBody text');

    const { push } = await import('../src/push.ts');
    await push({ yes: true });

    const targetFile = join(layout.vscodeDir, 'prompts', 'hello.prompt.md');
    expect(existsSync(targetFile)).toBe(true);

    if (process.platform === 'win32') {
      expect(lstatSync(targetFile).isSymbolicLink()).toBe(false);
      expect(readFileSync(targetFile, 'utf-8')).toBe(readFileSync(sourceFile, 'utf-8'));
    } else {
      expect(lstatSync(targetFile).isSymbolicLink()).toBe(true);
      expect(readlinkSync(targetFile)).toBe(sourceFile);
    }

    const manifest = readJson<{ synced: Array<{ source: string; target: string; strategy: string }>; agent_notice_shown: boolean }>(
      join(layout.repoDir, '.sync-manifest.json'),
    );
    expect(manifest.synced).toHaveLength(1);
    expect(manifest.synced[0]).toMatchObject({
      source: sourceFile,
      target: targetFile,
      strategy: process.platform === 'win32' ? 'copy' : 'symlink',
    });
    expect(manifest.agent_notice_shown).toBe(true);
  });

  it('pull imports new VS Code files into sync and records them in the manifest', async () => {
    const vscodeFile = join(layout.vscodeDir, 'prompts', 'captured.prompt.md');
    writeFile(vscodeFile, '---\ndescription: capture\nagent: agent\n---\n\nCaptured text');

    const { pull } = await import('../src/pull.ts');
    await pull({ yes: true });

    const importedFile = join(layout.repoDir, 'sync', 'prompts', 'captured.prompt.md');
    expect(existsSync(importedFile)).toBe(true);
    expect(readFileSync(importedFile, 'utf-8')).toBe(readFileSync(vscodeFile, 'utf-8'));

    const manifest = readJson<{ synced: Array<{ source: string; target: string; strategy: string }> }>(
      join(layout.repoDir, '.sync-manifest.json'),
    );
    expect(manifest.synced).toHaveLength(1);
    expect(manifest.synced[0]).toMatchObject({
      source: importedFile,
      target: vscodeFile,
      strategy: 'copy',
    });
  });

  it('pull keeps the repo copy on differing content in --yes mode', async () => {
    const repoFile = join(layout.repoDir, 'sync', 'prompts', 'conflict.prompt.md');
    const vscodeFile = join(layout.vscodeDir, 'prompts', 'conflict.prompt.md');
    writeFile(repoFile, 'repo version');
    writeFile(vscodeFile, 'vscode version');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { pull } = await import('../src/pull.ts');
    await pull({ yes: true });

    expect(readFileSync(repoFile, 'utf-8')).toBe('repo version');
    expect(logSpy.mock.calls.flat().join('\n')).toContain('content differs');
    expect(logSpy.mock.calls.flat().join('\n')).toContain('rerun without --yes');
  });

  it('status reports OK, ORPHANED, and NEW entries from real filesystem state', async () => {
    const okSource = join(layout.repoDir, 'sync', 'prompts', 'ok.prompt.md');
    const newSource = join(layout.repoDir, 'sync', 'prompts', 'new.prompt.md');
    const okTarget = join(layout.vscodeDir, 'prompts', 'ok.prompt.md');
    const orphanTarget = join(layout.vscodeDir, 'prompts', 'orphan.prompt.md');
    writeFile(okSource, 'ok');
    writeFile(newSource, 'new');
    writeFile(okTarget, 'ok');
    writeFile(orphanTarget, 'orphan');
    writeFile(
      join(layout.repoDir, '.sync-manifest.json'),
      `${JSON.stringify({
        synced: [
          {
            source: okSource,
            target: okTarget,
            strategy: 'copy',
            timestamp: '2026-01-01T00:00:00.000Z',
          },
          {
            source: join(layout.repoDir, 'sync', 'prompts', 'missing.prompt.md'),
            target: orphanTarget,
            strategy: 'copy',
            timestamp: '2026-01-01T00:00:00.000Z',
          },
        ],
        agent_notice_shown: true,
      }, null, 2)}\n`,
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { status } = await import('../src/status.ts');
    await status();

    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain('[OK] prompts/ok.prompt.md');
    expect(output).toContain('[ORPHANED] prompts/missing.prompt.md');
    expect(output).toContain('[NEW] prompts/new.prompt.md');
    expect(output).toContain('Run cam clean');
    expect(output).toContain('Run cam push');
  });

  it('clean removes orphaned target files and manifest entries', async () => {
    const orphanTarget = join(layout.vscodeDir, 'prompts', 'orphan.prompt.md');
    writeFile(orphanTarget, 'orphan');
    writeFile(
      join(layout.repoDir, '.sync-manifest.json'),
      `${JSON.stringify({
        synced: [
          {
            source: join(layout.repoDir, 'sync', 'prompts', 'missing.prompt.md'),
            target: orphanTarget,
            strategy: 'copy',
            timestamp: '2026-01-01T00:00:00.000Z',
          },
        ],
        agent_notice_shown: true,
      }, null, 2)}\n`,
    );

    const { clean } = await import('../src/clean.ts');
    await clean();

    expect(existsSync(orphanTarget)).toBe(false);
    const manifest = readJson<{ synced: unknown[] }>(join(layout.repoDir, '.sync-manifest.json'));
    expect(manifest.synced).toHaveLength(0);
  });
});

describe('push/pull focused warnings and gating', () => {
  let layout: TempLayout;

  beforeEach(() => {
    layout = createTempLayout();
    process.chdir(layout.repoDir);
    vi.resetModules();
    vi.doMock('chalk', () => ({
      default: {
        green: (value: string) => value,
        yellow: (value: string) => value,
        red: (value: string) => value,
      },
    }));
    vi.doMock('../src/paths.js', async () => {
      const actual = await vi.importActual<typeof import('../src/paths.ts')>('../src/paths.ts');
      return {
        ...actual,
        getVscodeUserDir: () => layout.vscodeDir,
      };
    });
  });

  afterEach(() => {
    vi.doUnmock('chalk');
    vi.doUnmock('../src/paths.js');
    process.chdir(originalCwd);
    rmSync(layout.rootDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('push warns when synced markdown contains absolute link targets', async () => {
    writeFile(
      join(layout.repoDir, 'sync', 'prompts', 'warning.prompt.md'),
      '---\ndescription: warn\nagent: agent\n---\n\nSee [local file](file:///tmp/example.md).',
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { push } = await import('../src/push.ts');
    await push({ yes: true });

    expect(logSpy.mock.calls.flat().join('\n')).toContain('absolute markdown link target: file:///tmp/example.md');
  });

  it('push is gated off when syncMode disables push', async () => {
    writeFile(join(layout.repoDir, '.cam-config.json'), `${JSON.stringify({ lang: 'en', syncMode: 'pull-only' }, null, 2)}\n`);
    writeFile(join(layout.repoDir, 'sync', 'prompts', 'blocked.prompt.md'), 'blocked');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { push } = await import('../src/push.ts');
    await push({ yes: true });

    expect(existsSync(join(layout.vscodeDir, 'prompts', 'blocked.prompt.md'))).toBe(false);
    expect(logSpy.mock.calls.flat().join('\n')).toContain('push is disabled');
    expect(logSpy.mock.calls.flat().join('\n')).toContain('cam config show');
  });

  it('pull is gated off when syncMode disables pull', async () => {
    writeFile(join(layout.repoDir, '.cam-config.json'), `${JSON.stringify({ lang: 'en', syncMode: 'push-only' }, null, 2)}\n`);
    writeFile(join(layout.vscodeDir, 'prompts', 'blocked.prompt.md'), 'blocked');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { pull } = await import('../src/pull.ts');
    await pull({ yes: true });

    expect(existsSync(join(layout.repoDir, 'sync', 'prompts', 'blocked.prompt.md'))).toBe(false);
    expect(logSpy.mock.calls.flat().join('\n')).toContain('pull is disabled');
    expect(logSpy.mock.calls.flat().join('\n')).toContain('cam config show');
  });
});
