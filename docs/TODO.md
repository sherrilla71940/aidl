# TODO

## 1. Terminal ↔ Chat command parity

Currently `clean`, `config lang`, and `config show` are terminal-only. `cam-help` is chat-only.

- [x] Add `/cam-clean` prompt
- [x] Add `/cam-config` prompt (language switching via chat)
- [ ] Add `cam translate` terminal command wrapping the translate skill logic
- [ ] Add `/cam-translate` prompt that invokes the translate skill

## 2. `cam translate` command + auto-translate workflow

When repo content is added or updated (README, CONTRIBUTING, guides), the zh-TW counterpart should stay in sync.

- [ ] `cam translate <file>` — reads file, detects language, outputs translated copy to conventional path (e.g., `README.md` → `README.zh-TW.md`)
- [x] CI check: `translation-parity` job in CI fails if zh-TW counterpart is missing or stale (`.github/workflows/ci.yml`)
- [x] Copilot pre-commit hook: `.github/hooks/translation-check.md` warns before commit and offers to invoke translate skill
- [x] Instruction: `.github/instructions/translation-check.instructions.md` tells agents to check parity on `.md` edits

## 3. Push/pull optionality + `cam init`

Users may want this repo for organizing only (no VS Code sync), or pull-only, or push-only.

- [ ] Add `cam init` command — prompts for sync direction: push-only, pull-only, both, neither
- [ ] Store preference in `.cam-config.json` (e.g., `"syncMode": "both"`)
- [ ] `cam push` / `cam pull` respect the setting; skip with a message if disabled
- [ ] `cam init` also prompts for language preference (currently done via `cam config lang`)
- [ ] Investigate: does VS Code Settings Sync already handle user-level prompts/instructions? If so, document the overlap
- [ ] Note: current sync is VS Code **user-level** config only, not workspace-level `.vscode/`

## 4. Clarify `sync/` naming in docs

Renaming `sync/` to `vscode-user-sync/` is more accurate but touches 30+ files (source, docs, agents, prompts, CI, i18n). Not worth the churn.

- [ ] Add a one-liner to README and SYNC.md: "`sync/` maps to your VS Code user config directory — it does not sync workspace-level settings"
- [ ] Revisit only if users report confusion

## 5. README: repo-open vs terminal requirements

- [ ] Chat commands require this repo **open in VS Code** (already documented)
- [ ] Add: "Terminal commands must be run from inside the repo directory" under the commands table
- [ ] Improve `cam` error message when not inside a repo tree — currently falls back silently to cwd

## 6. Cross-file Markdown links

Relative links between `sync/` subdirectories already work in both the repo and VS Code because `cam push` mirrors the directory structure. No template variables needed.

- [ ] Document in SYNC.md and authoring instructions: "use relative paths (e.g., `../skills/debug/SKILL.md`), never absolute paths"
- [ ] Add a push-time warning if `cam push` detects absolute paths in synced files
