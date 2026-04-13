# Copilot Asset Manager — Git-backed Copilot assets with optional bidirectional VS Code sync

**English** | [繁體中文](README.zh-TW.md)

Use this repo as the Git-tracked home for your personal Copilot workflow library: prompts, skills, agents, instructions, hooks, and private guides. Keep it personal, or fork it for a team and share `sync/`.

`sync/` is the VS Code-linked area: `cam push` sends it to VS Code, and `cam pull` imports back into it by default. Use `local/` when you want files tracked in the repo but not linked to VS Code.

## How it's organized

| Area | What lives here | Syncs with VS Code? |
| ---- | --------------- | ------------------- |
| `.github/` | Project agents, skills, and prompts | No - workspace only |
| `sync/` | Your prompts, skills, agents, instructions, and hooks | Yes - push and pull |
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
cam pull                 # import existing VS Code assets into sync/
git add . && git commit -m "add my ai config" && git push
cam push                 # restore sync/ back into VS Code on this machine
```

## User-level targets

`cam push` uses VS Code's current user-level customization layout:

- `sync/prompts/` -> your VS Code profile prompt folder (`Code/User/prompts`)
- `sync/instructions/`, `sync/skills/`, `sync/hooks/`, `sync/agents/` -> `~/.copilot/`

With Settings Sync configured to include Prompts and Instructions, VS Code can roam those user-level prompt and instruction assets across devices. Agents, skills, and hooks are still managed as file-based user assets, so this repo remains the source of truth for full restore and review.

`sync/agents/` is handled the same way as the other non-prompt asset types: `cam push` copies it into the user-level `.copilot/agents` directory. To have VS Code load agents directly from this repo while you edit them in place, set this in `settings.json` and reload the window:

```jsonc
"chat.agentFilesLocations": {
  "sync/agents": true
}
```

If a synced agent file exists under `.copilot/agents` but does not appear in VS Code, treat that as a VS Code discovery issue and use Chat Diagnostics to inspect loaded custom agents and any parse errors.

Deletion is conservative by default: `cam push` and `cam pull sync` report stale counterpart files from the manifest, and only remove them when you opt into `--cleanup ask` or `--cleanup delete`.

In Copilot Chat, use `/cam-pull` and `/cam-push` instead of the terminal commands. After that, your repo is the portable home of your AI setup.

## Commands

Chat commands require this repo open in VS Code. Terminal commands can be run from anywhere inside the repo. `sync/` maps to VS Code user-level customization storage, not workspace-level `.vscode/` settings.

Syntax:

- `[]` = optional
- `<...>` = required
- `a|b` = choose one
- `<destination>` = `sync` or `local`
- `<locale>` = `en` or `zh-TW`
- `<cleanup-mode>` = `report`, `ask`, or `delete`

### Terminal CLI

- `cam --help`: show CLI help.
- `cam --version`: show the installed CLI version.
- `cam init`: initialize language and sync preferences interactively.
- `cam pull [<destination>] [--yes] [--cleanup <cleanup-mode>]`: import VS Code user-level assets into the repo. Default destination is `sync`.
- `cam push [--yes] [--cleanup <cleanup-mode>]`: sync `sync/` to VS Code user-level storage.
- `cam status`: report synced, new, and orphaned files.
- `cam clean`: remove orphaned synced files and update the manifest.
- `cam translate <file>`: detect language and show the translated target path.
- `cam config`: show help for config subcommands.
- `cam config lang [<locale>]`: set CLI language; if the locale is omitted, it prompts interactively.
- `cam config show`: print current language and sync mode.

### Option meanings

- `--yes`: supported by `cam pull` and `cam push`; skips confirmation prompts.
- `--cleanup <cleanup-mode>`: supported by `cam pull` and `cam push` only.
- `--cleanup report`: report stale files without deleting them.
- `--cleanup ask`: prompt one by one before deleting stale files.
- `--cleanup delete`: delete stale files automatically.
- `cam clean` does not support `--yes` or `--cleanup`.

### Copilot Chat commands

Slash commands can take inline input, for example `/cam-pull local all`, `/cam-config lang zh-TW`, or `/cam-translate README.md`. For `/cam-pull`, `local` changes the destination and `all` maps to `--yes`.

- `/cam-help`: show help and live repo status.
- `/cam-pull`: import VS Code assets into the repo.
- `/cam-push`: sync `sync/` to VS Code.
- `/cam-status`: show sync state.
- `/cam-clean`: remove orphaned entries.
- `/cam-config`: set or show language settings.
- `/cam-translate`: translate an asset between English and zh-TW.

Examples: `cam pull`, `cam pull local --yes`, `cam push --cleanup ask`, `cam push --cleanup delete`, `cam config lang`, `cam config lang zh-TW`, `cam clean`.

Agents: use `@copilot-asset-manager` as the default project assistant for most repo tasks; use `@scout` for community prompts, skills, and agent research. These workspace-native assets live under `.github/` and do not affect `sync/` or `local/`.

## Language support

This repo is designed for bilingual English and Traditional Chinese (zh-TW) workflows across the CLI and Copilot Chat. Set your preference:

```bash
cam config lang zh-TW   # switch to Chinese
cam config lang en      # switch back to English
cam config show         # show current language
```

After `cam push`, the synced instruction `cam-language.instructions.md` tells Copilot to respond in your chosen language in every workspace, not just this repo. The translate skill (`.github/skills/translate/`) can convert asset files between languages while preserving frontmatter and structure.

## Contributing

PRs should focus on the CLI (`src/`), `.github/` workspace assets, or docs. See [`CONTRIBUTING.md`](docs/CONTRIBUTING.md).
