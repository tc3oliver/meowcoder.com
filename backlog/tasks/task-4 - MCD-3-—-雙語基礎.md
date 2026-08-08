---
id: TASK-4
title: MCD-3 — 雙語基礎
status: In Progress
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 14:45'
labels: []
dependencies:
  - TASK-2
priority: high
type: feature
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §7（Bilingual Strategy，含 SEO for bilingual pages）、§8（Information Architecture，含主導覽定義）、§27（Localization Architecture）、§39 (MCD-3)

## 目標

雙語路由、型別化 i18n 字典、主導覽與語言切換、在地化 SEO metadata 在空白頁殼上正確運作，供後續內容任務直接填入。

## 範圍

- 英文預設路由與 /zh/ 路由，依 PRD §7-8
- 型別化語系字典（src/i18n/en.ts、src/i18n/zh.ts 及其分區模組）
- 主導覽項目，嚴格依 PRD §8 定義
- Header 語言切換，保留對應頁面
- 每個路由的 canonical、hreflang（en、zh-Hant）、x-default、在地化 title / description 與在地化 Open Graph metadata
- 作品項目的穩定 slug 與翻譯 key 對應機制（PRD §27）

## 不在範圍

- 佔位以外的實際頁面內容（MCD-4 起）
- 結構化資料、sitemap、robots 與全站 metadata 稽核（MCD-11）

## 穩定實作限制

- 僅在 build time 在地化，不使用 client-side runtime 翻譯（PRD §27）
- 不得依瀏覽器語言自動轉址；URL 必須穩定可分享（PRD §7）
- 主導覽不得新增 PRD §8 禁止的頂層項目：Blog、Notes、Categories、Tags、Archive、Skills、Certifications、Research、Resume；研究、證照與職涯脈絡只能放在既有的策展頁面內
- 專有名詞不翻譯：Oliver Yu、Shouri / 收理、Astro、vLLM、ROCm、MCP、Backlog.md（PRD §7）
- 平行執行考量：語系字典必須依頁面或區塊切分為獨立模組（例如 nav、home、about、work、writing），避免 MCD-4、MCD-5、MCD-8、MCD-9 在 max_parallel_tasks 為 3 的批次中同時修改單一字典檔而產生 merge 衝突

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工確認 /work 與 /zh/work、/about 與 /zh/about 可經語言切換來回且保留頁面
- 檢視產出的 HTML 是否含正確的 canonical、hreflang 與 Open Graph tag

## 測試需求

- 以型別檢查確保中英字典 key 結構一致
- 語言切換的對應解析需有自動化測試涵蓋（使用 MCD-1 建立的測試執行器）

## 影響

- 安全性：無
- 資料 / Schema：無
- API / 相容性：決定全站 URL 結構與導覽契約，後續所有頁面與外部連結皆依賴
- 文件：i18n 使用方式與新增語系字串的流程
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 英文路由 /、/work、/about 與中文路由 /zh/、/zh/work、/zh/about 皆可正常解析並回傳頁殼
- [ ] #2 型別化 UI 字典驅動導覽與頁尾文字，且中文字典與英文字典的 key 結構由型別強制一致
- [ ] #3 語言切換在存在對應頁面時保留當前頁面（例如 /work 切換為 /zh/work）
- [ ] #4 每個路由的 HTML 皆輸出 canonical、hreflang=en、hreflang=zh-Hant，以及指向英文的 x-default
- [ ] #5 不會依瀏覽器語言自動轉址，URL 保持穩定且可分享
- [ ] #6 語系字典依頁面或區塊切分為獨立模組，新增單一頁面的字串不需修改共用字典檔
- [ ] #7 在地化於 build time 完成，產出的 HTML 不含 client-side 翻譯邏輯
- [ ] #8 主導覽項目與順序完全符合 PRD §8：Oliver Yu、Work、Writing 外連、About、GitHub 外連、EN / 中文語言切換
- [ ] #9 導覽未出現 PRD §8 禁止的頂層項目（Blog、Notes、Categories、Tags、Archive、Skills、Certifications、Research、Resume）
- [ ] #10 每個路由皆輸出在地化的 title、description 與 Open Graph metadata，中英各自對應該語言的頁面內容
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/i18n/locales.ts：定義 Locale 型別（'en' | 'zh'）、LOCALES、DEFAULT_LOCALE = 'en'、
   每個 locale 的 hreflang 標籤（en → "en"、zh → "zh-Hant"）與 html lang 值。

2. src/lib/i18n.ts：純函式，全部在 build time 執行。
   - localePathPrefix(locale)：en → ''、zh → '/zh'
   - localizePath(locale, route)：將與語言無關的 route（'/', '/work', '/about'）
     轉為該語系的實際路徑
   - alternatesFor(route)：產出 canonical、hreflang=en、hreflang=zh-Hant、
     x-default（指向英文）所需的完整 URL 清單，統一透過 site.ts 的 absoluteUrl
   全部搭配單元測試。

3. 字典切分（AC #6）——分兩層，依「是否共用」而非依語言切：
   - src/i18n/chrome/{types,en,zh}.ts：導覽、頁尾、skip link、語言切換標籤。
     這些本來就跨頁共用，放共用檔是正確的。
   - src/i18n/pages/{home,about,work}.ts：每頁一個檔，內含該頁的 en 與 zh 兩份，
     型別為 Record<Locale, PageMeta>，強制兩語系 key 結構一致（AC #2）。
     新增一個頁面 = 新增一個檔案，不需修改任何共用字典檔（AC #6）。

4. src/components/LanguageSwitcher.astro：以 route 計算對應語系的 URL，
   當前語系標為 aria-current。純連結，無 client-side JavaScript（AC #5、#7）。

5. 擴充 src/layouts/BaseLayout.astro：新增 locale 與 route props，
   輸出 canonical、三個 hreflang（en、zh-Hant、x-default）、以及在地化的
   og:title / og:description / og:url / og:locale / twitter:card（AC #4、#10）。
   沿用 TASK-2 既有的 head slot 與 lang prop，不改動其設計系統契約。

6. 頁面：src/pages/{index,about,work/index}.astro 與
   src/pages/zh/{index,about,work/index}.astro，共六個路由。
   共用一個 SiteShell 包裝元件，把 chrome 字典接進 Header/Footer，
   導覽項目嚴格依 PRD §8：Oliver Yu（品牌）、Work、Writing 外連、About、
   GitHub 外連、EN/中文；不得出現 §8 禁止的頂層項目（AC #8、#9）。
   內容維持頁殼佔位，實際內容屬 MCD-4 起。

7. 測試：src/lib/i18n.test.ts 涵蓋 localizePath、alternatesFor 的
   對應解析（AC #3 的語言切換邏輯）；src/i18n/dictionary.test.ts 以
   遞迴比對確認 en 與 zh 的 key 結構完全一致，並斷言導覽項目符合 §8
   且未出現 §9 的禁用項目。

8. 建置後驗證產出的 HTML：六個路由各自的 canonical / hreflang / OG 標籤正確，
   且 dist/ 內不含任何翻譯用的 client-side script（AC #7）。
   依 PRD §23 順序跑 format:check → lint → typecheck → build → linkcheck → test。
<!-- SECTION:PLAN:END -->
