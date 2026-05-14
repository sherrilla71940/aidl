# Copilot Asset Manager Interview Prep

Reviewed on: 2026-05-14

## Core Positioning

I built `copilot-asset-manager` first as the foundation for a version-controlled AI workflow system in VS Code. The project lets me keep Copilot instructions, prompts, skills, hooks, and agents in a git-tracked source of truth, then sync them into VS Code user-level customization storage. That gave me versioning, reviewability, restoration across machines, and a cleaner alternative to relying only on VS Code Settings Sync for AI workflow assets.

Interview-ready version:

> I built a version-controlled Copilot workflow library for frontend work. It separates always-on coding standards from deeper specialist workflows for React, accessibility, performance investigation, UI patterns, and browser testing. The goal was to make AI assistance more reliable and evidence-driven instead of just prompt-based.

## Why This Is Worth Mentioning

- Shows initiative: I built the tooling layer before building out the workflow library.
- Shows frontend maturity: the workflow covers React standards, accessibility, performance diagnosis, UI/UX patterns, and browser-based testing.
- Shows engineering process: AI assistance is treated as versioned infrastructure, not one-off chat prompts.
- Shows maintainability thinking: instructions stay lightweight while deeper workflows live in specialist skills and agents.
- Shows portability: settings and workflow assets can be restored, reviewed, and synced across VS Code environments.

## Stronger Interview Explanation

I noticed that AI coding workflows can become scattered across local settings, ad hoc prompts, and undocumented habits. So I built `copilot-asset-manager` as a TypeScript CLI to manage Copilot customization assets as files. The tool syncs a tracked `sync/` directory into VS Code and Copilot user storage, which lets me keep frontend workflow guidance under version control.

On top of that, I created a frontend-focused workflow library: always-on standards for JavaScript, TypeScript, React, styling, and accessibility, plus deeper specialist agents and skills for performance investigation, accessibility review, frontend UI/UX patterns, browser collaboration testing, and resume evidence analysis. The result is an AI-assisted workflow that is more repeatable, auditable, and evidence-driven.

## Interview Follow-Up Angles

- Why build this instead of only using VS Code Settings Sync?
- How does `sync/` act as the source of truth?
- How do prompts, instructions, skills, and agents differ in the workflow?
- How does this improve frontend quality around accessibility and performance?
- How would this scale to a team workflow with reviewable AI customizations?
