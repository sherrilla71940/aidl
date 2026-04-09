English | **繁體中文**

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

`sync/` 和 `local/` 都是你的。差別在於 `sync/` 下對應子目錄（`prompts/`、`skills/`、`instructions/`、`hooks/`、`agents/`）的檔案會同步到 VS Code。`local/` 不會被同步 — 拿來放個人筆記、團隊指南、草稿 prompts、參考文件等等都可以。

`sync/` 裡面可以用子資料夾分類整理，同步沒問題：

```
sync/
  prompts/
    code-review/
      review-pr.prompt.md
      review-security.prompt.md
    writing/
      summarize.prompt.md
  skills/
    debug/
      SKILL.md
  hooks/
    pre-commit-check.md
```

## 快速開始

選你的 shell 對應的同步腳本：`<sync-script>` = `./scripts/sync.sh`（macOS/Linux/Git Bash）或 `.\scripts\sync.ps1`（Windows PowerShell）。

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager

# 把現有的 VS Code prompts/skills/instructions 匯入 sync/
<sync-script> pull

# commit 讓你的 fork 成為唯一的真實來源
git add sync/ && git commit -m "add my ai config" && git push

# 在任何新機器上：clone 你的 fork 然後還原
<sync-script> push
```

完成後，這個 repo 就是你 AI 設定的可攜式家園。

## 指令

Chat 指令需要在 VS Code 中開啟此 repo。

| 動作 | 終端機 | Copilot Chat |
|------|--------|--------------|
| 匯入 VS Code → `sync/` | `<sync-script> pull [--yes]` | `/cam-pull` |
| 還原 `sync/` → VS Code | `<sync-script> push [--yes]` | `/cam-push` |
| 顯示同步狀態 | `<sync-script> status` | `/cam-status` |
| 移除孤立項目 | `<sync-script> clean` | — |
| 說明與即時狀態 | — | `/cam-help` |
| 自然語言介面 | — | `@copilot-asset-manager` |
| 搜尋社群資源 | — | `@scout` |

## Workspace 預設資源

此 repo 在 `.github/` 下附帶了 workspace 專用資源 — `@copilot-asset-manager` 和 `@scout` agents 以及斜線指令 prompts。這些只在此 repo 中生效，不會影響 `sync/` 或 `local/`。

## 貢獻

PR 請專注於同步腳本、`.github/` workspace 資源或文件。詳見 `CONTRIBUTING.zh-TW.md`。
