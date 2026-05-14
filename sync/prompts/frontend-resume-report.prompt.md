---
description: 'Analyze the current project for frontend resume evidence and write English/zh-TW reports to the job-hunting archive.'
name: 'Frontend Resume Report'
argument-hint: 'optional project name, target role, or job description'
agent: 'Frontend Resume Project Analyst'
---

# Frontend Resume Report

Use the `Frontend Resume Project Analyst` agent to analyze the current project for frontend developer resume material.

Treat the current workspace or active project as the project to analyze unless the user provides a different folder, repository, project name, target role, or job description in the prompt arguments.

Produce the agent's standard bilingual project reports and write them to the configured job-hunting archive:

`C:\Users\Aaron Sherrill\Documents\2026 work\copilot-asset-manager\local\archives\job-hunting\<project-name>`

The report must remain frontend-first while including backend context that helps explain frontend architecture, API boundaries, auth/role constraints, deployment, or full-stack credibility. Preserve the product's own project name for the folder, including Traditional Chinese names such as `桃園GIS`, unless path-hostile characters must be normalized.

If the job-hunting archive is not writable from the current workspace, stop and explain that `copilot-asset-manager` should be opened as an additional workspace folder. Do not silently write reports into the analyzed project.

After writing the reports, respond with a concise summary of the two report paths, the top resume-worthy frontend findings, and any confirmation questions needed before the user uses stronger resume claims.
