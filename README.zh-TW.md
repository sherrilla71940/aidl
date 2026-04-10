[English](README.md) | **繁體中文**

> 這是 README.md 的翻譯版本。英文版為主要版本。

# copilot-asset-manager — 以 Git 管理 Copilot 資源，雙向同步 VS Code

Fork 這個 repo，打造你的 AI 開發環境：prompts、skills、agents、instructions、hooks 和私人筆記 — 全部用 git 管理，隨時可攜。

一個人用，讓你的 AI 工作方式在不同機器間保持一致。或者 fork 成團隊 repo — 把共用的 skills、agents 和 instructions 放進 `sync/`，隊友 clone 後執行 `push` 就能拿到同樣的設定。

## 目錄結構

| 目錄 | 內容 | 會同步到 VS Code？ |
|------|------|---------------------|
| `.github/` | 專案的 agents、skills 和 prompts | 否 — 僅限 workspace |
| `sync/` | 你的 prompts、skills、agents、instructions 和 hooks | 是 |
| `local/` | 私人筆記、指南，任何你想放的東西 | 否 |

`sync/` 和 `local/` 都是你的。差別在於 `sync/` 下對應子目錄（`prompts/`、`skills/`、`instructions/`、`hooks/`、`agents/`）的檔案會同步到 VS Code。`local/` 不會被同步 — 拿來放個人筆記、團隊指南、草稿 prompts、參考文件等等都可以。`sync/` 裡面可以用子資料夾分類整理，同步沒問題。

## 快速開始

先決條件：Node.js 18+ 和 npm。

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager
npm install
cam config lang zh-TW    # 可選：設定語言（en 或 zh-TW）

# 把現有的 VS Code prompts/skills/instructions 匯入 sync/
cam pull

# commit 讓你的 fork 成為唯一的真實來源
git add sync/ && git commit -m "add my ai config" && git push

# 在任何新機器上：clone 你的 fork 然後還原
cam push
```

完成後，這個 repo 就是你 AI 設定的可攜式家園。

## 指令

Chat 指令需要在 VS Code 中開啟此 repo。
`sync/` 對應到你的 VS Code 使用者設定目錄 — 不會同步 workspace-level 的 `.vscode/` 設定。

| 動作 | 終端機 | Copilot Chat |
|------|--------|--------------|
| 初始化語言與同步模式 | `cam init` | — |
| 匯入 VS Code → `sync/` | `cam pull [--yes]` | `/cam-pull` |
| 還原 `sync/` → VS Code | `cam push [--yes]` | `/cam-push` |
| 顯示同步狀態 | `cam status` | `/cam-status` |
| 移除孤立項目 | `cam clean` | — |
| 說明與即時狀態 | — | `/cam-help` |
| 自然語言介面 | — | `@copilot-asset-manager` |
| 搜尋社群資源 | — | `@scout` |
| 設定語言 | `cam config lang [en\|zh-TW]` | — |
| 翻譯資源檔（en ↔ zh-TW） | — | 使用 `translate` skill |

## 語言支援

支援英文和繁體中文（zh-TW），涵蓋 CLI 與 Copilot Chat agents。設定你的偏好：

```bash
cam config lang zh-TW   # 切換為中文
cam config lang en      # 切回英文
cam config show         # 顯示目前語言
```

執行 `cam push` 後，同步的指令檔 `cam-language.instructions.md` 會讓 Copilot 在所有 workspace 中使用你選的語言回應，不限於此 repo。翻譯 skill（`.github/skills/translate/`）可以在兩種語言之間轉換資源檔，同時保留 frontmatter 和結構。

## Workspace 預設資源

此 repo 在 `.github/` 下附帶了 workspace 專用資源 — `@copilot-asset-manager` 和 `@scout` agents 以及斜線指令 prompts。這些只在此 repo 中生效，不會影響 `sync/` 或 `local/`。

## 貢獻

PR 請專注於 CLI（`src/`）、`.github/` workspace 資源或文件。詳見 [`CONTRIBUTING.zh-TW.md`](docs/CONTRIBUTING.zh-TW.md)。
