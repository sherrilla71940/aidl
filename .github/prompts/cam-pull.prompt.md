---
description: Capture untracked VS Code prompts, skills, and instructions into sync/ (pull VS Code → repo).
mode: agent
---

Run the following command to import your existing VS Code config into the copilot-asset-manager repo:

```bash
./scripts/sync.sh pull
```

Or on Windows:

```powershell
.\scripts\sync.ps1 pull
```

This will:
- Scan your VS Code user config (`prompts/`, `skills/`, `instructions/`) for files not yet tracked in `sync/`.
- Show you the candidates and ask which ones to import (or import all with `y`).
- Skip files whose content already matches a copy in `sync/` (no duplicates).
- Print a warning and skip any file that differs from an existing `sync/` copy — delete the `sync/` copy first if you want to overwrite it.

To import all without prompting (e.g., in CI or first-time setup):

```bash
./scripts/sync.sh pull --yes
```

After importing, commit the new files in `sync/` and push to your fork.
