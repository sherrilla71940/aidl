---
applyTo: "**/*.{html,cshtml,css,scss,sass,ts,tsx,js,jsx,mts}"
---

# UX Guidelines

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
