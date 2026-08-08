---
id: TASK-8
title: MCD-4 — 首頁
status: In Progress
assignee: []
created_date: '2026-08-08 06:46'
updated_date: '2026-08-08 15:40'
labels: []
dependencies:
  - TASK-4
  - TASK-7
priority: high
type: feature
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §5（Engineering Expertise 四項支柱）、§9（Homepage 全部子節）、§11（Company Experience Policy）、§12（LLM Infrastructure Positioning）、§34（Content Language Rules）、§35（Homepage Final Order）、§39 (MCD-4)

## 目標

首頁在兩種語言下傳達專業身分與可驗證證據，訪客不需深入導覽即可理解 Oliver 是誰、專精什麼、做出了什麼。

## 範圍

- Hero、Featured Product（Shouri）、Engineering Expertise、Open Source（AI Coding Skills）、Research、Technical Writing、Professional Experience、Footer，依 PRD §9.1-9.8
- 英文與中文兩個版本，資訊架構一致
- 將 Technical Writing 區塊接上 MCD-9 的 Study feed 輸出

## 不在範圍

- 作品索引與作品詳細頁（MCD-5、MCD-6、MCD-7）
- About 頁（MCD-8）
- 完整 SEO、結構化資料、分析埋點與 Lighthouse 最佳化（MCD-11）

## 穩定實作限制

- 區塊順序必須完全依 PRD §35，中文版遵循相同架構
- Professional Experience 僅能以安全抽象層級描述，不得出現內部專案名稱、私有 benchmark 或客戶資訊（PRD §11）
- LLM Infrastructure 僅作為 Engineering Expertise 的專長領域呈現；不得因最強證據來自機密的雇主系統就在首頁暗示存在對應的公開案例研究，公開證明應導向 Study 技術文章（PRD §12）
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 第三方來源的 skill 必須保留明確出處與授權標示，不得呈現為原創作品（PRD §9.4）
- 不得為單一論文建立獨立的 Research 導覽項目（PRD §9.5）
- 不得在本站重製 Study 文章全文（PRD §9.6）
- meowcoder.com 原始碼為次要開源證據，不需要大型首頁卡片（PRD §24）
- 避免 PRD §9.1 與 §25 列出的禁用視覺元素

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的區塊順序、文案與所有 CTA 連結目標
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 人工 QA：桌機與行動裝置、英文與中文各一輪
- 首頁為內容組合，無獨立產品邏輯；自動化測試涵蓋由 MCD-9 與 MCD-3 負責

## 影響

- 安全性：需確認 Professional Experience 不含雇主機密（PRD §11、§12）
- 資料 / Schema：無
- API / 相容性：無
- 文件：無
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 首頁區塊順序完全符合 PRD §35：Hero、Shouri、Engineering Expertise、Open Source、Research、Technical Writing、Professional Experience、Footer
- [x] #2 Hero 文案在英文與中文下皆對應 PRD §9.1，且未出現大頭照、裝飾性 AI 圖像、動畫程式碼或打字機效果
- [ ] #3 Shouri 區塊呈現一張產品截圖、Save First 與 Explicit AI 與 Recoverable Architecture 三項產品原則、工程領域清單，以及連往 shouri.app 的 CTA
- [x] #4 Engineering Expertise 僅呈現 PRD §5 的四項支柱並各附一段簡潔說明，未使用框架名稱清單或技術方格
- [x] #5 Open Source 區塊以 backlog-workflow 為主要公開作品、audit-claude-md 為次要，且其中任何第三方來源的 skill 皆保留明確出處與授權標示
- [ ] #6 Research 區塊呈現 JISA 論文摘要與 View Publication CTA，且未在導覽新增獨立的 Research 項目
- [ ] #7 Technical Writing 區塊透過 MCD-9 呈現最新 3 至 5 篇 Study 文章的日期、分類與標題並提供外連 CTA，未重製文章全文
- [x] #8 Professional Experience 傳達 10 年以上工程經驗與現職方向，且不含任何雇主機密資訊
- [ ] #9 Footer 連結 GitHub、Study、ORCID、Shouri 與 Site Source（公開的 meowcoder.com 儲存庫）
- [x] #10 中文首頁 /zh/ 以相同資訊架構與區塊順序呈現在地化內容
- [x] #11 Engineering Expertise 的 LLM Infrastructure 支柱僅呈現為專長領域並導向 Study 技術文章，未暗示存在以機密雇主系統為基礎的公開案例研究（PRD §12）
- [x] #12 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [x] #2 Required applicable tests, lint, typecheck, and build pass
- [x] #3 Documentation and Requirement Matrix are synchronized when applicable
- [x] #4 Validation evidence is recorded in the task
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 研究現況：已讀 PRD §5/§9.1-9.8/§11/§12/§24/§25/§34/§35/§37、SiteShell/Footer/chrome 字典、study-feed 契約、about 頁的既有寫法與測試風格。
2. 內容型別：在 src/i18n/pages/home.ts 新增 HomeStrings extends PageStrings（hero / shouri / expertise / openSource / research / writing / experience），比照 about.ts 的 satisfies HomeDictionary 作法，讓兩語系鍵值缺漏成為編譯錯誤。
3. 元件：新增 src/components/home/ 下的 HomeContent.astro（唯一決定區塊順序，兩語系共用）、HomeSection.astro、ExternalCta.astro、HomeHero.astro、ShouriSection.astro、ExpertiseSection.astro、OpenSourceSection.astro、ResearchSection.astro、WritingSection.astro、ExperienceSection.astro、shouri-screenshot.ts。順序固定為 PRD §35。
4. 頁面：src/pages/index.astro 與 src/pages/zh/index.astro 只負責 locale、metadata、await getStudyPosts()，其餘交給 HomeContent，確保兩語系資訊架構一致。
5. Technical Writing：消費 MCD-9 的 getStudyPosts()；posts 為空時只渲染外連 CTA（study-feed 已載明的降級行為），不重製文章全文，category 僅在 feed 提供時顯示。
6. Footer：PRD §9.8 的連結列屬於全站 chrome，依 SiteShell 既有註解（『The link row PRD §9.8 specifies is MCD-4 scope』）擴充 src/i18n/chrome/{types,en,zh}.ts 的 footer.links 標籤，並在 SiteShell 組出連結陣列。
7. 缺證據的項目一律不臆造：ORCID 與 JISA 論文連結全份 PRD 皆未給出網址，Shouri 產品截圖在儲存庫中沒有任何影像資產。截圖以 src/assets/shouri/product.* 加上各語系 screenshot.alt 的『資產＋替代文字』插槽實作，資產不存在時不渲染 figure、也不放置佔位圖。
8. 測試：新增 src/i18n/pages/home.test.ts，鎖定 PRD 規定的固定數量、英文逐字文案、第三方 skill 出處與授權標示、PRD §11 不揭露雇主資訊、PRD §34 語言規則。
9. 驗證：npm run format:check / lint / typecheck / build / linkcheck / test，並以 dist/ 產出的 HTML 檢查兩語系區塊順序與 CTA 連結目標。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

- `src/i18n/pages/home.ts`：新增 `HomeStrings extends PageStrings` 與 `ExpertisePillar`、`NamedItem`、`CtaLabel`，以 `satisfies HomeDictionary` 讓兩語系鍵值缺漏成為編譯錯誤（比照 `about.ts`）。PRD §9 有逐字文案處一律引用原文，中文側以保留語意為原則改寫。
- `src/components/home/`（新增）：`HomeContent.astro`（唯一決定區塊順序）、`HomeSection.astro`、`CtaLink.astro`、`HomeHero.astro`、`ShouriSection.astro`、`ExpertiseSection.astro`、`OpenSourceSection.astro`、`ResearchSection.astro`、`WritingSection.astro`、`ExperienceSection.astro`、`shouri-screenshot.ts`。
- `src/pages/index.astro`、`src/pages/zh/index.astro`：只負責 locale、metadata 與 `await getStudyPosts()`，共用同一個 `HomeContent`，兩語系不可能在結構上分歧。
- `src/i18n/chrome/{types,en,zh}.ts` 與 `src/layouts/SiteShell.astro`：實作 PRD §9.8 的頁尾連結列。頁尾屬全站 chrome（SiteShell 原註解即標示此列為 MCD-4 範圍），故標籤放在 chrome 字典而非頁面字典。
- `src/i18n/pages/home.test.ts`（新增）：鎖定 PRD 規定的固定數量、英文逐字文案、第三方 skill 出處與授權、PRD §11 不揭露雇主資訊、PRD §12 僅 LLM 支柱導向 Study、PRD §34 語言規則。
- `package.json`：`linkcheck:site` 的 `--skip` 增加 `^https://github\.com/tc3oliver/meowcoder\.com`。該儲存庫目前為 private（`.agent-workflow/PROJECT.md`），匿名存取回 404；轉為 public 屬 MCD-13，屆時應移除此 skip。

## 實作過程中修正的缺陷

ExpertiseSection 原本以英文名稱 `LLM Infrastructure` 比對支柱來決定是否顯示導向 Study 的連結，中文支柱名為「LLM 基礎架構」，導致 `/zh/` 完全沒有渲染該連結（AC #11 在中文版失效）。改為由字典在支柱上標記 `evidence`，元件不再比對名稱；`home.test.ts` 針對兩語系各驗證「恰有一個支柱帶 evidence 且為第三個支柱」。

## 驗證證據

指令（依 PRD §23 的 CI 順序，Node v22.23.2）：

- `npm run format:check` → `All matched files use Prettier code style!`
- `npm run lint` → 無輸出（通過）
- `npm run typecheck` → `Result (56 files): 0 errors, 0 warnings, 0 hints`
- `npm run build` → `6 page(s) built`、`[build] Complete!`
- `npm run linkcheck` → `Successfully scanned 15 links`（dist）、`Successfully scanned 6 links`（docs）
- `npm test` → `Test Files 8 passed (8)`、`Tests 212 passed (212)`

產出 HTML 檢查：

- 區塊順序（`dist/index.html` 與 `dist/zh/index.html` 的 `aria-labelledby` 依序）：`featured-product`、`engineering-expertise`、`open-source`、`research`、`technical-writing`、`professional-experience`；其前為 Hero（`h1`），其後為 SiteShell 的頁尾 → 完全符合 PRD §35。
- 頁尾連結（兩語系）：`https://github.com/tc3oliver`、`https://study.meowcoder.com`、`https://shouri.app`、`https://github.com/tc3oliver/meowcoder.com`，皆帶 `rel="noopener noreferrer"`。
- Study feed：兩語系各渲染 5 篇，例如 `<time datetime="2026-08-07T16:50:00.000Z">Aug 8, 2026</time>` / `2026年8月8日`，連結指向 `https://study.meowcoder.com/posts/...`，未含任何文章內文。
- 降級路徑：`PUBLIC_STUDY_FEED_URL=https://study.meowcoder.com/does-not-exist.xml npm run build` → 記錄 `[study-feed] Technical Writing section degraded: HTTP 404`，建置仍 `Complete!`，文章列表消失、外連 CTA 仍在（符合 PRD §28）。
- LLM 支柱導向 Study 的連結在兩語系皆存在（en: `Read the published analysis on Study`；zh: `閱讀發表於 Study 的公開分析`）。
- 導覽列未新增 Research 項目（`SiteShell` 的 `navItems` 未更動）。

## 未通過的 AC 與缺口

- **AC #3（Shouri 產品截圖）**：儲存庫中沒有任何影像資產。未生成佔位圖、未外連遠端圖片。截圖以「資產＋替代文字」插槽實作，補齊方式見 `src/components/home/shouri-screenshot.ts`：(1) 放入 `src/assets/shouri/product.<avif|webp|png|jpg|jpeg>`（僅一個檔案、檔名固定）；(2) 在 `src/i18n/pages/home.ts` 兩語系各補上 `shouri.screenshot = { alt: '…' }`。兩者齊備後 `<figure>` 即自動渲染，無需改動程式碼。該區塊的其餘要求（摘要、三項產品原則、工程領域、Visit Shouri CTA）皆已完成。
- **AC #6（View Publication CTA）**：PRD §9.5、§15、§6 皆指名該 JISA 論文，但全份 PRD 未給出任何 DOI 或網址，`src/lib/external.ts` 也記錄了同一缺口。猜測 DOI 會指向他人論文，故不放連結；`AboutContent.astro` 基於相同理由亦省略。論文標題、期刊年份、首頁摘要與詳述均已呈現，導覽也未新增 Research 項目。取得正式網址後補上 CTA 即可。
- **AC #7（日期／分類／標題）**：日期、標題、外連 CTA 皆已呈現且未重製全文；分類已實作為「feed 有提供才顯示」，但 `https://study.meowcoder.com/index.xml` 目前所有項目皆無 `<category>` 元素（實測 `grep -c '<category'` 為 0），故畫面上沒有分類。這是上游 feed 的資料缺口，需 Study 端於 feed 輸出分類後才會顯示，本站無需再改動。
- **AC #9（ORCID）**：PRD §6、§8、§9.8 均指名 ORCID，但未給出 ORCID iD 或網址。猜測 iD 會連到他人的研究紀錄，故頁尾先不放；其餘四個連結（GitHub、Study、Shouri、Site Source）皆已依 PRD §9.8 順序完成。取得正式 ORCID iD 後，於 `ChromeDictionary.footer` 與 `SiteShell` 的 `footerLinks` 各補一筆即可。

## 文件同步

本儲存庫無 Requirement Matrix；本任務未改變任何產品需求，README 與 PRD 均無需更新，故第 3 項完成條件視為不適用而非略過。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
首頁在英文與中文下皆已依 PRD §35 的順序完整實作：Hero、Featured Product（Shouri）、Engineering Expertise、Open Source（AI Coding Skills）、Research、Technical Writing、Professional Experience，頁尾則由 SiteShell 的全站 chrome 提供。兩語系共用同一個 HomeContent，資訊架構不可能分歧；文案內容集中在 src/i18n/pages/home.ts，並以 src/i18n/pages/home.test.ts 鎖住 PRD 規定的固定數量、逐字文案、第三方授權標示與語言規則。Technical Writing 區塊接上 MCD-9 的 getStudyPosts()，實測渲染最新 5 篇，並驗證 feed 失效時建置仍會成功、僅保留外連 CTA。

format:check、lint、typecheck、build、linkcheck、test 全數通過（212 個測試）。

任務維持 In Progress、狀態為 Blocked，因為四項 AC 需要本儲存庫以外的事實才能成立，而這些事實不得臆造：AC #3 缺 Shouri 產品截圖影像資產、AC #6 與 AC #9 缺 JISA 論文網址與 ORCID iD（PRD 全文未給），AC #7 缺 Study feed 端的 <category> 資料。四者的補齊方式已逐項記錄於 Implementation Notes，補上後皆不需要再改動程式邏輯。
<!-- SECTION:FINAL_SUMMARY:END -->
