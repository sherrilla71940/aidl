# 前端履歷報告：桃園市下水道雲端智慧管理系統

## 1. 專案概覽

- **專案名稱 / 暫定名稱：** 桃園市下水道雲端智慧管理系統 / Taoyuan Sewer Cloud Smart Management System
- **產品類型：** 市政公共工程營運平台、GIS 圖台、流程管理系統
- **一句話描述：** 這是一套 ASP.NET MVC Web 應用程式，透過角色化儀表板、地圖、表單、報表與資料視覺化，管理桃園市污水、雨水、工程、巡檢、監測與水肥站相關作業。
- **已確認或可合理推論的使用者：** 桃園市水務 / 下水道相關承辦人員、系統管理者、施工廠商、監造 / PCM、區公所、水肥業者、公會使用者、巡檢與維護廠商。此判斷來自 MVC Layout 與 Controller 中的角色名稱與選單權限判斷。
- **主要解決的問題：** 將下水道與雨水設施的資產管理、現場填報、GIS 巡查、工程進度、監測資料、報表與水肥站作業集中在同一系統，降低以人工紀錄、試算表、GIS 工具與分散廠商系統各自處理的成本。

## 2. 已檢視證據

### 主要檔案與資料夾

- `TaoyuanSewer2/Views/Shared/_Layout.cshtml`：確認產品名稱、全域前端依賴、角色化導覽、分析工具與 `SitePath` 設定。
- `TaoyuanSewer2/tsconfig.json`、`TaoyuanSewer2/package.json`、根目錄 `package.json`、`TaoyuanSewer2/gulpfile.js`：確認 TypeScript 與建置設定。
- `TaoyuanSewer2/App_Start/BundleConfig.cs`、`TaoyuanSewer2/App_Code/HtmlHelpers.cs`、`.gitlab-ci.yml`：確認 bundling、版本化靜態資源載入，以及 IIS / MSBuild 發佈流程。
- `TaoyuanSewer2/Scripts/Map/Map.ts`、`TaoyuanSewer2/Scripts/Map/Layer.ts`：確認 GIS 圖台架構、下水道圖層控制、可視範圍篩選、座標轉換與街景整合。
- `TaoyuanSewer2/Scripts/App/APPUNDERCON.ts`、`APPFAC.ts` 與相關搜尋結果：確認工程進度圖表、污水廠監測、3D 模型、CCTV / 影像流程與即時水質儀表板。
- `TaoyuanSewer2/Scripts/FertilizerStation/ScheduledFertilizer.ts`、`Business_DailyFertilizerManagement.ts`、`Views/FertilizerStation/Business_DailyFertilizerManagement.cshtml`、`Content/Styles/FertilizerStation/Business_DailyFertilizerManagement.css`：確認水肥預約與新版事業水肥每日投料管理畫面。
- `TaoyuanSewer2/Controllers/FertilizerStationController.cs`、`TaoyuanSewer2/Controllers/SlurryController.cs`：確認前端與 API 的流程邊界及角色保護。
- `TaoyuanSewer2/Scripts/Common.ts`：確認共用瀏覽器工具、圖片預覽 / EXIF、Excel 下載、WKT / GIS 轉換與跨頁 UI 工具。

### 使用的搜尋與指令

- 透過 workspace file search 找出 `package.json`、MVC 設定、Views、Scripts、Styles、Solution / Project 檔。
- 透過 workspace search 搜尋產品名稱、GIS / map、chart、AJAX / fetch、水肥 / slurry、角色檢查與無障礙屬性。
- 因 bash terminal 中沒有 `rg`，改用 `find` 取得前端規模快照：
  - `TaoyuanSewer2/Scripts` 底下 253 個 TypeScript 檔
  - `TaoyuanSewer2/Views` 底下 369 個 Razor View
  - `TaoyuanSewer2/Content/Styles` 底下 24 個 CSS 檔
  - 水肥站相關 TypeScript 檔 19 個
  - 統計報表 View 10 個

### 未深入檢視範圍

- 未啟動系統或進行瀏覽器測試。
- 未逐一檢視所有 Controller、`Scripts/CompileTS` 產出的 JavaScript，或全部 369 個 View。
- 未驗證正式環境指標、使用者數、載入時間或業務成效；若要使用較強的履歷敘述，需由使用者補充確認。

## 3. 技術棧與設定

- **前端模型：** ASP.NET MVC 5 Razor Views，搭配依頁面拆分的 TypeScript，編譯成 JavaScript 後由 MVC section 載入。
- **語言：** TypeScript 與 JavaScript。應用程式層級的 TypeScript 版本為 `5.8.2`；根目錄另有 `^4.6.2` 的 TypeScript dependency。
- **編譯目標：** `tsconfig.json` 以 ES5 為 target，使用 DOM 與 ES2018 libraries、CommonJS modules，並輸出到 `Scripts/CompileTS`。
- **UI 函式庫：** jQuery 3.7.1、jQuery UI、Bootstrap、Air Datepicker、AlertifyJS、jsPanel、Select2、DataTables、FooTable、ViewerJS、Font Awesome、Chart.js、Google Charts、JSZip、FileSaver，以及 Excel parser / xlsx 整合。
- **GIS 與地圖：** Google Maps JavaScript API、內部 `GMapEX` 抽象層、NLSC WMTS 圖層、ArcGIS REST service layer、WKT 解析、TWD97 / WGS84 座標轉換、marker clustering、街景管線 / 人孔覆蓋、圖層切換與圖例行為。
- **資料流：** 頁面 script 透過 `fetch`、jQuery event handlers、`FormData`、local storage、query string 與 `SitePath` 下的 ASP.NET Web API 溝通。
- **樣式：** `Content/Styles` 下的 Razor-linked CSS、Bootstrap / vendor CSS、頁面專屬 CSS 與 responsive media queries。
- **品質與交付：** GitLab CI 會還原 NuGet packages，並透過 MSBuild 將 ASP.NET solution 發佈到 IIS file-system 目標，涵蓋 `develop`、`hotfix` 與測試分支。Gulp 用於壓縮編譯後 JavaScript 並 bundle map script。
- **監控 / 分析：** Layout 中引用 Google Analytics；專案套件與設定中也存在 Application Insights。

## 4. 架構摘要

此專案是 server-rendered MVC 應用程式。Razor Views 負責頁面結構、Layout 選擇、角色化導覽，以及 script / style entry point。`Scripts` 底下的 TypeScript 實作頁面行為，編譯到 `Scripts/CompileTS`；Views 透過 `@Url.VersionedContent(...)` 載入編譯後的 page script，並利用檔案最後修改時間附加版本參數，降低瀏覽器快取造成的舊資源問題。

系統共用 `_Layout.cshtml` 作為全域 shell，集中載入 vendor、導覽、登入角色檢查與全域 `SitePath`。功能則依 route 與 domain 拆分，例如 Map、App、FertilizerStation、Statistics、InspectionManhole、RainMaintenance、WaterFeeMgt、SwitchingValve、SewerLayer 等。

資料流主要由頁面 script 以 `fetch` 和 JSON payload 呼叫 MVC / Web API endpoint。部分流程使用 browser state 進行跨頁傳遞，例如將選取的工程、污水廠或幾何資料存在 `localStorage` 後，再導向 detail、map、chart 或 video 頁面。地圖子系統是重要整合邊界：頁面 script 初始化 Google Maps，再透過 `GMapEX` 與 layer modules 繪製基礎設施、篩選可視幾何、轉換座標系統並掛接街景行為。

新版 `Business_DailyFertilizerManagement.ts` 比舊式 jQuery-heavy script 更模組化且型別化。它定義 API response interface、以 `PageRefs` 集中 DOM references、維護 `PageState`、使用 `AbortController` 取消過期 request、依 API summary render 月曆，並包含 popover / modal 的鍵盤與焦點管理。

## 5. 產品與使用者故事

此產品支援市政下水道與雨水基礎設施營運。UI 協助不同使用者族群查找資產位置、管理工程與巡檢流程、查看設施狀態、提交或更新紀錄、查詢報表、匯出資料，以及監控水質或站區資料。

前端在此專案中特別重要，因為領域本身具有高度空間性、營運性與時間敏感性。使用者需要 map-based asset discovery、工程進度定位、現場照片處理、日期排程、角色化選單、儀表板摘要，以及能避免不合規送出的可靠表單。水肥站模組又加入更複雜的排程限制：車輛 / 證照有效性、每日與每月上限、特殊關廠 / 補班日、業者類別、實際量與預約量都必須在 UI 中清楚呈現並可被驗證。

## 6. 值得放入履歷的前端證據

### 高度 GIS 化的基礎設施圖台體驗

證據：`Scripts/Map/Map.ts`、`Scripts/Map/Layer.ts`，以及 App、Statistics、Inspection、Rain、SewerLayer、maintenance scripts 中的 map 搜尋結果。

- 初始化 Google Maps，包含自訂控制項、街景行為、座標顯示、右鍵複製座標與 map idle 更新。
- 透過自訂 `GMapEX` 包裝 Google Maps，整合下水道圖層、NLSC WMTS 底圖、ArcGIS REST layer、WKT geometry、TWD97 座標轉換與 marker clustering。
- 依登入角色控制可見圖層，例如雨水巡檢廠商 / 區公所與污水巡檢廠商看到的圖層不同。
- 透過可視範圍篩選 sewer-layer graphics，處理地圖渲染效能敏感情境。

### 營運儀表板與資料視覺化

證據：`Scripts/App/APPUNDERCON.ts`、`Scripts/App/APPFAC.ts`、`Scripts/App/APPFAC_realtime.ts`、統計 View，以及 Google Charts / Chart.js 搜尋結果。

- 以 FooTable 與 Chart.js pie chart 建構工程進度列表，呈現施工完成百分比。
- 透過 local storage 與 geometry payload，將工程定位操作導向施工範圍圖台頁。
- 整合即時或近即時污水廠水質資料，與放流水標準比較並以視覺狀態標示超標資料。
- 支援污水廠 detail workflow，包括圖表、CCTV / video 頁與 3D model 存取。

### 水肥 / 投料預約與額度流程

證據：`Scripts/FertilizerStation/ScheduledFertilizer.ts`、`Business_DailyFertilizerManagement.ts`、`FertilizerStationController.cs`、`SlurryController.cs` 與水肥站 Views / Styles。

- 處理三天到六十天的預約窗口、每日 08:00 後可預約、關廠日、補班日、週三 / 週日不可預約、證照過期檢查、禁投車輛檢查、公會 / 非公會投肥量限制等規則。
- 支援水肥站多個功能區：預約投肥、每日投料管理、清運紀錄、禁投管理、合約管理與料源類別管理。
- 使用 category-aware API，例如 `GetFACMAll`、`GetFACMLDByFACMId`、`FACMSummary`、`FertilizerBookingSpecialDate`、`ModifyFACMLD`。

### 現代化的事業水肥每日投料管理畫面

證據：`Views/FertilizerStation/Business_DailyFertilizerManagement.cshtml`、`Scripts/FertilizerStation/Business_DailyFertilizerManagement.ts`、`Content/Styles/FertilizerStation/Business_DailyFertilizerManagement.css`。

- 實作月曆 UI，按日顯示已預約與已投料量。
- 使用 typed response interfaces、可預期的 page-state management，以及初始化時集中取得 DOM references 並處理頁面結構錯誤。
- 平行讀取類別、額度、月份摘要與特殊日期資料，並用 `AbortController` 取消過期 request。
- 在插入動態公司名稱與數量到 table rows 前，透過 `EscapeHtml` helper 避免直接注入未轉義文字。
- 具備無障礙導向行為：有 label 的控制項、`aria-live` 額度摘要、quota popover 的 `aria-controls` / `aria-expanded`、dialog role / `aria-modal`、Escape 關閉、focus trap 與 focus restoration。
- CSS 包含 responsive 行為：小尺寸排版、月曆水平 overflow、mobile full-width action、mobile modal 尺寸調整。

### 共用瀏覽器工具與靜態資源交付

證據：`Scripts/Common.ts`、`App_Code/HtmlHelpers.cs`、`_Layout.cshtml`、`gulpfile.js`。

- 提供共用 datepicker、loading state、Excel 下載、圖片預覽、EXIF 擷取、viewer 初始化與 GIS WKT 轉換支援。
- 使用 server-side versioned asset URL，在靜態檔變更時降低瀏覽器快取風險。
- 使用專門的 TypeScript output folder 與 Gulp minification / bundling 管理編譯後 JavaScript 資產。

## 7. 最大前端挑戰

- **複雜角色矩陣：** 導覽與 route access 依 SystemAdmin、Sewage、RainWater、BOT、Supervisor、PCM、Constructors、SlurryAdmin、FertilizerGuild、FertilizerCompany、DistrictOffice、CableContractor 等多種角色改變。
- **空間型 UX 複雜度：** GIS 前端需要結合地圖圖層、政府底圖、污水 / 雨水幾何、巡檢 marker、WKT geometry、座標轉換、街景與 marker clustering。
- **營運規則正確性：** 水肥流程受日期、容量、證照有效性、公司類別、實際投料與特殊關廠 / 補班日曆限制。
- **Legacy 與現代化前端並存：** 程式碼同時存在舊式 jQuery-heavy scripts 與較新的 typed TypeScript modules。在不破壞既有行為下逐步改善結構，是有難度也有價值的工作。
- **功能面積大：** 專案有數百個 Views 與 Scripts，前端變更可能影響許多營運流程。
- **安全與隱私限制：** 系統處理登入後政府 / 廠商流程、檔案上傳、位置資料與營運紀錄。履歷敘述應避免揭露敏感 endpoint、credential 或私有營運細節。

## 8. 履歷 Bullet Bank

### 已有證據支持的保守版本

- Built and maintained TypeScript/jQuery frontend modules for a municipal sewer management platform with 250+ TypeScript files and 360+ Razor views across GIS, inspection, construction, statistics, and station-operation workflows.
- Implemented GIS-heavy user workflows using Google Maps, custom map-layer utilities, NLSC basemaps, ArcGIS service layers, WKT geometry, coordinate conversion, marker clustering, and street-view sewer asset overlays.
- Developed role-aware operational interfaces for sewer, rainwater, construction, inspection, and fertilizer/slurry station users, aligning visible navigation and page behavior with authenticated MVC role checks.
- Built fertilizer/slurry scheduling interfaces that validate booking windows, plant closure/makeup dates, license status, vehicle bans, and quota limits before users submit reservations.
- Delivered a monthly business fertilizer management calendar with TypeScript interfaces, parallel API loading, abortable requests, quota editing, responsive layout, and accessible modal/popover interactions.
- Integrated Chart.js, Google Charts, FooTable, DataTables, and map visualizations to present construction progress, inspection status, water-quality readings, and statistics dashboards.
- Improved frontend asset freshness by loading scripts and styles through MVC versioned content URLs based on file modification timestamps.

### 需要使用者補充確認或數據的強化版本

- Modernized the fertilizer-station frontend from legacy jQuery patterns toward typed, state-driven TypeScript modules, reducing maintenance effort by `[metric]` or improving change confidence across `[number]` workflows.
- Optimized GIS layer rendering by filtering visible sewer graphics and clustering markers, improving map responsiveness for `[asset count]` infrastructure records.
- Reduced booking errors or manual corrections by implementing frontend validation for capacity limits, license expiration, banned vehicles, and special-date scheduling rules.
- Improved accessibility of operational modals and quota controls by adding keyboard support, focus restoration, ARIA state, and responsive layouts, supporting WCAG-aligned internal UI standards.
- Supported deployment reliability by aligning TypeScript compilation, Gulp minification/bundling, versioned assets, and GitLab/MSBuild IIS publish workflows.

### 建議補上的指標

- 支援的正式市府 / 廠商角色數量。
- 正式環境顯示的 GIS 圖層數或基礎設施資料筆數。
- 地圖圖層切換前後的載入或互動時間。
- 水肥月曆 / 額度改善後，預約錯誤、客服問題或人工更正的下降比例。
- 管理的水肥類別、公司、車牌 / 證照、預約或每日紀錄數量。
- 個人實際負責或重構的頁面 / 模組數。

## 9. 面試可用談資

### 故事 1：市政規模的 GIS 營運介面

- **情境：** 內勤與外勤使用者需要從空間角度查看污水 / 雨水資產，以及相關工程或巡檢紀錄。
- **技術挑戰：** UI 必須結合 Google Maps、政府底圖、自訂 sewer layers、座標系統、WKT geometry、街景與角色化圖層權限。
- **行動：** 實作與維護 TypeScript map modules，初始化地圖行為、繪製圖層 / marker、篩選可視幾何、支援 TWD97 座標複製，並將地圖選取串接到 detail workflow。
- **需確認成果：** 資產查找更快、現場情境更清楚，或減少人工 GIS 轉交作業。

### 故事 2：在瀏覽器中處理水肥預約規則

- **情境：** 水肥站預約取決於政策規則、容量限制、車輛 / 證照狀態、公司類型與特殊營運日期。
- **技術挑戰：** 使用者送出無效預約前就需要即時回饋，同時後端 API 仍需作為最終規則 enforcement。
- **行動：** 建立 client-side validation 與 calendar-driven UI，檢查預約窗口、證照過期、禁投狀態、額度總量、關廠 / 補班日與類別化上限。
- **需確認成果：** 無效送出減少、站區排程更清楚，或行政更正工作降低。

### 故事 3：漸進式現代化 Legacy MVC 前端

- **情境：** 系統有大量既有 Razor / jQuery 頁面，但新畫面需要更好的可維護性與無障礙。
- **技術挑戰：** 完整重寫風險高，因此改善必須相容既有 MVC routing、shared layouts、compiled TypeScript output 與 vendor dependencies。
- **行動：** 以 typed models、明確 PageRefs、集中 PageState、abortable fetch、安全 render、可鍵盤操作的 modal / popover 與 responsive CSS 建立事業水肥每日管理畫面。
- **需確認成果：** 功能變更更容易、race-condition bug 減少，或鍵盤 / mobile 使用性提升。

### 面試官可能追問

- 你如何讓大量基礎設施資產的 map rendering 保持順暢？
- 水肥預約流程中，哪些驗證應放前端，哪些一定要由後端處理？
- 你如何避免舊 API response 覆蓋較新的 UI state？
- 在 legacy MVC / jQuery 專案中，你如何推動無障礙改善？
- TypeScript 檔案如何編譯並載入 Razor Views？
- 使用 local storage 做跨頁流程時，有哪些取捨？

## 10. 開放問題

- 哪些前端模組是使用者親自建置、維護或重構？
- 目前分支主要是在處理事業水肥每日投料管理畫面、Scheduled Fertilizer mapping 文件，還是更廣的水肥站前端修正？
- 哪些正式環境規模可以安全對外描述：使用者、角色、資料筆數、圖層數、每日預約量或管理設施數？
- 是否有前後對比指標：效能、無障礙、預約正確率、support tickets 或行政處理時間？
- 是否有官方英文專案名稱？若沒有，英文履歷可暫用描述式翻譯 `Taoyuan Sewer Cloud Smart Management System`。
- 是否有水肥月曆、GIS 圖台、工程進度列表或污水廠監測畫面的截圖可用於作品集 / 面試？

## 11. 下一步

- 確認個人貢獻範圍：哪些 module / screen 是親自實作、修改或主導。
- 補上可公開使用的指標，尤其是 GIS 圖層規模、預約 / 錯誤降低，以及負責畫面數。
- 擷取 GIS 圖台、水肥月曆、工程進度列表與污水廠監測儀表板截圖，用於 portfolio / interview。
- 使用部署成效敘述前，先確認事業水肥每日投料管理畫面是否已 merged、deployed 或仍在進行中。
- 目前可直接使用的保守 bullets：GIS workflows、TypeScript / MVC frontend modules、水肥預約驗證、事業水肥月曆、chart / dashboard integrations、versioned asset delivery。
- 使用前需要確認的 bullets：modernization impact、production scale、performance improvements、error reduction、accessibility compliance level。