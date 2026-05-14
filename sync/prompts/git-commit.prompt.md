---
description: 'Create a Conventional Commit from the current git diff with safe staging and message selection.'
name: 'Git Commit'
argument-hint: '[draft|commit] [en|zhtw] [recent] optional type, scope, description, or files'
agent: 'agent'
tools: ['search/changes', 'execute', 'read/terminalLastCommand', 'read/terminalSelection']
---

# Git Commit

Create one standardized git commit using the Conventional Commits format. Analyze the actual repository state before choosing the commit message.

## Mission

Create one safe Conventional Commit from the current logical diff, or draft the commit message when requested. Prefer the actual diff over user-provided hints when they disagree.

## Arguments

Parse trailing slash-command text as optional flags and hints. Defaults are `draft` mode and `en` language.

- Mode flags:
  - `draft`: return the proposed commit message in chat without staging or committing. This is the default.
  - `commit`: create the commit.
- Language flags:
  - `en`: write the generated commit description or body in English. This is the default.
  - `zhtw`: write the generated commit description or body in Traditional Chinese. Keep type and trailers in English, scope can be in English or Chinese depending on what fits better.
  - Keep Conventional Commit type/scope tokens and trailers such as `feat`, `fix`, and `BREAKING CHANGE:` in English.
- Context flags:
  - `recent`: use the assistant changes from the current conversation as the primary commit scope hint. Still verify the repository state before drafting or committing.
  - Infer `recent` when the user says "that change", "your change", "the change you just made", or similar.
- Treat all remaining arguments as hints for type, scope, description, file selection, or commit grouping.

## Workflow

1. Parse arguments to determine mode, language, context flags, and any commit hints.
2. Inspect repository state with `git status --porcelain`.
3. When `recent` is explicit or inferred, prefer files the assistant edited in the current conversation as the logical commit scope. For one or two known recent files, do not run broad `git diff` commands first; use direct targeted commands such as `git diff --cached --stat -- <files>`, `git diff --cached -- <files>`, `git diff --stat -- <files>`, and `git diff -- <files>` as needed. Inspect broader diffs only when `git status --porcelain` shows unexpected files or the recent scope is ambiguous.
4. In `draft` mode without `recent`, inspect staged changes with `git diff --cached --stat` and `git diff --cached`; if nothing is staged, inspect `git diff --stat` and `git diff`. Do not stage files, run commit checks, or create a commit.
5. In `commit` mode, inspect `git diff --cached --stat` and `git diff --cached` when files are staged. If nothing is staged, inspect `git diff --stat` and `git diff`, then stage the files that belong to one logical change. In `recent` mode, stage only files that match the recent-change scope unless the user explicitly expands the scope.
6. Check relevant filenames for obvious secrets or private credentials, including `.env`, private keys, credential JSON, tokens, and generated secret dumps.
7. Choose a Conventional Commit message using the rules below:
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
8. Keep the description imperative, present tense, and under 72 characters when practical.
9. Use a body only when it clarifies a non-obvious change, breaking change, migration note, or multi-area commit.
10. In `draft` mode, respond with the proposed commit message in a fenced `text` block, mention that no commit was created, and stop.
11. In `commit` mode, run `git diff --cached --check` before committing.
12. Commit with `git commit -m "<type>[optional scope]: <description>"` or a multi-line message when needed.
13. Finish with `git status --short` and report the commit hash and message.

## Additional Conventional Commit Rules

- Use `!` after the type/scope or a `BREAKING CHANGE:` footer only when the diff clearly introduces a breaking API, configuration, or behavior change.
- If one diff contains unrelated commit types, split it into separate commits when practical.
- Use footers only for useful trailers such as `BREAKING CHANGE:`, `Refs:`, or `Closes:`.

## Safety Rules

- Never update git config.
- Never run destructive commands such as `git reset --hard`, `git clean`, or force operations unless the user explicitly asks.
- Never use `--no-verify` unless the user explicitly asks.
- Never force push to `main` or `master`.
- Never commit obvious secrets. Stop and explain what needs review if a secret-like file is staged.
- Never stage files or create commits in `draft` or `paste` mode.
- If hooks fail, fix the reported issue and create a normal commit. Do not amend unless the user asks.

## Message Examples

```text
feat(auth): add password reset flow
```

```text
fix(api): handle empty search results
```

```text
docs(readme): clarify sync workflow
```

```text
chore(sync): archive unused copilot assets
```

```text
feat(api)!: require explicit project id

BREAKING CHANGE: config files must now include projectId.
```
