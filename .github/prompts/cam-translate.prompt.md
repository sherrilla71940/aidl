---
description: Translate a Markdown file between English and Traditional Chinese (zh-TW) using the translate skill.
agent: agent
---

The user wants to translate a file. Follow these steps:

1. Ask which file to translate if not already specified.
2. Run `cam translate <file>` to detect the language direction and target path.
3. Read the source file content.
4. Use the `translate` skill (`.github/skills/translate/SKILL.md`) to produce the translation — preserve all YAML frontmatter structure, code blocks, and technical terms.
5. Write the translated content to the target path shown by `cam translate`.

If the target file already exists, show a diff summary and ask before overwriting.

Supported directions: English → zh-TW and zh-TW → English. The direction is inferred from the filename (`.zh-TW.md` files are Chinese; others are English).
