# Copilot Asset Manager — Git-backed Copilot assets with optional bidirectional VS Code sync

**English** | [繁體中文](README.zh-TW.md)

Use this repo as the Git-tracked home for your personal Copilot workflow library: prompts, skills, agents, instructions, hooks, and private guides. Keep it personal, or fork it for a team and share `sync/`.

`sync/` is the VS Code-linked area: `cam push` sends it to VS Code, and `cam pull` imports back into it by default. Use `local/` when you want files tracked in the repo but not linked to VS Code.

## How it's organized

| Area | What lives here | Syncs with VS Code? |
| ---- | ----------------- | -------------------- |
| `.github/` | Project agents, skills, and prompts | No — workspace only |
| `sync/` | Your prompts, skills, agents, instructions, and hooks | Yes — push and pull |
| `local/` | Private guides, notes, anything you want | No |

Both `sync/` and `local/` are yours. `sync/` is for assets you want to move between this repo and VS Code; `local/` is for repo-only notes, drafts, and references. You can nest folders inside either one.

## Quick start

Prerequisites: Node.js 18+ and npm. Run these in a terminal:

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager
npm install
npm link                 # links `cam` on this machine
cam init                 # set language + sync mode (Enter keeps defaults)

# Import your existing VS Code prompts/skills/instructions/hooks into sync/ by default
cam pull                # use `cam pull local` for a repo-only copy

# Commit so your fork is your source of truth
git add . && git commit -m "add my ai config" && git push

# On any new machine: clone your fork and restore
cam push                 # first push may ask for chat.agentFilesLocations for sync/agents
```

In Copilot Chat, use `/cam-pull` and `/cam-push` instead of the terminal commands. After that, your repo is the portable home of your AI setup.

## Commands

Chat commands require this repo open in VS Code. Terminal commands can be run from anywhere inside the repo. `sync/` maps to your VS Code user config directory, not workspace-level `.vscode/` settings.
Slash commands can take inline input, for example `/cam-pull local all`, `/cam-config lang zh-TW`, or `/cam-translate README.md`. For pull, destination and prompt-skipping are separate: `cam pull` defaults to `sync/`, `local` changes the destination, and `all` maps to `--yes`.

| Action | Terminal | Copilot Chat |
| ------ | ---------- | -------------- |
| Initialize language + sync mode | `cam init` | — |
| Import VS Code → repo | `cam pull [sync/local] [--yes]` | `/cam-pull` |
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

`cam pull` defaults to `sync/` and does not import agents from VS Code. Keep personal agents in `sync/agents/`, then follow the one-time `chat.agentFilesLocations` notice shown by `cam push`.

## Contributing

PRs should focus on the CLI (`src/`), `.github/` workspace assets, or docs. See [`CONTRIBUTING.md`](docs/CONTRIBUTING.md).
