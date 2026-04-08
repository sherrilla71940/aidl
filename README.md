# aidl — version your Copilot setup

`aidl` turns your VS Code Copilot assets into a normal Git repo.

It gives you one place to keep the prompts, skills, instructions, and bundled agents you want available across machines.

## What it syncs

There are two sides:

- Your local VS Code user config
- This repo's `user-sync/` folder

`pull` copies your existing local VS Code prompts, skills, and instructions into `user-sync/` so you can commit them.

`push` copies or links the repo's `user-sync/` files back into VS Code on the current machine.

`add` installs a community asset into `user-sync/` from [github/awesome-copilot](https://github.com/github/awesome-copilot) or a URL.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/aidl
cd aidl

# Import your current machine's VS Code prompts/skills/instructions into the repo
./scripts/sync.sh pull

# Save that config to your fork
git add user-sync/ && git commit -m "add my ai config" && git push

# On a new machine, clone your fork and restore it into VS Code
./scripts/sync.sh push
```

On Windows, you can run the same workflow with `./scripts/sync.sh` in Git Bash or `./scripts/sync.ps1` in PowerShell.

After that, your repo becomes the portable copy of your Copilot setup.

## Commands

```bash
./scripts/sync.sh pull       # VS Code -> repo
./scripts/sync.sh push       # repo -> VS Code
./scripts/sync.sh add debug  # install from registry or URL into user-sync/
./scripts/sync.sh list       # browse community assets
./scripts/sync.sh status     # show synced, new, and orphaned files
```

When the repo is open in Copilot Chat, you can also use `/aidl-pull`, `/aidl-push`, `/aidl-add`, and `/aidl-help`.

## Bundled here

This repo already includes two agents in `user-sync/agents/`: [aidl](user-sync/agents/aidl.agent.md) and [explorer](user-sync/agents/explorer.agent.md).

## Why this exists

VS Code Settings Sync does not cover `prompts/`, `skills/`, or `agents/`. `aidl` fills that gap with Git history, machine-to-machine restore, and one-command installs.

## Contributing

Community prompts, skills, and agents belong in [github/awesome-copilot](https://github.com/github/awesome-copilot). PRs here should focus on the sync scripts, bundled agents, or docs.
