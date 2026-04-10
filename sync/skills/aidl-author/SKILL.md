---
name: aidl-author
description: Create and validate Copilot assets (prompts, skills, agents, instructions). Use when creating a new asset, writing frontmatter, or checking if an existing file meets conventions.
---

# aidl-author — Asset Creation Skill

Use this skill when creating or validating any Copilot asset: prompt files, skill files, agent files, or instruction files. Follows the aidl conventions enforced by the bundled CI.

## Asset creation workflow

1. **Choose the type** — what are you building?
   - `prompt` — a slash command that appears in the `/` menu in Copilot Chat
   - `skill` — a capability Copilot loads automatically when relevant, or via the `/` menu
   - `agent` — a persistent agent with a name (appears as `@name` in Copilot Chat)
   - `instruction` — passive context auto-applied to matching files (no invocation needed)

2. **Name it** — follow naming conventions:
   - Prompts: `kebab-case.prompt.md` (e.g., `review-pr.prompt.md`)
   - Skills: folder name in `kebab-case/`, file is always `SKILL.md` (e.g., `debug/SKILL.md`)
   - Agents: `kebab-case.agent.md` (e.g., `explorer.agent.md`)
   - Instructions: `kebab-case.instructions.md` (e.g., `api-style.instructions.md`)

3. **Write frontmatter** — use the templates below. All fields are required unless marked optional.

4. **Write the body** — minimum 100 words. Be specific and actionable. Vague one-liners fail CI and don't help Copilot.

5. **Validate** — run `./scripts/sync.sh status` to see unsynced files. Run `./scripts/sync.sh push` to link it to VSCode. Open Copilot Chat and confirm the asset appears.

## Frontmatter templates

### Prompt
```yaml
---
description: One-sentence description shown in the slash command menu.
mode: agent
---
```

### Skill
```yaml
---
name: skill-folder-name   # must match parent directory name exactly
description: One sentence. When to use this skill and what it helps with.
---
```

### Agent
```yaml
---
description: One-sentence description of what this agent does.
tags: [tag1, tag2]
type: agent
tools: [codebase, terminal]   # list only tools the agent actually needs
---
```

### Instruction
```yaml
---
applyTo: "**"   # glob pattern — e.g. "src/**/*.ts" or "user-sync/**"
description: One-sentence description of what these instructions enforce.
---
```

## Common mistakes

- **`name` mismatch** — the `name:` field in a SKILL.md must exactly match the parent folder name. `user-sync/skills/debug/SKILL.md` must have `name: debug`.
- **Missing `mode: agent`** — all `.prompt.md` files must have `mode: agent` in frontmatter. Without it, the slash command won't work correctly.
- **Vague body** — "Helps with debugging" is not enough. Write the actual steps, questions to ask, or outputs to produce. Minimum 100 words.
- **Wrong file location** — user-owned prompts go in `user-sync/prompts/`, skills in `user-sync/skills/<name>/`, agents in `user-sync/agents/`, and instructions in `user-sync/instructions/`. Repo-owned defaults live in `bundled/`.
- **Hardcoded paths** — don't hardcode paths to the aidl repo. The scripts resolve their own location via `$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )`.
- **Not running push** — creating a file in `user-sync/` doesn't auto-link it to VSCode. Run `./scripts/sync.sh push` after adding any new asset.

## Validation checklist

- [ ] Frontmatter is valid YAML (test with a linter if unsure)
- [ ] Required fields present for this asset type (see templates above)
- [ ] `name` field (skills only) matches parent directory name exactly
- [ ] Body is at least 100 words with specific, actionable content
- [ ] User-owned asset is in the correct `user-sync/` subdirectory
- [ ] `./scripts/sync.sh status` shows the file as unsynced (meaning it was found)
- [ ] `./scripts/sync.sh push` links it without errors
- [ ] Asset appears in Copilot Chat after push
