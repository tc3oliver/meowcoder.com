---
id: TASK-2
title: MCD-2 — 設計系統
status: Done
assignee: []
created_date: '2026-08-08 06:43'
updated_date: '2026-08-08 14:37'
labels: []
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §25（Visual Direction）、§26（Technical Architecture）、§39 (MCD-2)

## 目標

建立共用視覺基礎（設計 token、響應式外框、Header/Footer、focus 狀態），供後續所有頁面直接沿用。

## 範圍

- CSS 設計 token：字級、間距、中性色系、單一強調色、細邊框（styles/tokens.css、styles/global.css）
- 響應式頁面外框，內容寬與閱讀寬依 PRD §25
- Header 與 Footer 元件骨架
- focus-visible 狀態與 prefers-reduced-motion 支援
- 可選深色模式

## 不在範圍

- 雙語路由、語言切換與導覽文字（MCD-3）
- 實際頁面內容（MCD-4 起）
- Lighthouse 分數最佳化（MCD-11）

## 穩定實作限制

- static-first，盡量不輸出 client-side JavaScript（PRD §26、§29）
- 採 light-first、暖中性背景、近黑字色、單一克制的強調色
- 嚴禁 PRD §25 列出的視覺元素
- Header/Footer 僅建立結構與樣式，文字內容留給 MCD-3 的 i18n 字典注入，避免與後續任務在同一檔案衝突

## 驗證

- 依 MCD-1 回填 .agent-workflow/PROJECT.md 的 lint、typecheck、build 指令
- 桌機與行動裝置視窗寬度下的人工視覺檢查

## 測試需求

- 人工視覺 QA（桌機與行動裝置）
- 本專案尚無自動化視覺回歸工具，記錄為不適用

## 影響

- 安全性：無
- 資料 / Schema：無
- API / 相容性：設計 token 名稱成為後續所有元件的共用契約
- 文件：styles/tokens.css 中的 token 用途註解
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 設計 token（字級、間距、中性色系、單一強調色、細邊框）已實作於 styles/tokens.css 並由 global.css 套用
- [x] #2 響應式外框在桌機與行動裝置皆正確：內容寬約 1100-1200px、閱讀寬約 680-760px
- [x] #3 Header 與 Footer 元件可在任意頁面重複使用
- [x] #4 所有可聚焦元素具備明顯 focus 樣式，且對比符合 WCAG AA
- [x] #5 深色模式切換不會出現未套用樣式的閃爍
- [x] #6 prefers-reduced-motion 生效時停用非必要動態效果
- [x] #7 頁面未出現 PRD §25 禁用的任何視覺元素（AI 機器人、霓虹漸層、粒子、視差、打字機效果、logo 牆、技能百分比圖等）
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
1. 建立 src/styles/tokens.css：以 :root 單一 token 清單定義字體堆疊（含 CJK fallback）、流體字級、4px 基準間距、暖中性色系、單一克制強調色（深墨藍 #1D4E89）、1px 細邊框、圓角、動效時間與版面寬度（內容寬 1160px、閱讀寬 720px）。
2. 深色模式採 CSS light-dark() 搭配 color-scheme，色值只寫一份，同時支援系統偏好與 :root[data-theme] 明確覆寫；全程零 client-side JavaScript，因此不可能出現套用前的閃爍（AC #5）。
3. 建立 src/styles/global.css：現代化 reset、語意化基礎排版階層、.container / .container--reading 外框工具類、:focus-visible 焦點環（2px outline + 2px offset）、prefers-reduced-motion 全域降級。
4. 建立 src/components/Header.astro 與 src/components/Footer.astro：僅結構與樣式，導覽項目與品牌以 props/slot 注入，無任何寫死的使用者可見文字，保留給 MCD-3 的 i18n 字典。
5. 建立 src/layouts/BaseLayout.astro：html/head/body 骨架、lang、canonical、color-scheme meta、可選 skip link（文字由 prop 注入）、header/footer 具名 slot 且預設帶入 Header/Footer。
6. 改寫 src/pages/index.astro 使用 BaseLayout，作為設計系統的最小示範頁，不加入 MCD-4 的產品內容。
7. 新增 src/styles/design-system.test.ts：解析 tokens.css 的 light-dark() 取出雙主題色值，實際計算 WCAG 對比度並斷言達 AA（文字 4.5:1、焦點環與 UI 邊界 3:1）；同時掃描 src/** 確認未出現 PRD §25 禁用視覺元素（漸層、粒子、視差、打字機、3D、動畫等）樣式特徵。
8. 依 PRD §23 的 CI 順序驗證：npm run format:check → npm run lint → npm run typecheck → npm run build → npm test，並檢查 dist/ 產出的 HTML 未含 <script>。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

- `src/styles/tokens.css`（新增）：設計 token 單一契約。字體堆疊（含 Noto Sans TC / PingFang TC 等 CJK fallback，不使用 web font）、流體字級（clamp）、4px 基準間距與 `--space-section`、暖中性色系、單一強調色（深墨藍）、1px 細邊框、圓角、焦點環幾何、動效時間、版面寬度 `--width-content: 1160px` 與 `--width-reading: 720px`。
- 深色模式採 CSS `light-dark()` + `color-scheme`：每個語意色只寫一次即同時定義淺／深兩組值，色板不會各自漂移；`:root[data-theme='light'|'dark']` 以 `color-scheme: only …` 提供明確覆寫掛鉤（本任務不出貨切換器）。全程零 client-side JavaScript。
- `src/styles/global.css`（新增）：reset、語意化排版階層（h1–h6、prose 行高）、`.container` / `.container--reading` / `.prose` 外框、`.skip-link`、`.visually-hidden`、`:focus-visible` 焦點環、`prefers-reduced-motion` 雙層降級（token 歸零 + 全域 catch-all）。
- `src/components/Header.astro`、`src/components/Footer.astro`（新增）：僅結構與樣式。品牌、導覽項目、footer 連結、landmark 的 aria-label 全部由 props/slot 注入，元件內無任何寫死的使用者可見文字，MCD-3 可直接接上 i18n 字典。內容不存在時不渲染該區塊（避免空的 `<nav>` 或無名稱連結這類無障礙缺陷）。無 client-side JS：窄視窗以 flex-wrap 換行，不使用需要腳本的漢堡選單。
- `src/layouts/BaseLayout.astro`（新增）：文件骨架、`lang`、canonical（沿用 MCD-1 的 `absoluteUrl`）、`color-scheme` meta、可選 skip link（文字由 prop 注入）；Header/Footer 以具名 slot 的預設值提供，頁面可覆寫。
- `src/pages/index.astro`（修改）：改用 BaseLayout + Header/Footer，作為設計系統最小示範頁，不加入 MCD-4 產品內容。
- `src/styles/design-system.test.ts`（新增）：把 AC #2、#4、#6、#7 轉成可重跑的客觀檢查——解析 tokens.css 的 `light-dark()` 取出雙主題實際計算 WCAG 對比度、驗證兩個寬度落在 PRD §25 區間、檢查 focus-visible 與 prefers-reduced-motion 規則存在、掃描 src/** 是否出現 PRD §25 禁用視覺元素。
- `vitest.config.ts`（修改）：加上 `css: true`。Vitest 預設 `css: false` 會把 CSS import 變成空字串，上述以 `?raw` 讀取樣式原文的斷言會「通過但什麼都沒檢查」。此為讓驗證真實生效的必要修改。

## 工程決策與理由

- **強調色選深墨藍 `#1d4e89`（深色模式 `#8fb6e8`）**：PRD §25 要求「單一克制的強調色」，藍色連結是既有可用性慣例，且在暖中性底色上對比充裕（實測 7.91:1）。屬可逆的工程選擇。
- **深色模式用 `light-dark()` 而非重複宣告或 JS 切換**：色值只有一份，淺／深不會失同步；瀏覽器在第一次 style pass 就解析完成，因此結構上不可能出現套用前的閃爍。
- **測試以 Vite `?raw` 讀檔而非 `node:fs`**：本專案以 `astro check` 型別檢查且未安裝 `@types/node`，`node:fs` 無法通過 typecheck；`?raw` 同時讓檔案被移動時 import 直接失敗，而不是讓掃描默默變成空集合。
- **未改動 `package.json` / `package-lock.json`**：`npm install` 會把 lockfile 的 `engines` 從 `>=20.3.0` 同步為 `>=22.12.0`，此為與本任務無關的既有落差，已 `git checkout` 還原以維持變更範圍。

## 驗證證據

環境：`node -v` → `v22.23.2`。依 PRD §23 的 CI 順序執行：

```text
--- npm run format:check ---
Checking formatting...
All matched files use Prettier code style!
--- npm run lint ---
> eslint .
（無輸出，無錯誤）
--- npm run typecheck ---
- 0 errors
- 0 warnings
- 0 hints
--- npm run build ---
[build] ✓ Completed in 210ms.
[build] 1 page(s) built in 263ms
[build] Complete!
--- npm test ---
 Test Files  2 passed (2)
      Tests  59 passed (59)
```

### 測試有效性（負向對照）

為避免斷言「通過但沒檢查到東西」，實際做過兩次負向對照並確認會失敗，之後還原：

```text
# 將 --color-text-muted 淺色值改為 #cccccc，並新增含 radial-gradient 的 CSS 檔
× color-text-muted on color-bg reaches 4.5:1
× color-text-muted on color-surface reaches 4.5:1
× color-text-muted on color-surface-subtle reaches 4.5:1
× contains no neon gradients
 Tests  4 failed | 55 passed (59)
# 還原後
 Tests  59 passed (59)
```

### 建置產物

```text
dist/index.html
dist/_astro/index.ByJYcIzC.css   （6748 bytes）
grep -c '<script' dist/index.html          → 0
grep -oE '<(img|svg|canvas|video)' …       → NONE
grep -o 'light-dark([^)]*)' dist/…css | wc -l → 11
grep -oiE 'gradient|@keyframes|animation:|parallax|particle|typewriter|perspective|translate3d|preserve-3d|background-attachment' dist/ → NO MATCHES
```

### 響應式外框推導（AC #2）

依 `--gutter: clamp(1.25rem, 0.9rem + 1.75vw, 2.5rem)`、`--width-content: 1160px`、`--width-reading: 720px` 實算各視窗寬度：

```text
vw=375   gutter=20.96px  content=333.07px   reading=333.07px  section-pad=50.75px
vw=768   gutter=27.84px  content=712.32px   reading=712.32px  section-pad=70.40px
vw=1024  gutter=32.32px  content=959.36px   reading=720.00px  section-pad=83.20px
vw=1440  gutter=39.60px  content=1160.00px  reading=720.00px  section-pad=104.00px
vw=1920  gutter=40.00px  content=1160.00px  reading=720.00px  section-pad=104.00px
```

任一寬度皆無水平溢出；桌機上限 1160px 落在 PRD §25 的 1100–1200px，閱讀寬 720px 落在 680–760px。

### 對比度實測（AC #4）

由 `src/styles/design-system.test.ts` 依 WCAG 2.2 相對亮度公式計算，淺／深各 16 組共 32 組全數通過：

```text
LIGHT  text/bg 16.71  text/surface 17.72  muted/bg 6.87  muted/surface 7.28
       accent/bg 7.91  accent/surface 8.39  accent-strong/bg 10.47  on-accent/accent 8.39
       focus/bg 7.91  focus/surface 8.39  border-strong/bg 3.49  border-strong/surface 3.70
DARK   text/bg 16.19  text/surface 15.02  muted/bg 7.34  muted/surface 6.81
       accent/bg 8.87  accent/surface 8.23  accent-strong/bg 11.28  on-accent/accent 8.79
       focus/bg 8.87  focus/surface 8.23  border-strong/bg 4.35  border-strong/surface 4.04
```

文字類全部 ≥ 4.5:1，焦點環與 UI 邊界全部 ≥ 3:1（WCAG 1.4.11）。

### 不可執行的檢查

- **人工視覺 QA（桌機／行動裝置實機目視）**：本執行環境無任何瀏覽器（已確認 chromium／chrome／firefox／playwright／puppeteer 皆不存在），無法由代理人執行，記錄為 unavailable。上述外框推導、建置產物檢查與 token 測試為其客觀替代證據，實機目視仍建議由站長在合併後補做。
- **自動化視覺回歸**：本專案未導入相關工具，依任務「測試需求」記錄為不適用。
- **Requirement Matrix 同步**：本專案無 Requirement Matrix；doc-1 為權威需求來源且本任務未變更任何需求，記錄為不適用。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
建立 MCD-2 設計系統：以 `src/styles/tokens.css` 作為後續所有元件共用的 token 契約（字級、間距、暖中性色系、單一深墨藍強調色、細邊框、版面寬度、動效），`src/styles/global.css` 提供 reset、排版階層、響應式外框、`:focus-visible` 焦點環與 `prefers-reduced-motion` 降級，並新增 Header / Footer / BaseLayout 三個可重複使用的骨架元件。

深色模式以 CSS `light-dark()` 搭配 `color-scheme` 實作：色值只寫一份、瀏覽器於首次 style pass 解析完成，因此不需要任何 client-side JavaScript，也不可能出現套用前的閃爍——建置產物 `dist/index.html` 實測 0 個 `<script>` 標籤。

Header 與 Footer 內無任何寫死的使用者可見文字，全部經 props/slot 注入，MCD-3 可直接接上 i18n 字典而不必改寫元件。

AC #2、#4、#6、#7 以 `src/styles/design-system.test.ts` 轉為可重跑的客觀檢查（實算 WCAG 對比度、驗證寬度區間、掃描 PRD §25 禁用視覺元素），並以負向對照確認斷言確實會失敗。format:check / lint / typecheck / build / test 全數通過（59 tests）。實機人工目視 QA 因環境無瀏覽器，已明確記錄為 unavailable。
<!-- SECTION:FINAL_SUMMARY:END -->
