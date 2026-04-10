**English** | [繁體中文](README.zh-TW.md)

# copilot-asset-manager — Git-backed Copilot assets with bidirectional VS Code sync

Fork this repo and build your AI development setup: prompts, skills, agents, instructions, hooks, and private guides — all versioned and portable.

Use it alone to keep your AI working style portable across machines. Or fork it as a team repo — populate `sync/` with shared skills, agents, and instructions, and teammates clone + `push` to get the same setup.

## How it's organized

| Area | What lives here | Synced to VS Code? |
|------|-----------------|--------------------|
| `.github/` | Project agents, skills, and prompts | No — workspace only |
| `sync/` | Your prompts, skills, agents, instructions, and hooks | Yes |
| `local/` | Private guides, notes, anything you want | No |

Both `sync/` and `local/` are yours. The difference is that files under `sync/` in the right subdirectories (`prompts/`, `skills/`, `instructions/`, `hooks/`, `agents/`) get synced to VS Code. `local/` is never synced — use it for personal notes, team guides, draft prompts, reference docs, or anything else. You can nest folders inside `sync/` for organization — they sync fine.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager
npm install
cam config lang en       # optional: set language (en or zh-TW)

# Import your existing VS Code prompts/skills/instructions into sync/
cam pull

# Commit so your fork is your source of truth
git add sync/ && git commit -m "add my ai config" && git push

# On any new machine: clone your fork and restore
cam push
```

After that, your repo is the portable home of your AI setup.

## Commands

Chat commands require this repo open in VS Code.

| Action | Terminal | Copilot Chat |
|--------|----------|--------------|
| Import VS Code → `sync/` | `cam pull [--yes]` | `/cam-pull` |
| Restore `sync/` → VS Code | `cam push [--yes]` | `/cam-push` |
| Show sync state | `cam status` | `/cam-status` |
| Remove orphaned entries | `cam clean` | — |
| Help & live status | — | `/cam-help` |
| Plain-English interface | — | `@copilot-asset-manager` |
| Find community assets | — | `@scout` |
| Set language | `cam config lang [en\|zh-TW]` | — |
| Translate assets (en ↔ zh-TW) | — | Invoke the `translate` skill |

## Language support

English and Traditional Chinese (zh-TW) are supported across the CLI and Copilot Chat agents. Set your preference:

```bash
cam config lang zh-TW   # switch to Chinese
cam config lang en      # switch back to English
cam config show         # show current language
```

After `cam push`, the synced instruction `cam-language.instructions.md` tells Copilot to respond in your chosen language in every workspace — not just this repo. The translate skill (`.github/skills/translate/`) can convert asset files between languages while preserving frontmatter and structure.

## Workspace defaults

This repo ships its own workspace-native assets under `.github/` — the `@copilot-asset-manager` and `@scout` agents and the slash command prompts. These apply within this repo only and don't affect `sync/` or `local/`.

## Contributing

PRs should focus on the CLI (`src/`), `.github/` workspace assets, or docs. See [`CONTRIBUTING.md`](docs/CONTRIBUTING.md).
