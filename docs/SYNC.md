# SYNC.md — Detailed sync logic

**English** | [繁體中文](SYNC.zh-TW.md)

This document describes the internal logic of the `cam` CLI (`src/`). For usage, see the README.

## Overview

`copilot-asset-manager` syncs between two locations:

- **copilot-asset-manager repo areas**
  - `sync/` — git-tracked config synced to VS Code
  - `local/` — git-tracked private files, never synced to VS Code
- **VS Code user-level customization storage**
  - prompts: VS Code profile data (`Code/User/prompts`)
  - instructions, skills, hooks, agents: `~/.copilot/`

Repo workspace assets live under `.github/` and are not part of `pull` or `push`. `pull` imports into `sync/` by default, or `local/` when requested. `push` only syncs `sync/`. `local/` is never synced to VS Code.

Note on agents: `sync/agents/` is user-level agent sync. `cam push` copies those files into user-level storage, but current VS Code behavior only exposes workspace custom agents in Copilot CLI sessions. If an agent must be selectable in Copilot CLI, define it in `.github/agents/`.

Supported asset subdirectories: `prompts/`, `skills/`, `instructions/`, `hooks/`, `agents/`.

`sync/` maps to user-level Copilot customization storage. It does not sync workspace-level `.vscode/` settings.

## VS Code Settings Sync overlap

VS Code's built-in Settings Sync already handles user-level Settings, Keyboard Shortcuts, User Snippets, User Tasks, UI State, Extensions, and Profiles. Current Copilot customization docs also support roaming user prompt files and user instruction files when Settings Sync is configured to include Prompts and Instructions.

That means the overlap is limited:

- Settings Sync can already move your normal editor preferences between machines.
- Prompt and instruction roaming is handled by VS Code when that sync category is enabled.
- `copilot-asset-manager` remains useful as the git-tracked source of truth for full restore, review, team sharing, selective push/pull, and file-based assets such as skills, hooks, and agents.

## Cross-file markdown links

Relative links between files under `sync/` work in both the repo and VS Code because `cam push` preserves the directory structure. Use relative paths such as `../skills/debug/SKILL.md`, never absolute paths such as `/Users/...`, `C:\...`, or `file:///...`.

`cam push` warns when it detects absolute markdown link targets in synced files, but it does not block the sync.

---

## push — repo → VS Code

1. Scan `sync/` recursively for all non-.gitkeep files matching:

- `sync/prompts/**/*.prompt.md`
- `sync/skills/*/SKILL.md` (one level only — folder name = skill name)
- `sync/instructions/**/*.instructions.md`
- `sync/hooks/**/*`
- `sync/agents/**/*.agent.md`

1. For each file, determine the target path by asset type:

- `sync/prompts/**/*` → `{vscodeUserPath}/prompts/<relative-subpath>` (structure preserved)
- `sync/skills/{name}/SKILL.md` → `{copilotUserPath}/skills/{name}/SKILL.md`
- `sync/instructions/**/*` → `{copilotUserPath}/instructions/<relative-subpath>`
- `sync/hooks/**/*` → `{copilotUserPath}/hooks/<relative-subpath>`
- `sync/agents/**/*` → `{copilotUserPath}/agents/<relative-subpath>`

1. **Conflict check:** if a target path already exists and is NOT tracked in the manifest (i.e., not created by copilot-asset-manager), skip it and print:

```text
SKIP <rel-path> — exists at target but not created by copilot-asset-manager (delete the target file first if you want to overwrite)
```

1. After syncing current files, compare the manifest against `sync/`:

- default `--cleanup report`: report stale manifest-managed user files whose repo source was deleted
- `--cleanup ask`: prompt one-by-one before deleting the user-level copy and removing the manifest entry
- `--cleanup delete`: remove stale user-level copies automatically and drop their manifest entries

1. Create parent directories as needed.

1. Symlink (macOS/Linux) or copy (Windows) the file to the target.

1. Write each synced file to `.sync-manifest.json`.

---

## pull — VSCode → repo

Command syntax: `cam pull [sync|local] [--yes] [--cleanup report|ask|delete]` (`sync` is the default).

1. Scan user-level customization storage:

- `{vscodeUserPath}/prompts/`
- `{copilotUserPath}/skills/`
- `{copilotUserPath}/instructions/`
- `{copilotUserPath}/hooks/`
- `{copilotUserPath}/agents/`

1. For each file found:

- If a symlink pointing into `sync/` — skip (already managed).
- If NOT in the selected destination (`local/` or `sync/`) — candidate for import.
- If already in the selected destination with **identical content** — skip silently.
- If already in the selected destination with **different content** — prompt:
  - **k** — keep the repo version (no change to the selected destination)
  - **v** — accept the VS Code version (overwrites the selected destination copy)
  - **s** — skip (decide later)

  With `--yes`: conflicts are skipped with a warning, repo version is kept.

1. Without `--yes`: list candidates and prompt user (select all with `y`, or specific items by number).
   With `--yes`: import all without prompting.

1. Copy selected files into the selected destination, preserving the directory structure.

1. When importing into `sync/`, compare the manifest against user-level storage:

- default `--cleanup report`: report stale manifest-managed repo files whose user-level counterpart was deleted
- `--cleanup ask`: prompt one-by-one before deleting the repo copy and removing the manifest entry
- `--cleanup delete`: remove stale repo copies automatically and drop their manifest entries

  `--cleanup` only affects `pull sync`. `pull local` never deletes repo files because it does not use the manifest.

1. Update `.sync-manifest.json` only when importing into `sync/`.

---

## status — compare manifest vs filesystem

1. Read manifest.
2. For each synced entry: check source and target still exist. Report OK or ORPHANED.
3. Scan `sync/` for files not in manifest. Report as NEW.
4. NEW files mean `push` hasn't been run for those assets yet.
5. ORPHANED entries mean the source or target file is missing; run `cam clean` to remove stale manifest entries and leftover targets.

---

## clean — remove stale entries

- Find manifest entries whose source no longer exists.
- Remove the corresponding target file (symlink or copy) if present.
- Remove the entry from the manifest.

`clean` remains the explicit bulk cleanup command. `push` and `pull sync` now provide lighter per-run cleanup controls via `--cleanup`.

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
- `agent_notice_shown` — legacy field retained for backward compatibility

The manifest is **gitignored** — it is local machine state only.

---

## Version history

Every asset in `sync/` is git-tracked. To see the history of any file:

```bash
git log --oneline sync/prompts/my-prompt.prompt.md
git diff HEAD~1 sync/prompts/my-prompt.prompt.md
```

This replaces the need for external backup — git is the version history.
