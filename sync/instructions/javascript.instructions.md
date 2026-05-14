---
applyTo: "**/*.{js,jsx,mjs,cjs,ts,tsx,mts}"
---

# JavaScript Standards

## Scope

Applies to JavaScript and TypeScript files. For TypeScript-specific guidelines, see `typescript.instructions.md`. For React-specific guidelines, see `react.instructions.md`.

## Declarations and Naming

- Prefer `const`; use `let` only when reassignment is required; never use `var`.
- Use `camelCase` for most variables and constants.
- Use `UPPER_SNAKE_CASE` only for true constants whose value is fixed, shared, and configuration-like, such as module-level limits, event names, storage keys, breakpoints, or environment-derived constants.

## General JavaScript

- Prefer object/array literals (`{}` / `[]`) over constructors (`new Object()` / `new Array()`).
- Use strict equality (`===`, `!==`) except intentional `== null` checks.
- Prefer immutable updates and avoid mutating function parameters; allow local mutation only when safe, clear, or improves performance/API alignment.
- Use a typed options object when a function takes 3+ parameters, has multiple optional/boolean parameters, or the argument order is easy to mix up; destructure directly in the signature and provide defaults when relevant.
- Prefer ES6+ and declarative array methods for synchronous data transformations when feasible. Use loops when control flow requires it, such as `await` in sequential work.
- Prefer returning objects for multiple outputs when named fields improve readability; use tuples when positional semantics are intentional and clear.
- Use template literals over string concatenation.
- Use braces for `if`/`else`/loop bodies, even for single-line blocks.
- Use descriptive variable names. Descriptive names are 90% of documentation.
- Prefer ESM `import`/`export` over `require`/`module.exports` in modern JavaScript/TypeScript code if the project supports it.
- Avoid dynamic code execution (`eval`, `new Function`, and string-based `setTimeout`/`setInterval`); prefer callbacks, JSON parsing, and safe property access.
- Avoid creating standalone functions for trivial one-liners by default; inline the logic where it is used unless naming it improves readability, testability, or reuse.
- Prefer existing project patterns, shared components, and established copy for UI states and feedback before introducing new variants.

## DOM and Browser APIs

- Use optional chaining only when a missing DOM element is acceptable for an optional one-off action. For required elements, validate once near initialization and throw a clear error if missing. Store the element in a variable when it is used multiple times or the action is complex.
- Prefer `addEventListener` over inline `on*` handlers (for vanilla JavaScript), and use listener options (`once`, `passive`, `signal`) intentionally.
- In legacy non-module scripts, wrap private runtime code in an IIFE. When external callers need access, attach a small, explicit API to one existing project global or `window`; avoid leaking unrelated globals.
- Keep `DOMContentLoaded` handlers thin: call initialization functions from them, but keep business logic, rendering, data parsing, and event handlers in named functions outside the callback.
- Prefer `data-*` attributes for JavaScript DOM targeting. Use `id` only for unique document-level targets, accessibility relationships, browser-native linking, testing constraints, or legacy integration. Keep class names reserved for styling hooks, and avoid encoding element types in attribute values (for example: `data-action="submit"` instead of `data-type="button"`).

## Asynchronous code and promises
- Prefer `async/await`.
- Do not use `await` inside `forEach`/`filter`/`some`/`every`/`reduce` callbacks because these methods do not await async callbacks as intended.
- Use `for...of` for sequential async flows, or `Promise.all`/`Promise.allSettled` over an array of promises (typically from `map`) for parallel async work.
- For user-triggered async flows such as submit, filter, search, or tab changes, cancel prior in-flight work when a newer action supersedes it; do not rely only on ignoring stale responses.
- Run independent async work in parallel with `Promise.all`/`Promise.allSettled` when task order does not matter. If the work comes from a large or user-controlled list, process items in small batches or use a concurrency limit instead of one unbounded `Promise.all(items.map(...))`.
- Use `AbortController` when async work or event listeners can outlive their initiating UI state, component, request, or page section; cancel on teardown or when a newer user action supersedes older work.

## Performance and lifecycle

- When initialization can run more than once, keep it idempotent so setup does not duplicate event listeners, timers, DOM nodes, or requests.
- Lazy-load non-critical resources (e.g., `loading="lazy"` for off-screen images/iframes).
- Defer/split non-critical JavaScript (`type="module"`, dynamic `import()`).
- Use `requestAnimationFrame` for visual updates in scroll/resize handlers and complex animations.
- Use debounce for high-frequency events where only the final value matters, such as search input, filtering, or resize recalculation.
- Use throttle for continuous feedback that should update at a steady rate, such as scroll position, drag movement, or progress indicators.

## Validation and error handling

- Use `Number.isFinite` for numeric validation to avoid coercion pitfalls (`isFinite('123') === true`), accidental acceptance of `NaN`/`Infinity`, and non-number inputs passing checks.
- Catch errors at external boundaries only; do not blanket-wrap all functions.
- Handle edge cases and potential failure points explicitly; do not swallow errors silently.
- Console logging is diagnostic only; when an operation affects the visible page, provide an appropriate user-facing error or fallback state.
