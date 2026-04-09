# 貢獻 copilot-asset-manager

## Fork 模式如何運作

當你 fork `copilot-asset-manager`，你的 fork 就成為你個人或團隊的 AI 設定 repo。`sync/` 和 `local/` 是你的 — 隨你怎麼用。它們自然會跟 upstream 不同，這是預期的。

Upstream `copilot-asset-manager` 保持乾淨：只有 CLI（`src/`）、`.github/` workspace 資源和文件。CI 會拒絕任何包含 `sync/` 或 `local/` 變更的 PR。

## 把改進回饋給 upstream

如果你修了 CLI 的 bug、改善了 workspace agent 或更新了文件，可以發 PR 回去。關鍵是把貢獻分支跟你的個人設定分開：

```bash
# 如果還沒加 upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/copilot-asset-manager
git fetch upstream

# 從 upstream main 建立乾淨的分支
git checkout -b fix/my-cli-fix upstream/main

# 只改工具層級的檔案（src/、.github/、docs/）
# 不要動 sync/ 或 local/
git add src/
git commit -m "fix: describe what you fixed"
git push origin fix/my-cli-fix

# 從那個分支開 PR
```

你個人的 `sync/` 和 `local/` 內容在你 fork 的 main 分支上，不會進入這個分支。CI 會自動確保這點。

## 創建者 / 維護者雙重身份

如果你同時維護 upstream repo 又想要自己的 AI 設定，把兩者分開：

- **Upstream**（`copilot-asset-manager`）— 你的維護者角色。只有工具變更會進來。
- **你的個人 fork** — 你的使用者角色。有你自己的 `sync/` 和 `local/` 內容，跟其他使用者一樣。

這跟任何開源維護者使用自己工具的模式一樣。

## 貢獻到別人的 fork

Fork 就是 repo。如果有人分享他們的 `copilot-asset-manager` fork，而你想改善他們的某個 prompt、修一個 skill 或建議更好的指南 — 直接對他們的 fork 開 PR。同樣的分支紀律適用：建立專注的分支，只改你要改善的部分，保持可審查性。

`no-personal-content` CI 檢查只在 upstream `copilot-asset-manager` repo 上執行。個人和團隊的 fork 可以自行決定 CI 結構，或完全不用。

## 什麼適合作為 upstream copilot-asset-manager 的 PR

- CLI（`src/`）的 bug 修復或改進
- Workspace agents、skills、prompts 或 instructions 的更新（`.github/agents/`、`.github/skills/`、`.github/prompts/`、`.github/instructions/`）
- 文件修正（README、CONTRIBUTING、`docs/`）
- CI 更新（`.github/workflows/`）

## 品質標準

- 開 PR 前 `npm run build` 必須通過
- Workspace agent 和 skill 檔案必須有有效的 frontmatter
- README 必須維持在 80 行以內
- 不可包含 `sync/` 或 `local/` 的變更 — CI 會自動拒絕
