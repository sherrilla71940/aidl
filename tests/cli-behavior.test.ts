import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '../src/i18n/en.ts';
import { zhTW } from '../src/i18n/zh-TW.ts';

const originalCwd = process.cwd();

function createTempRepo(): string {
  const repoDir = mkdtempSync(join(tmpdir(), 'cam-test-'));
  mkdirSync(join(repoDir, 'sync'));
  return repoDir;
}

describe('config behavior', () => {
  let repoDir: string;

  beforeEach(() => {
    repoDir = createTempRepo();
    process.chdir(repoDir);
    vi.resetModules();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(repoDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('defaults to English and both sync directions when config is missing', async () => {
    const { readConfig } = await import('../src/config.ts');
    expect(readConfig()).toEqual({ lang: 'en', syncMode: 'both' });
  });

  it('sanitizes invalid config values back to defaults', async () => {
    writeFileSync(join(repoDir, '.cam-config.json'), JSON.stringify({ lang: 'de', syncMode: 'sideways' }));
    const { readConfig } = await import('../src/config.ts');
    expect(readConfig()).toEqual({ lang: 'en', syncMode: 'both' });
  });

  it('writes config to the repo root config file', async () => {
    const { writeConfig } = await import('../src/config.ts');

    writeConfig({ lang: 'zh-TW', syncMode: 'pull-only' });

    const saved = JSON.parse(readFileSync(join(repoDir, '.cam-config.json'), 'utf-8'));
    expect(saved).toEqual({ lang: 'zh-TW', syncMode: 'pull-only' });
  });
});

describe('init behavior', () => {
  let repoDir: string;

  beforeEach(() => {
    repoDir = createTempRepo();
    process.chdir(repoDir);
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('../src/util.js');
    vi.doUnmock('chalk');
    process.chdir(originalCwd);
    rmSync(repoDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('updates language and sync mode from prompt answers', async () => {
    vi.doMock('chalk', () => ({ default: { green: (value: string) => value } }));
    vi.doMock('../src/util.js', () => ({
      ask: vi
        .fn()
        .mockResolvedValueOnce('zh-TW')
        .mockResolvedValueOnce('3'),
    }));

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { init } = await import('../src/init.ts');
    const { readConfig } = await import('../src/config.ts');

    await init();

    expect(readConfig()).toEqual({ lang: 'zh-TW', syncMode: 'pull-only' });
    expect(logSpy.mock.calls.flat().join('\n')).toContain('syncMode=pull-only');
  });

  it('keeps existing settings when both prompts are blank', async () => {
    writeFileSync(join(repoDir, '.cam-config.json'), `${JSON.stringify({ lang: 'zh-TW', syncMode: 'push-only' }, null, 2)}\n`);

    vi.doMock('chalk', () => ({ default: { green: (value: string) => value } }));
    vi.doMock('../src/util.js', () => ({
      ask: vi
        .fn()
        .mockResolvedValueOnce('')
        .mockResolvedValueOnce(''),
    }));

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { init } = await import('../src/init.ts');
    const { readConfig } = await import('../src/config.ts');

    await init();

    expect(readConfig()).toEqual({ lang: 'zh-TW', syncMode: 'push-only' });
  });
});

describe('translate behavior', () => {
  let repoDir: string;

  beforeEach(() => {
    repoDir = createTempRepo();
    process.chdir(repoDir);
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('chalk');
    process.chdir(originalCwd);
    rmSync(repoDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('derives zh-TW target path for an English markdown source', async () => {
    writeFileSync(join(repoDir, 'README.md'), '# Hello\n');

    vi.doMock('chalk', () => ({
      default: {
        green: (value: string) => value,
        yellow: (value: string) => value,
        red: (value: string) => value,
      },
    }));

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { translate } = await import('../src/translate.ts');

    await translate('README.md');

    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain(`Source: ${join(repoDir, 'README.md')}`);
    expect(output).toContain(`Target: ${join(repoDir, 'README.zh-TW.md')}`);
    expect(output).toContain('Direction: en→zh-TW');
  });

  it('derives English target path for a zh-TW markdown source and warns on overwrite', async () => {
    writeFileSync(join(repoDir, 'README.zh-TW.md'), '# 哈囉\n');
    writeFileSync(join(repoDir, 'README.md'), '# Hello\n');

    vi.doMock('chalk', () => ({
      default: {
        green: (value: string) => value,
        yellow: (value: string) => value,
        red: (value: string) => value,
      },
    }));

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { translate } = await import('../src/translate.ts');

    await translate('README.zh-TW.md');

    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain(`Target: ${join(repoDir, 'README.md')}`);
    expect(output).toContain('Direction: zh-TW→en');
    expect(output).toContain(`Target already exists: ${join(repoDir, 'README.md')} (will be overwritten)`);
  });

  it('prints an error and exits when the source file does not exist', async () => {
    vi.doMock('chalk', () => ({
      default: {
        green: (value: string) => value,
        yellow: (value: string) => value,
        red: (value: string) => value,
      },
    }));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: string | number | null) => {
      throw new Error(`process.exit:${String(code)}`);
    }) as never);

    const { translate } = await import('../src/translate.ts');

    await expect(translate('missing.md')).rejects.toThrow('process.exit:1');
    expect(errorSpy.mock.calls.flat().join('\n')).toContain('File not found: missing.md');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe('agent guidance strings', () => {
  it('uses the current object form for direct repo agent loading in English', () => {
    expect(en.pushAgentSetting('ignored')).toBe('  "chat.agentFilesLocations": { "sync/agents": true }');
    expect(en.pushAgentSection).toContain('.copilot/agents');
    expect(en.statusAgentHint).toContain('"sync/agents": true');
  });

  it('uses the current object form for direct repo agent loading in zh-TW', () => {
    expect(zhTW.pushAgentSetting('ignored')).toBe('  "chat.agentFilesLocations": { "sync/agents": true }');
    expect(zhTW.pushAgentSection).toContain('.copilot/agents');
    expect(zhTW.statusAgentHint).toContain('"sync/agents": true');
  });
});
