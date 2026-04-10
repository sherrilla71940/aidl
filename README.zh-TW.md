# Copilot Asset Manager — 以 Git 管理 Copilot 資源，可選擇雙向同步 VS Code
[English](README.md) | **繁體中文**
> 這是 README.md 的翻譯版本。英文版為主要版本。
把這個 repo 當成你個人 Copilot workflow library 的 Git 版：prompts、skills、agents、instructions、hooks 和私人筆記都放在這裡。你可以自己用，也可以 fork 成團隊 repo 來共享 `sync/`。`sync/` 是和 VS Code 連動的區域：`cam push` 會把它送到 VS Code，`cam pull` 預設也會把 VS Code 的檔案匯回這裡。想保留成只存在 repo 的副本時，再用 `local/`。
## 目錄結構
| 目錄 | 內容 | 會和 VS Code 同步？ |
| ---- | ---- | --------------------- |
| `.github/` | 專案的 agents、skills 和 prompts | 否 — 僅限 workspace |
| `sync/` | 你的 prompts、skills、agents、instructions 和 hooks | 是 — 可推送也可匯入 |
| `local/` | 私人筆記、指南，任何你想放的東西 | 否 |
`sync/` 和 `local/` 都是你的。`sync/` 用來放你想在 repo 和 VS Code 之間來回同步的資源；`local/` 用來放只想留在 repo 的筆記、草稿和參考文件。兩邊都可以自由再分資料夾。
## 快速開始
先決條件：Node.js 18+ 和 npm。以下請在終端機執行：

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager
npm install
npm link                 # 在這台機器上建立 `cam` 連結
cam init                 # 設定語言與同步模式（直接按 Enter 可保留預設值）

# 預設把現有的 VS Code prompts/skills/instructions/hooks 匯入 sync/
cam pull                # 如果只想留在 repo，改用 `cam pull local`

# commit 讓你的 fork 成為唯一的真實來源
git add . && git commit -m "add my ai config" && git push

# 在任何新機器上：clone 你的 fork 然後還原
cam push                 # 第一次 push 可能會提示設定 sync/agents 的 chat.agentFilesLocations
```
## Agent 設定
如果你把個人的 agents 放在 `sync/agents/`，請把該資料夾在你本機上的實際路徑加到 VS Code 的 `chat.agentFilesLocations`。
如果你有使用 VS Code Settings Sync，最好的情況是在每台機器都把這個 repo clone 到相同路徑；如果不同機器的路徑不同，就在各台機器上把 `chat.agentFilesLocations` 改成對應的本機 repo 路徑。
如果你想讓其他 VS Code 設定繼續同步，但把這一項保留成每台機器各自設定，請把 `chat.agentFilesLocations` 加到 `settingsSync.ignoredSettings`。

```json
{
	"chat.agentFilesLocations": [
		"/actual/path/to/copilot-asset-manager/sync/agents"
	],
	"settingsSync.ignoredSettings": [
		"chat.agentFilesLocations"
	]
}
```

如果你是在 Copilot Chat 中操作，請用 `/cam-pull` 和 `/cam-push` 取代終端機指令。完成後，這個 repo 就是你 AI 設定的可攜式家園。
## 指令

Chat 指令需要在 VS Code 中開啟此 repo。終端機指令可以在 repo 內任一位置執行。`sync/` 對應到你的 VS Code 使用者設定目錄，不包含 workspace-level 的 `.vscode/` 設定。
Slash command 可以直接附帶輸入，例如 `/cam-pull local all`、`/cam-config lang zh-TW` 或 `/cam-translate README.md`。以 pull 來說，目的地和是否跳過提示是分開的：`cam pull` 預設匯入到 `sync/`，`local` 會改變目的地，`all` 則對應到 `--yes`。

| 動作 | 終端機 | Copilot Chat |
| ------ | -------- | -------------- |
| 初始化語言與同步模式 | `cam init` | — |
| 匯入 VS Code → repo | `cam pull [sync/local] [--yes]` | `/cam-pull` |
| 還原 `sync/` → VS Code | `cam push [--yes]` | `/cam-push` |
| 顯示同步狀態 | `cam status` | `/cam-status` |
| 移除孤立項目 | `cam clean` | `/cam-clean` |
| 說明與即時狀態 | — | `/cam-help` |
| 設定/顯示語言 | `cam config lang` / `cam config show` | `/cam-config` |
| 翻譯資源檔（en ↔ zh-TW） | `cam translate <file>` | `/cam-translate` |

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
