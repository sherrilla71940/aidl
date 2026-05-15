---
description: 'Synthesize archived frontend project reports into English/zh-TW career portfolio materials.'
name: 'Career Portfolio Synthesis'
argument-hint: 'optional target role, job description, company type, market, or project folders'
agent: 'Career Portfolio Synthesizer'
---

# Career Portfolio Synthesis

Use the `Career Portfolio Synthesizer` agent to turn archived frontend project resume reports into a bilingual career portfolio strategy.

Treat the job-hunting archive as the source of truth unless the user provides a different archive folder or specific project folders in the prompt arguments:

`C:\Users\Aaron Sherrill\Documents\2026 work\copilot-asset-manager\local\archives\job-hunting`

Default to all project folders that contain `frontend-resume-report.en.md` and/or `frontend-resume-report.zh-TW.md`. If the user provides a target role, job description, company type, location market, resume constraint, or selected project list, use those arguments to prioritize the synthesis.

Write the bilingual portfolio reports to:

`C:\Users\Aaron Sherrill\Documents\2026 work\copilot-asset-manager\local\archives\job-hunting\career-portfolio`

Create or update these files:

- `career-portfolio-synthesis.en.md`
- `career-portfolio-synthesis.zh-TW.md`

The synthesis must produce immediate job-search material and deeper supporting analysis:

- `Use This Now` summary for quick resume and interview use
- overall frontend career positioning
- project ranking and recommendation for resume, portfolio, interview, or background use
- master resume bullet bank with contribution confidence labels
- skill matrix across projects
- business translation across project themes
- interview story index
- job-description match analysis when a role or JD is provided
- bilingual pitch and glossary for natural English and Traditional Chinese phrasing
- open questions, missing metrics, and next actions

Use existing project reports as evidence. Do not re-analyze original source repositories unless a report is missing, contradictory, clearly stale, or the user explicitly requests verification. Do not invent ownership, metrics, client names, production scale, business outcomes, or backend responsibilities.

If the job-hunting archive is not writable from the current workspace, stop and explain that `copilot-asset-manager` should be opened as an additional workspace folder. Do not silently write reports into an unrelated repository.

After writing the reports, respond with a concise summary of the two report paths, the strongest career positioning, the top project themes, and any confirmation questions needed before the user applies with stronger claims.
