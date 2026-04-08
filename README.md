# aidl — version your Copilot setup

`aidl` lets you version, sync, restore, and extend your VS Code Copilot setup with Git.

Keep your personal Copilot assets consistent across machines, install community assets from registries like [github/awesome-copilot](https://github.com/github/awesome-copilot), and keep repo-specific workspace defaults under `.github/`.

## User areas

There are two user areas:

- `user/sync/` — your personal prompts, skills, instructions, and optional agents synced with VS Code
- `user/local/` — your personal local-only prompts, instructions, and templates you don't want synced with VS Code

`pull` copies your existing local VS Code prompts, skills, and instructions into `user/sync/` so you can commit them.

`push` copies or links `user/sync/` back into VS Code on the current machine.

`add` installs a community asset into `user/sync/` from [github/awesome-copilot](https://github.com/github/awesome-copilot) or a URL.

## Quick start

Pick your shell's sync script once: `<sync-script>` = `./scripts/sync.sh` for macOS/Linux or Windows Git Bash, and `.\scripts\sync.ps1` for Windows PowerShell.

```bash
git clone https://github.com/YOUR_USERNAME/aidl
cd aidl

# Import your current machine's VS Code prompts/skills/instructions into the repo
<sync-script> pull

# Save that config to your fork
git add user/sync/ && git commit -m "add my ai config" && git push

# On a new machine, clone your fork and restore it into VS Code
<sync-script> push
```

After that, your repo becomes the portable copy of your Copilot setup.

## Commands

Choose your shell's sync script, then use the same subcommands with it:

```bash
<sync-script> pull       # VS Code -> repo
<sync-script> push       # repo -> VS Code
<sync-script> add debug  # install from the default registry into user/sync/
<sync-script> list       # browse community assets
<sync-script> status     # show synced, new, and orphaned files
<sync-script> clean      # remove orphaned synced files
```

Registry behavior:

By default, `add` installs from [github/awesome-copilot](https://github.com/github/awesome-copilot). To install from a different community registry, set `AIDL_REGISTRY` for that command.

```bash
# default: installs from github/awesome-copilot
<sync-script> add debug

# override the registry, then install the same way
AIDL_REGISTRY=https://github.com/someone/community-copilot <sync-script> add debug
```

When the repo is open in Copilot Chat, you can also use `/aidl-pull`, `/aidl-push`, `/aidl-add`, `/aidl-list`, `/aidl-status`, and `/aidl-help`. There is no `/aidl-clean` slash command.

## Workspace defaults

This repo's own workspace-native assets live in `.github/`, including [.github/agents/aidl.agent.md](.github/agents/aidl.agent.md), [.github/agents/explorer.agent.md](.github/agents/explorer.agent.md), and [.github/skills/aidl-author/SKILL.md](.github/skills/aidl-author/SKILL.md).

## Contributing

Community prompts, skills, and agents belong in [github/awesome-copilot](https://github.com/github/awesome-copilot). PRs here should focus on the sync scripts, `.github/` workspace assets, or docs.
