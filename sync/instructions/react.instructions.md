---
applyTo: "**/*.{tsx,jsx}"
---

# React Standards

## React

- Keep renders pure.
- Use function components and hooks for new React code; keep class components only when maintaining existing legacy code.
- Use effects only for external synchronization and always clean up subscriptions/listeners.
- Keep hook order stable: hooks first, then helpers, then JSX.
- Use stable keys for lists.
- Avoid array indexes as React keys unless the list is static and cannot be reordered, inserted into, or filtered.
- Prefer composition over prop drilling.
- Avoid deriving state that can be computed from props.
- Avoid premature memoization; when memoization is applied, use `useMemo` or `useCallback` only when it meaningfully improves performance. Do not memoize trivial components, cheap calculations, or stable props/handlers unnecessarily.
- Split components when complexity harms readability.
- Use ternary only for simple inline JSX with short branches. If a ternary is nested, spans multiple lines of JSX, or has more than one condition, refactor to if/else (or early returns).
