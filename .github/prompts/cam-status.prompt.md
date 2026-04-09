---
description: Show which files are synced, which are new (not yet pushed), and which are orphaned.
mode: agent
---

Run the following command to check sync status:

```bash
cam status
```

The output groups your assets into three states:

- **`[OK]`** — File is tracked in the manifest and exists at both source (`sync/`) and target (VS Code user config).
- **`[ORPHANED]`** — File is in the manifest but one end is missing. Run `cam clean` to remove orphaned entries.
- **`[NEW]`** — File exists in `sync/` but has not been synced to VS Code yet. Run `/cam-push` to link it.

Use status to verify your library is fully synced, especially after adding new assets or pulling config from a new machine.

To clean up orphaned entries:

```bash
cam clean
```
