import type { Locale } from './en.js';

export const zhTW: Locale = {
  // config
  langPrompt: '語言 / Language? (en / zh-TW): ',
  langSet: (lang: string) => `語言已設為 ${lang}。`,
  langCurrent: (lang: string) => `目前語言：${lang}`,
  configUsage: '用法：cam config lang [en|zh-TW]',

  // push
  pushHeading: (dir: string) => `推送 sync/ → ${dir}`,
  pushSkipNotManaged: (rel: string) => `略過 ${rel} — 目標已存在且非 cam 管理`,
  pushLinked: (rel: string, target: string) => `  已連結：${rel} → ${target}`,
  pushCopied: (rel: string, target: string) => `  已複製：${rel} → ${target}`,
  pushComplete: (count: number, strategy: string, skipped: number) =>
    `推送完成：${count} 個${strategy}，${skipped} 個略過。`,
  pushAgentNotice: '必要操作：請加入以下設定到 VS Code settings.json：',
  pushAgentSetting: (path: string) => `  "chat.agentFilesLocations": ["${path}/agents"]`,

  // pull
  pullScanning: '正在掃描 VS Code 設定中未追蹤的檔案...',
  pullSkipDiffers: (rel: string) => `略過 ${rel} — 內容不同（保留 repo 版本）`,
  pullConflict: (rel: string) => `衝突：${rel}`,
  pullConflictPrompt: '  保留 repo 版本 (k)、使用 VS Code 版本 (v)、略過 (s)？[k/v/s] ',
  pullUpdated: (rel: string) => `  已更新：${rel}（採用 VS Code 版本）`,
  pullKept: (rel: string) => `  已保留：${rel}（保留 repo 版本）`,
  pullSkipped: (rel: string) => `  已略過：${rel}`,
  pullNothingNew: '沒有新檔案需要匯入。',
  pullFound: (count: number) => `找到 ${count} 個未追蹤的檔案：`,
  pullImportPrompt: '全部匯入？[y/N] 或輸入編號（例如 1 3）：',
  pullNothingImported: '未匯入任何檔案。',
  pullImported: (rel: string) => `  已匯入：${rel} → sync/${rel}`,
  pullComplete: (count: number) => `匯入完成：${count} 個已匯入。`,

  // status
  statusHeading: '=== copilot-asset-manager 同步狀態 ===',
  statusSynced: (count: number) => `已同步（${count}）：`,
  statusNew: '新增（尚未同步到 VS Code）：',
  statusRunPush: '執行 cam push 以同步新檔案。',

  // clean
  cleanHeading: '正在清理孤立項目...',
  cleanRemoving: (target: string) => `  移除孤立項目：${target}`,
  cleanComplete: (count: number) =>
    `清理完成：已移除 ${count} 個孤立項目。`,

  // paths
  notInRepo: '不在 copilot-asset-manager repo 內。請在 repo 根目錄執行 cam。',
} satisfies Locale;
