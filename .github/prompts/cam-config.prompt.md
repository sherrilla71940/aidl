---
description: View or change your copilot-asset-manager language setting.
agent: agent
---

To see your current language:

```bash
cam config show
```

To switch languages:

```bash
cam config lang en       # English
cam config lang zh-TW    # Traditional Chinese (繁體中文)
```

Supported languages: `en` and `zh-TW`. This setting controls the CLI output language and is stored in `.cam-config.json`.

After changing language, run `/cam-push` to sync the `cam-language.instructions.md` file to VS Code — this tells Copilot to respond in your chosen language across all workspaces, not just this repo.
