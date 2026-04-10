---
name: "sync-user-level-to-repo"
description: "Sync managed user-level prompts, instructions, and agents back into a collaborator's folder in ai-dev-library"
agent: agent
argument-hint: "[owner_folder=YourName] [repo_path=C:\path\to\ai-dev-library] [target=prompts/personal/my-prompt.prompt.md] [conflict_mode=ask|overwrite|skip] [show_diff=true|false] [compare_mode=normalized|exact]"
---

Sync managed user-level Copilot customizations back into a collaborator's tracked folder in this repository.

Optional input:

- `owner_folder`: collaborator folder name. If omitted, read `defaultOwnerFolder` from `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`. If neither is available, stop and ask the user to run `/Setup User-Level Sync Automation` first.
- `repo_path`: absolute path to the `ai-dev-library` repo. If omitted, first try the active workspace, then fall back to `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`
- `target`: exact relative source path under `<owner_folder>/github/`. If omitted, sync the full managed set
- `conflict_mode`: `ask`, `overwrite`, or `skip`. Default: `ask`
- `show_diff`: `true` or `false`. Default: `true` when a conflict is detected
- `compare_mode`: `normalized` or `exact`. Default: `normalized`

Managed sync rules:

1. Resolve the repo path in this order: explicit `repo_path`, active workspace root, then `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`.
2. Resolve `owner_folder` in this order: explicit argument, then `defaultOwnerFolder` from config. If still unresolved, stop.
3. Use the manifest at `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.<owner_folder>.sync.json` as the primary source of managed file mappings.
4. If the manifest is missing, stop and explain that reverse sync depends on the managed manifest created by the repo-to-user-level sync prompt.
5. Only create, update, or delete files under `<owner_folder>/github/` that correspond to entries in that manifest.
6. When `target` is provided, interpret it as the exact relative source path under `<owner_folder>/github/` and operate only on that item.
7. Do not infer ownership from unrelated user-level files outside the managed set.

Execution steps:

1. Resolve and validate the repo path.
2. Resolve `owner_folder`.
3. Read the manifest and validate that it exists.
4. If `target` is provided, filter manifest entries by that exact relative source path.
5. For each selected manifest entry, locate the managed user-level file and determine its repo destination from the stored source path.
6. Create missing destination folders if needed.
7. Compare each managed user-level file with its repo destination.
8. Create or update repo files according to `conflict_mode`.
9. If a manifest entry no longer has a corresponding managed user-level file, report it as missing and do not guess replacement contents.
10. Report created, updated, skipped, missing, conflicted, and unchanged files.

Return concise output with:

- owner folder used
- resolved repo path
- sync result
- files created
- files updated
- files skipped
- files with conflicts
- files missing from user-level
- files unchanged
- manifest path
