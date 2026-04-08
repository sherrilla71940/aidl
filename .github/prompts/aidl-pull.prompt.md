---
description: Capture untracked VSCode prompts, skills, and instructions into user-sync/ (pull VSCode → repo).
mode: agent
---

Run the following command to import your existing VSCode config into the aidl repo:

```bash
./scripts/sync.sh pull
```

Or on Windows:

```powershell
.\scripts\sync.ps1 pull
```

This will:
- Scan your VSCode user config (`prompts/`, `skills/`, `instructions/`) for files not yet tracked in `user-sync/`.
- Show you the candidates and ask which ones to import (or import all with `y`).
- Skip files whose content already matches a copy in `user-sync/` (no duplicates).
- Print a warning and skip any file that differs from an existing `user-sync/` copy — delete the `user-sync/` copy first if you want to overwrite it.

To import all without prompting (e.g., in CI or first-time setup):

```bash
./scripts/sync.sh pull --yes
```

After importing, commit the new files in `user-sync/` and push to your fork.
