---
description: Show live sync status and list all aidl slash commands with descriptions.
mode: agent
---

Run `./scripts/sync.sh status` and display the output, then list all available aidl commands:

| Command | What it does |
|---------|--------------|
| `/aidl-help` | Show live status and all commands (this command) |
| `/aidl-push` | Symlink/copy `user/sync/` files to VSCode user config |
| `/aidl-pull` | Capture untracked VSCode files into `user/sync/` |
| `/aidl-add` | Install an asset from the community registry or a URL |
| `/aidl-list` | List all available assets in the registry, grouped by type |
| `/aidl-status` | Show what's synced, what's new, and what's orphaned |

If this is your first time using aidl, start with `/aidl-pull` to capture your existing VSCode config, then commit the result. On a new machine, run `/aidl-push` to restore everything.

For plain-English guidance, open `@aidl` in Copilot Chat.
