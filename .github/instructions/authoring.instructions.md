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

Nested folders within these directories are supported and sync correctly.

## After creating or editing an asset

1. Run `cam push` (or `/cam-push` in Chat) — files are NOT auto-synced to VS Code
2. Run `cam status` (or `/cam-status`) to verify the file was picked up
3. `local/` is never synced — if an asset doesn't appear in VS Code, check it's in `sync/`, not `local/`

## Content quality

- Minimum 100 words in the body — CI enforces this
- Be specific and actionable, not vague one-liners
