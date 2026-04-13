**English** | [繁體中文](CONTRIBUTING.zh-TW.md)

# Contributing to copilot-asset-manager

## How the fork model works

When you fork `copilot-asset-manager`, your fork becomes your personal or team AI config repo. The `sync/` and `local/` areas are yours — fill them however you like. They will naturally diverge from upstream, and that is expected.

Upstream `copilot-asset-manager` stays clean: only the CLI (`src/`), `.github/` workspace assets, and docs. CI will reject any PR that includes changes to `sync/` or `local/`.

## Contributing back to upstream

If you fix a bug in the CLI, improve a workspace agent, or update docs, you can PR that back. The key is to keep your contribution branch separate from your personal config:

```bash
# Add upstream as a remote if you haven't already
git remote add upstream https://github.com/ORIGINAL_OWNER/copilot-asset-manager
git fetch upstream

# Create a clean branch from upstream main
git checkout -b fix/my-cli-fix upstream/main

# Make only tool-level changes (src/, .github/, docs/)
# Do not touch sync/ or local/
git add src/
git commit -m "fix: describe what you fixed"
git push origin fix/my-cli-fix

# Open a PR from that branch
```

Your personal `sync/` and `local/` content lives on your fork's main branch and never enters this branch. CI enforces this automatically.

## Creator / maintainer dual-hat

If you maintain the upstream repo and also want your own personal AI setup, keep them separate:

- **Upstream** (`copilot-asset-manager`) — your maintainer role. Only tool changes land here.
- **Your personal fork** — your user role. Has your own `sync/` and `local/` content, just like any other user.

This is the same pattern as any open source maintainer who uses their own tool.

## Contributing to someone else's fork

Forks are just repos. If someone shares their `copilot-asset-manager` fork and you want to improve one of their prompts, fix a skill, or suggest a better guide — open a PR against their fork directly. The same branch discipline applies: make a focused branch, change only what you're improving, keep it reviewable.

The `no-personal-content` CI check only runs on the upstream `copilot-asset-manager` repo. Personal and team forks can structure their own CI however they like, or none at all.

## What belongs as a PR to upstream copilot-asset-manager

- Bug fixes or improvements to the CLI (`src/`)
- Updates to workspace agents, skills, prompts, or instructions (`.github/agents/`, `.github/skills/`, `.github/prompts/`, `.github/instructions/`)
- Documentation fixes (README, CONTRIBUTING, `docs/`)
- CI updates (`.github/workflows/`)

## Quality bar

- `npm run build` must pass with no errors
- Workspace agent and skill files must have valid frontmatter
- README must remain under 150 lines
- No `sync/` or `local/` changes — CI will reject them automatically

See the PR template for the full checklist.

## Translation parity

All `.md` files in the repo root and `docs/` must have a `.zh-TW.md` counterpart. Three layers enforce this:

| Layer | What it does |
|-------|--------------|
| **Instruction** (`.github/instructions/translation-check.instructions.md`) | Agents warn when editing `.md` files without a zh-TW counterpart |
| **Hook** (`.github/hooks/translation-check.md`) | Copilot pre-commit hook warns before committing and offers to translate |
| **CI** (`.github/workflows/ci.yml` → `translation-parity`) | Fails the PR if a zh-TW file is missing or stale |

To translate a file, use the `translate` skill in Copilot Chat or (coming soon) `cam translate <file>` in the terminal.
