---
name: "validate-sync"
description: "Validate that a collaborator's managed prompts, instructions, and agents are mirrored correctly between the repo and the VS Code user-level folder"
agent: agent
argument-hint: "[owner_folder=YourName] [repo_path=C:\path\to\ai-dev-library] [target=prompts/personal/my-prompt.prompt.md] [show_diff=true|false] [compare_mode=normalized|exact]"
---

Validate that a collaborator's managed Copilot customizations are mirrored correctly between this repository and the user-level Copilot folder.

Optional input:

- `owner_folder`: collaborator folder name. If omitted, read `defaultOwnerFolder` from `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`. If neither is available, stop and ask the user to run `/Setup User-Level Sync Automation` first.
- `repo_path`: absolute path to the `ai-dev-library` repo. If omitted, first try the active workspace, then fall back to `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`
- `target`: exact relative source path under `<owner_folder>/github/`. If omitted, validate the full managed set
- `show_diff`: `true` or `false`. Default: `true` when content mismatches are detected
- `compare_mode`: `normalized` or `exact`. Default: `normalized`

Source discovery:

- scan recursively under `<owner_folder>/github/prompts/`
- scan recursively under `<owner_folder>/github/instructions/`
- scan recursively under `<owner_folder>/github/agents/`
- ignore `.gitkeep` and files under `.local/`
- do not include skills

Validation rules:

1. Resolve the repo path in this order: explicit `repo_path`, active workspace root, then `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.sync-config.json`.
2. Resolve `owner_folder` in this order: explicit argument, then `defaultOwnerFolder` from config. If still unresolved, stop.
3. Read the manifest at `{{VSCODE_USER_PROMPTS_FOLDER}}/ai-dev-library.<owner_folder>.sync.json` if it exists.
4. Compare the current tracked files under `<owner_folder>/github/`, the manifest entries, and the managed user-level files.
5. If `target` is provided, interpret it as the exact relative source path under `<owner_folder>/github/` and validate only that item.
6. Treat `<owner_folder>/github/` as the source of truth for expected coverage.
7. Do not modify files during validation.

Checks to perform:

1. Every tracked prompt, instruction, and agent under `<owner_folder>/github/` has a corresponding managed user-level file.
2. Every managed user-level file listed in the manifest still exists.
3. File contents match according to `compare_mode`.
4. Manifest entries still point to valid repo source paths.
5. No managed user-level files exist for deleted repo files unless intentionally retained.
6. No two manifest entries resolve to the same effective destination filename.
7. No unsupported file types are being treated as managed sync files.

Return concise output with:

- owner folder used
- resolved repo path
- validation result: clean or drift detected
- missing user-level files
- content mismatches
- stale manifest entries
- orphaned managed user-level files
- filename collisions
- manifest path or missing-manifest note
