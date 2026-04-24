# Copilot Asset Manager — 以 Git 管理 Copilot 資源，可選擇雙向同步 VS Code

[English](README.md) | **繁體中文**

> 這是 README.md 的翻譯版本。英文版為主要版本。

把這個 repo 當成你個人 Copilot workflow library 的 Git 版：prompts、skills、agents、instructions、hooks 和私人筆記都放在這裡。你可以自己用，也可以 fork 成團隊 repo 來共享 `sync/`。

`sync/` 是和 VS Code 連動的區域：`cam push` 會把它送到 VS Code，`cam pull` 預設也會把 VS Code 的檔案匯回這裡。想保留成只存在 repo 的副本時，再用 `local/`。

## 目錄結構

| 目錄 | 內容 | 會和 VS Code 同步？ |
| ---- | ---- | ------------------- |
| `.github/` | 專案的 agents、skills 和 prompts | 否 - 僅限 workspace |
| `sync/` | 你的 prompts、skills、agents、instructions 和 hooks | 是 - 可推送也可匯入 |
| `local/` | 私人筆記、指南，任何你想放的東西 | 否 |

`sync/` 和 `local/` 都是你的。`sync/` 用來放你想在 repo 和 VS Code 之間來回同步的資源；`local/` 用來放只想留在 repo 的筆記、草稿和參考文件。兩邊都可以自由再分資料夾。

> **只有 Skills 必須保持平層結構，其他類型可以自由分資料夾。** 每個 skill 必須是 `sync/skills/` 的直接子資料夾（例如 `sync/skills/my-skill/SKILL.md`）。VS Code 在 runtime 探索 skill 的方式是掃描 `~/.copilot/skills/<name>/SKILL.md`，不會遞迴進入更深的子資料夾；因此若 skill 放在 `sync/skills/category/my-skill/SKILL.md` 這樣的巢狀路徑，可能無法被載入。Instructions、agents 和 prompts 則是以副檔名遞迴掃描方式探索，巢狀子資料夾完全沒問題。

## 快速開始

先決條件：Node.js 18+ 和 npm。以下請在終端機執行：

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager
npm install
npm link                 # 每台機器執行一次 — 全域連結 `cam`
cam init                 # 每台機器執行一次 — 設定語言與同步模式
cam pull                 # 把現有的 VS Code 資源匯入 sync/
git add . && git commit -m "add my ai config" && git push
cam push                 # 把 sync/ 還原回這台機器的 VS Code
```

## 使用者層級目標位置

`cam push` 會使用 VS Code 目前的使用者層級自訂資源位置：

- `sync/prompts/` -> VS Code profile 的 prompt 資料夾（`Code/User/prompts`）
- `sync/instructions/`、`sync/skills/`、`sync/hooks/`、`sync/agents/` -> `~/.copilot/`

若 VS Code Settings Sync 已設定同步 Prompts and Instructions，VS Code 可以在裝置之間漫遊這些使用者層級的 prompt 與 instruction 資源。至於 agents、skills、hooks，仍建議以這個 repo 作為完整還原與審查的真實來源。

`sync/agents/` 的處理方式和其他非 prompt 類型相同：`cam push` 會把它複製到使用者層級的 `.copilot/agents` 目錄。若你想在 repo 內直接編輯並讓 VS Code 直接從這裡載入 agent，請在 `settings.json` 設定以下內容，然後重新載入視窗：

```jsonc
"chat.agentFilesLocations": {
  "sync/agents": true
}
```

如果同步後的 agent 檔案已經存在於 `.copilot/agents`，但仍未出現在 VS Code，請把它視為 VS Code 的 discovery 問題，並用 Chat Diagnostics 檢查已載入的 custom agents 與任何解析錯誤。

刪除行為預設採保守模式：`cam push` 與 `cam pull sync` 只會回報 manifest 中偵測到的過期對應檔案；只有在你明確指定 `--cleanup ask` 或 `--cleanup delete` 時才會移除。

如果你是在 Copilot Chat 中操作，請用 `/cam-pull` 和 `/cam-push` 取代終端機指令。完成後，這個 repo 就是你 AI 設定的可攜式家園。

## 指令

Chat 指令需要在 VS Code 中開啟此 repo。終端機指令可以在 repo 內任一位置執行。`sync/` 對應到 VS Code 使用者層級的自訂資源儲存位置，不包含 workspace-level 的 `.vscode/` 設定。

語法：

- `[]` = 可選
- `<...>` = 必填
- `a|b` = 擇一
- `<destination>` = `sync` 或 `local`
- `<locale>` = `en` 或 `zh-TW`
- `<cleanup-mode>` = `report`、`ask` 或 `delete`

### 終端機 CLI

- `cam --help`：顯示 CLI 說明。
- `cam --version`：顯示目前安裝的 CLI 版本。
- `cam init`：以互動方式初始化語言與同步偏好。
- `cam pull [<destination>] [--yes] [--cleanup <cleanup-mode>]`：把 VS Code 使用者層級資源匯入 repo。預設目的地是 `sync`。
- `cam push [--yes] [--cleanup <cleanup-mode>]`：把 `sync/` 同步到 VS Code 使用者層級儲存位置。
- `cam status`：回報 synced、new 和 orphaned 檔案。
- `cam clean`：移除孤立的同步檔案並更新 manifest。
- `cam translate <file>`：偵測語言並顯示翻譯目標路徑。
- `cam config`：顯示 config 子指令說明。
- `cam config lang [<locale>]`：設定 CLI 語言；若省略語言值，會改為互動式提示。
- `cam config show`：輸出目前語言與同步模式。

### 選項說明

- `--yes`：只有 `cam pull` 和 `cam push` 支援；會跳過確認提示。
- `--cleanup <cleanup-mode>`：只有 `cam pull` 和 `cam push` 支援。
- `--cleanup report`：只回報過期檔案，不刪除。
- `--cleanup ask`：刪除前逐項詢問。
- `--cleanup delete`：自動刪除所有過期檔案。
- `cam clean` 不支援 `--yes` 或 `--cleanup`。

### Copilot Chat 指令

Slash command 可以直接附帶輸入，例如 `/cam-pull local all`、`/cam-config lang zh-TW` 或 `/cam-translate README.md`。對 `/cam-pull` 來說，`local` 會改變目的地，`all` 對應到 `--yes`。

- `/cam-help`：顯示說明與目前 repo 狀態。
- `/cam-pull`：把 VS Code 資源匯入 repo。
- `/cam-push`：把 `sync/` 同步到 VS Code。
- `/cam-status`：顯示同步狀態。
- `/cam-clean`：移除孤立項目。
- `/cam-config`：設定或顯示語言設定。
- `/cam-translate`：在 English 與 zh-TW 之間翻譯資源。

範例：`cam pull`、`cam pull local --yes`、`cam push --cleanup ask`、`cam push --cleanup delete`、`cam config lang`、`cam config lang zh-TW`、`cam clean`。

Agents：用 `@copilot-asset-manager` 當此 repo 的預設助理，處理多數工作；用 `@scout` 研究社群 prompts、skills 與 agents。這些 workspace 專用資源放在 `.github/`，不會影響 `sync/` 或 `local/`。

## 語言支援

這個 repo 是為英文與繁體中文（zh-TW）的雙語工作流程設計，涵蓋 CLI 與 Copilot Chat。設定你的偏好：

```bash
cam config lang zh-TW   # 切換為中文
cam config lang en      # 切回英文
cam config show         # 顯示目前語言
```

執行 `cam push` 後，同步的指令檔 `cam-language.instructions.md` 會讓 Copilot 在所有 workspace 中使用你選的語言回應，不限於此 repo。翻譯 skill（`.github/skills/translate/`）可以在兩種語言之間轉換資源檔，同時保留 frontmatter 和結構。

## 貢獻

PR 請專注於 CLI（`src/`）、`.github/` workspace 資源或文件。詳見 [`CONTRIBUTING.zh-TW.md`](docs/CONTRIBUTING.zh-TW.md)。
