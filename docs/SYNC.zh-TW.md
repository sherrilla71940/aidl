[English](SYNC.md) | **繁體中文**

# SYNC.md — 同步邏輯詳解

本文件描述 `cam` CLI（`src/`）的內部邏輯。使用方式請見 README。

## 概述

`copilot-asset-manager` 在兩個位置之間同步：

- **copilot-asset-manager repo 區域**
  - `sync/` — 以 git 追蹤的設定，會同步到 VS Code
  - `local/` — 以 git 追蹤的私人檔案，不會同步到 VS Code
- **VS Code 使用者設定** （Linux: `~/.config/Code/User/`、macOS: `~/Library/Application Support/Code/User/`、Windows: `%APPDATA%\Code\User\`）

Repo 的 workspace 資源放在 `.github/` 下，不屬於 `pull` 或 `push` 的範圍。`pull` 只匯入到 `sync/`。`push` 只同步 `sync/`。`local/` 永遠不會同步到 VS Code。

支援的資源子目錄：`prompts/`、`skills/`、`instructions/`、`hooks/`。Agents（`*.agent.md`）透過 `chat.agentFilesLocations` 發現，push 不會建立 symlink 或複製。

`sync/` 對應到你的 VS Code 使用者設定目錄，不會同步 workspace-level 的 `.vscode/` 設定。

## VS Code Settings Sync 的重疊範圍

VS Code 內建的 Settings Sync 已經會同步使用者層級的 Settings、Keyboard Shortcuts、User Snippets、User Tasks、UI State、Extensions 和 Profiles。它不會同步 VS Code 使用者設定目錄下的任意檔案，例如 `prompts/`、`instructions/`、`skills/`、`hooks/` 或 `agents/`。

所以兩者的重疊其實很有限：

- Settings Sync 已經能在不同機器之間帶著你的編輯器偏好走。
- `copilot-asset-manager` 處理的是 Settings Sync 不會管理、而且可用 git 追蹤的 Copilot 資源檔。
- 即使開啟 Settings Sync，這個 repo 仍然適合拿來做版本紀錄、審查、團隊分享，以及選擇性 push/pull。

---

## push — repo → VS Code

1. 遞迴掃描 `sync/` 中所有非 .gitkeep、非 .agent.md 的檔案，比對：

- `sync/prompts/**/*.prompt.md`
- `sync/skills/*/SKILL.md`（僅一層 — 資料夾名稱 = skill 名稱）
- `sync/instructions/**/*.instructions.md`

1. 對每個檔案，決定 VS Code 使用者設定中的目標路徑：

- `sync/prompts/**/*` → `{vscodeUserPath}/prompts/<相對子路徑>`（結構保留）
- `sync/skills/{name}/SKILL.md` → `{vscodeUserPath}/skills/{name}/SKILL.md`
- `sync/instructions/**/*` → `{vscodeUserPath}/instructions/<相對子路徑>`

1. **衝突檢查：** 如果目標路徑已存在，且未被 manifest 追蹤（即非 copilot-asset-manager 建立的），跳過並輸出：

```text
SKIP <rel-path> — exists at target but not created by copilot-asset-manager (delete the target file first if you want to overwrite)
```

1. 視需要建立父目錄。

1. 建立 symlink（macOS/Linux）或複製（Windows）到目標位置。

1. 將每個同步的檔案寫入 `.sync-manifest.json`。

1. **Agent 發現機制：** VS Code 不會自動掃描全域的 `agents/` 資料夾。push 後，檢查 `sync/agents/` 是否已列在 VS Code settings.json 的 `chat.agentFilesLocations` 中。如果尚未顯示過，輸出：

```text
ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:
  "chat.agentFilesLocations": ["/absolute/path/to/copilot-asset-manager/sync/agents"]
```

   在 `.sync-manifest.json` 中記錄 `agent_notice_shown: true`，每台機器只顯示一次。

---

## pull — VS Code → repo

1. 掃描 VS Code 設定中的 `prompts/`、`skills/`、`instructions/` 目錄。**不掃描 `agents/`** — 個人 agent 檔案透過 `chat.agentFilesLocations` 直接從 `sync/agents/` 讀取。

1. 對每個找到的檔案：

- 如果是指向 `sync/` 的 symlink — 跳過（已管理）。
- 如果完全不在 `sync/` 中 — 列為匯入候選。
- 如果已在 `sync/` 中且**內容相同** — 靜默跳過。
- 如果已在 `sync/` 中且**內容不同** — 顯示精簡 diff 並提示：
  - **k** — 保留 repo 版本（`sync/` 不變）
  - **v** — 接受 VS Code 版本（覆寫 `sync/`）
  - **s** — 跳過（稍後決定）

  使用 `--yes` 時：衝突靜默跳過，保留 repo 版本。

1. 不加 `--yes` 時：列出候選檔案並提示使用者（`y` 全選，或輸入編號選擇特定項目）。
   加 `--yes` 時：全部匯入，不提示。

1. 將選取的檔案複製到 `sync/`，保留目錄結構。

1. 更新 `.sync-manifest.json`。

---

## status — 比對 manifest 與檔案系統

1. 讀取 manifest。
2. 對每個同步項目：檢查 source 和 target 是否仍存在。回報 OK 或 ORPHANED。
3. 掃描 `sync/` 中不在 manifest 裡的檔案。回報為 NEW。
4. NEW 表示這些資源尚未執行 `push`。

---

## clean — 移除過期項目

- 找出 manifest 中 source 已不存在的項目。
- 移除對應的 target 檔案（symlink 或複製檔），如果存在的話。
- 從 manifest 中移除該項目。

---

## .sync-manifest.json 格式

```json
{
  "synced": [
    {
      "source": "/abs/path/to/copilot-asset-manager/sync/prompts/my-review.prompt.md",
      "target": "/abs/path/to/Code/User/prompts/my-review.prompt.md",
      "strategy": "symlink",
      "timestamp": "2026-04-07T12:00:00Z"
    }
  ],
  "agent_notice_shown": false
}
```

- `strategy` — `symlink`（macOS/Linux）或 `copy`（Windows）
- `agent_notice_shown` — 在該機器上顯示過 `chat.agentFilesLocations` 指示後為 `true`

Manifest 已加入 **gitignore** — 僅為本機狀態。

---

## 版本歷史

`sync/` 中的每個資源都由 git 追蹤。查看任何檔案的歷史：

```bash
git log --oneline sync/prompts/my-prompt.prompt.md
git diff HEAD~1 sync/prompts/my-prompt.prompt.md
```

這取代了外部備份的需求 — git 就是版本歷史。
