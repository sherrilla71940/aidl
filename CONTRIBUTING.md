# Contributing to aidl

## Where community assets go

Skills, agents, and prompts belong in the registry — **not in this repo**.

Contribute community assets to [github/awesome-copilot](https://github.com/github/awesome-copilot). That's the default registry `aidl` fetches from. It has its own contributing guide and CI that validates naming, frontmatter, and content quality.

## What belongs as a PR here

Pull requests to this repo are for:

- Bug fixes in `scripts/sync.sh` or `scripts/sync.ps1`
- Updates to bundled agent content (`user-sync/agents/`)
- Documentation fixes (README, CONTRIBUTING, `docs/`)
- CI updates (`.github/workflows/`)

## Quality bar

- `shellcheck scripts/sync.sh` must pass locally before opening a PR
- `scripts/sync.ps1` must be updated whenever `sync.sh` changes
- Bundled agent files must have valid frontmatter (`description`, `tags`, `type`)
- README must remain under 80 lines

See the PR template for the full checklist.
