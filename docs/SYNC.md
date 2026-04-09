**English** | [繁體中文](SYNC.zh-TW.md)

# SYNC.md — Detailed sync logic

This document describes the internal logic of the `cam` CLI (`src/`). For usage, see the README.

## Overview

`copilot-asset-manager` syncs between two locations:

- **copilot-asset-manager repo areas**
  - `sync/` — git-tracked config synced to VS Code
  - `local/` — git-tracked private files, never synced to VS Code
- **VSCode user config** (`~/.config/Code/User/` on Linux, `~/Library/Application Support/Code/User/` on macOS, `%APPDATA%\Code\User\` on Windows)

Repo workspace assets live under `.github/` and are not part of `pull` or `push`. `pull` only imports into `sync/`. `push` only syncs `sync/`. `local/` is never synced to VSCode.\n\nSupported asset subdirectories: `prompts/`, `skills/`, `instructions/`, `hooks/`. Agents (`*.agent.md`) are discovered via `chat.agentFilesLocations` and are not symlinked/copied by push.

---

## push — repo → VSCode

1. Scan `sync/` recursively for all non-.gitkeep, non-.agent.md files matching:

- `sync/prompts/**/*.prompt.md`
- `sync/skills/*/SKILL.md` (one level only — folder name = skill name)
- `sync/instructions/**/*.instructions.md`

1. For each file, determine the target path in VSCode user config:

- `sync/prompts/**/*` → `{vscodeUserPath}/prompts/<relative-subpath>` (structure preserved)
- `sync/skills/{name}/SKILL.md` → `{vscodeUserPath}/skills/{name}/SKILL.md`
- `sync/instructions/**/*` → `{vscodeUserPath}/instructions/<relative-subpath>`

1. **Conflict check:** if a target path already exists and is NOT tracked in the manifest (i.e., not created by copilot-asset-manager), skip it and print:

```text
SKIP <rel-path> — exists at target but not created by copilot-asset-manager (delete the target file first if you want to overwrite)
```

1. Create parent directories as needed.

1. Symlink (macOS/Linux) or copy (Windows) the file to the target.

1. Write each synced file to `.sync-manifest.json`.

1. **Agent discovery:** VS Code does not auto-scan any global `agents/` folder. After push, check whether `sync/agents/` is listed in `chat.agentFilesLocations` in VSCode settings.json. If this has not been shown before, print:

```text
ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:
  "chat.agentFilesLocations": ["/absolute/path/to/copilot-asset-manager/sync/agents"]
```

   Track `agent_notice_shown: true` in `.sync-manifest.json` so this prints only once per machine.

---

## pull — VSCode → repo

1. Scan VSCode config `prompts/`, `skills/`, `instructions/` directories. **Do NOT scan `agents/`** — personal agent files are sourced directly from `sync/agents/` via `chat.agentFilesLocations`.

1. For each file found:

- If a symlink pointing into `sync/` — skip (already managed).
- If NOT in `sync/` at all — candidate for import.
- If already in `sync/` with **identical content** — skip silently.
- If already in `sync/` with **different content** — show a compact diff and prompt:
  - **k** — keep the repo version (no change to `sync/`)
  - **v** — accept the VS Code version (overwrites `sync/` copy)
  - **s** — skip (decide later)

  With `--yes`: conflicts are skipped silently, repo version is kept.

1. Without `--yes`: list candidates and prompt user (select all with `y`, or specific items by number).
   With `--yes`: import all without prompting.

1. Copy selected files into `sync/` preserving the directory structure.

1. Update `.sync-manifest.json`.

---

## status — compare manifest vs filesystem

1. Read manifest.
2. For each synced entry: check source and target still exist. Report OK or ORPHANED.
3. Scan `sync/` for files not in manifest. Report as NEW.
4. NEW files mean `push` hasn't been run for those assets yet.

---

## clean — remove stale entries

- Find manifest entries whose source no longer exists.
- Remove the corresponding target file (symlink or copy) if present.
- Remove the entry from the manifest.

---

## .sync-manifest.json format

```json
{
  "synced": [
    {
      "source": "/abs/path/to/copilot-asset-manager/sync/prompts/my-review.prompt.md",
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

## Version history

Every asset in `sync/` is git-tracked. To see the history of any file:

```bash
git log --oneline sync/prompts/my-prompt.prompt.md
git diff HEAD~1 sync/prompts/my-prompt.prompt.md
```

This replaces the need for external backup — git is the version history.
