---
description: Sync sync/ files to your VS Code user config (push repo → VS Code).
mode: agent
---

Run the following command to push your copilot-asset-manager library to VS Code:

```bash
cam push
```

This will:
- Symlink (macOS/Linux) or copy (Windows) all files from `sync/prompts/`, `sync/skills/`, and `sync/instructions/` into your VS Code user config directory.
- Skip any files that already exist at the target and were not created by copilot-asset-manager (prints a warning).
- Print `ACTION REQUIRED` if `chat.agentFilesLocations` needs to be added to your VS Code `settings.json` for personal agent discovery.

Run this after adding any new asset to `sync/`, or on a fresh machine after cloning your fork.

To skip confirmation prompts (e.g., in a script), use `--yes`.
