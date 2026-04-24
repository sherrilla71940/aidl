---
applyTo: "**/*.{html,cshtml,css,scss,sass}"
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
