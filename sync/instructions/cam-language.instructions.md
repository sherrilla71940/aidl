---
description: Sets the preferred language for all Copilot responses based on cam config.
applyTo: "**"
---

# Language preference

Read the file `.cam-config.json` in the workspace root. If it contains a `lang` field, respond in that language:

- `en` — respond in English
- `zh-TW` — respond in Traditional Chinese (繁體中文)

If the file does not exist or has no `lang` field, default to English.

This applies to all responses, explanations, generated comments, and commit messages.
