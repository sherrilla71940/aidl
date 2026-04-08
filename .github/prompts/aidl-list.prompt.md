---
description: List all available assets in the community registry, grouped by type.
mode: agent
---

Run the following command to browse the registry:

```bash
./scripts/sync.sh list
```

Or on Windows:

```powershell
.\scripts\sync.ps1 list
```

This fetches (or refreshes) the registry cache from [github/awesome-copilot](https://github.com/github/awesome-copilot) and prints all available assets grouped by type:

```
Skills
  debug           Systematic debugging workflow
  api-design      REST API design with opinionated defaults

Agents
  explorer        Codebase exploration and architecture summary

Prompts
  (none yet — contribute at https://github.com/github/awesome-copilot)
```

To install any asset, use `/aidl-add <name>` or run `./scripts/sync.sh add <name>`.

The registry cache is refreshed automatically if it's older than 24 hours. To use a different registry, set `AIDL_REGISTRY=<url>` before running the command.
