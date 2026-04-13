# SYNC.md — 同步邏輯詳解

[English](SYNC.md) | **繁體中文**

本文件描述 `cam` CLI（`src/`）的內部邏輯。使用方式請見 README。

## 概述

`copilot-asset-manager` 在兩個位置之間同步：

- **copilot-asset-manager repo 區域**
  - `sync/` — 以 git 追蹤的設定，會同步到 VS Code
  - `local/` — 以 git 追蹤的私人檔案，不會同步到 VS Code
- **VS Code 使用者層級自訂資源儲存位置**
  - prompts：VS Code profile 資料夾（`Code/User/prompts`）
  - instructions、skills、hooks、agents：`~/.copilot/`

Repo 的 workspace 資源放在 `.github/` 下，不屬於 `pull` 或 `push` 的範圍。`pull` 預設匯入到 `sync/`，需要時也可指定匯入到 `local/`。`push` 只同步 `sync/`。`local/` 永遠不會同步到 VS Code。

關於 agents 的補充：`sync/agents/` 屬於使用者層級 agent 同步。`cam push` 會把這些檔案複製到使用者層級儲存位置，但依目前 VS Code 行為，Copilot CLI session 只會顯示 workspace custom agents。若某個 agent 必須能在 Copilot CLI 中被選取，請改定義在 `.github/agents/`。

支援的資源子目錄：`prompts/`、`skills/`、`instructions/`、`hooks/`、`agents/`。

`sync/` 對應到使用者層級的 Copilot 自訂資源儲存位置，不會同步 workspace-level 的 `.vscode/` 設定。

## VS Code Settings Sync 的重疊範圍

VS Code 內建的 Settings Sync 已經會同步使用者層級的 Settings、Keyboard Shortcuts、User Snippets、User Tasks、UI State、Extensions 和 Profiles。依照目前的 Copilot 自訂資源文件，當 Settings Sync 設定為包含 Prompts and Instructions 時，VS Code 也可以漫遊使用者層級的 prompt 與 instruction 檔案。

所以兩者的重疊其實很有限：

- Settings Sync 已經能在不同機器之間帶著你的編輯器偏好走。
- prompt 與 instruction 的漫遊由 VS Code 在啟用該同步類別時處理。
- `copilot-asset-manager` 仍然適合當作完整還原、審查、團隊分享、選擇性 push/pull，以及 skills、hooks、agents 這些檔案型資源的 git 版真實來源。

## 跨檔案 markdown 連結

`sync/` 底下檔案之間的相對連結在 repo 與 VS Code 中都能正常運作，因為 `cam push` 會保留目錄結構。請使用像 `../skills/debug/SKILL.md` 這樣的相對路徑，不要使用 `/Users/...`、`C:\...` 或 `file:///...` 這類絕對路徑。

當 `cam push` 偵測到 synced 檔案內有絕對 markdown 連結路徑時，會顯示警告，但不會阻止同步。

---

## push — repo → VS Code

1. 遞迴掃描 `sync/` 中所有非 .gitkeep 的檔案，比對：

- `sync/prompts/**/*.prompt.md`
- `sync/skills/*/SKILL.md`（僅一層 — 資料夾名稱 = skill 名稱）
- `sync/instructions/**/*.instructions.md`
- `sync/hooks/**/*`
- `sync/agents/**/*.agent.md`

1. 依資源類型決定目標路徑：

- `sync/prompts/**/*` → `{vscodeUserPath}/prompts/<相對子路徑>`（結構保留）
- `sync/skills/{name}/SKILL.md` → `{copilotUserPath}/skills/{name}/SKILL.md`
- `sync/instructions/**/*` → `{copilotUserPath}/instructions/<相對子路徑>`
- `sync/hooks/**/*` → `{copilotUserPath}/hooks/<相對子路徑>`
- `sync/agents/**/*` → `{copilotUserPath}/agents/<相對子路徑>`

1. **衝突檢查：** 如果目標路徑已存在，且未被 manifest 追蹤（即非 copilot-asset-manager 建立的），跳過並輸出：

```text
SKIP <rel-path> — exists at target but not created by copilot-asset-manager (delete the target file first if you want to overwrite)
```

1. 同步目前檔案後，再比對 manifest 與 `sync/`：

- 預設 `--cleanup report`：只回報那些 repo source 已刪除、但使用者層級副本仍存在的 manifest 管理檔案
- `--cleanup ask`：逐一詢問是否刪除使用者層級副本，並從 manifest 移除該項目
- `--cleanup delete`：自動刪除這些過期的使用者層級副本，並從 manifest 移除該項目

1. 視需要建立父目錄。

1. 建立 symlink（macOS/Linux）或複製（Windows）到目標位置。

1. 將每個同步的檔案寫入 `.sync-manifest.json`。

---

## pull — VS Code → repo

指令語法：`cam pull [sync|local] [--yes] [--cleanup report|ask|delete]`（預設為 `sync`）。

1. 掃描使用者層級自訂資源儲存位置：

- `{vscodeUserPath}/prompts/`
- `{copilotUserPath}/skills/`
- `{copilotUserPath}/instructions/`
- `{copilotUserPath}/hooks/`
- `{copilotUserPath}/agents/`

1. 對每個找到的檔案：

- 如果是指向 `sync/` 的 symlink — 跳過（已管理）。
- 如果在所選目的地（`local/` 或 `sync/`）中完全不存在 — 列為匯入候選。
- 如果已在所選目的地中且**內容相同** — 靜默跳過。
- 如果已在所選目的地中且**內容不同** — 提示：
  - **k** — 保留 repo 版本（所選目的地不變）
  - **v** — 接受 VS Code 版本（覆寫所選目的地副本）
  - **s** — 跳過（稍後決定）

  使用 `--yes` 時：衝突會顯示警告並略過，保留 repo 版本。

1. 不加 `--yes` 時：列出候選檔案並提示使用者（`y` 全選，或輸入編號選擇特定項目）。
   加 `--yes` 時：全部匯入，不提示。

1. 將選取的檔案複製到所選目的地，保留目錄結構。

1. 匯入到 `sync/` 時，會再比對 manifest 與使用者層級儲存位置：

- 預設 `--cleanup report`：只回報那些使用者層級副本已刪除、但 repo 副本仍存在的 manifest 管理檔案
- `--cleanup ask`：逐一詢問是否刪除 repo 副本，並從 manifest 移除該項目
- `--cleanup delete`：自動刪除這些過期的 repo 副本，並從 manifest 移除該項目

  `--cleanup` 只影響 `pull sync`。`pull local` 不會刪除 repo 檔案，因為它不使用 manifest。

1. 只有在匯入到 `sync/` 時才更新 `.sync-manifest.json`。

---

## status — 比對 manifest 與檔案系統

1. 讀取 manifest。
2. 對每個同步項目：檢查 source 和 target 是否仍存在。回報 OK 或 ORPHANED。
3. 掃描 `sync/` 中不在 manifest 裡的檔案。回報為 NEW。
4. NEW 表示這些資源尚未執行 `push`。
5. ORPHANED 表示 source 或 target 已遺失；執行 `cam clean` 可清掉過期的 manifest 項目與殘留 target。

---

## clean — 移除過期項目

- 找出 manifest 中 source 已不存在的項目。
- 移除對應的 target 檔案（symlink 或複製檔），如果存在的話。
- 從 manifest 中移除該項目。

`clean` 仍然是明確的批次清理指令；`push` 與 `pull sync` 則透過 `--cleanup` 提供每次執行時的較細緻控制。

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
- `agent_notice_shown` — 為了向後相容而保留的舊欄位

Manifest 已加入 **gitignore** — 僅為本機狀態。

---

## 版本歷史

`sync/` 中的每個資源都由 git 追蹤。查看任何檔案的歷史：

```bash
git log --oneline sync/prompts/my-prompt.prompt.md
git diff HEAD~1 sync/prompts/my-prompt.prompt.md
```

這取代了外部備份的需求 — git 就是版本歷史。
