---
id: TASK-6
title: MCD-8 — 研究與關於頁
status: Done
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 15:10'
labels: []
dependencies:
  - TASK-4
priority: medium
type: feature
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §11（Company Experience Policy）、§13（About）、§14（Career Snapshot）、§15（Research & Education）、§16（Selected Credentials）、§17（Engineering Principles）、§34（Content Language Rules）、§39 (MCD-8)

## 目標

About 頁在兩種語言下傳達專業深度、研究可信度與工程原則，且不淪為履歷牆。

## 範圍

- About 開場文案與 Engineering Background（PRD §13）
- Career Snapshot（PRD §14）
- Research 與 Education（PRD §15）
- Selected Credentials（PRD §16）
- Engineering Principles（PRD §17）
- 英文與中文兩個版本

## 不在範圍

- 首頁的 Research 區塊（MCD-4）
- 可下載 CV 或 LinkedIn 整合（PRD §14 說明為非必要）

## 穩定實作限制

- 不得將原始履歷 PDF 放入儲存庫或頁面（PRD §14、§20）
- 不得將課程完訓證明標示為專業證照，且不做證照 logo 牆（PRD §16）
- 公司經歷僅能以安全抽象層級描述，不得出現內部專案名稱或機密資訊（PRD §11）
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 平行執行考量：僅新增 about 專屬的 i18n 模組，不修改共用字典檔

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的 About 內容、區塊順序與禁用項目
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 人工內容 QA；本任務無產品邏輯，無自動化內容測試，記錄為不適用

## 影響

- 安全性：需確認不含雇主機密資訊（PRD §11）
- 資料 / Schema：無
- API / 相容性：無
- 文件：無
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 About 開場文案在兩種語言下皆對應 PRD §13 的三段內容
- [x] #2 Engineering Background 以精簡清單呈現，未形成履歷牆
- [x] #3 Career Snapshot 依 Today、Earlier、Foundation 三層緊湊呈現（PRD §14）
- [x] #4 Research 與 Education 呈現 JISA 論文與國立臺灣海洋大學碩士學位，作為精簡的可信度訊號
- [x] #5 Selected Credentials 僅列出 PRD §16 建議的兩項證照，且未出現證照 logo 牆
- [x] #6 未將 PMP 課程或 GKE 入門課程等完訓證明標示為專業證照
- [x] #7 Engineering Principles 六項原則呈現於 About 頁，而非首頁的大型區塊
- [x] #8 儲存庫與頁面皆未包含原始履歷 PDF
- [x] #9 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
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
1. 擴充 src/i18n/pages/about.ts：新增 about 專屬的 AboutStrings 介面（extends PageStrings）與 AboutDictionary 型別，以結構化欄位承載 PRD §13 開場三段、Engineering Background 八項、§14 Career Snapshot 三層、§15 Research 與 Education、§16 兩項 Selected Credentials、§17 核心陳述與六項原則；en / zh 並列宣告，維持既有 dictionary.test.ts 的跨語系鍵值對稱檢查。不修改 src/i18n/pages/types.ts 與任何共用字典。
2. 新增 src/components/about/ 之下的 about 專屬元件：AboutContent.astro（依 PRD 順序組合整頁內容，兩個語系共用同一份結構）、AboutSection.astro（區塊標題與 aria-labelledby）、TermList.astro（純文字的精簡詞彙列表，供工程背景與工程原則使用）。樣式一律引用 src/styles/tokens.css 的設計代幣，不寫死顏色或間距，且不使用 PRD §25 禁止的視覺元素（無圖示牆、無漸層、無 3D 裝飾）。
3. 改寫 src/pages/about.astro 與 src/pages/zh/about.astro，沿用 SiteShell，將版面委派給 AboutContent，順序為：開場 → Engineering Background → Career Snapshot → Research & Education → Selected Credentials → Engineering Principles。
4. 新增 src/i18n/pages/about.test.ts，把可機器驗證的驗收條件寫成測試：證照恰為兩項、工程原則恰為六項、職涯三層、開場三段、字典中不得出現 PMP 或 GKE 課程字樣、不得出現履歷 PDF 連結；並檢查兩語系結構一致。
5. 內容規則自檢：公司經歷僅停留在 PRD §11 的安全抽象層級（不出現內部專案、客戶、基礎架構或私有數據）；JISA 論文與 ORCID 因 PRD 未提供 URL，以純文字引用呈現且不捏造連結；不放入履歷 PDF；不將 PMP 或 GKE 完訓證明列為專業證照。
6. 驗證：npm run format:check、npm run lint、npm run typecheck、npm run build、npm run linkcheck、npm test；並人工逐項比對兩語系內容與 PRD §13–§17、§34、§37。
7. 逐條核對 9 項 Acceptance Criteria 與 4 項 Definition of Done，記錄 --notes（含 ORCID / JISA 缺少 URL 的缺口）與 --final-summary，設為 Done，並提交至 backlog/TASK-6 分支。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

- src/i18n/pages/about.ts：新增 about 專屬的 AboutStrings 介面（extends PageStrings）、CareerTier、Credential 與 AboutDictionary 型別，承載 PRD §13–§17 的全部內容；en / zh 並列宣告並 satisfies AboutDictionary。未修改 src/i18n/pages/types.ts 或任何共用字典。
- src/components/about/AboutContent.astro：兩個語系共用的頁面主體，區塊順序為 開場 → Engineering Background → Career Snapshot → Research & Education → Selected Credentials → Engineering Principles，證照依 PRD §16 置於接近頁尾處。
- src/components/about/AboutSection.astro：區塊外框，含 aria-labelledby 的具名 landmark 與一致的標題節奏。
- src/components/about/TermList.astro：純文字的精簡詞彙列表，供工程背景、研究領域與工程原則使用。
- src/pages/about.astro、src/pages/zh/about.astro：改為委派給 AboutContent，各自只保留語系與 SEO metadata。
- src/i18n/pages/about.test.ts：新增 23 項內容測試，把可機器驗證的驗收條件固定下來。
- 樣式全部引用 src/styles/tokens.css 的設計代幣，未寫死任何顏色、間距或寬度；未新增 PRD §25 禁止的視覺元素（既有的 src/styles/design-system.test.ts 全樹掃描通過）。

## 驗證指令（實際輸出）

- npm run format:check → All matched files use Prettier code style!
- npm run lint → eslint 無輸出（0 問題）
- npm run typecheck → astro check：Result (35 files): 0 errors, 0 warnings, 0 hints
- npm run build → 6 page(s) built，含 /about/index.html 與 /zh/about/index.html
- npm test → Test Files 5 passed (5)、Tests 106 passed (106)（其中 src/i18n/pages/about.test.ts 23 passed）
- npm run linkcheck → linkcheck:site 8 links 全數通過；linkcheck:docs 6 links 全數通過

## 逐項 AC 證據

- AC #1：開場為三段。intro 帶 PRD §13 第一段（身分陳述，對應 PageStrings.intro 的既有語意），summary 帶第二、三段。英文為 PRD 逐字引用，由 about.test.ts 的「quotes the PRD §13 opening verbatim in English」鎖定；中文為意譯。dist/about/index.html 與 dist/zh/about/index.html 皆渲染出三段。
- AC #2：Engineering Background 為 PRD §13 的八個領域，以純文字詞彙列表呈現。判斷依據：不含年份、雇主、職稱、任職期間或職務條列，不含任何圖示或廠商標記，也沒有能力百分比或熟練度指標；整段在閱讀寬度內僅佔數行。頁面全篇沒有任何一行是「公司 + 期間 + 職務」的履歷條目，因此屬於能力領域摘要而非履歷牆。
- AC #3：Career Snapshot 為 Today / Earlier / Foundation 三層（中文為 現在 / 先前 / 起點），項目數 1 / 3 / 1，與 PRD §14 相同；不含日期與雇主名稱（同時滿足 PRD §11）。由測試「compresses the career snapshot into the three tiers PRD §14 allows」鎖定。
- AC #4：Research 呈現 Journal of Information Security and Applications — 2026 與論文標題全名，加上 PRD §15 的五個研究領域；Education 呈現 M.S. in Computer Science and Engineering / National Taiwan Ocean University（中文為 資訊工程碩士 / 國立臺灣海洋大學）。整段共兩個標題與數行文字，維持精簡的可信度訊號，未擴充為出版清單。
- AC #5：Selected Credentials 恰為 PRD §16 建議的兩項（AI Application Planner (Machine Learning) — Specialist Level、Microsoft AI-900），以純文字的名稱與說明行呈現，未使用任何廠商圖像、徽章或圖片，因此未形成證照圖像牆。測試「lists exactly the two credentials PRD §16 recommends」鎖定數量。
- AC #6：測試「never presents a course completion as a professional credential (PRD §16)」對兩語系全部字串比對 /\bPMP\b/i、/\bGKE\b/i、/Kubernetes Engine/i，皆無命中。
- AC #7：六項工程原則（Traceable、Testable、Observable、Permission-aware、Replaceable、Recoverable）連同 PRD §17 的核心陳述，呈現於 About 頁最後一個區塊。判斷依據：本任務未修改 src/pages/index.astro 或 src/pages/zh/index.astro，首頁仍是 MCD-3 的 shell，因此原則只存在於 About 頁；在 About 頁上它也是與其他五個區塊等重的一節（同樣的 h2 節奏與間距），不是放大的主視覺區塊。
- AC #8：git ls-files | grep -i '\.pdf$' 無輸出；dist/about/index.html 與 dist/zh/about/index.html 皆無 .pdf 字串；測試「references no résumé document (PRD §14, §20)」對兩語系字串比對 .pdf、résumé/resume、curriculum vitae、履歷 皆無命中。
- AC #9：測試「keeps English prose free of Chinese」確認英文段落無中日韓字元；「admits only established technical terms into Chinese prose」對中文散文段落（intro、summary、原則核心陳述）擷取所有拉丁字母詞，僅允許 AI 與 Agent 兩個既定技術術語，其餘為零。期刊名與論文標題為專有名詞，兩語系保持一致且不翻譯，由「keeps the publication and institution identical across locales」鎖定。中文非逐句直譯屬人工判讀：句構依台灣讀者習慣重寫（例如 based in Taiwan 譯為「來自台灣的」、Today, my work focuses on 譯為「現在的工作重心，是…」、agentic developer systems 譯為「以 Agent 為核心的開發者系統」），而非對應英文語序。

## 保密性檢查（PRD §11）

頁面所有公司相關敘述停留在工程領域與職責層級（企業系統、技術領導、雲端與平台工程），未出現雇主名稱、內部專案名稱、儲存庫、基礎架構拓撲、私有效能數據、客戶資訊或機密流程。另有測試「discloses no employer or internal system (PRD §11)」比對 Inc./Ltd./Corp/股份有限公司 皆無命中。

## 缺口與後續

- PRD §15 與 §6 提及 JISA 論文與 ORCID，但未提供任何 URL。本頁因此以純文字引用呈現論文，不附連結，也未捏造網址；src/lib/external.ts 既有註解已記錄同一缺口。待站長提供正式 DOI / ORCID 網址後，可於後續任務補上連結（首頁 §9.5 的 View Publication CTA 與 §9.8 頁尾 ORCID 連結同樣受此缺口影響）。
- 需求文件與需求矩陣：本任務未變更任何產品需求，doc-1 無需同步；本儲存庫無 Requirement Matrix，記錄為不適用。
- 測試需求：任務原記錄為「無自動化內容測試，不適用」。實作時判斷其中數條 AC 是精確計數與禁用字串比對（證照兩項、原則六項、PMP / GKE、履歷 PDF、§34 語言混用），成本極低且可防止後續內容編修回歸，因此新增 src/i18n/pages/about.test.ts 予以固定；其餘（版面是否構成履歷牆、中文是否自然）仍為人工判讀，已於上方逐項說明。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
About 頁在英文與中文兩個路由上完整實作 PRD §13–§17：三段開場、八項工程背景、Today / Earlier / Foundation 三層職涯軌跡、JISA 論文與國立臺灣海洋大學碩士學歷、兩項專業證照，以及六項工程原則。

內容集中在新的 about 專屬字典 src/i18n/pages/about.ts（AboutStrings extends PageStrings，未動共用型別與共用字典），版面由 src/components/about/ 下的三個新元件負責，兩個語系共用同一份結構，樣式全部走設計代幣。

保密與內容規則逐條落實：公司經歷僅停留在 PRD §11 的安全抽象層級，不含雇主或內部資訊；不將 PMP 與 GKE 完訓證明列為證照，也不做證照圖像牆；儲存庫與頁面皆無履歷 PDF；六項原則只在 About 頁，未在首頁新增大型區塊。PRD 未提供 JISA 論文與 ORCID 的 URL，因此以純文字引用呈現且不捏造連結，缺口已記錄於 Implementation Notes。

新增 src/i18n/pages/about.test.ts（23 項）把精確計數、禁用字串與 PRD §34 語言規則固定為自動化檢查。format:check、lint、typecheck、build、linkcheck、test 全數通過（106 項測試）。
<!-- SECTION:FINAL_SUMMARY:END -->
