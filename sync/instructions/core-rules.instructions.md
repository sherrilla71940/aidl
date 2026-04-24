---
applyTo: "**"
---

# Core Personal Instructions

## Scope and priority

- Apply rules in this order when conflicts occur: language/framework-specific > file-type-specific > general.
- Follow repository conventions and local patterns in the files being edited. Repository conventions override stylistic preferences unless they cause correctness or security issues.
- Edit source-of-truth files, not generated output (for example: `.ts` over `.js`, `.scss` over `.css`).

## Response behavior

- Always respond in English. This instruction wins over any language-specific rules in any conflict.
- Be concise, actionable, and explicit about assumptions when requirements are ambiguous.
- After implementation, summarize what changed, why, and any assumptions or risks.
- Do not invent APIs/facts; state uncertainty explicitly and use available project context/tools first.
- When requirements are unclear, state assumptions before implementing.
- If a change affects multiple files or architecture boundaries, briefly outline the plan before writing code.

## Engineering principles

- Keep changes minimal, scoped, and architecture-aware, especially in shared modules.
- Optimize for correctness first, then clarity, then performance.
- Default to the simplest solution that satisfies requirements.
- Do not introduce abstractions, helper layers, reusable utilities, or configuration objects until duplication, variation, or complexity clearly justifies them.
- Prefer local, explicit code over speculative generalization.
- Prefer root-cause fixes over surface-level patches.
- Apply safe improvements proactively; ask only when trade-offs are significant.
- Isolate side effects and keep business logic as pure as practical.
- Prefer pure functions for business rules, parsing, formatting, and data transformations.
- Treat DOM access, network/storage I/O, timers, logging, and framework orchestration as integration boundaries where impurity is expected.
- Keep side effects in thin orchestration layers; keep core decision logic deterministic and testable.
- Follow DRY and SRP pragmatically, not mechanically; prefer duplication over premature abstraction when the abstraction would make the code harder to read or reason about.
- Prefer existing utilities, services, and shared modules before creating new abstractions.
- Do not rewrite or reformat unrelated code while implementing a change.
- Preserve existing structure, naming, and formatting unless modification is required for correctness or the requested change.
- Prefer solutions that minimize diff size and reduce churn in version control when multiple correct implementations exist.

## Readability

- Prefer the clearest correct code over the shortest or cleverest code.
- Prefer descriptive names and straightforward control flow over explanatory comments and clever abstractions.
- Name components, elements, and helpers by role in the feature; prefer domain terms such as `reservationDetail`, `quotaPopover`, or `detailBody` over vague names like `box`, `content`, or `data`.
- Avoid compact syntax when it makes intent harder to understand at a glance.
- Avoid nested ternaries or expressions that require mental unpacking; rewrite them into a few simpler statements when needed.
- If good naming can make a comment unnecessary, improve the naming instead of adding the comment.
- Prefer explicit intermediate variables when they make transformation steps easier to follow.
- Do not split simple feature logic into multiple helpers or layers unless it clearly improves readability, reuse, or testability.
- Write code for the next maintainer.

## Security

- Prevent common web risks (XSS, injection, unsafe deserialization, CSRF gaps).
- Treat client-side validation and escaping as defense-in-depth, not a trust boundary.
- Enforce validation, authorization, and critical business rules on the server side.
- Escape or sanitize user-generated content when bypassing framework-level protections (e.g., dangerouslySetInnerHTML).
- Never hardcode secrets, API keys, or tokens.
- Follow OWASP Top 10 and any project-specific security standards.

## Documentation

- Write code comments in Traditional Chinese (company standard).
- Explain why, not what, in comments.
- Use JSDoc for complex, non-obvious, or exported logic only.

## Testing

- Prefer deterministic and isolated tests.
- Mock only external boundaries, not internal logic.
- Avoid over-mocking that hides integration issues.
- Test behavior, not implementation details.
- For user-triggered async features, cover rapid repeated actions, cancellation behavior, timeout/failure paths, and visible error-state rendering.

# Default Git Hooks Preference

When I work in a repository that uses a `.githooks` directory, remind me to set:

git config core.hooksPath .githooks

Treat repository git hooks as part of the normal workflow.
When helping with commits, assume hooks may run code scanning, formatting, linting, or validation.
Prefer fixing the reported issues instead of bypassing hooks.
If needed, tell me how to verify the setting with:

git config --get core.hooksPath
