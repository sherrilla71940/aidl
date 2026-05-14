---
name: frontend-uiux-patterns
description: 'Frontend UI/UX pattern guidance for implementing or reviewing forms, validation feedback, data tables, sticky headers, responsive overflow, modals, popovers, drawers, destructive actions, empty states, error states, loading states, and async UI behavior in web UI.'
---

# Frontend UI/UX Patterns

Use this skill when a task needs detailed interaction guidance beyond the always-on UI and accessibility guardrails. Prefer existing project components, design-system behavior, and established copy before introducing new patterns.

## When to Use This Skill

Use this skill for detailed guidance on how to build:
- Forms
- Data tables
- Modals, dialogs, popovers, drawers, or other overlays
- Loading states and async UI patterns

## Forms

- For async submit actions, make the submitting state explicit and prevent accidental duplicate submission while the request is in flight.
- Show validation feedback near the relevant field, avoid premature error states before user interaction, and use form-level summaries for submit-level or multi-field failures when helpful.
- Preserve user input on recoverable validation or save errors unless clearing the form is intentionally part of the workflow.
- Avoid disabling actions without explanation; if an action is unavailable, explain why and how to enable it when possible.
- Warn users before discarding meaningful unsaved changes.

## Data Tables

- Make tables responsive and usable on small screens by allowing horizontal scrolling, collapsing less critical columns, or reflowing into a more readable format.
- For tall tables, wrap table content in a vertical scroll container when needed and keep headers visible while users scroll so row data remains understandable.
- When using sticky table headers, keep the header and scroll container in the same scrolling context, and give sticky headers an explicit background and stacking order so content does not bleed through while scrolling.
- When sticky table headers need reliable borders, shadows, or layered backgrounds, prefer `border-collapse: separate` with `border-spacing: 0`; collapsed borders can render inconsistently with sticky positioning.

## Modals, Dialogs, And Overlays

- For modal dialogs, move focus into the dialog, trap focus while open, prevent background interaction, and restore focus to the triggering element on close.
- For modal dialogs, prefer `Escape` and an explicit close control; do not rely on outside-click close unless accidental dismissal is acceptable for the workflow.
- For informational popovers, prefer `Escape` and outside-click close unless there is a clear reason to require explicit dismissal.
- For non-modal drawers and interactive popovers, manage focus intentionally and restore focus to the triggering element on close when it improves keyboard and screen-reader usability.
- For dialogs or overlays with scrollable content, reset scroll position on reopen unless preserving prior position is intentionally part of the workflow.
- When dialogs or overlays lock background scroll, preserve scrollbar space with `scrollbar-gutter: stable` or an equivalent fallback to avoid layout shifts.

## Async UI States
- When async work affects visible page state, show a loading state and clear it only after the relevant work completes or fails.
- Prefer existing project patterns, shared components, and established copy before introducing new loading-state variants.
- If none exist, use skeletons when the final layout is known and the wait is noticeable.
- Avoid layout shift between loading and loaded states.
