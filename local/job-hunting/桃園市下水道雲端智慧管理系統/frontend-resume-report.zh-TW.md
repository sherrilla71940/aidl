# 前端履歷專案報告：桃園市下水道雲端智慧管理系統

檢視日期：2026-05-11

## 1. 專案快照

- 專案名稱或暫定名稱：桃園市下水道雲端智慧管理系統
- 產品類型：市政基礎設施 GIS 與下水道/水務營運管理 Web 系統
- 一句話描述：以 ASP.NET MVC 建置的角色權限式 Web 應用，透過 GIS 圖台、儀表板、資料匯入與營運表單，支援桃園下水道、雨水、巡檢、工程、水費、許可、報修與水肥站相關流程。
- 已確認或推測使用者：市府承辦與管理人員、污水/雨水管理者、BOT/承攬廠商、監造與 PCM、施工廠商、水廠/水肥管理人員、巡檢廠商、區公所使用者，以及部分民眾申請端使用者。
- 主要解決問題：把原本分散在 GIS 工具、Excel、紙本/PDF 表單、Email 與人工進度追蹤中的基礎設施資料與營運流程集中到同一套系統。

## 2. 檢視證據

- 主要檢視檔案與資料夾：`TaoyuanSewer2/Views`、`TaoyuanSewer2/Scripts`、`TaoyuanSewer2/Content/Styles`、`TaoyuanSewer2/Controllers`、`TaoyuanSewer2/App_Start`、`TaoyuanSewer2/packages.config`、`TaoyuanSewer2/TaoyuanSewer2.csproj`、`TaoyuanSewer2/Web.config`、根目錄與專案內 package metadata。
- 代表性檔案：共用 layout、`Views/Map/Index.cshtml`、`Views/Home/QuickNavigation.cshtml`、人孔巡檢圖台/統計 TypeScript、水費管理 TypeScript、制水閥文件上傳 TypeScript、水肥站預約 TypeScript、路由/API/驗證設定與圖台/權限控制器。
- 使用搜尋方向：專案 metadata、前端技術棧、GIS/map/chart/DataTable、角色與權限、上傳/下載/Excel/PDF 流程、TypeScript 編譯輸出、後端 API/controller 邊界。
- 未深入檢視範圍：完整 controller 細節、資料庫 schema/Entity Framework model 內部、`Scripts/CompileTS` 下每個產出 JavaScript、每個 CSS rule，以及實際 production 部署行為。
- 資安處理註記：設定檔中存在敏感值；本報告只保留非敏感的架構事實，不重現任何密碼、token、API key、connection string 或憑證。

## 3. 技術棧與設定

- 前端框架/模式：ASP.NET MVC Razor server-rendered views，搭配頁面層級 TypeScript/JavaScript 模組，編譯後 JavaScript 位於 `Scripts/CompileTS`。
- 語言與建置工具：根目錄與專案內 `package.json` 皆有 TypeScript；TypeScript source 位於 `TaoyuanSewer2/Scripts/**`，編譯後 JavaScript 也納入專案。
- UI libraries 與資產：jQuery 3.7.1、jQuery UI、Bootstrap、DataTables、FooTable、Select2、AlertifyJS、jsPanel、ViewerJS、Air Datepicker、Font Awesome、Chart.js、Google Charts、ExcelParser/xlsx、JSZip/FileSaver、Google Maps、GMapEX、ArcGIS link helpers、Turf，以及 `Content/Styles` 下的客製 CSS。
- Layout 與設計結構：共用 Razor layouts 負責載入全域資產、產品識別、responsive viewport、common services、analytics、角色權限導航，以及提供 `SitePath` 讓前端 URL 能符合 IIS 應用程式根目錄。
- State 與資料流：多數狀態存在頁面層級 TypeScript 變數、jQuery event handlers、`fetch` 呼叫、表單送出，以及 `Common`、`ExcelParser`、map-layer helpers 等全域工具物件。
- 路由與 API 邊界：MVC default route 指向 `Map/Index`；Web API route template 為 `api/{controller}/{id}`；頁面 script 透過 `SitePath` 呼叫 MVC controller routes 與 Web API endpoints。
- 與前端相關的後端背景：.NET Framework 4.8、ASP.NET MVC 5/Web API、Razor、Entity Framework 6、ASP.NET Identity/Owin cookie auth、角色權限 attributes、repository-style data access、IIS 導向 Web config、static-content caching、Application Insights、自訂 security headers、Excel/PDF/document-generation libraries，以及地圖、SMS/mail、LINE Bot、市政資料服務等外部整合線索。
- 部署/執行環境線索：IIS/IIS Express 設定、Web.Release/Web.Debug transforms、repo root 有 `.gitlab-ci.yml`、static content cache headers、CSP/security headers、Application Insights modules、MSBuild-style `.csproj` 專案結構。
- 測試與品質關卡：抽樣檢視未發現專門的前端 test runner、E2E test suite、Storybook 或 accessibility test 設定。

## 4. 前端架構摘要

此系統是 server-rendered MVC 架構。Razor views 負責 layout、導覽、partial panels、頁面 markup 與 server-side role checks；TypeScript modules 則為各工作流程加上 client-side interactivity。這不是 React/Vue SPA，而是一套大型 multi-page operational application，在 MVC 頁面上疊加大量 JavaScript 行為。

預設路由會進入 GIS 圖台。`Views/Map/Index.cshtml` 是主要 map shell，載入圖層、圖例、工具箱、設施詳情、統計面板、污水/雨水圖層、用戶接管圖層、參考圖層、地籍/圖台服務等多個編譯模組。此 view 也會依角色渲染不同統計 partial，因此 GIS 頁面不只是地圖，而是營運儀表板。

資料流由頁面控制項進入 TypeScript event handlers，再透過 `fetch`、form posts 或 helper utilities 呼叫後端 endpoints。代表例子包含巡檢結果查詢、下水道圖層查詢、水費明細查詢/匯入/匯出、水肥預約異動、文件上傳等。UI 狀態通常保存在目前搜尋結果、選取圖層狀態、預約清單、chart instances、上傳檢核結果等頁面變數中。

最明顯的架構優點是以 domain 分資料夾：`Scripts/InspectionManhole`、`Scripts/WaterFeeMgt`、`Scripts/FertilizerStation`、`Scripts/SwitchingValve`、`Scripts/Map` 等目錄與 views/controllers 大致對應，讓大型 MVC legacy codebase 的功能邊界更容易辨識。代價是仍有傳統 jQuery/MVC 架構常見的 global utilities、layout dependency 與頁面層級 state，而不是集中式 typed client/data layer。

## 5. 與前端相關的後端背景

- API 與 server-rendering 邊界：Razor views 渲染初始頁面與角色導航；JavaScript 透過 MVC/Web API endpoints 取得動態資料、處理匯入、上傳、匯出與圖層操作。
- Auth 與 roles：系統設定 ASP.NET Identity/Owin cookie authentication；shared layouts 與 controllers 使用 `SystemAdmin`、`Sewage`、`RainWater`、`BOT`、`Supervisor`、`PCM`、`Constructors`、`SlurryAdmin`、`WaterPlantAdmin` 等角色判斷來顯示導覽或保護路由。
- 影響 UI 的權限行為：自訂 `AuthorizePlus` 與 `AuthorizePlusApi` attributes 會處理登入與強制改密碼行為；API 未授權時會回傳 JSON 訊息，前端流程可顯示對應提示。
- 影響 UI 的資料/整合限制：GIS 圖層仰賴 map APIs 與 geospatial helpers；巡檢與水費頁依賴後端查詢 endpoints；上傳頁使用 `FormData`；Excel 匯入/匯出同時有 client-side parsing 與 server-side validation；PDF/文件流程仰賴 server-generated files；水肥預約需反映特殊日期、每日上限、證照/車牌資格與停權區間。
- 已確認後端事實：專案包含 .NET Framework 4.8、ASP.NET MVC/Web API packages、Entity Framework 6、ASP.NET Identity/Owin、Web API routing、MVC routing to `Map/Index`、security header/static content configuration。
- 推測後端事實：從 Entity Framework SQL Server packages 與 connection string 結構可推測 SQL Server 是主要資料庫，但正式 production database topology 應由使用者確認後再寫入履歷。
- 不應在未確認下宣稱：個人擁有後端 API、production deployment、database design、官方使用者數、可用性/SLA 或資安修補責任。

## 6. 產品與使用者故事

此專案看起來服務市府下水道與水務營運團隊，讓使用者能巡檢資產、管理工程與報修流程、追蹤污水/雨水基礎設施、審核申請、處理水費紀錄、上傳正式文件，以及安排水肥站營運。

前端之所以重要，是因為這些流程都屬於高摩擦的營運工作：地圖式設施定位、角色專屬儀表板、大型表單、檔案上傳、Excel 檢核、巡檢統計圖表、日期與資格規則驅動的預約。好的前端能降低使用者在 GIS 軟體、Excel、紙本文件、Email 與人工進度追蹤之間切換的成本。

專案中也可看到 `Views/App` 與 `Scripts/CompileTS/App` 等 mobile/app-facing 線索，加上 responsive viewport 與巡檢圖台中的 mobile-specific behavior，推測系統同時支援辦公室與外勤/現場營運情境。不過實際 mobile 使用狀況仍應由使用者確認。

## 7. 值得寫進履歷的前端證據

- GIS-first 營運儀表板：`Views/Map/Index.cshtml` 載入 Google Maps、GMapEX、ArcGIS link helpers、SewerEX、map-layer modules、map legend/toolbox/facility detail modules，以及依角色渲染的統計 partials。可支撐「將地理圖層整合進營運儀表板」的履歷敘述。
- 多圖層地圖互動：`Scripts/InspectionManhole/InspectionManholeMap.ts` 管理污水/BOT 污水圖層切換、陰井/連接管圖層、bounds-based BOT layers、marker/polyline drawing callbacks、依管線/人孔/連接管/陰井編號搜尋定位、mobile 搜尋面板行為與巡檢資料 overlay。
- 巡檢統計分析：`Scripts/InspectionManhole/InspectionManholeStatistics.ts` 載入 Google Charts，查詢篩選後巡檢結果，切分人孔外部/內部巡檢資料，計算正常/異常數，並呈現 chart/table/map views。
- Excel 匯入/匯出與檢核：`Scripts/WaterFeeMgt/WaterFeeChargeRecordManagement.ts` 支援查詢篩選、Excel 匯出、批次匯入、檔案檢核、錯誤清單匯出、水號檢查與新增/編輯流程。`Scripts/Home/index.ts` 也會解析下水道圖層 Excel 並驗證 domain-specific columns 後再上傳。
- 文件/PDF 流程整合：制水閥 views/scripts 顯示多檔 PDF upload、產製申請書 PDF 指示、案件列表導引與 server response handling。
- 水肥站預約規則：`Scripts/FertilizerStation/ScheduledFertilizer.ts` 包含 datepicker 客製化、特殊開放/關閉日期、預約天數限制、週三/週日限制、每日公會/非公會上限、證照到期檢查、停權車牌提示、預約編輯/刪除與報表匯出。
- 角色權限式產品導覽：shared layouts 依多種角色與 domain 條件渲染導航，這是有意義的前端工作，因為不同權限會影響 UI 可見性、路由入口與使用者旅程。
- Legacy modernization surface：大型 ASP.NET MVC/jQuery 專案中存在 TypeScript source，可作為「在不重寫架構的前提下，逐步導入 typed frontend structure」的證據。
- 效能/資安相關前端交付線索：使用 versioned content helper、static content caching、CSP/security headers 與 script nonces。若使用者確認有參與，可作為輔助履歷素材。

## 8. 最大前端挑戰

- 在沒有 SPA framework 的情況下協調多個 map layers、overlays、搜尋與角色專屬 dashboard panels。
- 讓 server-rendered Razor、compiled TypeScript、jQuery plugins 與 global utility services 之間的 UI 行為維持一致。
- 處理大型營運表單與檔案流程，並提供清楚的 validation、錯誤顯示與可靠的重試體驗。
- 透過 `SitePath` 保持 application-relative URLs 正確，支援 IIS virtual-directory deployment。
- 在大量角色與權限模型下維護正確的 UI visibility 與使用者路徑。
- 為政府營運情境建立易用的 Excel/PDF 匯入、匯出與正式文件流程。
- 面對舊式 jQuery/Razor codebase 中常見的 accessibility 與 maintainability 風險，例如大量 plugin、inline behavior 與部分語意結構限制。

## 9. 履歷 bullet bank

### 可直接使用的保守版本

- Built and maintained TypeScript-backed Razor workflows for a municipal sewer management platform, adding client-side behavior for GIS maps, inspection analytics, water-fee management, document uploads, and fertilizer-station scheduling.
- Integrated Google Maps/GMapEX-based infrastructure layers with role-specific dashboards, facility search, layer toggles, marker/polyline overlays, legends, and statistics panels for sewer and rainwater operations.
- Implemented Excel-driven operational workflows, including client-side parsing, validation feedback, error-list export, batch import, and report export for sewer-layer and water-fee data management.
- Developed data-heavy inspection UI flows that query backend APIs, filter by date/town/company/status, compute normal vs. abnormal inspection summaries, and render charts, tables, and map-based results.
- Delivered permit/document frontend flows using Razor, TypeScript, `FormData`, PDF upload controls, and server response handling to support official application and review processes.
- Built scheduling UI logic for fertilizer/slurry station workflows, including date restrictions, daily quantity limits, license eligibility checks, banned-vehicle warnings, and booking edit/delete flows.
- Supported a large role-based MVC interface with conditional navigation and page access paths across sewer, rainwater, construction, contractor, inspection, water-fee, and public-facing workflows.
- Used TypeScript in a legacy ASP.NET MVC/jQuery codebase to organize domain-specific client logic and reduce risk in complex operational pages.

### 前端優先、帶後端整合脈絡

- Built frontend workflows on top of ASP.NET MVC/Web API endpoints, coordinating Razor-rendered pages, cookie-authenticated API calls, file uploads, and role-aware UI behavior across a municipal infrastructure system.
- Integrated GIS, Excel, PDF, and charting features into server-rendered MVC pages, enabling field and office users to manage infrastructure records without leaving the web application.
- Implemented application-root-aware URL handling through shared layout configuration and `SitePath` usage, supporting IIS/virtual-directory deployment constraints across client-side API calls and asset references.

### 較強但需要使用者確認或補 metrics 的版本

- Modernized [number] legacy MVC pages with TypeScript modules, reducing frontend regression risk and improving maintainability across [specific domains].
- Improved GIS workflow performance by [metric] through bounds-based layer loading, marker clustering, or selective map-layer rendering.
- Reduced manual spreadsheet processing time by [metric] by implementing Excel validation, batch import, and export workflows for water-fee or sewer-layer data.
- Improved field inspection turnaround by [metric] by delivering map-based facility lookup and inspection result dashboards.
- Supported [number] user roles or [number] municipal departments through role-aware navigation and workflow-specific UI paths.

### 建議補上的 metrics

- 親自交付或現代化的頁面/功能數量。
- 負責的 TypeScript modules 或 workflows 數量。
- 匯入/匯出檔案常見大小、資料筆數或每月交易量。
- Excel、PDF、巡檢或預約流程的前後時間差。
- GIS 圖層數、地圖 feature 數或每個流程渲染的資料量。
- 服務的角色/部門，以及系統是否為 production-facing。
- 載入時間、錯誤率、任務完成時間或 support tickets 是否有改善。

## 10. 面試談資

- GIS 儀表板故事：系統預設入口是污水/雨水營運 GIS 圖台。可以說明 Razor 如何渲染 shell、TypeScript modules 如何載入與切換圖層、搜尋如何依設施編號定位，以及角色統計 panels 如何把圖台變成營運工作台。
- Excel 檢核故事：說明使用者如何帶入營運 spreadsheet、為什麼提交後端前的 client-side validation 很重要、錯誤如何呈現/匯出，以及如何降低非技術使用者來回修檔成本。
- 巡檢統計故事：描述查詢巡檢結果、切分內外部巡檢、計算異常類別、渲染 charts/tables/maps，以及處理空資料與錯誤狀態。
- 預約規則故事：把水肥站預約 UI 描述成 rules-heavy workflow，日期限制、容量上限、廠商/車輛資格、證照到期、停權車牌都必須在送出前清楚反映。
- Legacy TypeScript 故事：說明如何在 ASP.NET MVC/jQuery 環境中維護 typed frontend modules，並用 domain folder 控制修改範圍，避免破壞 server-rendered views。

面試官可能追問：

- 多圖層、多 marker 的 map performance 如何處理？
- 前端 validation 與後端 validation 如何分工？
- 哪些內容是 server-rendered，哪些是 dynamic fetch？
- 角色權限 UI 行為如何測試或驗證？
- 在 legacy jQuery/MVC app 中遇到哪些 accessibility 問題？
- TypeScript 如何編譯與部署？

## 11. 待確認問題

- 哪些前端功能是你親自建置、重構或維護？
- 專案是否已由桃園市府使用者、承攬廠商或民眾申請者實際上線使用？
- 是否有官方英文專案名稱，或履歷應使用中文名稱？
- 你是否負責 GIS 圖台、巡檢統計、水肥站預約、水費流程或制水閥文件流程？
- 是否有任務完成時間、上傳錯誤率、報表產製時間、地圖載入時間或 support volume 的改善數據？
- 系統支援多少角色、部門、承攬廠商或每月交易量？
- TypeScript 是你導入，還是原本已存在？
- 你是否參與 security headers、CSP nonces、static caching、analytics 或部署設定？
- repo 之外是否有人工/自動化 QA、UAT、accessibility testing 或 browser/device testing？
- 若要做作品集截圖或分享程式碼，設定檔中的敏感值是否已輪替/修補？

## 12. 下一步

- 目前可直接使用：TypeScript-backed Razor workflows、GIS maps、Excel validation/export、inspection analytics、file upload flows、fertilizer-station scheduling、role-aware navigation 相關 bullets。
- 需要確認後再加強：個人 ownership、production impact、user scale、performance improvements、business metrics，以及後端/API/deployment 是否能作為個人貢獻宣稱。
- 建議收集截圖：GIS dashboard、巡檢統計、Excel 檢核錯誤流程、水肥站預約畫面、角色專屬導航。
- 投履歷前至少補兩種 metrics：一個 scope metric（頁面/modules/roles/records），一個 impact metric（節省時間、降低錯誤、處理筆數、載入改善或服務使用者數）。
- 在無法確認後端 ownership 前，後端內容只作為整合脈絡，不寫成個人主要成就。