---
description: "Stage emitted .js files for currently staged .ts files, including tsconfig outDir builds"
name: "Stage Corresponding JS"
argument-hint: "optional path filter, e.g. Scripts/FertilizerStation"
agent: "agent"
---
Stage the emitted `.js` files for currently staged `.ts` files.

Requirements:
- Work from the current git repository root.
- Read staged files from `git diff --name-only --cached`.
- Keep only `.ts` files and exclude `.d.ts`.
- If an optional path filter is provided by the user, only process staged `.ts` paths that include that filter.
- For each matched `.ts` file, resolve the emitted `.js` path using this priority order:
  1. Find the nearest ancestor `tsconfig.json` for that `.ts` file.
  2. If the owning `tsconfig.json` has `compilerOptions.outDir`, prefer an emitted path under that `outDir`.
  3. Build the emitted relative path using this fallback order:
     - If `compilerOptions.rootDir` exists and the `.ts` file is inside it, preserve the path relative to `rootDir`.
     - Otherwise, if the `.ts` file is under a folder that is the parent of `outDir`, preserve the path relative to that parent folder. Example: source `Scripts/Foo/Bar.ts` and `outDir` `Scripts/CompileTS` maps to `Scripts/CompileTS/Foo/Bar.js`.
     - Otherwise, preserve the path relative to the `tsconfig.json` directory.
  4. Also compute the same-folder fallback by replacing `.ts` with `.js`.
  5. Prefer the first candidate `.js` path that actually exists on disk.
  6. If no candidate exists, report the preferred emitted path in `Missing JS`.
- Stage only existing mapped `.js` files with `git add -- <path>`.
- Do not stage any other files.
- Do not commit.
- Use safe shell quoting for paths containing spaces.

Output format:
1. `Processed TS`: total number of matched staged `.ts` files.
2. `Staged JS`: list of `.js` files successfully staged.
3. `Missing JS`: list of mapped `.js` files that do not exist.
4. `No-op reason`: explain if nothing was staged.
