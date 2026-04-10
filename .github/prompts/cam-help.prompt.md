---
description: Show live sync status and list all copilot-asset-manager slash commands with descriptions.
agent: agent
---

Run `cam status` and display the output, then list all available copilot-asset-manager commands:

| Command | What it does |
|---------|--------------|
| `/cam-help` | Show live status and all commands (this command) |
| `/cam-push` | Symlink/copy `sync/` files to VS Code user config |
| `/cam-pull` | Capture untracked VS Code files into `sync/` |
| `/cam-status` | Show what's synced, what's new, and what's orphaned |
| `/cam-clean` | Remove orphaned manifest entries and stale synced files |
| `/cam-config` | View or change your language setting |
| `/cam-translate` | Translate a Markdown file between English and zh-TW |

If this is your first time using copilot-asset-manager, start with `/cam-pull` to capture your existing VS Code config, then commit the result. On a new machine, run `/cam-push` to restore everything.

For plain-English guidance, open `@copilot-asset-manager` in Copilot Chat.
