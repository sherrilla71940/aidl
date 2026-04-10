---
description: Sync sync/ files to your VS Code user config (push repo → VS Code).
argument-hint: "[all]"
agent: agent
---

The user wants to push `sync/` into their VS Code user config.

Use any extra slash-command input after `/cam-push`:
- `all` or `yes` means skip confirmation prompts, which maps to `--yes`.

Examples:
- `/cam-push` → `cam push`
- `/cam-push all` → `cam push --yes`

Run the matching terminal command and summarize any follow-up, especially `chat.agentFilesLocations` setup when relevant.
