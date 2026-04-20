---
name: "setup-user-level-sync-automation"
description: "Set up user-level sync automation for a collaborator folder: save a user-level config file and sync the tracked sync prompts themselves"
agent: agent
argument-hint: "owner_folder=YourName [repo_path=C:\path\to\ai-dev-library] [sync_prompts=true|false] [default_cleanup_mode=report|ask|delete]"
---

Set up the user-level sync workflow for a collaborator's tracked source-of-truth files in this repo.

Required input:

- `owner_folder`: the collaborator's top-level folder name in this repo (for example: `Aaron`, `Mia`, `Kevin`). This is stored in config and used automatically by all sync prompts going forward. If omitted, stop and ask for it — do not proceed without it.

Optional input:

- `repo_path`: absolute path to the `ai-dev-library` repo. If omitted, detect it from the active workspace and ask only if detection is ambiguous
- `sync_prompts`: `true` or `false`. Default: `true`
- `default_cleanup_mode`: `report`, `ask`, or `delete`. Default: `report`

Setup goals:

- confirm `owner_folder` exists as a top-level folder in the repo
- resolve the correct repo path for `ai-dev-library`
- save a reusable user-level config file at `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`
- optionally sync the tracked sync prompts from `<owner_folder>/github/prompts/personal/sync/` into the user-level prompt folder
- verify that the saved config and synced prompts are usable from outside this repo

Config file requirements:

1. Create or update `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`.
2. Store at least:
   - `repoPath`
   - `defaultOwnerFolder` set to the provided `owner_folder`
   - `defaultCleanupMode`
3. Preserve existing keys that are not being changed unless they are clearly invalid.
4. If the resolved repo path does not exist or does not look like `ai-dev-library`, stop and explain the blocker.
5. If `owner_folder` does not exist as a top-level folder in the repo, stop and explain the blocker.

Prompt sync requirements:

1. If `sync_prompts=true`, ensure these tracked sync prompt files from `<owner_folder>/github/prompts/personal/sync/` are synced to user level:
   - `setup-user-level-sync-automation.prompt.md`
   - `sync-repo-to-user-level.prompt.md`
   - `sync-user-level-to-repo.prompt.md`
   - `validate-sync.prompt.md`
2. Use the manifest `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.<owner_folder>.sync.json`.
3. Use `<owner_folder>`-prefixed managed filenames that preserve nested source path segments by replacing `/` with `__`.
4. Do not touch unrelated user-level files.

Execution steps:

1. Confirm `owner_folder` is provided. If missing, stop and ask for it.
2. Resolve the repo path.
3. Validate that `<owner_folder>/` exists in the repo.
4. Create or update the user-level config file.
5. If `sync_prompts=true`, sync the tracked sync prompts from `<owner_folder>/github/prompts/personal/sync/` into the user-level prompt folder and update the manifest.
6. Verify that the config file exists and that the managed prompt files exist when prompt sync is enabled.
7. Report exact commands the user can run later from any workspace.

Return concise output with:

- owner folder used
- resolved repo path
- saved default cleanup mode
- config file path
- manifest path
- synced user-level prompt files
- exact example commands for future use
