---
id: TASK-7
title: MCD-9 — Study 文章整合
status: Done
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 15:15'
labels: []
dependencies:
  - TASK-4
priority: medium
type: feature
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §9.6（Technical Writing）、§28（Study Integration）、§39 (MCD-9)

## 目標

於 build time 取得 Study 最新文章供首頁在兩種語言下呈現，且 feed 失敗絕不影響建置。

## 範圍

- study.meowcoder.com 的 RSS / Atom 解析器（src/lib/study-feed.ts，依 PRD §26）
- 取最新 3 至 5 篇，可行時加入快取
- feed 無法取得時的優雅降級路徑
- 語言感知呈現：英文顯示原標題並可加上簡短英文分類標籤，中文自然呈現

## 不在範圍

- 在 meowcoder.com 重製完整文章內容（PRD §9.6 禁止）
- 首頁 Technical Writing 區塊的版面實作（由 MCD-4 消費本任務的輸出）

## 穩定實作限制

- 不引入資料庫或 CMS（PRD §28）
- feed 取得失敗絕不可導致 production build 失敗
- 不得在 runtime 機器翻譯文章標題（PRD §7）
- Study 仍是技術文章的正式發佈平台，本站不得取代之

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、build 指令
- 將 feed 來源指向不可用位址後重跑 build，確認建置仍成功且降級行為正確

## 測試需求

- 需有自動化測試涵蓋 feed 正常解析與取得失敗兩種路徑

## 影響

- 安全性：僅對外部 feed URL 發出唯讀請求，不涉及機密
- 資料 / Schema：無
- API / 相容性：依賴 study.meowcoder.com 的 feed 可用性與格式
- 文件：src/lib/study-feed.ts 的使用方式與失敗行為說明
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 build time 取得 study.meowcoder.com 的 RSS/Atom feed，並解析出最新 3 至 5 篇文章的日期、分類與標題
- [x] #2 feed 無法取得或格式錯誤時，production build 仍成功並以優雅降級方式處理
- [x] #3 英文情境在沒有英文標題時顯示文章原標題，且不在 runtime 進行機器翻譯
- [x] #4 中文情境以自然的中文呈現 Study 內容
- [x] #5 未為了此同步引入任何資料庫或 CMS
- [x] #6 具備涵蓋正常解析與失敗降級兩種路徑的自動化測試
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
1. Feed 探勘結論（已實測）：來源為 https://study.meowcoder.com/index.xml（Hugo 0.154.5 產生的 RSS 2.0，25 筆 item）。/rss.xml、/feed.xml、/atom.xml、/feed 皆為 404。三項實測發現會影響實作：(a) feed 內完全沒有 <category> 元素；(b) 每個 item 的 <link> origin 是上游誤設的 http://localhost:9996；(c) 首頁 autodiscovery <link rel="alternate"> 同樣指向 localhost，因此不可用 autodiscovery，改由 STUDY_URL 推導 feed 路徑。
2. 相依性決策：新增 devDependency @rgrove/parse-xml（零 transitive dependency、380 KB、嚴格 XML 解析）。相較 fast-xml-parser（6 個 transitive dependency、1.28 MB）更符合 PRD §23 相依性衛生；嚴格解析在格式錯誤時直接 throw，正好接上降級路徑。僅 build time 使用，與 astro 一致放在 devDependencies。
3. 實作 src/lib/study-feed.ts：
   - feed URL 由 src/lib/external.ts 既有的 STUDY_URL 推導，不重新宣告 origin。
   - fetch 加上 AbortSignal.timeout 逾時與 non-2xx 檢查，避免上游停滯拖住 build。
   - 同時支援 RSS 2.0 <item> 與 Atom <entry>，讓 Study 日後換產生器不必改動消費端。
   - 每筆只取 date / category / title / url，不取內文（PRD §9.6：本站不得重製全文）。
   - item link 一律以 STUDY_URL 重新錨定，修正上游 baseURL 誤設，否則首頁會連到 localhost。
   - 依發佈日期新到舊排序後取前 limit 筆（預設 5，符合 PRD §9.6 的 3-5 篇）。
   - 語言感知：以 xml:lang 蒐集 titleByLocale，並提供 localizedTitle(post, locale)；沒有英文標題時回傳原標題，全程不做 runtime 機器翻譯（PRD §7）。中文情境本來就取得中文原標題，自然呈現。
   - 單次 build 內以 module-level memoization 快取，讓 en 與 zh 兩個首頁共用一次抓取（PRD §28 cache where practical）。
   - 任何失敗（網路錯誤、逾時、HTTP 非 2xx、XML 格式錯誤、非 feed 內容）都回傳 { ok: false, posts: [] } 並輸出 warning，對外絕不 throw（PRD §28：feed 失敗不得使 production build 失敗）。
   - 不引入資料庫或 CMS（PRD §28）。
4. 明確定義 MCD-4（TASK-8）消費契約 StudyFeed / StudyPost，並在模組 doc comment 寫清楚降級狀態下 posts 為空陣列、消費端應只渲染 CTA。
5. 測試 src/lib/study-feed.test.ts：以真實 feed 截取的 fixture 覆蓋 RSS 解析、Atom 解析、link 重新錨定、排序與取數、快取、以及失敗路徑（網路錯誤、HTTP 500、XML 格式錯誤、空 feed、缺欄位 item）。
6. 驗證：npm run format:check / lint / typecheck / build / linkcheck / test；另外把 feed URL 指向實際不可用位址後真的跑一次 npm run build，擷取輸出作為 AC #2 的客觀佐證，並記錄降級狀態下首頁會收到什麼。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

新增 `src/lib/study-feed.ts`（build time feed 模組）與 `src/lib/study-feed.test.ts`、fixture 目錄 `src/lib/__fixtures__/`。本任務只交付模組，首頁 Technical Writing 區塊版面由 MCD-4 消費本模組輸出。

## Feed 探勘（實測結果）

- feed 位址為 `https://study.meowcoder.com/index.xml`（Hugo 0.154.5 產生的 RSS 2.0，25 筆）。`/rss.xml`、`/feed.xml`、`/atom.xml`、`/feed`、`/rss` 皆為 404。
- **不可使用 autodiscovery**：首頁的 `<link rel="alternate">` 指向 `http://localhost:9996/index.xml`。feed URL 改由 `src/lib/external.ts` 既有的 `STUDY_URL` 推導，未重新宣告 origin。
- **上游 baseURL 設定錯誤**：feed 中每個 item 的 `<link>` 與 `<guid>` 都是 `http://localhost:9996/posts/...`。模組一律把 item link 重新錨定到 `STUDY_URL`，否則首頁會輸出連往 localhost 的連結。上游若修正 baseURL，重新錨定即為 no-op。
- **feed 目前完全沒有 `<category>` 元素**（0 筆）。解析器同時支援 RSS 的 `<category>` 文字與 Atom 的 `term`/`label` 屬性並有測試涵蓋，但今日實際資料一律得到 `category: undefined`。**這會影響 MCD-4**：PRD §9.6 的 `Date / Category / Title` 三行顯示目前只能呈現兩行，分類行必須視為選用。
- feed 的 `<language>` 為 `zh-tw`，標題皆為中文，與 PRD §7 的英文情境顯示原標題一致。

## 相依性

新增 devDependency `@rgrove/parse-xml@^4.2.3`。選型理由：零 transitive dependency、380 KB、嚴格 XML 解析（格式錯誤直接 throw，正好接上降級路徑），較 `fast-xml-parser`（6 個 transitive dependency、1.28 MB）更符合 PRD §23 相依性衛生。僅 build time 使用，與 `astro` 一致放在 devDependencies。`package.json` 與 `package-lock.json` 因此變動。

## MCD-4 消費契約

```ts
interface StudyPost {
  title: string;                                   // 原始發佈標題，恆存在
  titleByLocale: Partial<Record<Locale, string>>;  // 依 feed 宣告語言索引
  url: string;                                     // 已錨定於 STUDY_URL 的絕對網址
  date: string;                                    // ISO 8601 instant，可直接給 <time datetime>
  category?: string;                               // feed 有宣告才存在（今日皆無）
}
interface StudyFeed { ok: boolean; posts: StudyPost[]; reason?: string }

getStudyPosts(options?): Promise<StudyFeed>   // 絕不 throw、絕不 reject
localizedTitle(post, locale): string          // 無該語言標題時回傳原標題
```

- 無文章內文欄位（PRD §9.6），測試以精確 key set 斷言，避免日後偷加 excerpt。
- 降級狀態下 `posts` 為空陣列；消費端直接依 `posts` 渲染即可，不需自行 try/catch，**不應**以 `ok` 判斷是否渲染（健康但空的 feed 同樣是空陣列）。空陣列時 MCD-4 應只渲染 `Explore Technical Writing ↗` CTA 並略過清單。
- 預設取 5 篇（`DEFAULT_POST_LIMIT`，PRD §9.6 的 3–5 上限），可用 `limit` 調整。
- 單次 build 內以 module-level memoization 快取，en 與 zh 兩個首頁共用一次請求（PRD §28 cache where practical）；不落地磁碟、不引入資料庫或 CMS。
- `PUBLIC_STUDY_FEED_URL` 環境變數可覆寫 feed 位址（供 CI／離線／演練降級使用）。

## 驗證證據

依 PRD §23 CI 順序執行（Node v22.23.2）：

```text
npm run format:check   EXIT: 0
npm run lint           EXIT: 0
npm run typecheck      EXIT: 0   Result (33 files): 0 errors, 0 warnings, 0 hints
npm run build          EXIT: 0   6 page(s) built
npm run linkcheck      EXIT: 0   8 links + 6 links scanned
npm test               EXIT: 0   Test Files 5 passed (5) / Tests 122 passed (122)
```

`src/lib/study-feed.test.ts` 新增 39 個測試，涵蓋 RSS 解析、Atom 解析、link 重新錨定、日期排序、無內文、缺欄位丟棄、語言感知標題，以及全部失敗路徑。

### AC #2 實測（真的跑 npm run build，非斷言）

以暫時性 probe 頁面（`src/pages/study-feed-probe.astro`，取證後已刪除，未進入 commit）在 Astro build 中 top-level await `getStudyPosts()`，複製 MCD-4 的實際用法，再以 `PUBLIC_STUDY_FEED_URL` 指向不可用位址：

```text
# feed 無法解析 DNS（feed.invalid，RFC 2606 保留網域）
>>> npm run build EXIT CODE: 0
[study-feed] Technical Writing section degraded: fetch failed
[probe] feedUrl=https://feed.invalid/index.xml ok=false posts=0 reason=fetch failed
[build] 7 page(s) built in 319ms
[build] Complete!
degraded 首頁輸出: <!DOCTYPE html><ul data-ok="false" data-count="0"></ul>

# 連線被拒（http://127.0.0.1:1/index.xml）
>>> BUILD EXIT CODE: 0   reason=fetch failed              posts=0

# 實機 HTTP 404（https://study.meowcoder.com/nope.xml）
>>> BUILD EXIT CODE: 0   reason=HTTP 404 from ...          posts=0

# 回應 200 但不是 feed（https://study.meowcoder.com/ 的 HTML）
>>> BUILD EXIT CODE: 0   reason=Attribute value expected   posts=0

# 對照組：feed 正常
>>> EXIT CODE: 0   ok=true posts=5
```

**降級狀態下首頁會收到 `{ ok: false, posts: [], reason: '...' }`**，即空清單；build 以 exit code 0 完成，僅在 log 留下一則 warning（非 error），且每次讀取只警告一次而非每頁一次。

### 對真實 feed 的實測輸出（非測試，一次性檢查）

```text
feed url: https://study.meowcoder.com/index.xml
ok: true | posts: 5
   2026-08-07 | (no category) | 下一代 AI Lab 的護城河，可能不是模型架構
      https://study.meowcoder.com/posts/260808-deepseek-v4-flash-post-training-moat/
   2026-07-02 | (no category) | Agentic AI 安全治理全解：從威脅分類到企業落地 Roadm
   2026-06-30 | (no category) | 記憶的不可逆性：為什麼 LLM Agent 的壓縮記憶可能比遺忘更危
   2026-06-17 | (no category) | StraTA：策略導向的 Agentic RL 訓練方法
   2026-06-05 | (no category) | Reality: The Final Eval — Andon La
```

英文情境（`localizedTitle(post, 'en')`）回傳的即為上列中文原標題，未做任何翻譯。

## 文件同步

模組使用方式與失敗行為以 doc comment 寫在 `src/lib/study-feed.ts` 內（任務描述的「文件」影響項）。本任務未變更 PRD；本專案無 Requirement Matrix，該項不適用。README 未變更（MCD-9 不屬於 README 範圍）。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
新增 build time 的 Study feed 模組 `src/lib/study-feed.ts`（MCD-9），於建置期抓取並解析 `https://study.meowcoder.com/index.xml`，取最新 5 篇的日期、分類與標題供 MCD-4 的首頁 Technical Writing 區塊消費，不重製任何文章內文（PRD §9.6）。

核心行為是「feed 失敗屬於正常情況」：`getStudyPosts()` 絕不 throw 也絕不 reject，DNS 失敗、連線被拒、HTTP 非 2xx、XML 格式錯誤一律降級為 `{ ok: false, posts: [] }` 並只在 build log 留一則 warning。已以暫時性 probe 頁面實際執行 `npm run build` 驗證四種失敗情境，build 全數以 exit code 0 完成（PRD §28）。

語言感知不含任何 runtime 機器翻譯（PRD §7）：`localizedTitle(post, locale)` 只在 feed 自行發佈的標題之間挑選，沒有英文標題時回傳原標題；`titleByLocale` 依 feed 的 `<language>` 與 `xml:lang` 建立索引，即為 PRD §28 所預留的雙語 metadata 接點。快取為單次 build 內的 module-level memoization，未引入任何資料庫或 CMS。

新增 devDependency `@rgrove/parse-xml@^4.2.3`（零 transitive dependency，較 fast-xml-parser 更符合 PRD §23 相依性衛生）。新增 39 個測試（總計 122 個通過），format/lint/typecheck/build/linkcheck/test 六項全數 EXIT 0。

需交接給 MCD-4 的兩項實測發現：(1) Study feed 目前完全沒有 `<category>`，PRD §9.6 的三行顯示只能呈現日期與標題，分類行必須視為選用；(2) 上游 Hugo baseURL 設定錯誤，feed 內連結皆為 `http://localhost:9996/...`，模組已一律重新錨定到 `STUDY_URL`。
<!-- SECTION:FINAL_SUMMARY:END -->
