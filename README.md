# aidl — Your AI dev config, versioned and synced.

**Git for your Copilot setup. Version control your prompts, skills, and agents — sync bidirectionally, install from the community.**

<!-- REQUIRED before launch: demo GIF showing sync.sh pull + push workflow (or add debug + push). See Step 0 in build prompt. Do not publish without this. -->

## ⚡ What this does

```bash
# In the terminal:
./scripts/sync.sh pull     # capture your existing VSCode config → repo
./scripts/sync.sh push     # restore everything on a new machine
./scripts/sync.sh add debug  # install a skill from the community registry
```

```
# Or in Copilot Chat (when aidl repo is open):
/aidl-pull
/aidl-push
/aidl-add
/aidl-help    ← shows live status and all commands
```

## 🚀 Try it now

```bash
git clone https://github.com/YOUR_USERNAME/aidl
cd aidl
# Import your existing Copilot prompts/skills/agents
./scripts/sync.sh pull
# Commit and push to your fork, then on a new machine:
git add user-sync/ && git commit -m "add my ai config" && git push
```

Clone your fork on a new machine and run `./scripts/sync.sh push`. Done.

## What comes bundled

Two agents ship pre-committed in `user-sync/agents/` — available immediately after your first `push`.

| Name | Type | What it does |
|------|------|--------------|
| [aidl](user-sync/agents/aidl.agent.md) | agent | Chat interface for your Copilot library |
| [explorer](user-sync/agents/explorer.agent.md) | agent | Codebase exploration and architecture summary |

Browse community skills, agents, and prompts from [github/awesome-copilot](https://github.com/github/awesome-copilot): `./scripts/sync.sh list`

## Why not just Settings Sync?

VS Code Settings Sync doesn't cover `prompts/`, `skills/`, or `agents/` — those directories are outside its scope entirely. `aidl` fills that gap: git history, any-machine restore, and one-command install from [github/awesome-copilot](https://github.com/github/awesome-copilot) or any URL.

## Contributing

Want to share a skill, agent, or prompt? Contribute to the registry — that's where community assets live: [github/awesome-copilot](https://github.com/github/awesome-copilot).
