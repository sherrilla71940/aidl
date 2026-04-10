---
description: Check that zh-TW translations exist and are up to date before committing Markdown files.
event: preCommit
---

# Translation parity check

Before committing, check if any staged `.md` files in the repo root or `docs/` are missing their `.zh-TW.md` counterpart or if the translation is stale.

## Steps

1. List all staged `.md` files in the repo root and `docs/` (exclude files already named `*.zh-TW.md`, `docs/TODO.md`, and `LICENSE`)
2. For each file, check if `NAME.zh-TW.md` exists in the same directory
3. If the counterpart is missing, warn: "⚠ NAME.zh-TW.md does not exist. Translate before committing?"
4. If the counterpart exists but the source file has uncommitted changes and the counterpart does not, warn: "⚠ NAME.zh-TW.md may be stale. Update the translation?"
5. If the user agrees, use the `translate` skill to generate or update the translation
6. If the user declines, allow the commit to proceed — CI will catch it on PR
