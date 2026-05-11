# Frontend Resume Report: 桃園市下水道雲端智慧管理系統

Reviewed on: 2026-05-11

## 1. Project Snapshot

- Name or working title: 桃園市下水道雲端智慧管理系統
- Product category: Municipal infrastructure GIS and sewer/water operations management web system
- One-sentence product description: A role-based ASP.NET MVC web application for managing Taoyuan sewer, rainwater, inspection, construction, water-fee, permit, repair, and fertilizer-station workflows through GIS maps, dashboards, data imports, and operational forms.
- Confirmed users or likely audience: Municipal staff, sewer/rainwater administrators, BOT/contractor users, supervisors, construction contractors, water plant/slurry administrators, inspection contractors, district office users, and public-facing applicants.
- Primary problem solved: Centralizes geospatial infrastructure data and operational workflows that would otherwise require separate map tools, spreadsheets, paper/PDF forms, and manual status tracking.

## 2. Evidence Reviewed

- Key files and folders inspected: `TaoyuanSewer2/Views`, `TaoyuanSewer2/Scripts`, `TaoyuanSewer2/Content/Styles`, `TaoyuanSewer2/Controllers`, `TaoyuanSewer2/App_Start`, `TaoyuanSewer2/packages.config`, `TaoyuanSewer2/TaoyuanSewer2.csproj`, `TaoyuanSewer2/Web.config`, and root/project package metadata.
- Representative files reviewed: shared layouts, `Views/Map/Index.cshtml`, `Views/Home/QuickNavigation.cshtml`, inspection manhole map/statistics scripts, water-fee management scripts, switching-valve document upload scripts, fertilizer-station scheduling scripts, route/API/auth configuration, and map/auth controllers.
- Searches used: project metadata discovery, frontend stack search, GIS/map/chart/DataTable search, role/auth search, upload/download/Excel/PDF workflow search, TypeScript compiled-output search, and backend API/controller search.
- Areas not deeply inspected: full controller implementation details, database schema/Entity Framework model internals, every generated JavaScript file under `Scripts/CompileTS`, every CSS rule, and production deployment behavior.
- Security handling note: configuration files contained sensitive values; this report deliberately records only non-sensitive architecture facts and does not reproduce secrets, tokens, API keys, connection strings, or credentials.

## 3. Stack and Configuration

- Frontend framework/model: ASP.NET MVC Razor server-rendered views with page-specific TypeScript/JavaScript modules and compiled JavaScript under `Scripts/CompileTS`.
- Language and build tooling: TypeScript is present in root and project `package.json`; source TypeScript files live under `TaoyuanSewer2/Scripts/**` and compiled JavaScript is checked into `TaoyuanSewer2/Scripts/CompileTS/**`.
- UI libraries and assets: jQuery 3.7.1, jQuery UI, Bootstrap, DataTables, FooTable, Select2, AlertifyJS, jsPanel, ViewerJS, Air Datepicker, Font Awesome, Chart.js, Google Charts, ExcelParser/xlsx, JSZip/FileSaver, Google Maps, GMapEX, ArcGIS link helpers, Turf, and custom CSS under `Content/Styles`.
- Layout and design structure: shared Razor layouts define global asset loading, product branding, responsive viewport settings, common services, analytics, role-aware navigation, and `SitePath` for application-root-relative URLs.
- State and data flow: mostly page-local state in TypeScript modules, jQuery event handlers, `fetch` calls to MVC/Web API endpoints, form posts, and global utility objects such as `Common`, `ExcelParser`, and map-layer helpers.
- Routing and API boundaries: MVC default route points to `Map/Index`; Web API route template is `api/{controller}/{id}`; page scripts call both MVC controller routes and Web API endpoints using `SitePath`.
- Backend context relevant to frontend work: .NET Framework 4.8, ASP.NET MVC 5/Web API, Razor, Entity Framework 6, ASP.NET Identity/Owin cookie auth, role-based authorization attributes, repository-style data access, IIS-oriented web configuration, static-content caching, Application Insights, custom security headers, Excel/PDF/document-generation libraries, and external integrations for maps, SMS/mail, LINE Bot, and municipal data services.
- Deployment/runtime clues: IIS/IIS Express configuration, Web.Release/Web.Debug transforms, `.gitlab-ci.yml` at repo root, static content cache headers, CSP/security headers, Application Insights modules, and MSBuild-style `.csproj` project structure.
- Tests and quality gates: no dedicated frontend test runner, E2E test suite, Storybook, or accessibility test setup was found in the sampled files.

## 4. Frontend Architecture Summary

The application uses a server-rendered MVC architecture. Razor views compose layout, navigation, partial panels, page markup, and server-side role checks, while TypeScript modules add client-side interactivity per workflow. This is not a React/Vue SPA; it is a large multi-page operational application with rich JavaScript behavior layered on top of MVC pages.

The default route opens the GIS map. `Views/Map/Index.cshtml` is the main map shell and loads many compiled modules for map layers, legends, toolbox controls, facility details, statistics panels, sewage/rain layers, building connection layers, reference layers, and cadastral/map services. The view also renders multiple statistics partials based on user roles, which makes the GIS page both a map and an operational dashboard.

Data flows from page controls to TypeScript event handlers, then to backend endpoints through `fetch`, form posts, or helper utilities. Examples include inspection result queries, sewer-layer lookup, water-fee detail search/import/export, fertilizer booking mutations, and document uploads. UI state is typically held in page-level variables such as current search results, selected map layer state, booking lists, chart instances, and upload validation results.

The strongest architectural pattern is pragmatic modularization by domain: `Scripts/InspectionManhole`, `Scripts/WaterFeeMgt`, `Scripts/FertilizerStation`, `Scripts/SwitchingValve`, `Scripts/Map`, and many other domain folders mirror views/controllers. This makes feature ownership discoverable in a large legacy MVC codebase, although the architecture still carries typical trade-offs: global utilities, inline layout dependencies, and page-level state instead of a centralized typed client/data layer.

## 5. Backend Context Relevant to Frontend

- API and rendering boundaries: Razor views render initial pages and role-specific navigation; JavaScript calls MVC/Web API endpoints for dynamic data, imports, uploads, exports, and map-layer operations.
- Auth and roles: ASP.NET Identity/Owin cookie authentication is configured; shared layouts and controllers use role checks such as `SystemAdmin`, `Sewage`, `RainWater`, `BOT`, `Supervisor`, `PCM`, `Constructors`, `SlurryAdmin`, `WaterPlantAdmin`, and others to conditionally show navigation or guard routes.
- Permission behavior affecting UI: custom `AuthorizePlus` and `AuthorizePlusApi` attributes enforce login and required password-change behavior; API unauthorized responses return JSON messages that frontend flows can surface.
- Data/integration constraints shaping UI: GIS layers depend on map APIs and geospatial helpers; inspection and water-fee pages rely on backend query endpoints; upload pages send `FormData`; Excel import/export uses client-side parsing plus server-side validation; PDF/document flows depend on server-generated files; fertilizer booking enforces backend-backed special dates, daily limits, license/plate eligibility, and ban windows.
- Confirmed backend facts: .NET Framework 4.8, ASP.NET MVC/Web API packages, Entity Framework 6, ASP.NET Identity/Owin, Web API routing, MVC routing to `Map/Index`, and security header/static content configuration are present.
- Inferred backend facts: SQL Server is likely the main persistence layer because Entity Framework SQL Server packages and connection string structure are present, but production database topology should not be claimed without confirmation.
- Do not claim without confirmation: personal ownership of backend APIs, production deployment responsibility, database design responsibility, official user counts, availability/SLA, or security remediation ownership.

## 6. Product and User Story

This project appears to serve city sewer and water operations teams who need to inspect assets, manage construction and repair workflows, track sewer/rainwater infrastructure, review applications, handle water-fee records, upload official documents, and schedule fertilizer/slurry station operations.

The frontend matters because many workflows are high-friction operational tasks: map-based facility lookup, role-specific dashboards, large forms, file uploads, Excel validation, chart-based inspection summaries, and date/eligibility-based scheduling. A good frontend reduces the need for users to switch between GIS software, spreadsheets, paper documents, email, and manual status trackers.

The project also has mobile/app-facing clues under `Views/App` and `Scripts/CompileTS/App`, plus responsive viewport settings and mobile-specific behavior in inspection map scripts. This suggests the system supports both office workflows and field/operational workflows, but actual mobile usage should be confirmed.

## 7. Impressive Frontend Evidence

- GIS-first operational dashboard: `Views/Map/Index.cshtml` loads Google Maps, GMapEX, ArcGIS link helpers, SewerEX, map-layer modules, map legend/toolbox/facility detail modules, and role-specific statistics partials. This supports a resume claim around integrating geospatial infrastructure layers into an operational dashboard.
- Layered map interactions: `Scripts/InspectionManhole/InspectionManholeMap.ts` manages sewer/BOT sewer layer toggles, catch-basin/connection-pipe layers, bounds-based BOT layers, marker/polyline drawing callbacks, facility search by pipe/manhole/connection-pipe/catch-basin number, mobile search-panel behavior, and inspection data overlays.
- Inspection analytics: `Scripts/InspectionManhole/InspectionManholeStatistics.ts` loads Google Charts, queries filtered inspection results, splits internal/external manhole inspection records, computes normal/abnormal counts, renders chart/table/map views, and redraws visualizations when tabs/maps change.
- Excel import/export and validation: `Scripts/WaterFeeMgt/WaterFeeChargeRecordManagement.ts` supports search filters, Excel export, batch import, file validation, error-list export, water-number checks, and create/edit flows. `Scripts/Home/index.ts` parses Excel sewer-layer imports and validates domain-specific columns before upload.
- Document/PDF workflow integration: Switching-valve views and scripts show multi-file PDF uploads with `FormData`, generated application PDF instructions, case-list navigation, and server response handling.
- Fertilizer-station scheduling rules: `Scripts/FertilizerStation/ScheduledFertilizer.ts` contains datepicker customization, special open/close date handling, booking windows, weekday restrictions, daily guild/personal quantity limits, license expiration checks, banned-plate warnings, booking edits/deletes, and report export flows.
- Role-aware product navigation: shared layouts conditionally render navigation for many roles and domains, which is meaningful frontend work because UI visibility, routing, and user journeys differ by permission and operational responsibility.
- Legacy modernization surface: TypeScript source files are used in a large ASP.NET MVC/jQuery application, giving evidence for incrementally adding typed frontend structure without replacing the server-rendered architecture.
- Performance/security-adjacent frontend delivery: assets use versioned content helpers, static content caching is configured, CSP/security headers are present, and script nonces appear throughout layouts/views. These are useful supporting claims if the user can confirm contribution.

## 8. Biggest Frontend Challenges

- Coordinating many map layers, overlays, searches, and role-specific dashboard panels without a SPA framework.
- Keeping UI behavior consistent across server-rendered Razor, compiled TypeScript, jQuery plugins, and global utility services.
- Handling large operational forms and file workflows where users expect clear validation, visible errors, and reliable retry behavior.
- Preserving correct application-relative URLs through `SitePath`, important for IIS virtual-directory deployments.
- Maintaining role-specific UI behavior across a broad permission model.
- Building user-friendly workflows for data-heavy government operations where Excel/PDF imports, exports, and official documents are core tasks.
- Managing accessibility and maintainability risks typical of older jQuery/Razor codebases with heavy plugin usage and some inline/semantic limitations.

## 9. Resume Bullet Bank

### Conservative bullets based on confirmed evidence

- Built and maintained TypeScript-backed Razor workflows for a municipal sewer management platform, adding client-side behavior for GIS maps, inspection analytics, water-fee management, document uploads, and fertilizer-station scheduling.
- Integrated Google Maps/GMapEX-based infrastructure layers with role-specific dashboards, facility search, layer toggles, marker/polyline overlays, legends, and statistics panels for sewer and rainwater operations.
- Implemented Excel-driven operational workflows, including client-side parsing, validation feedback, error-list export, batch import, and report export for sewer-layer and water-fee data management.
- Developed data-heavy inspection UI flows that query backend APIs, filter by date/town/company/status, compute normal vs. abnormal inspection summaries, and render charts, tables, and map-based results.
- Delivered permit/document frontend flows using Razor, TypeScript, `FormData`, PDF upload controls, and server response handling to support official application and review processes.
- Built scheduling UI logic for fertilizer/slurry station workflows, including date restrictions, daily quantity limits, license eligibility checks, banned-vehicle warnings, and booking edit/delete flows.
- Supported a large role-based MVC interface with conditional navigation and page access paths across sewer, rainwater, construction, contractor, inspection, water-fee, and public-facing workflows.
- Used TypeScript in a legacy ASP.NET MVC/jQuery codebase to organize domain-specific client logic and reduce risk in complex operational pages.

### Frontend-first bullets with backend context

- Built frontend workflows on top of ASP.NET MVC/Web API endpoints, coordinating Razor-rendered pages, cookie-authenticated API calls, file uploads, and role-aware UI behavior across a municipal infrastructure system.
- Integrated GIS, Excel, PDF, and charting features into server-rendered MVC pages, enabling field and office users to manage infrastructure records without leaving the web application.
- Implemented application-root-aware URL handling through shared layout configuration and `SitePath` usage, supporting IIS/virtual-directory deployment constraints across client-side API calls and asset references.

### Stronger bullets that need user confirmation or metrics

- Modernized [number] legacy MVC pages with TypeScript modules, reducing frontend regression risk and improving maintainability across [specific domains].
- Improved GIS workflow performance by [metric] through bounds-based layer loading, marker clustering, or selective map-layer rendering.
- Reduced manual spreadsheet processing time by [metric] by implementing Excel validation, batch import, and export workflows for water-fee or sewer-layer data.
- Improved field inspection turnaround by [metric] by delivering map-based facility lookup and inspection result dashboards.
- Supported [number] user roles or [number] municipal departments through role-aware navigation and workflow-specific UI paths.

### Suggested metrics to collect

- Number of pages/features personally delivered or modernized.
- Number of TypeScript modules or workflows owned.
- Typical import/export file size, record count, or monthly transaction volume.
- Before/after time saved for Excel, PDF, inspection, or scheduling workflows.
- GIS layer count, map feature count, or records rendered per workflow.
- User roles/departments served and whether the system is production-facing.
- Any measured improvements in load time, error rate, task completion time, or support tickets.

## 10. Interview Talking Points

- GIS dashboard story: The app’s default experience is a GIS map for sewer/rainwater operations. A strong interview story can cover how Razor renders the shell, how TypeScript modules load and toggle map layers, how search locates infrastructure by facility number, and how role-specific statistics panels make the map an operational workspace rather than a passive viewer.
- Excel validation story: Explain how users bring operational data in spreadsheets, why client-side validation matters before committing backend changes, how errors are surfaced/exported, and how this reduced back-and-forth for non-technical users.
- Inspection analytics story: Walk through querying inspection results, splitting internal/external inspection types, computing abnormal categories, rendering charts/tables/maps, and handling empty/error states.
- Scheduling rules story: Describe the fertilizer-station scheduling UI as a rules-heavy workflow where date restrictions, capacity limits, company/vehicle eligibility, license expiration, and banned-plate conditions all have to be reflected clearly before submission.
- Legacy TypeScript story: Discuss adding or maintaining typed frontend modules within an ASP.NET MVC/jQuery environment, including how to keep changes scoped by domain folder and avoid breaking server-rendered views.

Likely interviewer follow-up questions:

- How did you manage map performance with many layers and markers?
- How did frontend validation differ from backend validation?
- What parts were server-rendered versus dynamically fetched?
- How did you test or verify role-specific UI behavior?
- What accessibility issues did you have to handle in a legacy jQuery/MVC app?
- How were TypeScript files compiled and deployed?

## 11. Open Questions

- Which frontend features did you personally build, refactor, or maintain?
- Was the project used in production by Taoyuan municipal users, contractors, or public applicants?
- What is the official English project name, if any, or should the Chinese name be used on the resume?
- Did you own the GIS map, inspection analytics, fertilizer-station scheduling, water-fee workflows, or switching-valve document flows?
- Were there measurable improvements in task completion time, upload error rates, report generation time, map load time, or support volume?
- How many roles, departments, contractors, or monthly transactions did the system support?
- Was TypeScript introduced by you or already present before your work?
- Did you contribute to security headers, CSP nonces, static caching, analytics, or deployment configuration?
- Was there manual/automated QA, UAT, accessibility testing, or browser/device testing outside the repo?
- Should exposed sensitive config values be rotated/remediated before any portfolio screenshots or code sharing?

## 12. Next Actions

- Ready now: use conservative bullets about TypeScript-backed Razor workflows, GIS maps, Excel validation/export, inspection analytics, file upload flows, fertilizer-station scheduling, and role-aware navigation.
- Needs confirmation: ownership, production impact, user scale, performance improvements, business metrics, and whether backend/API/deployment work can be claimed as personal contribution.
- Strengthen the resume story by collecting screenshots of the GIS dashboard, inspection statistics, Excel validation error flow, fertilizer-station booking screen, and role-specific navigation.
- Fill in at least two metrics before applying: one scope metric (pages/modules/roles/records) and one impact metric (time saved, errors reduced, records processed, load time improved, or users supported).
- Keep backend language as integration context unless you can confirm personal backend ownership.