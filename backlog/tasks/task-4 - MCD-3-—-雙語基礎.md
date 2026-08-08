---
id: TASK-4
title: MCD-3 — 雙語基礎
status: Done
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 14:52'
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
- [x] #1 英文路由 /、/work、/about 與中文路由 /zh/、/zh/work、/zh/about 皆可正常解析並回傳頁殼
- [x] #2 型別化 UI 字典驅動導覽與頁尾文字，且中文字典與英文字典的 key 結構由型別強制一致
- [x] #3 語言切換在存在對應頁面時保留當前頁面（例如 /work 切換為 /zh/work）
- [x] #4 每個路由的 HTML 皆輸出 canonical、hreflang=en、hreflang=zh-Hant，以及指向英文的 x-default
- [x] #5 不會依瀏覽器語言自動轉址，URL 保持穩定且可分享
- [x] #6 語系字典依頁面或區塊切分為獨立模組，新增單一頁面的字串不需修改共用字典檔
- [x] #7 在地化於 build time 完成，產出的 HTML 不含 client-side 翻譯邏輯
- [x] #8 主導覽項目與順序完全符合 PRD §8：Oliver Yu、Work、Writing 外連、About、GitHub 外連、EN / 中文語言切換
- [x] #9 導覽未出現 PRD §8 禁止的頂層項目（Blog、Notes、Categories、Tags、Archive、Skills、Certifications、Research、Resume）
- [x] #10 每個路由皆輸出在地化的 title、description 與 Open Graph metadata，中英各自對應該語言的頁面內容
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作結果

六個路由全部產出，雙語 metadata、語言切換與型別化字典就位。10 項 AC 全數通過。

## 架構決策

**字典切分依「是否共用」而非依語言（AC #6）**

- `src/i18n/chrome/{types,en,zh}.ts` — 導覽、語言切換、skip link、頁尾 landmark 名稱。
  這些本來就跨頁共用，放共用檔是正確的；兩個語系皆宣告 `satisfies ChromeDictionary`。
- `src/i18n/pages/{home,work,about}.ts` — 每頁一個檔，檔內同時放 en 與 zh，
  型別為 `Record<Locale, PageStrings>`。

新增一個頁面 = 新增一個 `pages/*.ts`，不需修改任何共用字典檔，也不需修改 `chrome/`。
這正是 TASK-4 為了讓 MCD-4、MCD-5、MCD-8、MCD-9 能在同一平行批次中執行而設下的限制。

**key 結構一致性由編譯器強制（AC #2）**

`satisfies` 加上 `Record<Locale, PageStrings>` 讓任一語系缺 key 或多 key 都是編譯錯誤。
另有 `src/i18n/dictionary.test.ts` 以遞迴 dot-path 比對做執行期複驗，涵蓋型別無法表達的
情況（例如空字串）。

**路由以 route 而非 URL 定址**

頁面宣告 `locale` + `route`（`'/' | '/work' | '/about'`），canonical、hreflang、
og:url 全部由這組值在 `src/lib/i18n.ts` 推導。這是 canonical 與 hreflang 不會漂移的原因，
也讓語言切換必定保留當前頁面 —— 切換連結就是同一個 route 換一個 locale。

## 驗證證據

依 PRD §23 順序（Node v22.23.2）：

- `prettier --check .` → `All matched files use Prettier code style!`
- `eslint .` → exit 0
- `astro check` → `0 errors, 0 warnings, 0 hints`（31 個檔案）
- `astro build` → `6 page(s) built`
- `npm run linkcheck` → 站台 8 連結、文件 6 連結，皆 `Successfully scanned`
- `vitest run` → `Test Files 4 passed (4) / Tests 83 passed (83)`
- `npm audit` → `found 0 vulnerabilities`

產出 HTML 逐路由檢查：

| 路由 | html lang | canonical | x-default | og:locale |
|---|---|---|---|---|
| `/` | en | `https://meowcoder.com/` | → `/` | en_US |
| `/work/` | en | `.../work/` | → `/work/` | en_US |
| `/about/` | en | `.../about/` | → `/about/` | en_US |
| `/zh/` | zh-Hant | `.../zh/` | → `/` | zh_TW |
| `/zh/work/` | zh-Hant | `.../zh/work/` | → `/work/` | zh_TW |
| `/zh/about/` | zh-Hant | `.../zh/about/` | → `/about/` | zh_TW |

每個路由皆輸出 `hreflang="en"`、`hreflang="zh-Hant"`、`hreflang="x-default"` 三組。

AC #7（build time 在地化）：`grep -l "<script" dist/**/*.html` 於六個頁面皆無命中，
產出不含任何 client-side 腳本。

AC #8（導覽順序）：`dist/index.html` 實際輸出順序為
brand `/` → `/work/` → `https://study.meowcoder.com` → `/about/` →
`https://github.com/tc3oliver` → 語言切換（`/`、`/zh/`），完全符合 PRD §8。
中文版為 `/zh/` → 作品 → 技術文章 → 關於我 → GitHub，結構一致。

AC #3（語言切換保留頁面）：`dist/work/index.html` 與 `dist/zh/work/index.html`
的切換連結皆為 `/work/` 與 `/zh/work/`。

## 執行中發現並修正的問題

**linkcheck 追著正式網域跑，造成假失敗**

新增 hreflang 後 linkinator 開始跟隨 canonical/hreflang 的絕對 URL 打到
`https://meowcoder.com`，而該網域目前仍是舊的 WordPress 站：`/` 回 200、
`/zh/` 與 `/work/` 回 404（已以 curl 實測確認）。這不是產出的缺陷 —— 那些 URL 要到
MCD-13 切換後才存在，而 TASK-13 AC #5 本來就負責在正式環境重跑連結檢查。

修正：`linkcheck:site` 加上 `--skip "^https://meowcoder\.com"`。
反向驗證確認不是又一個假綠：於 `dist/index.html` 插入 `<a href="/definitely-missing/">`
後仍輸出 `[404] definitely-missing/` 與 `ERROR: Detected 1 broken links`。
外部連結（study.meowcoder.com、github.com）仍在檢查範圍內。

## 對 TASK-2 元件契約的擴充

`Header.astro` 的 `NavItem` 新增 `external?: boolean`，並新增 `externalIndicator` prop。
PRD §8 明確以 `↗` 標示 Writing 與 GitHub 為外連，原本的 NavItem 無法表達。
外連同時取得 `rel="noopener noreferrer"`，指示符號以 `aria-hidden` 排除於無障礙樹之外，
與 `Footer.astro` 既有的 `external` 處理方式一致。

## 移交後續任務

- 頁尾的五連結列（GitHub · Study · ORCID · Shouri · Site Source，PRD §9.8）
  屬 MCD-4 範圍，本任務僅提供頁尾 chrome 與 wordmark。
- **ORCID 與 JISA 論文的實際 URL 在 PRD 中只有名稱沒有網址。**
  `src/lib/external.ts` 只記錄有明確證據的三個（study、github、shouri），並註明此缺口。
  MCD-4 的頁尾與 MCD-8 的研究區塊會需要這兩個 URL，屆時需由站長提供。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
建立雙語基礎：六個路由（/、/work、/about 與 /zh/、/zh/work、/zh/about）、型別化語系字典、語言切換，以及每個路由的在地化 SEO metadata。

字典依「是否共用」切分：chrome/ 放跨頁共用的導覽與頁尾字串，pages/ 每頁一個檔且檔內並列 en 與 zh。新增頁面只需新增一個檔案，不觸碰共用字典 —— 這是 MCD-4、MCD-5、MCD-8、MCD-9 能排進同一平行批次的前提。語系 key 結構一致性由 satisfies 與 Record<Locale, T> 在編譯期強制，另有遞迴 dot-path 測試複驗。

頁面以 locale + route 定址而非 URL，canonical、hreflang（en / zh-Hant / x-default）與 og:* 全部由該組值推導，因此不可能彼此漂移，語言切換也必定保留當前頁面。全程 build time 在地化，產出的六個 HTML 皆不含任何 script。

導覽嚴格依 PRD §8，實際產出順序經 HTML 驗證；PRD §30 指定的首頁 title 與 description 逐字採用並以測試鎖定。

執行中修正 linkcheck 追隨 canonical 絕對 URL 打到尚未部署的正式網域而造成的假失敗，並反向驗證修正後仍能抓到真實死連結。
<!-- SECTION:FINAL_SUMMARY:END -->
