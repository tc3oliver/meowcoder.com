---
id: TASK-9
title: MCD-6 — Shouri 案例研究
status: Done
assignee: []
created_date: '2026-08-08 06:46'
updated_date: '2026-08-08 15:38'
labels: []
dependencies:
  - TASK-5
priority: medium
type: feature
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §4（Evidence Model）、§9.2、§10（Work — Shouri 詳細結構）、§34（Content Language Rules）、§37（Content Quality Rule）、§39 (MCD-6)

## 目標

以 MCD-5 的內容模型在兩種語言下發佈 Shouri 案例研究，作為網站的主要 Product Proof。

## 範圍

- src/content/work/en/shouri 與 src/content/work/zh/shouri 內容檔
- PRD §10 要求的全部區塊：Problem、Product Principles、Architecture、Engineering Decisions、AI Processing、Search & Retrieval、Mobile / PWA Integration、Production Considerations、Result、Evidence

## 不在範圍

- 首頁的 Shouri 摘要區塊（已由 MCD-4 完成）
- AI Coding Skills 案例研究（MCD-7）

## 穩定實作限制

- 僅呈現可公開檢視的證據（PRD §10、§38 第 10 點）
- 不得包含雇主機密、專有原始碼或未發佈的產品資訊（PRD §20）
- 內容品質須符合 PRD §37：以工程證據取代行銷形容詞
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 平行執行考量：本任務僅新增 shouri 的內容檔，不修改共用版面或字典

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的區塊完整性與語言切換對應
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 內容須通過 MCD-5 的 content schema 驗證（build time 強制）
- 人工內容 QA

## 影響

- 安全性：需確認不含機密或未發佈資訊
- 資料 / Schema：無（使用 MCD-5 既有 schema）
- API / 相容性：新增 /work/shouri 與 /zh/work/shouri 兩個公開 URL
- 文件：無
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Shouri 作品詳細頁在英文與中文下皆發佈，且包含 PRD §10 要求的全部區塊：Problem、Product Principles、Architecture、Engineering Decisions、AI Processing、Search & Retrieval、Mobile/PWA Integration、Production Considerations、Result、Evidence
- [x] #2 內容支撐 Shouri 作為主要 Product Proof 的定位，展現端對端產品執行力（PRD §4、§9.2）
- [x] #3 內容僅包含可公開檢視的證據，不含雇主機密、專有原始碼或未發佈的產品資訊
- [x] #4 /work/shouri 與 /zh/work/shouri 可透過語言切換正確互相對應
- [x] #5 兩種語言的內容皆通過 MCD-5 的 content schema 驗證
- [x] #6 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
- [x] #7 內容符合 PRD §37：每項主張以工程證據支撐，未使用行銷形容詞堆砌
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance Criteria all pass
- [x] #2 Required applicable tests, lint, typecheck, and build pass
- [x] #3 Documentation and Requirement Matrix are synchronized when applicable
- [x] #4 Validation evidence is recorded in the task
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## 來源盤點（先做，決定內容邊界）

1. PRD 權威素材：§9.2（Save First / Explicit AI / Recoverable Architecture、工程領域清單）、§10（十個必要區塊與 Type: Product · AI Systems）、§4（Shouri = Product Proof）、§34（語言規則）、§37（工程證據優先）、§20（不得揭露未發佈或機密資訊）。
2. 公開可驗證素材：shouri.app 首頁與 /pricing、/privacy、/terms、/refund 四份公開政策頁（最後更新 2026-08-03）。以此取得三段狀態流程、原始內容與 AI 結果分離、AI 預設關閉與首次使用才詢問同意、私有物件儲存與短效簽章連結、30 天垃圾桶與每日排程永久刪除、工作階段權杖僅存雜湊、依內容長度計費與整理前顯示花費、Free/Pro 各項分析上限、iOS Apple 捷徑與 Android PWA 兩條分享路徑、搜尋顯示命中段落、Review 佇列優先序、第三方處理者類別。
3. 明確排除：不寫任何未公開的技術堆疊、服務供應商名稱、模型名稱、基礎架構細節、延遲/準確率/使用者數等營運數據。公開頁面只寫「AI 服務供應商」「雲端儲存與主機」等類別，案例研究就停在同一層級。

## 實作步驟

1. 依 src/content/work/README.md 與 src/lib/work.ts 的 schema，新增 src/content/work/en/shouri.md 與 src/content/work/zh/shouri.md。frontmatter：slug/translationKey 皆為 shouri、order 0、draft false、locale 與目錄一致、type 為 'Product · AI Systems' 與 '產品 · AI 系統'。
2. 內文以 ## 起始，依 PRD §10 順序寫滿十個區塊：Problem、Product Principles、Architecture、Engineering Decisions、AI Processing、Search & Retrieval、Mobile / PWA Integration、Production Considerations、Result、Evidence。
3. 每個區塊只寫 PRD 明載或 shouri.app 公開頁面可驗證的內容；每項主張對應一項可檢視的產品行為或公開政策條文，不使用行銷形容詞。
4. Result 區塊只陳述已上線範圍與目前階段（Free 已開放、Pro NT$199/月且訂閱即將開放、測試期間），並明講營運數據未公開、本頁不引用。
5. Evidence 區塊列出 shouri.app 與四份公開政策頁連結，並說明刻意不揭露的資訊類別（PRD §20）。
6. 中英文各自撰寫而非逐句翻譯：英文精簡、技術可信；中文為台灣讀者自然語感。同一段落不混用語言，例外僅限 Shouri / 收理、產品名與既定技術術語（AI、PWA、PDF）。
7. 不使用表格（.prose 未定義表格樣式），分級上限改以清單呈現，避免動到共用樣式。

## 驗證

1. npm run format:check、npm run lint、npm run typecheck、npm test、npm run build（PRD §23 順序）。
2. build 通過即代表 MCD-5 schema 與 assertWorkContentIsConsistent 的四項跨語系不變式成立（AC #5）。
3. 檢查 dist 產出 /work/shouri/index.html 與 /zh/work/shouri/index.html，確認十個區塊標題齊備（AC #1）、語言切換 hreflang 互指（AC #4）。
4. 人工逐句核對每項主張的來源（AC #2、#3、#6、#7）。

## 不做

- 不修改 src/content.config.ts、src/lib、src/layouts、src/components、src/i18n、src/pages、src/styles。
- 不新增 ai-coding-skills 內容（MCD-7 / TASK-10 範圍）。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

新增兩個內容檔，未動任何共用程式碼、版面或字典：

- src/content/work/en/shouri.md（title 'Shouri / 收理'、type 'Product · AI Systems'、order 0）
- src/content/work/zh/shouri.md（title '收理 Shouri'、type '產品 · AI 系統'、order 0）

兩檔 slug 與 translationKey 皆為 shouri，依 PRD §10 順序寫滿十個區塊：Problem / Product Principles / Architecture / Engineering Decisions / AI Processing / Search & Retrieval / Mobile / PWA Integration / Production Considerations / Result / Evidence。

## 素材邊界（PRD §20、§37）

內容只採用兩類來源：doc-1 §9.2 的三條產品原則，以及 shouri.app 首頁與 /pricing、/privacy、/terms、/refund 四份公開政策頁（皆標示最後更新 2026 年 8 月 3 日）。可據此撰寫的具體工程事實包括：三段狀態流程、原始內容與 AI 結果分離、AI 預設關閉且首次使用才詢問同意、私有物件儲存與短效簽章連結、三十天垃圾桶與每日排程永久移除、工作階段與裝置權杖僅存雜湊、依內容長度計費並於整理前顯示估計花費、超過分析上限只截斷本次整理而不丟棄原始內容、Free/Pro 各項分析與儲存上限、iOS Apple 捷徑與 Android PWA 兩條分享路徑、搜尋顯示命中段落、Review 佇列的四項優先序、第三方處理者類別、濫用頻率上限、以現狀提供的可用性聲明、管理者僅見彙總統計、計費異常以補開通優先。

刻意不寫且已在 Evidence 區塊聲明：實作技術堆疊、服務供應商與模型名稱、基礎架構細節，以及使用者數、處理量、延遲、準確率等營運數據。公開文件只以類別描述第三方（「AI 服務供應商」「雲端儲存與主機」），案例研究即停在同一層級。Result 區塊改為陳述已上線範圍與目前階段（Free 已開放、Pro 月費 NT$199 且訂閱即將開放、測試期間限時優惠），並明講營運數據未公開、本頁不引用。

## 驗證證據

依 PRD §23 順序執行，全數通過：

- npm run format:check → All matched files use Prettier code style!
- npm run lint → eslint . 無輸出（0 問題）
- npm run typecheck → astro check：Result (44 files): 0 errors, 0 warnings, 0 hints
- npm run build → 8 page(s) built，含 /work/shouri/index.html 與 /zh/work/shouri/index.html
- npm test → Test Files 7 passed (7)，Tests 178 passed (178)

AC 逐項證據：

- AC #1：dist 產出的 h2 標題依序為 Problem / Product Principles / Architecture / Engineering Decisions / AI Processing / Search & Retrieval / Mobile / PWA Integration / Production Considerations / Result / Evidence；中文版對應 問題 / 產品原則 / 架構 / 工程決策 / AI 處理 / 搜尋與檢索 / 行動裝置與 PWA 整合 / 上線與維運考量 / 成果 / 證據。兩邊各十個、順序一致。
- AC #2：內容自問題、產品原則、架構切分、工程決策取捨，一路到 AI 處理、檢索設計、雙平台整合、計量與資料生命週期、計費異常修復與已上線範圍，涵蓋端對端產品執行。
- AC #3：每項主張均可回溯至 shouri.app 或其四份公開政策頁；無雇主機密、專有原始碼或未發佈資訊。
- AC #4：/work/shouri/ canonical 為 https://meowcoder.com/work/shouri/，/zh/work/shouri/ canonical 為 https://meowcoder.com/zh/work/shouri/；兩頁 hreflang en / zh-Hant / x-default 互指一致，語言切換 nav 的 href 分別為 /work/shouri/ 與 /zh/work/shouri/。兩語系 Work 索引也各自連到對應路徑。
- AC #5：astro build 通過即代表 workEntrySchema 與 assertWorkContentIsConsistent 的四項跨語系不變式（路徑對應、slug↔translationKey 一對一、每個 translationKey 在兩語系皆存在、order/draft 一致）全部成立。
- AC #6：英文檔全文僅 frontmatter title 出現中文，即 PRD §34 明列的 Shouri / 收理 雙語識別例外；中文檔的拉丁字元經清點後僅有 AI、PWA、PDF、GB、MB、NT、Free、Pro、Review、Google、Safari、Android、iPhone、iPad、Apple、App、App Store、Shouri 與 shouri.app 連結，全數屬產品名、平台專有名詞或既定技術術語。兩語系各自撰寫，非逐句直譯。
- AC #7：全文無行銷形容詞堆砌；每條工程決策附上它保護的失效模式與代價。撰寫過程中修正兩處精確度問題：20,000 字上限適用範圍補上「文字」，以及移除一句未經量測的同意率推論。

## 完成條件補充

文件同步：本任務未變更任何文件或需求來源，專案亦無 Requirement Matrix，記為不適用。
交付流程：依平行執行政策，本任務僅提交至 backlog/TASK-9，不推送、不合併。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
以 MCD-5 的內容模型新增 Shouri 案例研究的英文與中文內容檔，僅動 src/content/work/**，未修改任何共用程式碼、版面或字典。兩語系皆依 PRD §10 寫滿十個必要區塊，內容全部取自 doc-1 §9.2 與 shouri.app 及其四份公開政策頁，符合 PRD §20 只呈現可公開檢視證據的要求，並依 PRD §37 以工程證據取代行銷語言；未公開的技術堆疊、供應商、模型與營運數據一律不寫，且在 Evidence 區塊明白聲明此邊界。format:check、lint、typecheck、build、test 全數通過，/work/shouri 與 /zh/work/shouri 的 canonical、hreflang 與語言切換互指皆已驗證。
<!-- SECTION:FINAL_SUMMARY:END -->
