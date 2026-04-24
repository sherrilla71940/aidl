---
applyTo: "**/*.{js,jsx,mjs,cjs,ts,tsx,mts}"
---

# JavaScript Standards

## JavaScript

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
- Prefer optional chaining for one-off optional DOM actions (e.g., `document.querySelector('.my-btn')?.click()`).
- Prefer ESM `import`/`export` over `require`/`module.exports` in modern JavaScript/TypeScript code.
- Avoid dynamic code execution (`eval`, `new Function`, and string-based `setTimeout`/`setInterval`); prefer callbacks, JSON parsing, and safe property access.
- Prefer `addEventListener` over inline `on*` handlers, and use listener options (`once`, `passive`, `signal`) intentionally.
- Use `AbortController` to cancel in-flight `fetch` requests and abortable listeners during teardown.
- Use PascalCase for VanillaJS/VanillaTS function names and globals (company standard), and for React component names only; use camelCase for all other identifiers.
- Avoid creating standalone functions for trivial one-liners by default; inline the logic where it's used unless naming it improves readability, testability, or reuse.
- In legacy non-module scripts, wrap runtime code in an IIFE to avoid global pollution.
- Expose symbols on `window` only when required by external callers (views/other scripts).
- Keep `DOMContentLoaded` handlers for bootstrapping only; do not nest all business logic inside them.
- In large legacy single-file scripts, use `#region` / `#endregion` only when they materially improve navigation, for example large groups of types.
- Prefer a small number of substantial regions over many tiny regions.
- Use short Traditional Chinese region names that describe the block's role, such as `API 讀取`, `資料解析`, `畫面渲染`, or `事件綁定`.
- Do not use regions for tiny sections, single trivial helpers, or sections whose purpose is already obvious from the code layout.
- Do not add both a redundant section comment and a region title that say the same thing.
- Do not use regions as a substitute for proper file/module extraction when splitting is practical.

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
