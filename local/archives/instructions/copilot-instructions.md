---
# GitHub Copilot Instructions
# Copy this file into your project at .github/copilot-instructions.md
# Customize for your stack and team conventions.
---

## General

- Be concise. Prefer short answers over lengthy explanations unless the task is complex.
- Read existing files before suggesting changes. Understand the pattern already in use before introducing a new one.
- Match the style and conventions of the surrounding code. Don't introduce a new pattern when an existing one works.
- Don't add abstractions, helpers, or utilities for one-time use. Only generalize when there are three or more callsites.
- Remove unused code and dead imports. Don't leave commented-out code behind.

## Code changes

- Make the smallest change that solves the problem. Don't refactor unrelated code in the same PR.
- Don't add docstrings, comments, or type annotations to code you didn't write unless asked.
- Prefer editing existing files over creating new ones.
- When creating a new file, confirm it fits the existing folder structure before placing it.

## Security

- Validate and sanitize all inputs at system boundaries (API endpoints, file reads, CLI args).
- Never hardcode credentials, tokens, or secrets. Use environment variables or a secrets manager.
- Avoid constructing SQL, shell commands, or HTML via string concatenation. Use parameterized queries and safe APIs.

## Testing

- Write tests that cover behavior, not implementation details.
- Each test should have one clear assertion and a descriptive name.
- Don't mock what you don't own — prefer integration tests for third-party integrations.
