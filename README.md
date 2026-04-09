# copilot-asset-manager — Git-backed Copilot assets with bidirectional VS Code sync

Fork this repo and build your AI development setup: prompts, skills, agents, instructions, hooks, and private guides — all versioned and portable.

Use it alone to keep your AI working style portable across machines. Fork it as a shared repo to standardize how your team uses AI.

## How it's organized

| Area | What lives here | Synced to VS Code? |
|------|-----------------|--------------------|
| `.github/` | Project agents, skills, and prompts | No — workspace only |
| `sync/` | Your prompts, skills, agents, instructions, and hooks | Yes |
| `local/` | Private guides, notes, anything you want | No |

Both `sync/` and `local/` are yours. The difference is that files under `sync/` in the right subdirectories (`prompts/`, `skills/`, `instructions/`, `hooks/`, `agents/`) get synced to VS Code. `local/` is never synced — use it for personal notes, team guides, draft prompts, reference docs, or anything else.

You can nest folders inside `sync/` for organization — they sync fine:

```
sync/
  prompts/
    code-review/
      review-pr.prompt.md
      review-security.prompt.md
    writing/
      summarize.prompt.md
  skills/
    debug/
      SKILL.md
  hooks/
    pre-commit-check.md
```

## Quick start

Pick your shell's sync script: `<sync-script>` = `./scripts/sync.sh` (macOS/Linux/Git Bash) or `.\scripts\sync.ps1` (Windows PowerShell).

```bash
git clone https://github.com/YOUR_USERNAME/copilot-asset-manager
cd copilot-asset-manager

# Import your existing VS Code prompts/skills/instructions into sync/
<sync-script> pull

# Commit so your fork is your source of truth
git add sync/ && git commit -m "add my ai config" && git push

# On any new machine: clone your fork and restore
<sync-script> push
```

Or use Copilot Chat when this repo is open: `/cam-pull` to import, `/cam-push` to restore.

After that, your repo is the portable home of your AI setup.

## Commands

**Terminal** (`<sync-script>` = `./scripts/sync.sh` or `.\scripts\sync.ps1`):

```bash
<sync-script> pull [--yes]   # VS Code → sync/
<sync-script> push [--yes]   # sync/ → VS Code
<sync-script> status         # show what's synced, new, or orphaned
<sync-script> clean          # remove orphaned entries
```

**Copilot Chat** (when this repo is open):

| Command | What it does |
|---------|--------------|
| `/cam-pull` | Import untracked VS Code files into `sync/` |
| `/cam-push` | Sync `sync/` files to VS Code |
| `/cam-status` | Show sync state |
| `/cam-help` | Show all commands and live status |
| `@copilot-asset-manager` | Plain-English interface for any sync operation |
| `@scout` | Research existing community prompts and skills |

## Team use

Fork this repo as your team's shared AI config. Populate `sync/` with team-wide skills, agents, and instructions. Team members clone the fork and run `push` to get the shared setup into their VS Code.

## Workspace defaults

This repo ships its own workspace-native assets under `.github/` — the `@copilot-asset-manager` and `@scout` agents and the slash command prompts. These apply within this repo only and don't affect `sync/` or `local/`.

## Contributing

PRs should focus on sync scripts, `.github/` workspace assets, or docs. See `CONTRIBUTING.md`.
