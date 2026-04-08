---
description: Sync user-sync/ files to your VSCode user config (push repo → VSCode).
mode: agent
---

Run the following command to push your aidl library to VSCode:

```bash
./scripts/sync.sh push
```

Or on Windows:

```powershell
.\scripts\sync.ps1 push
```

This will:
- Symlink (macOS/Linux) or copy (Windows) all files from `user-sync/prompts/`, `user-sync/skills/`, and `user-sync/instructions/` into your VSCode user config directory.
- Skip any files that already exist at the target and were not created by aidl (prints a warning).
- Print `ACTION REQUIRED` if `chat.agentFilesLocations` needs to be added to your VSCode `settings.json` for agent discovery.

Run this after adding any new asset to `user-sync/`, or on a fresh machine after cloning your fork.

To skip confirmation prompts (e.g., in a script), use `--yes`.
