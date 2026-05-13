---
description: 'Create a Conventional Commit from the current git diff with safe staging and message selection.'
name: 'Git Commit'
argument-hint: 'optional type, scope, description, or files to include'
agent: 'agent'
tools: ['search/changes', 'execute', 'read/terminalLastCommand', 'read/terminalSelection']
---

# Git Commit

Create one standardized git commit using the Conventional Commits format. Analyze the actual repository state before choosing the commit message.

## Mission

Commit the current logical change safely. Use the user's arguments to guide type, scope, description, or file grouping, but prefer the diff when the arguments and code disagree.

## Workflow

1. Inspect repository state with `git status --porcelain`.
2. If files are staged, inspect `git diff --cached --stat` and `git diff --cached`.
3. If nothing is staged, inspect `git diff --stat` and `git diff`, then stage the files that belong to one logical change.
4. Check staged filenames for obvious secrets or private credentials, including `.env`, private keys, credential JSON, tokens, and generated secret dumps.
5. Choose a Conventional Commit message:
   - `feat`: new feature
   - `fix`: bug fix
   - `docs`: documentation only
   - `style`: formatting without behavior changes
   - `refactor`: code change without feature or bug fix
   - `perf`: performance improvement
   - `test`: tests only
   - `build`: build system or dependencies
   - `ci`: CI/config automation
   - `chore`: maintenance or repository housekeeping
   - `revert`: revert a prior commit
6. Keep the description imperative, present tense, and under 72 characters when practical.
7. Use a body only when it clarifies a non-obvious change, breaking change, migration note, or multi-area commit.
8. Run `git diff --cached --check` before committing.
9. Commit with `git commit -m "<type>[optional scope]: <description>"` or a multi-line message when needed.
10. Finish with `git status --short` and report the commit hash and message.

## Safety Rules

- Never update git config.
- Never run destructive commands such as `git reset --hard`, `git clean`, or force operations unless the user explicitly asks.
- Never use `--no-verify` unless the user explicitly asks.
- Never force push to `main` or `master`.
- Never commit obvious secrets. Stop and explain what needs review if a secret-like file is staged.
- If hooks fail, fix the reported issue and create a normal commit. Do not amend unless the user asks.

## Message Examples

```text
feat(auth): add password reset flow
fix(api): handle empty search results
docs(readme): clarify sync workflow
chore(sync): archive unused copilot assets
```
