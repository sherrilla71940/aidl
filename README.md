# aidl — version your Copilot setup

`aidl` turns your VS Code Copilot assets into a normal Git repo.

It gives you one place to keep your personal Copilot assets available across machines, while this repo's own workspace defaults live under `.github/`.

## What it syncs

There are two user areas:

- `user/sync/` — your personal synced prompts, skills, instructions, and optional agents
- `user/local/` — your personal local-only prompts, instructions, and templates

`pull` copies your existing local VS Code prompts, skills, and instructions into `user/sync/` so you can commit them.

`push` copies or links `user/sync/` back into VS Code on the current machine.

`add` installs a community asset into `user/sync/` from [github/awesome-copilot](https://github.com/github/awesome-copilot) or a URL.

## Quick start

macOS/Linux or Windows Git Bash:

```bash
git clone https://github.com/YOUR_USERNAME/aidl
cd aidl

# Import your current machine's VS Code prompts/skills/instructions into the repo
./scripts/sync.sh pull

# Save that config to your fork
git add user/sync/ && git commit -m "add my ai config" && git push

# On a new machine, clone your fork and restore it into VS Code
./scripts/sync.sh push
```

Windows PowerShell:

```powershell
git clone https://github.com/YOUR_USERNAME/aidl
cd aidl

.\scripts\sync.ps1 pull
git add user/sync/; git commit -m "add my ai config"; git push
.\scripts\sync.ps1 push
```

After that, your repo becomes the portable copy of your Copilot setup.

## Commands

```bash
./scripts/sync.sh pull       # VS Code -> repo
./scripts/sync.sh push       # repo -> VS Code
./scripts/sync.sh add debug  # install from registry or URL into user/sync/
./scripts/sync.sh list       # browse community assets
./scripts/sync.sh status     # show synced, new, and orphaned files
```

PowerShell equivalents: `.\scripts\sync.ps1 pull`, `.\scripts\sync.ps1 push`, `.\scripts\sync.ps1 add debug`, `.\scripts\sync.ps1 list`, `.\scripts\sync.ps1 status`.

When the repo is open in Copilot Chat, you can also use `/aidl-pull`, `/aidl-push`, `/aidl-add`, and `/aidl-help`.

## Workspace defaults

This repo's own workspace-native assets live in `.github/`, including [.github/agents/aidl.agent.md](.github/agents/aidl.agent.md), [.github/agents/explorer.agent.md](.github/agents/explorer.agent.md), and [.github/skills/aidl-author/SKILL.md](.github/skills/aidl-author/SKILL.md).

## Contributing

Community prompts, skills, and agents belong in [github/awesome-copilot](https://github.com/github/awesome-copilot). PRs here should focus on the sync scripts, `.github/` workspace assets, or docs.
