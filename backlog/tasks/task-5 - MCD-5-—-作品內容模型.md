---
id: TASK-5
title: MCD-5 — 作品內容模型
status: Done
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 15:15'
labels: []
dependencies:
  - TASK-4
priority: medium
type: feature
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §10（Work）、§26（Technical Architecture）、§27（Localization Architecture）、§39 (MCD-5)

## 目標

建立可驗證的雙語作品內容模型，讓案例研究以內容檔新增而非撰寫頁面程式碼。

## 範圍

- src/content/work/en 與 src/content/work/zh 的 Content Collections / MDX schema
- metadata 驗證（標題、類型、slug、語言、翻譯 key）
- /work 與 /zh/work 索引頁
- 供 /work/[slug] 與 /zh/work/[slug] 共用的 WorkLayout
- 語言切換所使用的 slug 對應

## 不在範圍

- Shouri 與 AI Coding Skills 的實際內容（MCD-6、MCD-7）
- 首頁上的作品呈現（MCD-4）

## 穩定實作限制

- 不引入資料庫或 CMS（PRD §26）
- 不預留第三個案例研究欄位；PRD §10 明確禁止為了讓作品集看起來更大而新增項目
- 長篇內容留在在地化的 MDX / 內容檔，不放進大型翻譯 JSON（PRD §27）
- 平行執行考量：僅新增 work 專屬的 i18n 模組，不修改共用字典檔

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、build 指令
- 故意提供缺少必填欄位的內容檔，確認 build 失敗且錯誤訊息可定位

## 測試需求

- schema 驗證需能在 build time 拒絕格式錯誤的作品內容，並有測試涵蓋此行為

## 影響

- 安全性：無
- 資料 / Schema：新增 src/content/work 的 content collection schema
- API / 相容性：確立 /work/[slug] 的 URL 契約，後續案例研究皆依賴
- 文件：新增雙語案例研究的內容撰寫說明
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Astro Content Collections 或 MDX schema 已定義雙語作品項目的必填 metadata（標題、類型、slug、語言、翻譯 key）
- [x] #2 /work 與 /zh/work 可列出所有已發佈的作品項目
- [x] #3 共用的 WorkLayout 在兩種語言下一致地呈現作品詳細頁
- [x] #4 穩定的 slug 與翻譯 key 對應讓語言切換能可靠地在 /work/[slug] 與 /zh/work/[slug] 之間解析
- [x] #5 缺少必填 metadata 的內容檔會在 build time 失敗並指出問題欄位
- [x] #6 新增一組雙語案例研究只需新增內容檔，不需新增或修改頁面程式碼
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
1. 內容模型核心（src/lib/work.ts）：以 astro/zod 定義 workEntrySchema，必填 title、type、summary、slug、locale、translationKey、order，選填 draft（預設 false）；另提供純函式 resolveWorkEntries() 驗證跨語系不變式（id 與 locale/slug 相符、slug 於語系內唯一、translationKey 與 slug 一對一、每個 translationKey 在所有語系皆存在、order 與 draft 跨語系一致），錯誤訊息帶 entry id 與欄位名。此模組只依賴 astro/zod，不 import astro:content，讓 vitest 可直接測試。
2. Content Collection（src/content.config.ts）：宣告 work collection，glob loader base './src/content/work'、pattern '{en,zh}/*.md'、schema 使用 workEntrySchema；明確指定 generateId 產生 '<locale>/<slug>'——glob 預設會優先採用 frontmatter 的 slug，雙語同 slug 會造成 id 衝突，必須覆寫。
3. 路由型別附加式擴充（src/lib/i18n.ts）：拆出 StaticRoute，新增 WorkDetailRoute = `/work/${string}` 與 workDetailRoute(slug)，Route = StaticRoute | WorkDetailRoute。ROUTES、localizePath、alternatesFor、switchTargets 行為不變，語言切換因此可直接解析 /work/<slug>/ 與 /zh/work/<slug>/。
4. 頁面字串（src/i18n/pages/work.ts）：在既有 en/zh 之上擴充 work 索引空狀態、詳細頁類型標籤與返回索引連結字串，維持雙語 key 對稱（src/i18n/dictionary.test.ts 會檢查）。
5. 共用版面（src/layouts/WorkLayout.astro）：接 locale、entry 與已 render 的內容，透過 SiteShell 以 locale + route 定位，兩種語言共用同一份結構。
6. 頁面：src/pages/work/index.astro 與 src/pages/zh/work/index.astro 列出該語系已發佈項目（依 order 排序，空集合顯示空狀態）；src/pages/work/[slug].astro 與 src/pages/zh/work/[slug].astro 以 getStaticPaths 產生詳細頁，兩者僅差在 locale 常數。
7. 文件（src/content/work/README.md）：撰寫雙語案例研究的內容撰寫說明——必填欄位、檔名與 slug 對應規則、跨語系不變式、新增一組案例研究只需新增兩個內容檔。README 不在 collection glob 內。
8. 測試（src/lib/work.test.ts）：涵蓋 schema 拒絕缺漏必填欄位並指出欄位、以及每一條跨語系不變式的失敗與成功案例。
9. 驗證：npm run format:check、lint、typecheck、build、linkcheck、test。另以暫時性雙語 fixture 實際執行 build，蒐集索引列出、詳細頁雙語產出、語言切換 URL、以及故意移除必填欄位造成 build 失敗的真實輸出作為 AC 證據，證據蒐集後移除 fixture——PRD §10 與本任務「不在範圍」禁止交付佔位案例研究，實際內容由 MCD-6／MCD-7 提供。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

- `src/lib/work.ts`（新增）：內容模型核心。`workEntrySchema`（`astro/zod` 的 `z.strictObject`）定義必填 metadata：`title`、`type`、`summary`、`slug`、`locale`、`translationKey`、`order`，`draft` 選填預設 `false`。`assertWorkContentIsConsistent` 驗證四項單一檔案看不到的跨檔案不變式：(1) 檔案路徑與自身 metadata 相符；(2) `slug` 與 `translationKey` 一對一；(3) 每個 `translationKey` 在所有語系皆存在（PRD §7 要求中文為完整在地化版本）；(4) `order` 與 `draft` 跨語系一致。`workEntriesForLocale` 先驗證整個集合，再過濾語系與草稿並依 `order` 排序（同序以位元組順序 tie-break，避免受主機 ICU 影響）。此模組不 import `astro:content`，因此規則可直接以 vitest 測試。
- `src/content.config.ts`（新增）：`work` collection，glob loader，`base: './src/content/work'`、`pattern: '{en,zh}/*.md'`。必須覆寫 `generateId`：glob 預設會優先採用 frontmatter 的 `slug`，而雙語刻意共用同一個 slug，沿用預設會造成 id 衝突並讓其中一個語系靜默消失。兩個語系放在同一個 collection，否則跨語系不變式無從檢查。
- `src/lib/i18n.ts`（附加式擴充）：拆出 `StaticRoute`，新增 `WorkDetailRoute = \`/work/\${string}\`` 與 `workDetailRoute(slug)`，`Route` 改為兩者聯集。`ROUTES`、`localizePath`、`alternatesFor`、`switchTargets` 行為完全未變，MCD-3 既有測試全數通過。語言切換因此對詳細頁只改寫語系前綴即可解析。
- `src/layouts/WorkLayout.astro`、`src/layouts/WorkIndexLayout.astro`（新增）：詳細頁與索引頁各一份雙語共用版面。Markdown 由頁面 `render()` 後透過 slot 傳入，版面本身不依賴 `astro:content`。
- `src/pages/work/[slug].astro`、`src/pages/zh/work/[slug].astro`（新增）與兩個 `index.astro`（改寫）：四個頁面只剩 `locale` 常數不同。
- `src/i18n/pages/work.ts`：新增 `WorkPageStrings extends PageStrings`，補上 `empty`、`typeLabel`、`backToIndex`。`intro` 改為 PRD §10 的常設說明，原本 MCD-3 的「案例研究將於後續版本推出」移到 `empty` 空狀態。
- `src/content/work/README.md`（新增）：雙語案例研究撰寫說明——必填欄位表、檔名與 slug 對應規則、build 強制的四項不變式。不在 collection glob 內。
- `src/lib/work.test.ts`（新增）：涵蓋 schema 必填欄位、strict 未知鍵、slug 格式、以及每一條不變式的失敗與成功案例。

未新增任何相依套件（未引入 `@astrojs/mdx`）。PRD §26 的建議結構本身即使用 `.md`，Markdown 已足夠；日後改用 MDX 只需加入整合並放寬 glob pattern，內容模型不受影響。

## 交付狀態：collection 目前為空

本任務不交付任何 work 內容檔。PRD §10 與本任務「不在範圍」明確將 Shouri 與 AI Coding Skills 的實際內容劃給 MCD-6／MCD-7，並禁止為了讓作品集看起來更大而新增條目；交付佔位案例研究也違反 `.agent-workflow/WORKFLOW.md` 的「不得加入 placeholder 並標記完成」。因此索引目前顯示空狀態字串。

已知副作用（非缺陷）：集合為空時 Astro 會輸出 `The collection "work" does not exist or is empty. Please check your content config file for errors.`，這是空集合的正常診斷，build exit code 為 0；MCD-6 落地後即消失。

操作備註：Astro 的 content layer 快取在 `node_modules/.astro/data-store.json`。手動刪除內容檔後，該檔的舊條目不會被清掉（glob loader 在零檔案匹配時只警告不清空），本地驗證需一併移除該快取才會看到真實狀態；CI 為全新 `npm install`，不受影響。

## AC 驗證證據

### AC #1 — 必填 metadata schema
`src/lib/work.ts` 的 `workEntrySchema` 以 `z.strictObject` 定義 title／type／summary／slug／locale／translationKey／order／draft。`src/lib/work.test.ts` 逐一移除七個必填欄位並斷言錯誤 `issue.path` 指到該欄位。

### AC #2 — /work 與 /zh/work 列出已發佈項目
以暫時性雙語 fixture（`example-case-study`）實際建置，索引輸出：
```text
dist/work/index.html:      <a href="/work/example-case-study/">Example Case Study</a>
                           work-index__type>Product · AI Systems
                           work-index__summary>One line on the problem and the result.
dist/zh/work/index.html:   <a href="/zh/work/example-case-study/">…</a>
                           work-index__type>產品 · AI 系統
```
移除 fixture 後（目前交付狀態）兩個索引改為輸出空狀態字串 `No case studies are published yet.` 與 `目前尚未發佈案例研究。`。

### AC #3 — WorkLayout 雙語一致
同一次建置產生 `/work/example-case-study/index.html` 與 `/zh/work/example-case-study/index.html`，結構相同、只有語言不同：
```text
EN: <title>Example Case Study — Oliver Yu</title>
    <dt>Type</dt><dd>Product · AI Systems</dd><h1>Example Case Study</h1>
    <h2 id="problem">Problem</h2> <h2 id="result">Result</h2>
    <a href="/work/">All work</a>
ZH: <html lang="zh-Hant"> <title>範例案例研究 — Oliver Yu</title>
    <dt>類型</dt><dd>產品 · AI 系統</dd><h1>範例案例研究</h1>
    <h2 id="問題">問題</h2> <h2 id="結果">結果</h2>
```

### AC #4 — slug 與翻譯 key 對應可靠解析語言切換
同一次建置的詳細頁 head 與語言切換輸出：
```text
EN 詳細頁: <link rel="canonical" href="https://meowcoder.com/work/example-case-study/">
           hreflang="en"      → https://meowcoder.com/work/example-case-study/
           hreflang="zh-Hant" → https://meowcoder.com/zh/work/example-case-study/
           hreflang="x-default" → https://meowcoder.com/work/example-case-study/
           lang-switch: /work/example-case-study/ 與 /zh/work/example-case-study/
ZH 詳細頁: <link rel="canonical" href="https://meowcoder.com/zh/work/example-case-study/">
           lang-switch: /work/example-case-study/ 與 /zh/work/example-case-study/
```
兩個方向互為對方的連結，往返一致。

### AC #5 — 缺少必填 metadata 於 build time 失敗並指出欄位
實際刪除 `src/content/work/en/example-case-study.md` 的 `translationKey:` 後執行 `npm run build`（exit code 1）：
```text
[InvalidContentEntryDataError] work → en/example-case-study data does not match collection schema.
  translationKey**: **translationKey: Required
  Location:
    /home/oliver/meowcoder/.worktrees/TASK-5/src/content/work/en/example-case-study.md:0:0
```
另外三項跨檔案不變式也逐一以真實 build 驗證（皆 exit code 1）：
```text
檔案路徑與 metadata 不符：
Work content: entry "zh/example-case-study" declares locale "zh" and slug "fan-li-an-li", so it must be the file src/content/work/zh/fan-li-an-li.md

翻譯的 slug 不一致：
Work content: translationKey "example-case-study" maps to slug "example-case-study" and "fan-li-an-li"; every translation of a case study must share one slug so the language switch resolves (see src/content/work/zh/fan-li-an-li.md)

缺少對應語系：
Work content: translationKey "example-case-study" has no zh entry; add src/content/work/zh/example-case-study.md
```
每則訊息都指出檔案與欄位。驗證後已還原並移除 fixture。

### AC #6 — 新增案例研究只需新增內容檔
上述 fixture 是在所有頁面程式碼完成之後才新增的：只加入 `src/content/work/en/<slug>.md` 與 `src/content/work/zh/<slug>.md` 兩個檔案，未修改任何 `.astro` 或 `.ts`，建置頁數即從 6 頁變為 8 頁，新增 `/work/<slug>/` 與 `/zh/work/<slug>/` 兩條路由並出現在兩個索引；移除該兩檔後回到 6 頁。新增一組雙語案例研究所需的全部動作為：建立兩個 Markdown 檔，frontmatter 填入八個欄位（兩邊 `slug`／`translationKey`／`order`／`draft` 相同，`locale` 對應目錄，`title`／`type`／`summary` 在地化），內文以 `##` 起始。

## 命令驗證（最終交付狀態，Node v22.23.2）

```text
npm run format:check  → All matched files use Prettier code style!            (exit 0)
npm run lint          → eslint . 無輸出                                        (exit 0)
npm run typecheck     → Result (38 files): 0 errors, 0 warnings, 0 hints       (exit 0)
npm run build         → 6 page(s) built                                        (exit 0)
npm run linkcheck     → Successfully scanned 8 links / Successfully scanned 6 links
npm test              → Test Files 5 passed (5), Tests 116 passed (116)
```

文件同步：新增 `src/content/work/README.md`；本專案無 Requirement Matrix，該項不適用。PRD（doc-1）未因本任務變更。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
建立雙語作品內容模型：Astro Content Collections（`src/content.config.ts`）搭配 `src/lib/work.ts` 的 strict zod schema 與跨語系不變式驗證，讓案例研究以新增兩個 Markdown 內容檔的方式加入，不需觸碰頁面程式碼。索引與詳細頁各由一份雙語共用版面（`WorkIndexLayout.astro`、`WorkLayout.astro`）驅動，`src/lib/i18n.ts` 附加 `WorkDetailRoute` 讓語言切換沿用既有的 locale + route 定位模型，在 `/work/<slug>/` 與 `/zh/work/<slug>/` 間可靠解析。缺少必填欄位、檔案放錯語系目錄、翻譯 slug 不一致、缺少對應語系翻譯都會讓 build 失敗並指出檔案與欄位。撰寫說明放在 `src/content/work/README.md`。依 PRD §10 與本任務範圍，未交付任何案例研究內容——Shouri 與 AI Coding Skills 由 MCD-6／MCD-7 提供，驗證用的暫時性 fixture 已在蒐集證據後移除。未新增相依套件。
<!-- SECTION:FINAL_SUMMARY:END -->
