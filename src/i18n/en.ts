export interface Locale {
  langPrompt: string;
  langSet: (lang: string) => string;
  langCurrent: (lang: string) => string;
  configUsage: string;

  pushHeading: (dir: string) => string;
  pushSkipNotManaged: (rel: string) => string;
  pushLinked: (rel: string, target: string) => string;
  pushCopied: (rel: string, target: string) => string;
  pushComplete: (count: number, strategy: string, skipped: number) => string;
  pushAgentNotice: string;
  pushAgentSetting: (path: string) => string;

  pullScanning: string;
  pullSkipDiffers: (rel: string) => string;
  pullConflict: (rel: string) => string;
  pullConflictPrompt: string;
  pullUpdated: (rel: string) => string;
  pullKept: (rel: string) => string;
  pullSkipped: (rel: string) => string;
  pullNothingNew: string;
  pullFound: (count: number) => string;
  pullImportPrompt: string;
  pullNothingImported: string;
  pullImported: (rel: string) => string;
  pullComplete: (count: number) => string;

  statusHeading: string;
  statusSynced: (count: number) => string;
  statusNew: string;
  statusRunPush: string;

  cleanHeading: string;
  cleanRemoving: (target: string) => string;
  cleanComplete: (count: number) => string;

  notInRepo: string;
}

export const en: Locale = {
  // config
  langPrompt: 'Language / 語言? (en / zh-TW): ',
  langSet: (lang: string) => `Language set to ${lang}.`,
  langCurrent: (lang: string) => `Current language: ${lang}`,
  configUsage: 'Usage: cam config lang [en|zh-TW]',

  // push
  pushHeading: (dir: string) => `Pushing sync/ → ${dir}`,
  pushSkipNotManaged: (rel: string) => `SKIP ${rel} — exists at target but not managed by cam`,
  pushLinked: (rel: string, target: string) => `  Linked: ${rel} → ${target}`,
  pushCopied: (rel: string, target: string) => `  Copied: ${rel} → ${target}`,
  pushComplete: (count: number, strategy: string, skipped: number) =>
    `Push complete: ${count} ${strategy}, ${skipped} skipped.`,
  pushAgentNotice: 'ACTION REQUIRED: Add to your VS Code settings.json:',
  pushAgentSetting: (path: string) => `  "chat.agentFilesLocations": ["${path}/agents"]`,

  // pull
  pullScanning: 'Scanning VS Code config for untracked files...',
  pullSkipDiffers: (rel: string) => `SKIP ${rel} — content differs (repo copy kept)`,
  pullConflict: (rel: string) => `CONFLICT: ${rel}`,
  pullConflictPrompt: '  Keep repo version (k), use VS Code version (v), skip (s)? [k/v/s] ',
  pullUpdated: (rel: string) => `  Updated: ${rel} (VS Code version accepted)`,
  pullKept: (rel: string) => `  Kept: ${rel} (repo version kept)`,
  pullSkipped: (rel: string) => `  Skipped: ${rel}`,
  pullNothingNew: 'Nothing new to import.',
  pullFound: (count: number) => `Found ${count} untracked file(s):`,
  pullImportPrompt: 'Import all? [y/N] or enter numbers (e.g. 1 3): ',
  pullNothingImported: 'Nothing imported.',
  pullImported: (rel: string) => `  Imported: ${rel} → sync/${rel}`,
  pullComplete: (count: number) => `Pull complete: ${count} imported.`,

  // status
  statusHeading: '=== copilot-asset-manager sync status ===',
  statusSynced: (count: number) => `Synced (${count}):`,
  statusNew: 'New (not yet synced to VS Code):',
  statusRunPush: 'Run cam push to sync new files.',

  // clean
  cleanHeading: 'Cleaning orphaned entries...',
  cleanRemoving: (target: string) => `  Removing orphaned: ${target}`,
  cleanComplete: (count: number) =>
    `Clean complete: ${count} orphaned ${count === 1 ? 'entry' : 'entries'} removed.`,

  // paths
  notInRepo: 'Not inside a copilot-asset-manager repo. Run cam from the repo root.',
} satisfies Locale;
