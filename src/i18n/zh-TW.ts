import type { Locale } from './en.js';

export const zhTW: Locale = {
  // config
  langPrompt: '語言 / Language? (en / zh-TW): ',
  langSet: (lang: string) => `語言已設為 ${lang}。`,
  langCurrent: (lang: string) => `目前語言：${lang}`,
  syncModeCurrent: (mode: string) => `目前同步模式：${mode}`,
  configUsage: '用法：cam config lang [en|zh-TW]',

  // push
  pushHeading: (dir: string) => `推送 sync/ → ${dir}`,
  pushSkipNotManaged: (rel: string) => `略過 ${rel} — 目標已存在且非 cam 管理`,
  pushLinked: (rel: string, target: string) => `  已連結：${rel} → ${target}`,
  pushCopied: (rel: string, target: string) => `  已複製：${rel} → ${target}`,
  pushComplete: (count: number, strategy: string, skipped: number) =>
    `推送完成：${count} 個${strategy}，${skipped} 個略過。`,
  pushAbsolutePathWarning: (rel: string, target: string) =>
    `警告 ${rel} 含有絕對 markdown 連結路徑：${target}。請改用相對路徑。`,
  pushAgentNotice: '必要操作：請加入以下設定到 VS Code settings.json：',
  pushAgentSetting: (path: string) => `  "chat.agentFilesLocations": ["${path}/agents"]`,

  // pull
  pullScanning: (destination: string) => `正在掃描 VS Code 設定中可匯入到 ${destination}/ 的檔案...`,
  pullSkipDiffers: (rel: string) => `略過 ${rel} — 內容不同（保留 repo 版本；如要處理衝突請不要加 --yes）`,
  pullConflict: (rel: string) => `衝突：${rel}`,
  pullConflictPrompt: '  保留 repo 版本 (k)、使用 VS Code 版本 (v)、略過 (s)？[k/v/s] ',
  pullUpdated: (rel: string) => `  已更新：${rel}（採用 VS Code 版本）`,
  pullKept: (rel: string) => `  已保留：${rel}（保留 repo 版本）`,
  pullSkipped: (rel: string) => `  已略過：${rel}`,
  pullNothingNew: '沒有新檔案需要匯入。',
  pullFound: (count: number, destination: string) => `找到 ${count} 個可匯入到 ${destination}/ 的未追蹤檔案：`,
  pullImportPrompt: (destination: string) => `要匯入到 ${destination}/ 嗎？[y/N] 或輸入編號（例如 1 3）：`,
  pullNothingImported: '未匯入任何檔案。',
  pullImported: (rel: string, destination: string) => `  已匯入：${rel} → ${destination}/${rel}`,
  pullComplete: (count: number, destination: string) => `匯入完成：${count} 個已匯入到 ${destination}/。`,

  // status
  statusHeading: '=== copilot-asset-manager 同步狀態 ===',
  statusSynced: (count: number) => `已同步（${count}）：`,
  statusNew: '新增（尚未同步到 VS Code）：',
  statusRunPush: '執行 cam push 以同步新檔案。',
  statusRunClean: '執行 cam clean，將孤立項目從 VS Code 與 manifest 中移除。',

  // clean
  cleanHeading: '正在清理孤立項目...',
  cleanRemoving: (target: string) => `  移除孤立項目：${target}`,
  cleanComplete: (count: number) =>
    `清理完成：已移除 ${count} 個孤立項目。`,

  // translate
  translateNotFound: (file: string) => `找不到檔案：${file}`,
  translateHeading: '=== cam translate ===',
  translateSource: (path: string) => `  來源：${path}`,
  translateTarget: (path: string) => `  目標：${path}`,
  translateDirection: (dir: string) => `  方向：${dir}`,
  translateTargetExists: (path: string) => `目標檔案已存在：${path}（將被覆寫）`,
  translateHint: '請使用 Copilot Chat 中的 translate skill 來產生翻譯：\n  開啟 Chat → 輸入：「Translate this file」並附上來源檔案。',

  // init
  initHeading: '=== cam init ===',
  initLangCurrent: (lang: string) => `目前語言：${lang}`,
  initLangPrompt: '語言 / Language? (en / zh-TW) [按 Enter 保留目前設定]：',
  initSyncModeOptions: '同步模式：',
  initSyncModeCurrent: (mode: string) => `目前模式：${mode}`,
  initSyncModePrompt: '選擇同步模式 (1–4) [按 Enter 保留目前設定]：',
  initComplete: (lang: string, mode: string) => `設定已儲存：lang=${lang}, syncMode=${mode}`,

  // sync mode gating
  syncModeDisabled: (command: string, mode: string) => `${command} 已停用（syncMode: ${mode}）。執行 cam init 來變更，或執行 cam config show 檢查目前設定。`,

  // paths
  notInRepo: '不在 copilot-asset-manager repo 內。請在 repo 根目錄執行 cam。',
} satisfies Locale;
