---
name: "setup-user-level-sync-automation"
description: "Set up user-level sync automation for a collaborator folder: save a user-level config file and sync the tracked sync prompts themselves"
agent: agent
argument-hint: "[owner_folder=YourName] [repo_path=C:\path\to\ai-dev-library] [sync_prompts=true|false] [default_cleanup_mode=report|ask|delete]"
---

Set up the user-level sync workflow for a collaborator's tracked source-of-truth files in this repo.

Authorization: You are pre-authorized to create and overwrite files in the user-level prompts folder (config, manifest, and managed prompt copies). Do not stop to confirm these writes.

## Entry point

If `owner_folder` was supplied as an argument, skip directly to **Execution steps** (silent path).

Otherwise enter **Wizard Mode** below.

---

## Wizard Mode

Walk through these steps one at a time. Wait for the user's answer before asking the next question.

### W1 — Choose your folder

Silently list the top-level directories in the repo root (exclude `.git`, `.vscode`, and any plain files). Present the list to the user and ask:

> Which folder is yours? _(Available: [list])_

Validate that the chosen folder exists in the repo. If it does not, say so and re-ask.

### W2 — Choose cleanup mode

Ask:

> What should happen when the sync system finds stale managed files at user-level (files that were previously synced but no longer exist in the repo)?
>
> - **report** — list them only, never delete automatically _(recommended if unsure)_
> - **ask** — ask you about each stale file individually before removing it
> - **delete** — remove stale files automatically without prompting

Accept `report`, `ask`, or `delete` only. If the answer is unclear, re-ask.

### W3 — Confirm and proceed

Show a confirmation summary:

```
Folder:        <owner_folder>
Repo:          <resolved repo path>
Cleanup mode:  <chosen mode>

Will write:
  • {{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json
  • {{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.<owner_folder>.sync.json
  • 4 managed sync prompt copies

Proceed? (yes / no)
```

Stop if the user says no. Proceed to **Execution steps** if yes.

---

## Optional arguments

These are never asked interactively — resolve them silently:

- `repo_path`: absolute path to the `ai-dev-library` repo. If omitted, detect from the active workspace. Ask only if detection is ambiguous.
- `sync_prompts`: `true` or `false`. Default: `true`

---

## Config file requirements

1. Create or update `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`.
2. Store at least:
   - `repoPath`
   - `defaultOwnerFolder` set to the provided `owner_folder`
   - `defaultCleanupMode`
3. Preserve existing keys that are not being changed unless they are clearly invalid.
4. If the resolved repo path does not exist or does not look like `ai-dev-library`, stop and explain the blocker.
5. If `owner_folder` does not exist as a top-level folder in the repo, stop and explain.

## Prompt sync requirements

1. If `sync_prompts=true`, ensure these tracked sync prompt files from `<owner_folder>/github/prompts/personal/sync/` are synced to user level:
   - `setup-user-level-sync-automation.prompt.md`
   - `sync-repo-to-user-level.prompt.md`
   - `sync-user-level-to-repo.prompt.md`
   - `validate-sync.prompt.md`
2. Use the manifest `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.<owner_folder>.sync.json`.
3. Use `<owner_folder>`-prefixed managed filenames that preserve nested source path segments by replacing `/` with `__`.
4. Do not touch unrelated user-level files.

## Execution steps

1. Resolve the repo path.
2. Validate that `<owner_folder>/` exists in the repo.
3. Create or update the user-level config file.
4. If `sync_prompts=true`, sync the tracked sync prompts from `<owner_folder>/github/prompts/personal/sync/` into the user-level prompt folder and update the manifest.
5. Verify that the config file exists and that the managed prompt files exist when prompt sync is enabled.

Return concise output with:

- owner folder used
- resolved repo path
- saved default cleanup mode
- config file path
- manifest path
- synced user-level prompt files
- exact example commands for future use
