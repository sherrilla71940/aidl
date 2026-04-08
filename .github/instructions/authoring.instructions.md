---
applyTo: "user-sync/**"
description: Frontmatter requirements, naming conventions, and content standards for Copilot assets in user-sync/.
---

# Authoring guide for user-sync/ assets

This file auto-applies whenever you are editing or creating files under `user-sync/`. Follow these conventions to ensure your assets work correctly after sync.

## Asset types

| Type | File pattern | Location |
|------|-------------|----------|
| `prompt` | `kebab-case.prompt.md` | `user-sync/prompts/` |
| `skill` | `SKILL.md` (folder name = skill name) | `user-sync/skills/<name>/SKILL.md` |
| `agent` | `kebab-case.agent.md` | `user-sync/agents/` |
| `instruction` | `kebab-case.instructions.md` | `user-sync/instructions/` |

## Required frontmatter by type

### Prompt (`*.prompt.md`)
```yaml
---
description: One-sentence description shown in the slash command menu.
mode: agent
---
```

### Skill (`SKILL.md`)
```yaml
---
name: skill-folder-name   # must exactly match parent directory name
description: One sentence. What this skill does and when Copilot should load it.
---
```

### Agent (`*.agent.md`)
```yaml
---
description: One-sentence description of what this agent does.
tags: [tag1, tag2]
type: agent
tools: [codebase, terminal]   # only include tools the agent actually uses
---
```

### Instruction (`*.instructions.md`)
```yaml
---
applyTo: "**"   # glob — e.g. "src/**/*.ts" restricts to TypeScript files
description: One sentence describing what these instructions enforce.
---
```

## Naming rules

- All file and folder names: `kebab-case` (lowercase, hyphens only)
- Skill folder name must exactly match the `name:` field in `SKILL.md`
- Agent file name should be descriptive — it becomes the `@agent-name` in Chat
- Prompt file name becomes the `/slash-command` — keep it short and memorable

## Content requirements

- **Minimum 100 words** in the body (below the frontmatter block)
- Content must be specific and actionable — not vague one-liners
- Include concrete examples, steps, or output specs
- Skills: include step-by-step workflow, frontmatter templates, and a common mistakes checklist
- Agents: include what the agent does, how to talk to it, and any safety constraints

## Common mistakes

- Forgetting `mode: agent` in prompt frontmatter — slash command won't work correctly
- `name:` field in SKILL.md doesn't match parent folder — CI will fail
- Placing files in `user-local/` then wondering why they don't appear in VSCode — `user-local/` is never synced
- Not running `./scripts/sync.sh push` after adding a new file — the link to VSCode doesn't happen automatically

## Validation

After creating or editing an asset:
1. Run `./scripts/sync.sh status` — new files appear as `[NEW]`
2. Run `./scripts/sync.sh push` — links the file to VSCode
3. Open Copilot Chat and confirm the asset appears (slash command, agent, or auto-applied instruction)
