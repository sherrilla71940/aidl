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

## JavaScript / TypeScript

- Prefer `const`; use `let` only when reassignment is required; never use `var`.
- Prefer object/array literals (`{}` / `[]`) over constructors (`new Object()` / `new Array()`).
- Use strict equality (`===`, `!==`) except intentional `== null` checks.
- Prefer `async/await`; do not use `await` inside `forEach`/`filter`/`some`/`every`/`reduce` callbacks because these methods do not await async callbacks as intended. Use `for...of` for sequential async flows, or `Promise.all`/`Promise.allSettled` over an array of promises (typically from `map`) for parallel async work.
- For user-triggered async flows such as submit, filter, search, or tab changes, cancel prior in-flight work when a newer action supersedes it; do not rely only on ignoring stale responses.
- Replace repeated literals with named constants when the constant improves readability or helps prevent drift.
- Use named constants for literals that are reused, domain-significant, or likely to change.
- Use `UPPER_SNAKE_CASE` for true module-level constants; use `camelCase` for narrow-scope local constants.
- Prefer immutable updates and avoid mutating function parameters, React state, or props; allow local mutation only when safe, clear, or improves performance/API alignment.
- Prefer a typed options object when parameter lists are hard to read, easy to mix up, or likely to grow; destructure directly in the signature and provide defaults when relevant.
- Prefer ES6+ and declarative array methods for synchronous data transformations when feasible.
- Prefer returning objects for multiple outputs when named fields improve readability; use tuples when positional semantics are intentional and clear.
- Prefer template literals over string concatenation.
- Use braces for `if`/`else`/loop bodies, even for single-line blocks.
- Use descriptive variable names.
- Prefer optional chaining for one-off optional DOM actions (e.g., document.querySelector('.my-btn')?.click()).
- Prefer ESM `import`/`export` over `require`/`module.exports` in modern JavaScript/TypeScript code.
- Avoid dynamic code execution (`eval`, `new Function`, and string-based `setTimeout`/`setInterval`); prefer callbacks, JSON parsing, and safe property access.
- Prefer `addEventListener` over inline `on*` handlers, and use listener options (`once`, `passive`, `signal`) intentionally.
- Use `AbortController` to cancel in-flight `fetch` requests and abortable listeners during teardown.
- Use PascalCase for VanillaJS/VanillaTS function names and globals (company standard), and for React component names only; use camelCase for all other identifiers.
- Avoid creating standalone functions for trivial one-liners by default; inline the logic where it’s used unless naming it improves readability, testability, or reuse.
- In legacy non-module scripts, wrap runtime code in an IIFE to avoid global pollution.
- Expose symbols on `window` only when required by external callers (views/other scripts).
- Keep `DOMContentLoaded` handlers for bootstrapping only; do not nest all business logic inside them.
- In large legacy single-file JavaScript/TypeScript scripts, use `#region` / `#endregion` only when they materially improve navigation, for example large groups of TypeScript types.
- Prefer a small number of substantial regions over many tiny regions.
- Use short Traditional Chinese region names that describe the block’s role, such as `API 讀取`, `資料解析`, `畫面渲染`, or `事件綁定`.
- Do not use regions for tiny sections, single trivial helpers, or sections whose purpose is already obvious from the code layout.
- Do not add both a redundant section comment and a region title that say the same thing.
- Do not use regions as a substitute for proper file/module extraction when splitting is practical.

## TypeScript-specific

- For new TypeScript projects, default to `"strict": true` (including `strictNullChecks`). For legacy projects, keep existing settings unless asked to harden.
- For non-exported local functions, omit explicit return types when TypeScript infers a simple and unambiguous type such as `string`, `number`, `boolean`, `void`, or a plainly inferred object or array shape.
- Keep explicit return types only for exported APIs, module boundaries, recursive functions, overload-like behavior, complex unions or generics, or places where the annotation materially improves readability. Example: `const tags = ['sale', 'new']` already infers `string[]`, and `function getTags() { return ['sale', 'new']; }` usually does not need `: string[]`.
- Require explicit types for exported/public APIs, module boundaries, callback contracts, complex generics, and places where inference is unclear or misleading.
- At external boundaries (`fetch`, storage, `postMessage`, env, JSON), parse as `unknown` and narrow before use.
- Normalize external date/time values into a single canonical format before dedupe, sort, comparison, or grouping logic.
- Avoid `any` by default; allow only for temporary migration, legacy interop, or third-party typing gaps with a short justification.
- Avoid unnecessary DOM query generics and type assertions; use them when they materially improve safety or readability, especially for element-specific properties or methods. Prefer null checks and `instanceof` narrowing when needed.
- Prefer narrowing (`typeof`, `in`, `instanceof`, discriminants) over assertions.
- Avoid non-null assertions (`!`) unless no safer path exists.
- Use discriminated unions for real variants, and use exhaustive `never` checks for domain/state-machine flows.
- Prefer union parameters over overloads when signatures differ only by argument type.
- For callbacks, do not mark parameters optional unless they are truly omitted at call time; use `() => void` when callback returns are ignored.
- Keep generics minimal and inference-friendly; avoid type parameters that do not relate multiple values.
- Prefer `interface` for extendable object shapes; use `type` for unions, mapped types, conditional types, and aliases.
- Use PascalCase for types/interfaces and `readonly` when mutation is not intended.
- Use primitive types (`string`, `number`, `boolean`, `symbol`, `object`) instead of boxed types, and avoid global `Function`.

## React

- Keep renders pure.
- Use effects only for external synchronization and always clean up subscriptions/listeners.
- Keep hook order stable: hooks first, then helpers, then JSX.
- Use stable keys for lists.
- Prefer composition over prop drilling.
- Avoid deriving state that can be computed from props.
- Avoid premature memoization; when memoization is applied, use `useMemo` or `useCallback` only when it meaningfully improves performance. Do not memoize trivial components, cheap calculations, or stable props/handlers unnecessarily.
- Split components when complexity harms readability.
- Use ternary only for simple inline JSX with short branches. If a ternary is nested, spans multiple lines of JSX, or has more than one condition, refactor to if/else (or early returns).

## HTML / CSS / SCSS

- Follow semantic HTML and accessibility guidance (WCAG 2.1 AA).
- Consider ARIA roles, keyboard focus management, and semantic landmarks.
- Ensure keyboard parity for custom interactive elements: they must be focusable and keyboard-operable (`Enter`/`Space`).
- Avoid positive `tabindex` values (`tabindex > 0`).
- Never remove focus indicators; prefer styling with `:focus-visible`.
- Use explicit form labeling by default (`<label for>` with a unique control `id`).
- Use the project's established styling approach consistently. If no clear local convention exists, default to BEM-style (`block__element--modifier-value`), class-based selectors. Do not mix naming systems arbitrarily within the same feature.
- Use BEM-style classes for component structure and styling when no stronger local convention exists.
- Prefer `data-*` attributes for JavaScript hooks and behavior targeting so styling and behavior concerns stay distinct.
- Use `id` only when required for accessibility relationships, form associations, browser-native linking, testing constraints, or legacy integration.
- Avoid encoding element types into `id` values such as `div_`, `btn_`, or `txt_` unless the existing file or integration already depends on that convention.
- Use relative units by default.
- Use `rem` for typography and spacing scales.
- Use unitless `line-height` for text.
- Use `%` for fluid widths; use `fr`/`minmax()` for grid tracks; use `clamp()` for bounded fluid sizing.
- Use `ch` for readable text measure.
- Use `px` only for fine-detail edges (for example borders/shadows).
- Use `em` only when sizing should scale with the component's own font size.
- Keep CSS/SCSS nesting shallow (target max 2-3 levels); nest only for states, modifiers, and pseudo-selectors, not deep DOM paths.
- In SCSS, prefer `&` for BEM modifiers, states, and pseudo-selectors; do not use it to build deep descendant chains or increase selector specificity.
- Keep selector specificity low (prefer class-based selectors; avoid escalating with IDs/deep selectors).
- Avoid `!important` unless there is no safe alternative.
- Do not rely on color alone to convey meaning; pair color with text/icon/state and maintain accessible contrast.
- Use `@layer` to control override order when integrating third-party/framework CSS.
- Respect `prefers-reduced-motion`.
- Design responsive layouts using flexbox for content-driven flow, grid for layout-driven page/section structure, and media queries for breakpoint adjustments.

## UX behavior

- When opening a modal dialog, move focus into it, trap focus within it while open, prevent interaction with background content, and restore focus to the triggering element on close.
- When opening a non-modal drawer or interactive popover, manage focus intentionally and restore focus to the triggering element on close when it improves keyboard and screen-reader usability.
- After major route or view changes, move focus to the main heading or primary content landmark when it improves keyboard and screen-reader usability.
- For informational popovers, prefer `Escape` and outside-click close unless there is a clear reason to require explicit dismissal.
- For modal dialogs, prefer `Escape` and an explicit close control; do not rely on outside-click close unless accidental dismissal is acceptable for the workflow.
- Announce important async state changes such as loading, success, and failure through appropriate live regions when the change is not otherwise obvious.
- For destructive or irreversible actions, require explicit confirmation or provide a reliable undo path.
- For dialogs or overlays with scrollable content, reset scroll position on reopen unless preserving prior position is intentionally part of the workflow.
- For scrollable tables or panels, prefer a dedicated inner wrapper to own scrolling instead of making the entire dialog, card, or page section scroll when only the content area needs it.
- Keep table controls (for example filter/search bars, length selectors, summaries, and pagination) outside the table's scrolling container so they remain stationary while only the table content scrolls.
- When using sticky table headers, keep the header and scroll container in the same scrolling context, and give sticky headers an explicit background and stacking order so content does not bleed through while scrolling.
- Prefer `border-collapse: separate` when sticky table headers need reliable borders or shadows; collapsed borders often render poorly with sticky positioning.
- When a table can overflow horizontally, keep column labels visible, provide a clear horizontal scroll container, and avoid layouts where critical context disappears off-screen without indication.
- For forms with async submit actions, make the submitting state explicit and prevent accidental duplicate submission while the request is in flight.
- Show validation feedback near the relevant field, avoid premature error states before user interaction, and use form-level summaries for submit-level or multi-field failures when helpful.
- Avoid disabling actions without explanation; if an action is unavailable, explain why and how to enable it when possible.
- Preserve user input on recoverable validation or save errors unless clearing the form is intentionally part of the workflow.
- Avoid hover-only interactions for important functionality; provide click and touch-accessible alternatives and keep touch targets comfortably usable.
- Warn users before discarding meaningful unsaved changes.
- Empty states should explain why content is absent and, when useful, suggest the next action instead of showing a blank area alone.
- Error states should be visible near the affected area and actionable when possible; avoid relying only on console output or generic alerts.

## Performance and lifecycle

- When task order does not matter, run independent async work in parallel with `Promise.all`/`Promise.allSettled`.
- Use bounded concurrency instead of unbounded fan-out when the number of parallel async operations can grow beyond a small fixed set.
- Ensure repeatable initialization is idempotent, and clean up listeners/requests with remove/abort on teardown.
- Prefer feature detection over browser sniffing (`"feature" in obj`, `CSS.supports`, `@supports`).
- Lazy-load non-critical resources (e.g., `loading="lazy"` for off-screen images/iframes) and defer/split non-critical JavaScript (`type="module"`, dynamic `import()`).
- Use loading indicators intentionally; prefer skeletons when the layout is known and the wait is noticeable, and avoid unnecessary layout shift between loading and loaded states.
- Prevent avoidable cumulative layout shift (CLS): reserve space for async content, media, and dynamically inserted UI when their final dimensions are reasonably predictable, and when dialogs or overlays lock background scroll, preserve scrollbar space with `scrollbar-gutter: stable` or an equivalent fallback so the page width does not jump.
- Use debouncing/throttling for high-frequency events.
- For interactive screens, make loading, empty, success, and error states explicit in the UI.
- Prefer existing project patterns, shared components, and established copy for UI states and feedback before introducing new variants.

## Validation and error handling

- Use `Number.isFinite` for numeric validation to avoid coercion pitfalls (`isFinite('123') === true`), accidental acceptance of `NaN`/`Infinity`, and non-number inputs passing checks.
- Catch errors at external boundaries only; do not blanket-wrap all functions.
- Handle edge cases and potential failure points explicitly; do not swallow errors silently.
- Console logging is diagnostic only; when an operation affects the visible page, provide an appropriate user-facing error or fallback state.

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
