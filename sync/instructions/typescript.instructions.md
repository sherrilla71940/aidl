---
applyTo: "**/*.{ts,tsx,mts}"
---

# TypeScript Guidelines

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
