# Frontend Resume Report: Taoyuan Sewer Cloud Smart Management System

## 1. Project Snapshot

- **Name / working title:** 桃園市下水道雲端智慧管理系統 / Taoyuan Sewer Cloud Smart Management System
- **Product category:** Municipal public-works operations platform, GIS dashboard, and workflow management system
- **One-sentence product description:** An ASP.NET MVC web application for managing Taoyuan sewer, rainwater, construction, inspection, monitoring, and fertilizer/slurry station operations through role-based dashboards, maps, forms, reports, and data visualizations.
- **Confirmed users or likely audience:** Taoyuan municipal water/sewer staff, system administrators, contractors, supervisors, district offices, fertilizer/slurry companies, guild users, and inspection/maintenance vendors. This is inferred from role names and menu visibility checks in the MVC layout and controllers.
- **Primary problem solved:** Centralizes sewer and rainwater asset management, field reporting, GIS inspection, construction progress, monitoring, reporting, and station operation workflows that would otherwise be spread across manual records, spreadsheets, GIS tools, and separate vendor systems.

## 2. Evidence Reviewed

### Key Files And Folders Inspected

- `TaoyuanSewer2/Views/Shared/_Layout.cshtml` for product name, global frontend dependencies, role-based navigation, analytics, and `SitePath` setup.
- `TaoyuanSewer2/tsconfig.json`, `TaoyuanSewer2/package.json`, root `package.json`, and `TaoyuanSewer2/gulpfile.js` for TypeScript and build configuration.
- `TaoyuanSewer2/App_Start/BundleConfig.cs`, `TaoyuanSewer2/App_Code/HtmlHelpers.cs`, `.gitlab-ci.yml` for bundling, versioned asset loading, and IIS/MSBuild publish flow.
- `TaoyuanSewer2/Scripts/Map/Map.ts` and `TaoyuanSewer2/Scripts/Map/Layer.ts` for the GIS map architecture, sewer layer controls, bounds filtering, coordinate conversion, and street-view integrations.
- `TaoyuanSewer2/Scripts/App/APPUNDERCON.ts`, `APPFAC.ts`, and related search results for construction progress charts, plant monitoring, 3D model links, CCTV/video workflows, and realtime water-quality dashboards.
- `TaoyuanSewer2/Scripts/FertilizerStation/ScheduledFertilizer.ts`, `Business_DailyFertilizerManagement.ts`, `Views/FertilizerStation/Business_DailyFertilizerManagement.cshtml`, and `Content/Styles/FertilizerStation/Business_DailyFertilizerManagement.css` for fertilizer/slurry scheduling and the newer business daily management UI.
- `TaoyuanSewer2/Controllers/FertilizerStationController.cs` and `TaoyuanSewer2/Controllers/SlurryController.cs` for frontend/API workflow boundaries and role protection.
- `TaoyuanSewer2/Scripts/Common.ts` for shared browser utilities, image preview/EXIF handling, Excel download helpers, WKT/GIS conversion usage, and cross-page UI helpers.

### Searches And Commands Used

- File discovery through workspace file search for `package.json`, MVC config, views, scripts, styles, and solution/project files.
- Workspace searches for product naming, GIS/map terms, charting, AJAX/fetch usage, fertilizer/slurry workflows, role checks, and accessibility attributes.
- Shell footprint counts with `find` because `rg` was not available in the bash terminal:
  - 253 TypeScript files under `TaoyuanSewer2/Scripts`
  - 369 Razor views under `TaoyuanSewer2/Views`
  - 24 CSS files under `TaoyuanSewer2/Content/Styles`
  - 19 fertilizer-station TypeScript files
  - 10 statistics views

### Areas Not Inspected Deeply

- I did not run the application or perform browser testing.
- I did not inspect every controller, every generated JavaScript file under `Scripts/CompileTS`, or all 369 views.
- I did not validate production metrics, user counts, load times, or business outcomes; those should be confirmed by the user before using stronger resume claims.

## 3. Stack And Configuration

- **Frontend model:** ASP.NET MVC 5 Razor views with page-specific TypeScript compiled to JavaScript and loaded through MVC sections.
- **Language:** TypeScript and JavaScript. The app-level TypeScript package is `5.8.2`; the repository root also has a TypeScript dependency at `^4.6.2`.
- **Compilation target:** `tsconfig.json` targets ES5, uses DOM and ES2018 libraries, CommonJS modules, and emits compiled files to `Scripts/CompileTS`.
- **UI libraries:** jQuery 3.7.1, jQuery UI, Bootstrap, Air Datepicker, AlertifyJS, jsPanel, Select2, DataTables, FooTable, ViewerJS, Font Awesome, Chart.js, Google Charts, JSZip, FileSaver, and an Excel parser/xlsx integration.
- **GIS and maps:** Google Maps JavaScript API plus a local `GMapEX` abstraction, NLSC WMTS layers, ArcGIS REST service layers, WKT parsing, TWD97/WGS84 coordinate conversion, marker clustering, street-view pipe/manhole overlays, layer toggles, and map legend behavior.
- **Data flow:** Page scripts use `fetch`, jQuery event handlers, `FormData`, local storage, query strings, and ASP.NET Web API endpoints under `SitePath`.
- **Styling:** Razor-linked CSS files in `Content/Styles`, Bootstrap/vendor CSS, page-specific CSS, and responsive media queries.
- **Quality and delivery:** GitLab CI restores NuGet packages and publishes the ASP.NET solution with MSBuild to IIS file-system targets for `develop`, `hotfix`, and a test branch. Gulp minifies compiled JavaScript and bundles map scripts.
- **Monitoring/analytics:** The layout references Google Analytics and Application Insights is present in the project packages/configuration.

## 4. Architecture Summary

The frontend is organized as a server-rendered MVC application where Razor views define page structure, layout selection, role-aware navigation, and script/style entry points. TypeScript files under `Scripts` implement page behavior and compile into `Scripts/CompileTS`; views load the compiled page script through `@Url.VersionedContent(...)`, which appends a last-modified timestamp to reduce stale browser cache risk.

The application uses a shared shell in `_Layout.cshtml` for global vendors, navigation, authenticated role checks, and global `SitePath`. Feature areas are split by route and domain, including Map, App, FertilizerStation, Statistics, InspectionManhole, RainMaintenance, WaterFeeMgt, SwitchingValve, SewerLayer, and many others.

Data flows from page scripts to MVC/Web API endpoints with `fetch` and JSON payloads. Several workflows use browser state for cross-page navigation, such as storing selected construction or plant data in `localStorage` before moving to a detail, map, chart, or video page. The map subsystem is a major shared integration boundary: page scripts initialize Google Maps, then use `GMapEX` and layer modules to draw infrastructure assets, filter visible geometry, convert coordinate systems, and attach street-view behavior.

The newer `Business_DailyFertilizerManagement.ts` screen is more modular and typed than older jQuery-heavy scripts. It defines interfaces for API response models, centralizes page references in `PageRefs`, maintains `PageState`, uses an `AbortController` to cancel stale requests, renders a monthly calendar from API summaries, and includes keyboard/focus behavior for popovers and modals.

## 5. Product And User Story

This product supports municipal operations for sewer and rainwater infrastructure. The UI helps different user groups find asset locations, manage construction and inspection workflows, review facility status, submit or update records, check reports, export data, and monitor water-quality or station data.

The frontend matters because much of the domain is spatial, operational, and time-sensitive. Users need map-based asset discovery, construction progress location, field photo handling, date-based scheduling, role-specific menus, dashboard summaries, and reliable forms that can prevent invalid or out-of-policy submissions. The fertilizer/slurry station area adds a high-stakes scheduling layer: vehicle/license validity, daily and monthly quota limits, special closure/makeup dates, company categories, and actual-versus-reserved amounts all need to be visible and enforceable in the UI.

## 6. Impressive Frontend Evidence

### GIS-Heavy Infrastructure Map Experience

Evidence: `Scripts/Map/Map.ts`, `Scripts/Map/Layer.ts`, map-related search results across App, Statistics, Inspection, Rain, SewerLayer, and maintenance scripts.

- Initializes Google Maps with custom controls, street-view behavior, coordinate display, right-click coordinate copying, and map idle updates.
- Integrates a custom `GMapEX` layer around Google Maps for sewer-layer graphics, NLSC WMTS basemaps, ArcGIS REST layers, WKT geometry, TWD97 conversion, and marker clustering.
- Implements role-aware layer availability, showing or hiding foul/rainwater layers based on authenticated role groups.
- Handles performance-sensitive map rendering by filtering sewer-layer graphics to visible bounds.

### Operational Dashboards And Data Visualization

Evidence: `Scripts/App/APPUNDERCON.ts`, `Scripts/App/APPFAC.ts`, `Scripts/App/APPFAC_realtime.ts`, statistics views, and Google Charts/Chart.js search results.

- Builds construction progress lists with FooTable and inline Chart.js pie charts for percentage completion.
- Routes map-location actions to construction-area map pages using local storage and geometry payloads.
- Integrates realtime or near-realtime sewage plant water-quality data, compares values to discharge standards, and marks out-of-range readings visually.
- Supports plant detail workflows for charts, CCTV/video pages, and 3D model access.

### Fertilizer/Slurry Scheduling And Quota Workflows

Evidence: `Scripts/FertilizerStation/ScheduledFertilizer.ts`, `Business_DailyFertilizerManagement.ts`, `FertilizerStationController.cs`, `SlurryController.cs`, and fertilizer-station views/styles.

- Handles booking rules such as three-day/sixty-day reservation windows, 08:00 booking start, plant close days, makeup days, Wednesday/Sunday closure logic, license expiration checks, vehicle ban checks, and guild/non-guild quantity limits.
- Supports specialized fertilizer/slurry feature areas for scheduled fertilizer, daily management, disposal records, ban management, contracts, and feedstock category management.
- Uses backend APIs for category-aware data such as `GetFACMAll`, `GetFACMLDByFACMId`, `FACMSummary`, `FertilizerBookingSpecialDate`, and `ModifyFACMLD`.

### Modernized Business Daily Fertilizer Management Screen

Evidence: `Views/FertilizerStation/Business_DailyFertilizerManagement.cshtml`, `Scripts/FertilizerStation/Business_DailyFertilizerManagement.ts`, and `Content/Styles/FertilizerStation/Business_DailyFertilizerManagement.css`.

- Implements a monthly calendar UI that displays reserved and delivered fertilizer amounts per day.
- Uses typed response interfaces, deterministic page-state management, and DOM references collected up front with initialization failure handling.
- Fetches category, limit, monthly summary, and special-date data in parallel and cancels stale requests with `AbortController`.
- Escapes rendered text with an `EscapeHtml` helper before inserting dynamic company names and amounts into table rows.
- Includes accessibility-minded behavior: labeled controls, `aria-live` quota summary, `aria-controls`/`aria-expanded` on the quota popover, dialog role/`aria-modal`, Escape handling, focus trapping, and focus restoration.
- Includes responsive CSS for compact layouts, horizontal calendar overflow, full-width mobile actions, and mobile modal sizing.

### Shared Browser Utilities And Asset Delivery

Evidence: `Scripts/Common.ts`, `App_Code/HtmlHelpers.cs`, `_Layout.cshtml`, and `gulpfile.js`.

- Provides reusable datepickers, loading states, Excel download helpers, image preview, EXIF extraction, viewer initialization, and GIS-related WKT conversion support.
- Uses server-side versioned asset URLs to bust cache when static files change.
- Uses a dedicated TypeScript output folder and Gulp minification/bundling for compiled JavaScript assets.

## 7. Biggest Frontend Challenges

- **Complex role matrix:** Navigation and route access vary by many roles such as SystemAdmin, Sewage, RainWater, BOT, Supervisor, PCM, Constructors, SlurryAdmin, FertilizerGuild, FertilizerCompany, DistrictOffice, CableContractor, and more.
- **Spatial UX complexity:** The GIS frontend must combine map layers, government basemaps, sewer/rainwater geometries, inspection markers, WKT geometry, coordinate conversion, street view, and marker clustering.
- **Operational correctness:** Fertilizer/slurry workflows are constrained by dates, capacities, license validity, company categories, actual deliveries, and special closure/makeup calendars.
- **Legacy-to-modern frontend mix:** The codebase contains older jQuery-heavy scripts alongside newer typed TypeScript modules. Maintaining consistent behavior while improving structure is a meaningful challenge.
- **Large surface area:** The app has hundreds of views and scripts, meaning frontend changes can affect many operational workflows.
- **Security and privacy constraints:** The app handles authenticated government/vendor workflows, file uploads, location data, and operational records. Resume claims should avoid exposing sensitive endpoints, credentials, or private operational details.

## 8. Resume Bullet Bank

### Conservative Bullets Based On Confirmed Evidence

- Built and maintained TypeScript/jQuery frontend modules for a municipal sewer management platform with 250+ TypeScript files and 360+ Razor views across GIS, inspection, construction, statistics, and station-operation workflows.
- Implemented GIS-heavy user workflows using Google Maps, custom map-layer utilities, NLSC basemaps, ArcGIS service layers, WKT geometry, coordinate conversion, marker clustering, and street-view sewer asset overlays.
- Developed role-aware operational interfaces for sewer, rainwater, construction, inspection, and fertilizer/slurry station users, aligning visible navigation and page behavior with authenticated MVC role checks.
- Built fertilizer/slurry scheduling interfaces that validate booking windows, plant closure/makeup dates, license status, vehicle bans, and quota limits before users submit reservations.
- Delivered a monthly business fertilizer management calendar with TypeScript interfaces, parallel API loading, abortable requests, quota editing, responsive layout, and accessible modal/popover interactions.
- Integrated Chart.js, Google Charts, FooTable, DataTables, and map visualizations to present construction progress, inspection status, water-quality readings, and statistics dashboards.
- Improved frontend asset freshness by loading scripts and styles through MVC versioned content URLs based on file modification timestamps.

### Stronger Bullets Requiring User Confirmation Or Metrics

- Modernized the fertilizer-station frontend from legacy jQuery patterns toward typed, state-driven TypeScript modules, reducing maintenance effort by `[metric]` or improving change confidence across `[number]` workflows.
- Optimized GIS layer rendering by filtering visible sewer graphics and clustering markers, improving map responsiveness for `[asset count]` infrastructure records.
- Reduced booking errors or manual corrections by implementing frontend validation for capacity limits, license expiration, banned vehicles, and special-date scheduling rules.
- Improved accessibility of operational modals and quota controls by adding keyboard support, focus restoration, ARIA state, and responsive layouts, supporting WCAG-aligned internal UI standards.
- Supported deployment reliability by aligning TypeScript compilation, Gulp minification/bundling, versioned assets, and GitLab/MSBuild IIS publish workflows.

### Suggested Metric Placeholders To Fill In

- Number of active municipal/vendor user roles supported.
- Number of GIS layers or infrastructure records displayed in production.
- Before/after load or interaction time for map layer toggles.
- Reduction in booking mistakes, support tickets, or manual corrections after the fertilizer calendar/quota improvements.
- Number of fertilizer/slurry categories, companies, license plates, bookings, or daily records managed.
- Number of pages/screens personally owned or refactored.

## 9. Interview Talking Points

### Story 1: GIS Operations At Municipal Scale

- **Situation:** Field and office users needed to inspect sewer/rainwater assets and related construction or inspection records spatially.
- **Technical challenge:** The UI had to combine Google Maps, government basemaps, custom sewer layers, coordinate systems, WKT geometry, street view, and role-specific layer access.
- **Action:** Implemented and maintained TypeScript map modules that initialize map behavior, draw layers/markers, filter visible geometry, support TWD97 coordinate copying, and connect map selections to detail workflows.
- **Result to confirm:** Faster asset lookup, clearer field context, or fewer manual GIS handoffs.

### Story 2: Fertilizer/Slurry Booking Rules In The Browser

- **Situation:** Fertilizer station reservations depend on policy rules, capacity limits, vehicle/license status, company type, and special operating dates.
- **Technical challenge:** Users needed immediate feedback before submitting invalid reservations, while backend APIs still enforced the real rules.
- **Action:** Built client-side validation and calendar-driven UI flows that check booking windows, license expiration, ban status, quota totals, closure/makeup dates, and category-specific limits.
- **Result to confirm:** Fewer invalid submissions, clearer station scheduling, or reduced administrative correction work.

### Story 3: Modernizing A Legacy MVC Frontend Incrementally

- **Situation:** The application has many existing Razor/jQuery pages, but newer screens need stronger maintainability and accessibility.
- **Technical challenge:** A full rewrite would be risky, so improvements must fit existing MVC routing, shared layouts, compiled TypeScript output, and vendor dependencies.
- **Action:** Built the business daily fertilizer management screen with typed models, explicit page refs, centralized page state, abortable fetches, safe rendering, accessible modal/popover behavior, and responsive CSS.
- **Result to confirm:** Easier feature changes, fewer race-condition bugs, or better keyboard/mobile usability.

### Follow-Up Questions Interviewers May Ask

- How did you keep map rendering performant with many infrastructure assets?
- What validation belongs in the frontend versus the backend for booking workflows?
- How did you prevent stale API responses from overwriting newer UI state?
- How did you approach accessibility in a legacy MVC/jQuery application?
- How were TypeScript files compiled and loaded into Razor views?
- What trade-offs did you make when using local storage for cross-page workflows?

## 10. Open Questions

- Which parts of the frontend did the user personally build versus maintain or refactor?
- Was the current branch primarily about the business daily fertilizer management screen, scheduled fertilizer mapping documentation, or a broader fertilizer-station frontend fix?
- What production scale can be stated safely: users, roles, records, map layers, daily bookings, or managed facilities?
- Were any measurable improvements recorded for performance, accessibility, booking accuracy, support tickets, or operational turnaround?
- Is the official English project name available, or should English resumes use the descriptive translation `Taoyuan Sewer Cloud Smart Management System`?
- Are there screenshots or before/after UI captures for the fertilizer calendar, GIS map, construction progress dashboard, or plant monitoring views?

## 11. Next Actions

- Confirm ownership: identify which modules/screens were personally implemented, modified, or led.
- Add metrics where possible, especially for GIS layer scale, booking/error reduction, and screen count.
- Capture screenshots of the GIS map, fertilizer calendar, construction progress list, and plant monitoring dashboard for portfolio/interview use.
- Verify whether the business daily fertilizer screen is merged, deployed, or still in progress before using deployment-impact language.
- Ready-to-use conservative bullets: GIS workflows, TypeScript/MVC frontend modules, fertilizer booking validation, monthly business fertilizer calendar, chart/dashboard integrations, and versioned asset delivery.
- Needs confirmation before use: modernization impact, production scale, performance improvements, error reduction, and accessibility compliance level.