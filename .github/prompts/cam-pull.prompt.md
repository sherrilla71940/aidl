---
description: Capture untracked VS Code prompts, skills, and instructions into local/ by default or sync/ when requested.
agent: agent
---

Run one of the following commands to import your existing VS Code config into the copilot-asset-manager repo:

```bash
cam pull
```

This uses the default target, `local/`.

To import directly into `sync/` instead:

```bash
cam pull sync
```

This will:
- Scan your VS Code user config (`prompts/`, `skills/`, `instructions/`, `hooks/`) for files not yet tracked in the selected destination.
- Show you the candidates and ask which ones to import (or import all with `y`).
- Skip files whose content already matches a copy in that destination (no duplicates).
- Print a warning and skip any file that differs from an existing destination copy — rerun without `--yes` to resolve conflicts interactively.

To import all without prompting (e.g., in CI or first-time setup):

```bash
cam pull [local|sync] --yes
```

After importing into `sync/`, commit the new files and push to your fork.
