---
applyTo: "sync/**"
description: Repo-specific conventions for Copilot assets in sync/.
---

# Authoring assets in sync/

Assets in `sync/` are synced to VS Code via the sync scripts. These repo-specific rules apply on top of standard Copilot asset conventions.

## Where files go

| Type | Location |
|------|----------|
| Prompts | `sync/prompts/` |
| Skills | `sync/skills/<name>/SKILL.md` |
| Agents | `sync/agents/` |
| Instructions | `sync/instructions/` |
| Hooks | `sync/hooks/` |

Do not create subfolders inside any of these directories. VS Code user-level discovery does not recurse subdirectories — nested files will be copied by `cam push` but will not be loaded by VS Code. Keep every asset as a direct child of its parent directory (e.g. `sync/skills/my-skill/SKILL.md`, not `sync/skills/category/my-skill/SKILL.md`).

## After creating or editing an asset

1. Run `cam push` (or `/cam-push` in Chat) — files are NOT auto-synced to VS Code
2. Run `cam status` (or `/cam-status`) to verify the file was picked up
3. `local/` is never synced — if an asset doesn't appear in VS Code, check it's in `sync/`, not `local/`

## Cross-file links

- Use relative paths for links between synced files, for example `../skills/debug/SKILL.md`
- Never use absolute paths such as `/Users/...`, `C:\...`, or `file:///...`
- `cam push` warns when it finds absolute markdown link targets in synced files

## Content quality

- Minimum 100 words in the body — CI enforces this
- Be specific and actionable, not vague one-liners
