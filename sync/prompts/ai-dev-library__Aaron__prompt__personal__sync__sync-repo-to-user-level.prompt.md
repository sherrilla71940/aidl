---
name: "sync-repo-to-user-level"
description: "Sync a collaborator's tracked prompts, instructions, and agents from ai-dev-library into the VS Code user-level folder"
agent: agent
argument-hint: "[owner_folder=YourName] [repo_path=C:\path\to\ai-dev-library] [target=prompts/personal/my-prompt.prompt.md] [conflict_mode=ask|overwrite|skip] [cleanup_mode=report|ask|delete] [show_diff=true|false] [compare_mode=normalized|exact]"
---

Sync a collaborator's tracked Copilot customizations from this repository into the user-level Copilot folder.

Optional input:

- `owner_folder`: collaborator folder name. If omitted, read `defaultOwnerFolder` from `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`. If neither is available, stop and ask the user to run `/Setup User-Level Sync Automation` first.
- `repo_path`: absolute path to the `ai-dev-library` repo. If omitted, first try the active workspace, then fall back to `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`
- `target`: exact relative source path under `<owner_folder>/github/`, for example `prompts/personal/create-creative-tic-tac-toe-game.prompt.md` or `prompts/personal/sync/setup-user-level-sync-automation.prompt.md`. If omitted, sync the full tracked set
- `conflict_mode`: `ask`, `overwrite`, or `skip`. Default: `ask`
- `cleanup_mode`: `report`, `ask`, or `delete`. If omitted, fall back to `defaultCleanupMode` in `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`, then default to `report`. When `ask`, prompt for confirmation **per stale file individually** — do not batch them into a single all-or-nothing question
- `show_diff`: `true` or `false`. Default: `true` when a conflict is detected
- `compare_mode`: `normalized` or `exact`. Default: `normalized`

Source discovery:

- scan recursively under `<owner_folder>/github/prompts/`
- scan recursively under `<owner_folder>/github/instructions/`
- scan recursively under `<owner_folder>/github/agents/`
- ignore `.gitkeep` and files under `.local/`
- do not sync skills

Managed sync rules:

1. Resolve the repo path in this order: explicit `repo_path`, active workspace root, then `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`.
2. Resolve `owner_folder` in this order: explicit argument, then `defaultOwnerFolder` from config. If still unresolved, stop.
3. Maintain a manifest at `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.<owner_folder>.sync.json`.
4. Use `<owner_folder>`-prefixed managed filenames that preserve nested source path segments by replacing `/` with `__`.
5. If `target` is provided, interpret it as the exact relative source path under `<owner_folder>/github/` and operate only on that item.
6. Treat `<owner_folder>/github/` as the source of truth.
7. Only create, update, or delete files tracked by that manifest.
8. Default cleanup behavior is non-destructive.

Execution steps:

1. Resolve and validate the repo path.
2. Resolve `owner_folder`.
3. Collect tracked files recursively from the source roots above.
4. If `target` is provided, filter by the exact relative source path and stop if zero or multiple matches are found.
5. Read the manifest if it exists. If it does not exist, treat it as empty.
6. Compare each selected repo source file with its managed user-level destination.
7. Create or update managed files according to `conflict_mode`.
8. During full sync, treat missing source paths referenced by the manifest as stale managed files and handle them according to `cleanup_mode`. When `cleanup_mode=ask`, ask about each stale file one at a time before acting on it — never group them into a single confirm-all prompt.
9. Rewrite the manifest so it reflects the current managed set and preserves stale entries only when cleanup is deferred.
10. Report created, updated, deleted, stale, skipped, conflicted, and unchanged files.

Return concise output with:

- owner folder used
- resolved repo path
- sync result
- files created
- files updated
- files deleted
- stale managed files
- files skipped
- files with conflicts
- files unchanged
- manifest path
