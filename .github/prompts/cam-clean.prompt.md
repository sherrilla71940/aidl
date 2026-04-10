---
description: Remove orphaned manifest entries and stale synced files.
agent: agent
---

First run `cam status` to show the current state, then run:

```bash
cam clean
```

This will:
- Remove any manifest entry whose source file in `sync/` no longer exists.
- Delete the corresponding target file in your VS Code user config directory if it's still present.
- Rewrite `.sync-manifest.json` with only the valid entries.

Use this after deleting files from `sync/` to keep the manifest and VS Code config in sync. Run `/cam-status` afterward to confirm everything looks clean.
