---
applyTo: "**/*.{html,css,scss,sass}"
---

# HTML / CSS / SCSS Standards

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
