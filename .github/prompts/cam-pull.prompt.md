---
description: Capture untracked VS Code prompts, skills, and instructions into sync/ by default or local/ when requested.
argument-hint: "[sync|local] [all]"
agent: agent
---

The user wants to import VS Code assets into this repo.

Use any extra slash-command input after `/cam-pull`:
- `sync` or `local` selects the destination. Default to `sync`.
- `all` or `yes` means import all without prompting, which maps to `--yes`.
- Destination and `--yes` are independent: destination chooses `sync` or `local`, while `--yes` only skips prompts.

Examples:
- `/cam-pull` → `cam pull`
- `/cam-pull local` → `cam pull local`
- `/cam-pull all` → `cam pull --yes`
- `/cam-pull local all` → `cam pull local --yes`

Run the matching terminal command, summarize what was imported, and mention when a commit or `/cam-push` is the natural next step.
