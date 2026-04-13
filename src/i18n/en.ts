export interface Locale {
  langPrompt: string;
  langSet: (lang: string) => string;
  langCurrent: (lang: string) => string;
  syncModeCurrent: (mode: string) => string;
  configUsage: string;

  pushHeading: (dir: string) => string;
  pushSkipNotManaged: (rel: string) => string;
  pushLinked: (rel: string, target: string) => string;
  pushCopied: (rel: string, target: string) => string;
  pushComplete: (count: number, strategy: string, skipped: number) => string;
  pushAbsolutePathWarning: (rel: string, target: string) => string;
  pushAgentNotice: string;
  pushAgentSetting: (path: string) => string;
  pushAgentSection: string;
  pushAgentSkipped: (rel: string) => string;
  pushAdopted: (rel: string) => string;
  pushStaleHeading: (count: number) => string;
  pushStaleEntry: (rel: string, target: string) => string;
  pushStalePrompt: (rel: string) => string;
  pushStaleDeleted: (rel: string) => string;
  pushStaleKept: (rel: string) => string;

  pullScanning: (destination: string) => string;
  pullSkipDiffers: (rel: string) => string;
  pullConflict: (rel: string) => string;
  pullConflictPrompt: string;
  pullUpdated: (rel: string) => string;
  pullKept: (rel: string) => string;
  pullSkipped: (rel: string) => string;
  pullNothingNew: string;
  pullFound: (count: number, destination: string) => string;
  pullImportPrompt: (destination: string) => string;
  pullNothingImported: string;
  pullImported: (rel: string, destination: string) => string;
  pullComplete: (count: number, destination: string) => string;
  pullStaleHeading: (count: number, destination: string) => string;
  pullStaleEntry: (rel: string, target: string) => string;
  pullStalePrompt: (rel: string) => string;
  pullStaleDeleted: (rel: string) => string;
  pullStaleKept: (rel: string) => string;

  statusHeading: string;
  statusSynced: (count: number) => string;
  statusNew: string;
  statusRunPush: string;
  statusRunClean: string;
  statusAgentSection: (count: number) => string;
  statusAgentFile: (rel: string) => string;
  statusAgentHint: string;

  cleanHeading: string;
  cleanRemoving: (target: string) => string;
  cleanComplete: (count: number) => string;

  translateNotFound: (file: string) => string;
  translateHeading: string;
  translateSource: (path: string) => string;
  translateTarget: (path: string) => string;
  translateDirection: (dir: string) => string;
  translateTargetExists: (path: string) => string;
  translateHint: string;

  initHeading: string;
  initLangCurrent: (lang: string) => string;
  initLangPrompt: string;
  initSyncModeOptions: string;
  initSyncModeCurrent: (mode: string) => string;
  initSyncModePrompt: string;
  initComplete: (lang: string, mode: string) => string;

  syncModeDisabled: (command: string, mode: string) => string;

  notInRepo: string;
}

export const en: Locale = {
  // config
  langPrompt: 'Language / 語言? (en / zh-TW): ',
  langSet: (lang: string) => `Language set to ${lang}.`,
  langCurrent: (lang: string) => `Current language: ${lang}`,
  syncModeCurrent: (mode: string) => `Current sync mode: ${mode}`,
  configUsage: 'Usage: cam config lang [en|zh-TW]',

  // push
  pushHeading: (dir: string) => `Pushing sync/ → ${dir}`,
  pushSkipNotManaged: (rel: string) => `SKIP ${rel} — exists at target but not managed by cam`,
  pushLinked: (rel: string, target: string) => `  Linked: ${rel} → ${target}`,
  pushCopied: (rel: string, target: string) => `  Copied: ${rel} → ${target}`,
  pushComplete: (count: number, strategy: string, skipped: number) =>
    `Push complete: ${count} ${strategy}, ${skipped} skipped.`,
  pushAbsolutePathWarning: (rel: string, target: string) =>
    `WARNING ${rel} contains an absolute markdown link target: ${target}. Use relative paths instead.`,
  pushAgentNotice: 'OPTIONAL: For live development directly from this repo, add to your VS Code settings.json:',
  pushAgentSetting: (_path: string) => '  "chat.agentFilesLocations": { "sync/agents": true }',
  pushAgentSection: 'Agent files (copied to user-level .copilot/agents):',
  pushAgentSkipped: (rel: string) => `  [AGENT] ${rel} — copied to user-level agents storage`,
  pushAdopted: (rel: string) => `  Adopted: ${rel} (target content matched — now tracked in manifest)`,
  pushStaleHeading: (count: number) => `Stale user-level file(s) found during push (${count}):`,
  pushStaleEntry: (rel: string, target: string) => `  Stale: ${rel} → ${target}`,
  pushStalePrompt: (rel: string) => `  Delete user-level copy for ${rel}? [y/N] `,
  pushStaleDeleted: (rel: string) => `  Deleted user-level copy: ${rel}`,
  pushStaleKept: (rel: string) => `  Kept user-level copy: ${rel}`,

  // pull
  pullScanning: (destination: string) => `Scanning VS Code config for files to import into ${destination}/...`,
  pullSkipDiffers: (rel: string) =>
    `SKIP ${rel} — content differs (repo copy kept; rerun without --yes to review conflicts)`,
  pullConflict: (rel: string) => `CONFLICT: ${rel}`,
  pullConflictPrompt: '  Keep repo version (k), use VS Code version (v), skip (s)? [k/v/s] ',
  pullUpdated: (rel: string) => `  Updated: ${rel} (VS Code version accepted)`,
  pullKept: (rel: string) => `  Kept: ${rel} (repo version kept)`,
  pullSkipped: (rel: string) => `  Skipped: ${rel}`,
  pullNothingNew: 'Nothing new to import.',
  pullFound: (count: number, destination: string) => `Found ${count} untracked file(s) to import into ${destination}/:`,
  pullImportPrompt: (destination: string) => `Import into ${destination}/? [y/N] or enter numbers (e.g. 1 3): `,
  pullNothingImported: 'Nothing imported.',
  pullImported: (rel: string, destination: string) => `  Imported: ${rel} → ${destination}/${rel}`,
  pullComplete: (count: number, destination: string) => `Pull complete: ${count} imported into ${destination}/.`,
  pullStaleHeading: (count: number, destination: string) =>
    `Stale ${destination}/ file(s) missing from user-level storage (${count}):`,
  pullStaleEntry: (rel: string, target: string) => `  Stale: ${rel} ← ${target}`,
  pullStalePrompt: (rel: string) => `  Delete repo copy for ${rel}? [y/N] `,
  pullStaleDeleted: (rel: string) => `  Deleted repo copy: ${rel}`,
  pullStaleKept: (rel: string) => `  Kept repo copy: ${rel}`,

  // status
  statusHeading: '=== copilot-asset-manager sync status ===',
  statusSynced: (count: number) => `Synced (${count}):`,
  statusNew: 'New (not yet synced to VS Code):',
  statusRunPush: 'Run cam push to sync new files.',
  statusRunClean: 'Run cam clean to remove orphaned entries from VS Code and the manifest.',
  statusAgentSection: (count: number) => `Agents (${count}) — synced to user-level .copilot/agents:`,
  statusAgentFile: (rel: string) => `  [AGENT] ${rel}`,
  statusAgentHint: 'Optional for live repo loading: add "sync/agents": true under "chat.agentFilesLocations" in VS Code settings.json',

  // clean
  cleanHeading: 'Cleaning orphaned entries...',
  cleanRemoving: (target: string) => `  Removing orphaned: ${target}`,
  cleanComplete: (count: number) =>
    `Clean complete: ${count} orphaned ${count === 1 ? 'entry' : 'entries'} removed.`,

  // translate
  translateNotFound: (file: string) => `File not found: ${file}`,
  translateHeading: '=== cam translate ===',
  translateSource: (path: string) => `  Source: ${path}`,
  translateTarget: (path: string) => `  Target: ${path}`,
  translateDirection: (dir: string) => `  Direction: ${dir}`,
  translateTargetExists: (path: string) => `Target already exists: ${path} (will be overwritten)`,
  translateHint: 'Use the translate skill in Copilot Chat to produce the translation:\n  Open Chat → type: "Translate this file" and attach the source file.',

  // init
  initHeading: '=== cam init ===',
  initLangCurrent: (lang: string) => `Current language: ${lang}`,
  initLangPrompt: 'Language / 語言? (en / zh-TW) [press Enter to keep]: ',
  initSyncModeOptions: 'Sync mode:',
  initSyncModeCurrent: (mode: string) => `Current mode: ${mode}`,
  initSyncModePrompt: 'Choose sync mode (1–4) [press Enter to keep]: ',
  initComplete: (lang: string, mode: string) => `Config saved: lang=${lang}, syncMode=${mode}`,

  // sync mode gating
  syncModeDisabled: (command: string, mode: string) =>
    `${command} is disabled (syncMode: ${mode}). Run cam init to change it, or cam config show to inspect the current setting.`,

  // paths
  notInRepo: 'Not inside a copilot-asset-manager repo. Run cam from anywhere inside the repo.',
} satisfies Locale;
