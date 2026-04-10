---
description: View or change your copilot-asset-manager language setting.
argument-hint: "show | lang en | lang zh-TW"
agent: agent
---

The user wants to view or change the repo language setting.

Use any extra slash-command input after `/cam-config`:
- `show` runs `cam config show`
- `lang en` runs `cam config lang en`
- `lang zh-TW` runs `cam config lang zh-TW`
- If no input is given, default to `cam config show`

After changing language, mention that `/cam-push` syncs the `cam-language.instructions.md` file to VS Code.
