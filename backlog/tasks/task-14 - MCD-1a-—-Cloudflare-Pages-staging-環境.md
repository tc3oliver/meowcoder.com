---
id: TASK-14
title: MCD-1a — Cloudflare Pages staging 環境
status: In Progress
assignee: []
created_date: '2026-08-08 14:21'
updated_date: '2026-08-08 16:51'
labels: []
dependencies:
  - TASK-1
priority: high
type: chore
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §26（Technical Architecture）、§29（Performance & Accessibility）、§32（Security）、§39 (MCD-1 的部署環境項目)
- decision-3（將 Cloudflare Pages staging 自 MCD-1 拆出為獨立任務）
- decision-4（以 Cloudflare Workers Static Assets 取代 Cloudflare Pages 作為託管方式）

## 目標

meowcoder.com 具備可用的 Cloudflare staging 環境，每次推送 main 都自動建置並部署靜態產出，供 MCD-11 量測 Lighthouse 與驗證安全標頭。

## 範圍

- 於儲存庫加入 wrangler.jsonc，僅宣告 assets.directory = "./dist"
- 將 wrangler 釘為 devDependency，避免部署時以 npx 取用浮動版本
- 確認 Cloudflare 專案的 build command 為 npm run build、deploy command 為 npx wrangler deploy
- 環境變數 NODE_VERSION 對齊 .nvmrc
- 驗證推送 main 後自動觸發部署且 staging URL 可正常提供網站
- 建立 public/ 作為 _headers 與 _redirects 的落點並驗證其複製到 dist/
- 將 staging URL 記錄於 .agent-workflow/PROJECT.md

## 不在範圍

- 正式網域切換（MCD-13）
- 安全標頭與 CSP 的實際內容（MCD-11 撰寫 public/_headers）
- 轉址規則的實際內容（MCD-13 撰寫 public/_redirects）
- 分析埋點（MCD-11）

## 穩定實作限制

- wrangler.jsonc 不得設定 main。沒有 main 即為純靜態資產 Worker，不執行任何伺服器端程式碼
- 不得安裝 @astrojs/cloudflare，不得執行 astro add cloudflare。astro.config.mjs 必須維持 output: 'static'（PRD §26、decision-4）
- 明確宣告 wrangler.jsonc 是防止 wrangler 再次自動 SSR 化專案的主要機制，不可移除
- Cloudflare API token 與 account ID 絕不可提交；.gitignore 已排除 .dev.vars 與 .wrangler/（PRD §20、§32）
- NODE_VERSION 必須與 .nvmrc 一致，否則 Astro 7 會拒絕建置
- 必須在 TASK-11 之前完成：沒有 staging 就沒有量測 Lighthouse 與驗證安全標頭的環境

## 驗證

- npm run build 產出 dist/ 且 astro.config.mjs 仍為 output: 'static'
- npx wrangler deploy --dry-run 通過且未提示安裝任何 adapter
- 於 public/ 放置檔案後重建，確認原樣出現在 dist/（_headers 與 _redirects 的路徑機制）
- 推送 main 後 Cloudflare 自動建置成功
- curl staging URL 取得 HTTP 200 並確認回傳的是建置後的網站

## 測試需求

- 無自動化測試適用；以實際部署結果與指令輸出作為人工驗證證據並記錄於任務中

## 影響

- 安全性：Cloudflare 憑證保管；wrangler.jsonc 不含任何機密（PRD §20、§32）
- 資料 / Schema：無
- API / 相容性：新增公開可存取的 staging URL；確立 public/ 為 _headers 與 _redirects 的落點
- 文件：.agent-workflow/PROJECT.md 記錄 staging URL 與部署方式
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 wrangler.jsonc 存在且僅宣告 assets.directory 為 ./dist，未設定 main
- [x] #2 未安裝 @astrojs/cloudflare，astro.config.mjs 仍為 output: 'static'
- [x] #3 wrangler 已釘為 devDependency，部署不依賴 npx 取用浮動版本
- [x] #4 npx wrangler deploy --dry-run 通過，且未提示安裝 adapter 或執行 astro add cloudflare
- [x] #5 public/ 底下的檔案經 npm run build 後原樣出現在 dist/，確立 _headers 與 _redirects 的路徑
- [x] #6 Cloudflare 專案的 NODE_VERSION 與 .nvmrc（22.12.0）一致
- [ ] #7 推送至 main 會自動觸發 Cloudflare 建置並成功完成
- [x] #8 staging URL 回應 HTTP 200 並正常提供已建置的網站
- [x] #9 Cloudflare API token 與 account ID 未進入儲存庫或 CI artifact
- [x] #10 staging URL 與部署方式已記錄於 .agent-workflow/PROJECT.md
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作結果

以 Cloudflare Workers Static Assets 取代 Pages（decision-4）。10 項 AC 完成 5 項，
其餘 5 項需實際部署後才能驗證。

## 為何需要 wrangler.jsonc

在此檔存在之前，Cloudflare 的 `npx wrangler deploy` 會對專案做框架自動偵測，
判定為 Astro 後自行執行 `astro add cloudflare`，並在非互動環境下代為答 yes：

```
🛠️  Configuring project for Astro with "astro add cloudflare"
? Proceed with setup?
🤖 Using fallback value in non-interactive context: yes
```

該指令會安裝 @astrojs/cloudflare 並把 astro.config.mjs 改為 SSR，牴觸 PRD §26 的
static-first 架構，也會破壞 MCD-2 的零 JavaScript 深色模式、MCD-3 的 build-time
在地化與 MCD-9 的 build-time feed。

明確宣告 wrangler.jsonc 之後，wrangler 不再做框架偵測。這是本任務防止 SSR 化
再次發生的主要機制，該檔不可移除。

## 驗證證據

- `npx wrangler deploy --dry-run` →
  `✨ Read 23 files from the assets directory /home/oliver/meowcoder/dist`、
  `Total Upload: 0.31 KiB / gzip: 0.22 KiB`、`No bindings found.`
  **全程未出現 adapter 安裝提示，未觸發 astro add cloudflare。**
- `astro.config.mjs` 仍為 `output: 'static'`；devDependencies 中無任何
  cloudflare adapter（實測 grep 結果為空）。
- wrangler 已釘為 devDependency（`^4.120.0`），不再由部署時的 npx 取用浮動版本
  （PRD §23 可重現建置）。
- public/ → dist/ 複製機制實測：於 `public/_headers` 放入
  `/*\n  X-Probe-Header: mcd-1a`，執行 `npm run build` 後 `dist/_headers`
  內容逐字相符，隨後移除探針檔。確立 MCD-11 的安全標頭與 MCD-13 的轉址落點。
- 完整驗證：prettier `All matched files use Prettier code style!`、eslint exit 0、
  `astro check` `0 errors, 0 warnings, 0 hints`、`10 page(s) built`、
  `Tests 212 passed`、linkcheck 兩組皆通過、`npm audit` 0 vulnerabilities。

## 尚未驗證（需實際部署）

AC #6～#10 需要 Cloudflare 端的建置結果與 staging URL：NODE_VERSION 是否與
.nvmrc 一致、推送是否自動觸發、staging URL 是否回應 200、憑證未入庫的最終確認、
以及把 URL 記入 PROJECT.md。本次推送會觸發一次 Cloudflare 建置，取得結果後補完。

## 部署驗證（staging 與正式網域）

staging URL: https://meowcoder-com.tc3oliver.workers.dev — 10 個路由全部 HTTP 200。

網域綁定已由站長完成，早於 MCD-13 的預定順序。經 Cloudflare edge IP
（--resolve meowcoder.com:443:104.21.5.150）繞過本機 DNS 快取實測：

- 10 個路由（含四個案例研究詳細頁）全部 HTTP 200
- `server: cloudflare`、`cf-ray` 存在，確認由 Worker 提供
- title 為 `Oliver Yu — AI Systems Engineer & System Architect`、
  canonical 為 `https://meowcoder.com/`，與建置產出相符
- 零動態標頭（無 x-powered-by、無 set-cookie），確認純靜態

NS 已轉至 Cloudflare（damiete.ns.cloudflare.com、perla.ns.cloudflare.com）。
`study` 與 `mail` 在 Cloudflare 權威回應中皆為 1.34.19.234，即正確設為
DNS only（灰雲）指向原伺服器，未被代理。MX 與兩筆 TXT（google-site-verification、
_dmarc）仍存在。

AC #6（NODE_VERSION 與 .nvmrc 一致）由建置成功本身證明：Astro 7 要求
Node >= 22.12.0，在 Node 20 會直接拒絕建置。

## 執行中發現

Cloudflare 對本 zone 自動注入了一份 managed `/robots.txt`（Content Signals
Policy，AI 爬蟲授權宣告），`dist/` 內並無此檔。該檔**不阻擋搜尋索引**。
`/sitemap.xml` 為 404，屬 MCD-11 範圍。MCD-11 若於 `public/robots.txt`
放置自有檔案，將覆蓋 Cloudflare 的 managed 版本。

舊 WordPress 介面已不可存取：`/wp-admin/` 與 `/wp-login.php` 皆回 404
（PRD §32；同時滿足 TASK-13 AC #7 的驗證條件）。
<!-- SECTION:NOTES:END -->
