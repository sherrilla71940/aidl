
# aidl — Your AI dev config, versioned and synced.

**Git for your Copilot setup. Version control your prompts, skills, and agents — sync bidirectionally, install from the community.**

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

## Why this matters

Your Copilot config already lives in VSCode — but it's invisible to git:
- `~/.config/Code/User/prompts/` is outside any repo
- `~/.config/Code/User/skills/` same — no versioning
- `.github/copilot-instructions.md` is per-project, never shared

Get a new machine: you start from scratch. Teammate asks for your best skill: you copy-paste it into Slack.

`aidl` fixes this. Your AI config lives in a git repo — full history, owned by you, portable. One command syncs it to VSCode.

- **Bidirectional sync** — capture existing VSCode config into git (`pull`), restore it anywhere (`push`)
- **Full git history** — every change tracked, diffable, branchable, attributable
- **Install from anywhere** — `add debug` pulls from the default registry (`github/awesome-copilot`); or pass any URL directly

## Two folders, two purposes

```
aidl/
├── user-sync/   ← Your personal assets. Synced to VSCode user config.
└── user-local/  ← Your personal assets. NOT synced. Copy into projects manually.
```

Community assets come from the default registry: [`github/awesome-copilot`](https://github.com/github/awesome-copilot). Or install directly from any URL: `./scripts/sync.sh add https://github.com/someone/skills`.

### user-sync/
Your personal assets that the `@aidl` agent + scripts sync bidirectionally with your VSCode user config (`~/.config/Code/User/prompts/`, etc.). These are git-tracked in your fork but NOT part of the shared collection.

**Use case:** "I have custom prompts I use across all my projects. I want them versioned in git AND available in Copilot Chat everywhere."

### user-local/
Assets you keep in the repo for reference or to manually copy into specific projects (into `.github/prompts/`, `.github/copilot-instructions.md`, etc.). NOT synced to VSCode user config. Git-tracked in your fork.

**Use case:** "I have project-specific instruction files and templates I want versioned but not cluttering my global Copilot config."

Three ways to interact:
- **Slash commands** (fastest) — `/aidl-push`, `/aidl-pull`, `/aidl-add`, `/aidl-list`, `/aidl-status`, `/aidl-help` — available in Copilot Chat when the aidl repo is open
- **`@aidl` agent** — plain English in Copilot Chat: "add the debug skill" or "what's available?"; globally available after `push`
- **Shell scripts** (`sync.sh` / `sync.ps1`) — direct terminal use, scripting, CI

### How sync works (in 10 seconds)

```
┌─────────────────────┐    scripts/sync.sh push   ┌──────────────────────┐
│                      │  ───────────────────────> │                      │
│  aidl repo           │                           │  VSCode User config  │
│  user-sync/prompts/  │  <─────────────────────── │  ~/.config/Code/     │
│  user-sync/skills/   │    scripts/sync.sh pull   │    User/prompts/     │
│  user-sync/instruct/ │                           │    User/skills/      │
│                      │                           │    User/instructions/│
└─────────────────────┘                            └──────────────────────┘

│  user-sync/agents/   │  ── synced to user-level agent storage
```

Only `user-sync/` participates in sync. Agent files are synced from `user-sync/agents/` into user-level agent storage. An extra `chat.agentFilesLocations` entry is only needed if you want VS Code to load directly from the repo folder during development.

## Repo structure

```
aidl/
├── README.md
├── CONTRIBUTING.md
├── .github/
│   ├── copilot-instructions.md
│   ├── pull_request_template.md
│   ├── prompts/                          ← repo-scoped slash commands (auto-discovered)
│   │   ├── aidl-help.prompt.md
│   │   ├── aidl-push.prompt.md
│   │   ├── aidl-pull.prompt.md
│   │   ├── aidl-add.prompt.md
│   │   ├── aidl-list.prompt.md
│   │   └── aidl-status.prompt.md
│   ├── instructions/                     ← auto-applied when editing user-sync/**
│   │   └── authoring.instructions.md
│   └── workflows/
│       └── ci.yml
├── user-sync/
│   ├── prompts/
│   │   └── .gitkeep
│   ├── skills/
│   │   └── aidl-author/
│   │       └── SKILL.md                 ← bundled: asset creation guide, globally available
│   ├── instructions/
│   │   └── .gitkeep
│   └── agents/
│       ├── aidl.agent.md                 ← bundled: chat interface for sync workflow
│       └── explorer.agent.md             ← bundled: codebase exploration starter
├── user-local/
│   ├── prompts/
│   │   └── .gitkeep
│   ├── instructions/
│   │   └── .gitkeep
│   └── templates/
        └── copilot-instructions.md       ← starter template to copy into projects
├── docs/
│   └── SYNC.md                           ← detailed sync logic, push/pull/add/list internals
├── scripts/
│   ├── sync.sh                           ← macOS/Linux sync script
│   └── sync.ps1                          ← Windows sync script
├── .sync-manifest.json               ← auto-generated, gitignored
└── .aidl-cache/                      ← auto-generated, gitignored (registry cache)
```

## Sync — how it works

Zero-install. Just run the script.

**Only `user-sync/` participates in sync.** Registry assets are installed into `user-sync/` via `sync.sh add`. Bundled agents ship pre-committed. Nothing else touches your VSCode config.

### Push (repo → VSCode)
1. Scan `user-sync/` recursively using these patterns:
   - `user-sync/prompts/**/*.prompt.md`
   - `user-sync/skills/*/SKILL.md`  ← one level only, intentional: folder name = skill name
   - `user-sync/instructions/**/*.instructions.md`
  - `user-sync/agents/**/*.agent.md`
2. For each file (except `.agent.md`), determine target in VSCode user config:
   - `user-sync/prompts/**/*.prompt.md` → `{vscodeUserPath}/prompts/<relative-subpath>` (preserve directory structure)
   - `user-sync/skills/*/SKILL.md` → `{vscodeUserPath}/skills/{folder}/SKILL.md` (folder name must match exactly)
   - `user-sync/instructions/**/*.instructions.md` → `{vscodeUserPath}/instructions/<relative-subpath>` (preserve directory structure)
  - `user-sync/agents/**/*.agent.md` → `{copilotUserPath}/agents/<relative-subpath>` (preserve directory structure)
3. **Conflict check:** for each target path, if a file already exists AND is not a symlink previously created by aidl (not in manifest): skip it and print `SKIP <file> — exists at target but not created by aidl (delete the target file first if you want to overwrite)`
4. Create symlinks (macOS/Linux) or copies (Windows) for all non-conflicting files
5. Track what's synced in a `.sync-manifest.json` at repo root
6. **Optional live repo loading:** if the user wants VS Code to load agents directly from `user-sync/agents/` while editing in place, check whether `chat.agentFilesLocations` contains a workspace-relative entry. If not, print:
   ```
   OPTIONAL: Add to your VSCode settings.json for live repo-backed agent discovery:
     "chat.agentFilesLocations": { "user-sync/agents": true }
   ```
   Track whether this message has been printed in `.sync-manifest.json` so it only appears once per machine, not on every push.

### Pull (VSCode → repo)
1. Scan VSCode user config `prompts/`, `skills/`, `instructions/`, and user-level `agents/` dirs.
2. For each file found:
   - If NOT in `user-sync/` at all: candidate for import
   - If already in `user-sync/` with **identical content**: skip silently
   - If already in `user-sync/` with **different content**: skip it and print `SKIP <file> — content differs from repo copy (delete user-sync copy first if you want to import the VSCode version)`
3. List imported files
4. Update `.sync-manifest.json`

## Sync scripts

### scripts/sync.sh (macOS/Linux)
Bash script that handles push and pull:

```bash
# Usage:
#   ./scripts/sync.sh list               — list registry assets, grouped by type
#   ./scripts/sync.sh add <name|url>     — install asset by name or URL
#   ./scripts/sync.sh push [--yes]       — symlink user-sync/ files to VSCode config
#   ./scripts/sync.sh pull [--yes]       — copy untracked VSCode files into user-sync/
#   ./scripts/sync.sh add <name> [--yes] — skip trust prompt
#   ./scripts/sync.sh status             — show what's synced, new, or orphaned
#   ./scripts/sync.sh clean              — remove dead symlinks
#
# --yes: skips all interactive prompts. Used by Copilot slash commands where stdin
#        is not interactive. pull --yes imports ALL found files without asking.
```

VSCode user config path: `~/Library/Application Support/Code/User/` (macOS) or `~/.config/Code/User/` (Linux). Auto-detect via `uname`.

### Registry config
One registry. Hardcoded default: `https://github.com/github/awesome-copilot`. Override for a session with `AIDL_REGISTRY=https://github.com/someone/skills ./scripts/sync.sh add debug`.

Push logic:
1. Find all `.prompt.md`, `SKILL.md`, `.instructions.md` files in `user-sync/` (not `.agent.md`)
2. For each, create symlink in corresponding VSCode config subdir (`prompts/`, `skills/`, `instructions/`)
3. Create parent dirs as needed
4. Write synced paths to `.sync-manifest.json`
5. For `.agent.md` files: print ACTION REQUIRED message for `chat.agentFilesLocations` if not already tracked in manifest
6. Print summary of what was linked

Pull logic:
1. Scan VSCode config `prompts/`, `skills/`, `instructions/` dirs for files not in manifest (skip `agents/`)
2. Without `--yes`: list found files, ask user which to import (select with numbers). With `--yes`: import all.
3. Copy selected into `user-sync/` preserving structure
4. Update manifest

Add logic (`sync.sh add <name|url>`):

Two accepted forms:
- `sync.sh add debug` — resolve name against the active registry
- `sync.sh add https://github.com/someone/skills` — direct URL, bypasses registry lookup

**Name-based flow:**
1. Accept a short name (e.g., `debug`)
2. Ensure registry cache is fresh: shallow-clone into `.aidl-cache/registry/` if missing; `git fetch --depth 1 && git reset --hard origin/HEAD` if older than `CACHE_TTL_HOURS` (default 24h)
3. Search `registry.json` index for a matching entry; fall back to recursive file scan
4. If no match: list available names and exit
5. **Trust prompt:** print the matched registry URL and asset path, ask for confirmation before proceeding — never silent-fetch. With `--yes`, skip the prompt and proceed.
6. Read frontmatter `type:` field to determine target subdir in `user-sync/`.
   **Frontmatter parsing (bash):** Extract `type:` using awk — read lines between the first two `---` markers, find the `type:` line, extract the value: `awk '/^---/{n++; next} n==1' file | grep "^type:" | cut -d: -f2 | tr -d ' '`
7. If already exists in `user-sync/`, print a message and skip
8. Copy from cache to `user-sync/`, preserving directory structure
9. Print: `Added: debug → user-sync/skills/debug/SKILL.md (from https://github.com/github/awesome-copilot)`
10. Remind user to run `push` to sync to VSCode

**URL-based flow:**
1. Detect that the argument starts with `https://` or `http://`
2. **Trust prompt:** print the exact URL being cloned, ask for explicit confirmation — never skip
3. Shallow-clone the URL into a temp dir under `.aidl-cache/tmp/`
4. Validate: must contain at least one file with valid frontmatter (`description`, `tags`, `type`) — exit with error if not
5. Determine target subdir from `type:` frontmatter
6. If already exists in `user-sync/`, ask before overwriting
7. Copy to `user-sync/`, preserving structure; clean up temp dir
8. Print: `Added: debug → user-sync/skills/debug/SKILL.md (from https://github.com/someone/skills)`
9. Remind user to run `push` to sync to VSCode

List logic (`sync.sh list`):
1. Ensure registry cache is fresh (same logic as `add`)
2. Read `registry.json` index from the registry cache (fall back to file scan if absent)
3. Group by type:
   ```
   Skills
     debug           Systematic debugging workflow
     api-design      REST API design with opinionated defaults
   Agents
     explorer        Codebase exploration and architecture summary
   Prompts
     (none yet — contribute at https://github.com/github/awesome-copilot)
   ```
4. Hint at bottom: `Run ./scripts/sync.sh add <name> to install any asset.`

Status: compare manifest vs filesystem, report synced/new/orphaned.

Clean: remove symlinks whose source file no longer exists, update manifest.

> **Implementation depth:** The detailed push/pull/add/list logic above is the full spec. In the repo, document it in `docs/SYNC.md` — not in the README. The README only shows the usage block.

### scripts/sync.ps1 (Windows)
PowerShell equivalent. Uses file copy instead of symlinks (symlinks require admin on Windows). Same push/pull/add/status/clean subcommands. Same manifest format.

VSCode user config path: `$env:APPDATA/Code/User/`

### .sync-manifest.json
```json
{
  "synced": [
    { "source": "user-sync/prompts/my-review.prompt.md", "target": "~/.config/Code/User/prompts/my-review.prompt.md", "strategy": "symlink", "timestamp": "2026-04-07T12:00:00Z" }
  ]
}
```
Gitignored — local state only.

## Copilot UX layer

When the aidl repo is open in VS Code, `.github/` adds a Copilot customization layer that makes the workflow faster and guided. All three file types are auto-discovered by VS Code — no wiring or settings changes needed.

### .github/prompts/ — slash commands

Six `.prompt.md` files auto-discovered by VS Code and appear as `/` commands in Copilot Chat. Each is a thin dispatcher — sets context and tells `@aidl` what to run. All logic stays in `sync.sh`.

| Command | What it does |
|---------|--------------|
| `/aidl-help` | Show live status + list all commands with descriptions |
| `/aidl-push` | Symlink `user-sync/` to VSCode config |
| `/aidl-pull` | Capture untracked VSCode files into `user-sync/` |
| `/aidl-add` | Install an asset — agent asks for name if not provided |
| `/aidl-list` | List registry assets grouped by type |
| `/aidl-status` | Show synced, new, and orphaned files |


Required frontmatter for every prompt file:
```yaml
---
description: <one-line description of what this slash command does>
mode: agent
---
```

**`/aidl-help` content spec:** Run `./scripts/sync.sh status`, print the output, then list all six slash commands with one-line descriptions. This is the "where am I?" entry point — especially useful on a new machine.

**`/aidl-add` behavior:** If no asset name is provided in the prompt, ask: *"Which asset do you want to add? Run `/aidl-list` to see what's available."* — never silently no-op.

### .github/instructions/authoring.instructions.md — passive frontmatter guide

`applyTo: user-sync/**`

Auto-applied by Copilot whenever it is helping edit or create files under `user-sync/`. No manual invocation. No slash command. Purely passive context.

Content spec: explain required frontmatter fields per asset type, the allowed `type` values (`prompt | skill | agent | instruction`), naming conventions (`*.prompt.md`, `SKILL.md`, `*.agent.md`), and the 100-word minimum for body content. Include one valid frontmatter example per type.

### .github/skills/ — removed

`aidl-author` ships as a bundled asset in `user-sync/skills/` instead — globally available after `push`, useful when creating Copilot assets in any project. See bundled assets section.

## Registry

`aidl` fetches community assets from an external registry repo rather than bundling them directly.

### Registry config (scripts/sync.sh)
One registry. Hardcoded default: `https://github.com/github/awesome-copilot`. Override for a session via env: `AIDL_REGISTRY=https://github.com/myteam/skills ./scripts/sync.sh add debug`.

```bash
REGISTRY_URL="${AIDL_REGISTRY:-https://github.com/github/awesome-copilot}"
CACHE_TTL_HOURS="${AIDL_CACHE_TTL:-24}"
```

### Registry cache
Cache dir: `.aidl-cache/registry/`. On first `list` or `add`, aidl shallow-clones the registry into the cache dir. Subsequent calls reuse the cache unless older than `CACHE_TTL_HOURS`.

**Graceful failure:** If the registry is unreachable, print a human-readable message and exit 1. Do not let `git` error output surface directly.

### Registry repo format
Plain git repo with a `registry.json` index at root:
```json
[
  { "name": "debug", "type": "skill", "description": "Systematic debugging workflow", "tags": ["debugging"], "path": "skills/debug" }
]
```
Assets in `skills/`, `agents/`, `prompts/` subdirectories, same naming conventions as `user-sync/`. The registry repo has its own CI — separate from aidl.

## CI

### .github/workflows/ci.yml
Runs on PRs to `main` only:

1. **Shellcheck:** Lint `scripts/sync.sh` with `shellcheck`
2. **PSScriptAnalyzer:** Lint `scripts/sync.ps1`
3. **Bundled asset frontmatter:** Validate that pre-committed files in `user-sync/agents/` have valid frontmatter (`description`, `tags`, `type`)
4. **Slash command frontmatter:** Validate that all `.github/prompts/*.prompt.md` files have a `description` field and `mode: agent` in frontmatter
5. **Skill frontmatter:** Validate that `user-sync/skills/aidl-author/SKILL.md` has required `name` and `description` fields, and that `name` matches the parent directory

> **Registry CI lives in the registry repo**, not here. Naming conventions, frontmatter completeness, and content length for community assets are enforced there.

## Standard file specs

### .gitignore
Must gitignore exactly:
```
.sync-manifest.json
.aidl-cache/
```
Do NOT gitignore `user-sync/` or `user-local/`. Those are the product.

### .github/copilot-instructions.md
Applied when Copilot works in the aidl repo itself. Keep it short and direct:
- This is the aidl repo: sync scripts, bundled agents, and the Copilot UX layer.
- Files under `user-sync/` must have valid YAML frontmatter — see `authoring.instructions.md` for field requirements.
- `sync.sh` and `sync.ps1` must stay functionally equivalent. Edit both when changing sync behavior.
- Do not expand the README beyond 150 lines. Keep it concise.
- Do not add features or subcommands beyond what is specced.

### .github/pull_request_template.md
```markdown
## What this changes

<!-- One paragraph: what does this fix or add? -->

## Type of change
- [ ] Bug fix in sync scripts
- [ ] Bundled agent content update
- [ ] Documentation fix
- [ ] CI update

## Checklist
- [ ] `shellcheck scripts/sync.sh` passes locally
- [ ] `scripts/sync.ps1` updated to match if `sync.sh` changed
- [ ] Bundled agent frontmatter valid (description, tags, type present)
- [ ] README remains under 150 lines

> Note: New skills, agents, or prompts belong in the registry repo, not here.
```

---
<!-- BUILD INSTRUCTIONS BELOW — DO NOT INCLUDE IN README.md -->
<!-- Everything from here to end of file is for the builder (you/Copilot), not for the repo README. -->
---

## README.md spec

The README is the primary product — write it as a standalone document, not a guide about itself. Scannable in 10 seconds, useful in 30.

> **User-facing only.** Do NOT include builder instructions, CI rules, or CONTRIBUTING quality bar details in the README. Those belong in this build prompt and in CONTRIBUTING.md.

Top-of-page order (critical — do not reorder):
1. Title + tagline
2. `## ⚡ What this does` (pull/push workflow block)
3. `## 🚀 Try it now` (clone → pull → push → your config is back)
4. `## What comes bundled` (2-row table: the two pre-committed agents + registry hint)
5. `## Why not just Settings Sync?` (3 lines)
6. `## Contributing` (2 lines)

**Keep the README under 150 lines of content.** If it's longer, cut.

### Content:
```
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
```

## Bundled assets to create

These ship pre-committed in `user-sync/agents/`. Every file must have YAML frontmatter:

```yaml
---
description: One-sentence description of what this asset does.
tags: [tag1, tag2]
type: agent  # prompt | skill | agent | instruction
---
```

### Agents (user-sync/agents/)

**aidl.agent.md** — The `@aidl` chat interface for managing your Copilot library. Knows all commands and the registry. By default guides you through the workflow in plain English. If you ask it to run a command, it executes it via the terminal tool with your confirmation. Example interactions:
- "What's available in the registry?"
- "Add the debug skill to my collection"
- "Sync my collection to VSCode"
- "What's the difference between user-sync and user-local?"

Frontmatter must include `tools: [codebase, terminal]`. Terminal commands should always be shown to the user before execution (no silent runs).

**Safety constraint:** The agent must NEVER run destructive commands (`clean`, `rm`, anything that deletes content) without first spelling out exactly what will be deleted and receiving explicit user confirmation. If unsure whether a command is destructive, treat it as destructive.

**explorer.agent.md** — Codebase exploration agent. Reads project structure, finds relevant files for a task, summarizes architecture. Good for onboarding onto unfamiliar repos.

### Skills (user-sync/skills/)

**aidl-author/SKILL.md** — Asset creation skill. Bundled pre-committed alongside the agents. Globally available after `push` — appears as `/aidl-author` in the `/` menu in any VS Code workspace. Also auto-loaded by Copilot when the task involves creating or validating any Copilot asset.

Required frontmatter:
```yaml
---
name: aidl-author
description: Create and validate Copilot assets (prompts, skills, agents). Use when creating a new asset, writing frontmatter, or checking if an existing file meets conventions.
---
```

> **Note:** `name:` is a VS Code skill-specific field — not part of the standard `description/tags/type` frontmatter used by prompts and agents. It is required here because VS Code uses it to match the skill file to its parent directory. `name` must equal the parent directory name exactly. `user-invocable` and `disable-model-invocation` omitted — defaults mean it appears in `/` menu and Copilot auto-loads when relevant.

Body must include:
- Step-by-step asset creation workflow (choose type → name → frontmatter → body → validate)
- Frontmatter templates for all four types (`prompt`, `skill`, `agent`, `instruction`)
- Common mistakes checklist
- How to validate: `./scripts/sync.sh status` shows unsynced files

### Templates (user-local/templates/)

**copilot-instructions.md** — A starter `.github/copilot-instructions.md` with sensible defaults: be concise, read files before editing, prefer existing patterns, don't add unnecessary abstractions.

## What to build — step by step

### Step 0: Record demo GIF (required — do not launch without this)
Record a short screen recording showing:
1. Running `./scripts/sync.sh pull` (capturing an existing VSCode prompt or skill into the repo) — or `./scripts/sync.sh add debug` if starting fresh
2. Running `./scripts/sync.sh push`
3. Opening Copilot Chat and using the synced asset

Save as `docs/demo.gif` and embed it in README.md where the `<!-- REQUIRED: demo GIF -->` comment is. **This is not optional. Do not publish the repo until this exists.**

### Step 1: Repo scaffold
Create all folders, README.md, CONTRIBUTING.md, .gitignore, .gitkeep files. No scripts or CI yet.

CONTRIBUTING.md must include a brief note: community assets (skills, agents, prompts) go to the registry — [github/awesome-copilot](https://github.com/github/awesome-copilot) — not to this repo. Opening a PR here is for fixes to the sync scripts, bundled agents, or docs only. Link to the registry's contributing guide.

**Done when:** Repo structure matches the tree above (including `user-sync/instructions/`). `.gitignore` contains `.sync-manifest.json` and `.aidl-cache/`. `.github/copilot-instructions.md` and `.github/pull_request_template.md` exist with content matching their specs. README has the full table structure (even if content is placeholder).

### Step 2: Bundled assets
Write `user-sync/agents/aidl.agent.md`, `user-sync/agents/explorer.agent.md`, and `user-local/templates/copilot-instructions.md`. Each must be ≥100 words with real, actionable content.

**Done when:** Both agents exist in `user-sync/agents/` with valid frontmatter and real content. `user-local/templates/copilot-instructions.md` exists. `@aidl` agent can answer questions about the registry and guide through pull/push/add workflow.

### Step 3: Sync scripts
Create `scripts/sync.sh` and `scripts/sync.ps1` with list, add, push, pull, status, and clean subcommands. Create `docs/SYNC.md` with the detailed push/pull/add/list logic from this build prompt.

**Done when (macOS/Linux):** `./scripts/sync.sh add debug` fetches from the registry cache and copies to `user-sync/skills/debug/`. `push` symlinks prompts, skills, and instructions to VSCode config dirs; skips conflicting files with a warning; prints ACTION REQUIRED for `chat.agentFilesLocations` if agents path not yet configured. `pull` captures untracked VSCode prompts/skills/instructions into `user-sync/`; skips files whose content differs from repo copy; `--yes` imports all without prompting. `list` shows registry assets grouped by type. `status` shows what's synced. `clean` removes dead links. `--yes` suppresses all interactive prompts.

**Done when (Windows):** Same acceptance criteria using `scripts\sync.ps1`. File copies instead of symlinks. All subcommands (add, push, pull, list, status, clean, --yes) behave identically to sync.sh equivalents.

### Step 3b: Copilot UX layer
Create all files under `.github/prompts/`, `.github/instructions/`, and `user-sync/skills/aidl-author/`. Follow the content specs in the "Copilot UX layer" and bundled assets sections.

**Done when:** All six slash commands appear in Copilot Chat when the aidl repo is open. `/aidl-help` shows live status output. `authoring.instructions.md` auto-applies when editing `user-sync/**` files. `/aidl-author` appears in the `/` menu globally after `push`.

### Step 4: CI
Create `.github/workflows/ci.yml` with shellcheck on `sync.sh` and bundled asset frontmatter validation.

> Registry CI (naming, frontmatter, content length) lives in the registry repo — a separate project.

**Done when:** A PR with a broken `sync.sh` or missing frontmatter on a bundled agent would fail CI.

### Step 5: README polish
Final pass on README with accurate asset table, clear quick-start, clean formatting.

**Done when:** README is the kind of page that makes someone star the repo in 10 seconds.

### Future / v2: `inject` subcommand
Not in v1. Add to `sync.sh` and `sync.ps1` after core workflow is stable.

```bash
# Usage:
#   ./scripts/sync.sh inject <path>  — copy a file from user-local/templates/ into the current
#                                      project's .github/ folder (e.g. copilot-instructions.md)
```

Usage pattern — the user runs this from INSIDE the target project, calling the script by its full path:
```bash
cd ~/code/my-project
~/code/aidl/scripts/sync.sh inject user-local/templates/copilot-instructions.md
```

The script uses `git rev-parse --show-toplevel` on the **current working directory** (the target project), not on the aidl repo's location. This is what determines where `.github/` goes.

Inject logic:
1. Accept a path to a file in `user-local/templates/` (relative to aidl repo root, resolved from the script's own directory)
2. Verify CWD is inside a git repo (exit with helpful error if not)
3. Determine target: `$(git -C "$PWD" rev-parse --show-toplevel)/.github/<filename>`
4. If target already exists, ask before overwriting — print the full path so user knows exactly what will change
5. Copy file, print: `Injected: user-local/templates/copilot-instructions.md → /path/to/my-project/.github/copilot-instructions.md`
6. Remind user to commit the file to the project repo

This bridges the gap between personal library and project-level config without manual copy-paste.

### Future / v3: Registry repo (`aidl-community/registry`)
A companion repo that serves as the default asset registry. Plain git repo with `skills/`, `agents/`, `prompts/` subdirectories and a `registry.json` index. Has its own CI for naming conventions, frontmatter, and content quality.

Point `AIDL_REGISTRY` at any repo with this structure — use the default community registry, a team-private repo, or your own. This is a separate build prompt.

## Constraints
- No paid APIs. No build step for the content — markdown files are the product.
- Zero-install. No extension needed. Just run the script.
- Symlinks on macOS/Linux (`sync.sh`), file copy on Windows (`sync.ps1`).
- `.sync-manifest.json` is gitignored — local state only.
- `user-sync/` and `user-local/` content is personal — `.gitkeep` files are committed but actual assets are in the user's own fork.
- Shared content must be generic (useful to any developer), not project-specific.
- Each prompt/skill/agent must be at least 100 words with specific, actionable instructions — not vague one-liners.
