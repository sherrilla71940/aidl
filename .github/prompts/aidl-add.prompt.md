---
description: Install an asset from the community registry (or any URL) into user-sync/.
mode: agent
---

To install an asset from the default registry ([github/awesome-copilot](https://github.com/github/awesome-copilot)):

```bash
./scripts/sync.sh add <name>
```

To install directly from a URL:

```bash
./scripts/sync.sh add https://github.com/someone/skills
```

On Windows:

```powershell
.\scripts\sync.ps1 add <name>
.\scripts\sync.ps1 add https://github.com/someone/skills
```

If you haven't provided an asset name, run `/aidl-list` first to see what's available, then come back with: `/aidl-add <name>`.

The script will:
1. Show you the registry URL and asset path before downloading (trust prompt).
2. Install the asset into the appropriate `user-sync/` subfolder.
3. Remind you to run `push` (or `/aidl-push`) to sync it to VSCode.

To use a different registry for this session:

```bash
AIDL_REGISTRY=https://github.com/myteam/skills ./scripts/sync.sh add debug
```
