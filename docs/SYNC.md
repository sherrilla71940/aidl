# SYNC.md — Detailed sync logic

This document describes the internal logic of `scripts/sync.sh` and `scripts/sync.ps1`. For usage, see the README.

## Overview

`aidl` syncs between two locations:

- **aidl repo user area**
  - `user/sync/` — git-tracked personal config synced to VS Code
  - `user/local/` — git-tracked personal files not synced to VS Code
- **VSCode user config** (`~/.config/Code/User/` on Linux, `~/Library/Application Support/Code/User/` on macOS, `%APPDATA%\Code\User\` on Windows)

Repo workspace assets live under `.github/` and are not part of `pull` or `push`. `pull` only imports into `user/sync/`. `push` only syncs `user/sync/`. `user/local/` is never synced to VSCode.

---

## push — repo → VSCode

1. Scan `user/sync/` recursively for all non-.gitkeep, non-.agent.md files matching:

- `user/sync/prompts/**/*.prompt.md`
- `user/sync/skills/*/SKILL.md` (one level only — folder name = skill name)
- `user/sync/instructions/**/*.instructions.md`

1. For each file, determine the target path in VSCode user config:

- `user/sync/prompts/**/*` → `{vscodeUserPath}/prompts/<relative-subpath>` (structure preserved)
- `user/sync/skills/{name}/SKILL.md` → `{vscodeUserPath}/skills/{name}/SKILL.md`
- `user/sync/instructions/**/*` → `{vscodeUserPath}/instructions/<relative-subpath>`

1. **Conflict check:** if a target path already exists and is NOT tracked in the manifest (i.e., not created by aidl), skip it and print:

```text
SKIP <rel-path> — exists at target but not created by aidl (delete the target file first if you want to overwrite)
```

1. Create parent directories as needed.

1. `sync.sh` — Create symlinks. `sync.ps1` — Copy files (Windows symlinks require admin elevation).

1. Write each synced file to `.sync-manifest.json`.

1. **Agent discovery:** VS Code does not auto-scan any global `agents/` folder. After push, check whether `user/sync/agents/` is listed in `chat.agentFilesLocations` in VSCode settings.json. If this has not been shown before, print:

```text
ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:
  "chat.agentFilesLocations": ["/absolute/path/to/aidl/user/sync/agents"]
```

   Track `agent_notice_shown: true` in `.sync-manifest.json` so this prints only once per machine.

---

## pull — VSCode → repo

1. Scan VSCode config `prompts/`, `skills/`, `instructions/` directories. **Do NOT scan `agents/`** — personal agent files are sourced directly from `user/sync/agents/` via `chat.agentFilesLocations`.

1. For each file found:

- If a symlink pointing into `user/sync/` — skip (already managed).
- If NOT in `user/sync/` at all — candidate for import.
- If already in `user/sync/` with **identical content** — skip silently.
- If already in `user/sync/` with **different content** — skip and print:

```text
SKIP <rel-path> — content differs from repo copy (delete user/sync copy first if you want to import the VSCode version)
```

1. Without `--yes`: list candidates and prompt user (select all with `y`, or specific items by number).
   With `--yes`: import all without prompting.

1. Copy selected files into `user/sync/` preserving the directory structure.

1. Update `.sync-manifest.json`.

---

## add — install from registry or URL

### Name-based (registry lookup)

```text
sync.sh add debug
sync.ps1 add debug
```

1. Accept a short name (e.g., `debug`).
2. Ensure registry cache is fresh:
   - Cache location: `.aidl-cache/registry/`
   - On first use: shallow-clone `REGISTRY_URL` into cache dir.
   - On subsequent use: check age of `.git/FETCH_HEAD`. If older than `CACHE_TTL_HOURS` (default 24h), run `git fetch --depth 1 && git reset --hard FETCH_HEAD`.
3. Search `registry.json` index for a matching entry. Fall back to recursive directory scan if `registry.json` is absent.
4. If no match: list available names and exit 1.
5. **Trust prompt** (skipped with `--yes`): print matched registry URL and asset path, ask for confirmation before proceeding.
6. Read `type:` from frontmatter to determine target subdir in `user/sync/`. Frontmatter parsing: extract lines between first two `---` markers, find `type:` line.
7. If already exists in `user/sync/`, skip and print a message.
8. Copy from cache to `user/sync/` preserving directory structure.
9. Print: `Added: debug → user/sync/skills/debug/SKILL.md (from https://github.com/github/awesome-copilot)`
10. Remind user to run `push` to sync to VSCode.

### URL-based (direct install)

```text
sync.sh add https://github.com/someone/skills
sync.ps1 add https://github.com/someone/skills
```

1. Detect `https://` or `http://` prefix.
2. **Trust prompt** (always shown, even with `--yes`-equivalent environment): print exact URL, ask for explicit confirmation.
3. Shallow-clone URL into `.aidl-cache/tmp/`.
4. Validate: must contain at least one file with valid frontmatter (`description` and `type` fields). Exit 1 if not.
5. Determine target subdir from `type:` frontmatter.
6. If already exists in `user/sync/`, ask before overwriting (or auto-overwrite if `--yes` provided).
7. Copy to `user/sync/`, clean up temp dir.
8. Print: `Added: <name> → user/sync/<subdir>/<name> (from <url>)`
9. Remind user to run `push`.

---

## list — browse registry

```text
sync.sh list
sync.ps1 list
```

1. Ensure registry cache is fresh (same logic as `add`).
1. Read `registry.json` from cache. Fall back to directory scan if absent.
1. Group assets by type and print:

```text
Skills
  debug           Systematic debugging workflow
  api-design      REST API design with opinionated defaults

Agents
  explorer        Codebase exploration and architecture summary

Prompts
  (none yet — contribute at https://github.com/github/awesome-copilot)
```

1. Print hint: `Run ./scripts/sync.sh add <name> to install any asset.`

---

## status — compare manifest vs filesystem

1. Read manifest.
2. For each synced entry: check source and target still exist. Report OK or ORPHANED.
3. Scan `user/sync/` for files not in manifest. Report as NEW.
4. NEW files mean `push` hasn't been run for those assets yet.

---

## clean — remove stale entries

`sync.sh`:

- On macOS/Linux: find dead symlinks in VSCode user config dirs, remove them, and remove their manifest entries.
- On Windows Git Bash: find manifest entries whose source no longer exists, remove the copied target if present, and remove the entry from the manifest.

`sync.ps1`:

- Find manifest entries whose source no longer exists.
- Remove the corresponding copied file at target if present.
- Remove the entry from the manifest.

---

## .sync-manifest.json format

```json
{
  "synced": [
    {
      "source": "/abs/path/to/aidl/user/sync/prompts/my-review.prompt.md",
      "target": "/abs/path/to/Code/User/prompts/my-review.prompt.md",
      "strategy": "symlink",
      "timestamp": "2026-04-07T12:00:00Z"
    }
  ],
  "agent_notice_shown": false
}
```

- `strategy` — `symlink` (macOS/Linux) or `copy` (Windows)
- `agent_notice_shown` — `true` after the `chat.agentFilesLocations` instruction has been printed once on this machine

The manifest is **gitignored** — it is local machine state only.

---

## Registry format

The default registry is a plain git repo at `https://github.com/github/awesome-copilot` with:

```text
registry.json       ← index
skills/
  debug/
    SKILL.md
agents/
  explorer/
    explorer.agent.md
prompts/
  review-pr/
    review-pr.prompt.md
```

`registry.json` schema:

```json
[
  {
    "name": "debug",
    "type": "skill",
    "description": "Systematic debugging workflow",
    "tags": ["debugging"],
    "path": "skills/debug"
  }
]
```

Override the registry for a session:

```bash
AIDL_REGISTRY=https://github.com/myteam/skills ./scripts/sync.sh add debug
```

---

## Environment variables

| Variable         | Default                                     | Description        |
|------------------|---------------------------------------------|--------------------|
| `AIDL_REGISTRY`  | `https://github.com/github/awesome-copilot` | Registry URL       |
| `AIDL_CACHE_TTL` | `24`                                        | Cache TTL in hours |
