# Copilot Asset Manager — Git-backed Copilot assets with optional bidirectional VS Code sync

**English** | [繁體中文](README.zh-TW.md)

Use this repo as the Git-tracked home for your personal Copilot workflow library: prompts, skills, agents, instructions, hooks, and private guides. Keep it personal, or fork it for a team and share `sync/`.

`cam push` syncs `sync/` to VS Code. `cam pull` imports from VS Code into `local/` or `sync/`; use `cam pull sync` + `cam push` for bidirectional sync, with one user-level copy in VS Code and one Git-tracked copy here.

## How it's organized

| Area | What lives here | Synced to VS Code? |
| ---- | ----------------- | -------------------- |
| `.github/` | Project agents, skills, and prompts | No — workspace only |
| `sync/` | Your prompts, skills, agents, instructions, and hooks | Yes |
| `local/` | Private guides, notes, anything you want | No |

Both `sync/` and `local/` are yours. The difference is that files under `sync/` in the right subdirectories (`prompts/`, `skills/`, `instructions/`, `hooks/`, `agents/`) get synced to VS Code. `local/` is never synced — use it for personal notes, team guides, draft prompts, reference docs, or anything else. You can nest folders inside `sync/` for organization — they sync fine.

## Quick start

Prerequisites: Node.js 18+ and npm.

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager
npm install
npm link                 # links `cam` on this machine
cam init                 # set language + sync mode (Enter keeps defaults)

# Import your existing VS Code prompts/skills/instructions/hooks into sync/
cam pull sync

# Commit so your fork is your source of truth
git add sync/ && git commit -m "add my ai config" && git push

# On any new machine: clone your fork and restore
cam push                 # first push may ask for chat.agentFilesLocations for sync/agents
```

After that, your repo is the portable home of your AI setup.

## Commands

Chat commands require this repo open in VS Code.
`sync/` maps to your VS Code user config directory — it does not sync workspace-level `.vscode/` settings. Terminal commands must be run from inside the repo directory.

| Action | Terminal | Copilot Chat |
| ------ | ---------- | -------------- |
| Initialize language + sync mode | `cam init` | — |
| Import VS Code → repo | `cam pull [local|sync] [--yes]` | `/cam-pull` |
| Restore `sync/` → VS Code | `cam push [--yes]` | `/cam-push` |
| Show sync state | `cam status` | `/cam-status` |
| Remove orphaned entries | `cam clean` | `/cam-clean` |
| Help & live status | — | `/cam-help` |
| Set/show language | `cam config lang` / `cam config show` | `/cam-config` |
| Translate assets (en ↔ zh-TW) | `cam translate <file>` | `/cam-translate` |

Agents: use `@copilot-asset-manager` as the default project assistant for most repo tasks; use `@scout` for community prompts, skills, and agent research.

## Language support

This repo is designed for bilingual English and Traditional Chinese (zh-TW) workflows across the CLI and Copilot Chat. Set your preference:

```bash
cam config lang zh-TW   # switch to Chinese
cam config lang en      # switch back to English
cam config show         # show current language
```

After `cam push`, the synced instruction `cam-language.instructions.md` tells Copilot to respond in your chosen language in every workspace — not just this repo. The translate skill (`.github/skills/translate/`) can convert asset files between languages while preserving frontmatter and structure.

## Workspace defaults

This repo ships its own workspace-native assets under `.github/` — the `@copilot-asset-manager` and `@scout` agents and the slash command prompts. These apply within this repo only and don't affect `sync/` or `local/`.

`cam pull [local|sync]` defaults to `local/` and does not import agents from VS Code. Keep personal agents in `sync/agents/`, then follow the one-time `chat.agentFilesLocations` notice shown by `cam push`.

## Contributing

PRs should focus on the CLI (`src/`), `.github/` workspace assets, or docs. See [`CONTRIBUTING.md`](docs/CONTRIBUTING.md).
