---
applyTo: "**/*.{html,cshtml,ts,tsx,js,jsx,mts}"
---

# Accessibility Standards

## Accessibility

- Follow semantic HTML and accessibility guidance (WCAG 2.1 AA).
- Consider ARIA roles, keyboard focus management, and semantic landmarks.
- Ensure keyboard parity for custom interactive elements: they must be focusable and keyboard-operable (`Enter`/`Space`).
- Avoid positive `tabindex` values (`tabindex > 0`).
- Never remove focus indicators; prefer styling with `:focus-visible`.
- Use explicit form labeling by default (`<label for>` with a unique control `id`).
