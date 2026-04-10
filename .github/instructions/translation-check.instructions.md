---
applyTo: "*.md"
description: Check translation parity for Markdown files in root and docs/ before committing.
---

# Translation parity check

Before committing changes to `.md` files in the repo root or `docs/`, check if the modified file has a `.zh-TW.md` counterpart.

## Rules

1. Only check files that follow the naming convention: `NAME.md` ↔ `NAME.zh-TW.md`
2. Files that already contain `.zh-TW.` in their name are translations — skip them
3. If a source file is modified but its `.zh-TW.md` counterpart does not exist, warn the user:
   - "⚠ NAME.zh-TW.md does not exist. Would you like to translate NAME.md now?"
4. If a source file is modified and the `.zh-TW.md` counterpart exists but was last committed before the source, warn:
   - "⚠ NAME.zh-TW.md may be stale. Would you like to update the translation?"
5. If the user says yes, use the `translate` skill to produce the translation
6. This check applies to: repo root `*.md` and `docs/*.md` — not to `sync/`, `local/`, or `.github/`
