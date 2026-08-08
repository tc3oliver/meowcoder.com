---
id: decision-4
title: 以 Cloudflare Workers Static Assets 取代 Cloudflare Pages 作為託管方式
date: '2026-08-08 16:12'
status: accepted
---
## Context

PRD（`doc-1`）§26 的建議技術堆疊明列 `Cloudflare Pages`，`decision-3` 拆出的 TASK-14 也以此撰寫驗收標準。

實際建立時，該 Cloudflare 帳號走的是 Workers Builds 流程而非傳統 Pages 流程。以預設的 `npx wrangler deploy` 部署會被判定為 Worker 專案，wrangler 隨即自動執行 `astro add cloudflare`，並在非互動環境下自行答 yes：

```
🛠️  Configuring project for Astro with "astro add cloudflare"
? Proceed with setup?
🤖 Using fallback value in non-interactive context: yes
```

該指令會安裝 `@astrojs/cloudflare` adapter 並改寫 `astro.config.mjs`，把網站從靜態輸出轉為 SSR。這直接牴觸 PRD §26 的 static-first 架構，也會破壞 MCD-2 的零 JavaScript 深色模式、MCD-3 的 build-time 在地化與 MCD-9 的 build-time feed —— 這些全部建立在靜態輸出之上。同一次建置也警告 `wrangler` 的 Astro 整合尚未支援 Astro 7.2.0。

該次部署未修改儲存庫（Cloudflare 的變更只發生在其建置機器上），本機 `astro.config.mjs` 經確認仍為 `output: 'static'`。

站長決定不改走 Pages 流程、不刪除既有的 `meowcoder-com` Worker，改以 Cloudflare Workers Static Assets 託管。

## Decision

以 **Cloudflare Workers Static Assets** 取代 Cloudflare Pages 作為託管方式。

在儲存庫加入 `wrangler.jsonc`，僅宣告 `assets.directory = "./dist"`，**不設定 `main`** —— 沒有 `main` 即為純靜態資產 Worker，不執行任何伺服器端程式碼。不安裝 `@astrojs/cloudflare`，不執行 `astro add cloudflare`，`astro.config.mjs` 維持 `output: 'static'` 不變。

`wrangler` 釘為 devDependency，而非讓部署時以 `npx` 取用最新版（PRD §23 要求可重現的建置）。

## Consequences

- 託管平台由 Pages 改為 Workers Static Assets，但**對外行為等價**：兩者皆提供靜態檔案，皆支援 `_headers` 與 `_redirects`，皆提供 `*.workers.dev` / `*.pages.dev` 形式的預覽網域與自訂網域。
- `_headers` 與 `_redirects` 必須放在 `public/` 底下，Astro 建置時會原樣複製到 `dist/`，Workers Static Assets 再從該處讀取。MCD-11（安全標頭與 CSP）與 MCD-13（轉址）依此路徑實作。
- 明確宣告 `wrangler.jsonc` 之後，wrangler 不再對專案做框架自動偵測，因此不會再嘗試安裝 adapter。這是本決策防止 SSR 化再次發生的主要機制。
- TASK-14 的驗收標準原以 Cloudflare Pages 撰寫，需改寫為 Workers Static Assets；驗收意圖不變（自動建置、staging URL 可用、Node 版本一致、憑證不入庫）。
- PRD §26 的 `Cloudflare Pages` 字面被本決策推翻，`doc-1` 維持原文不動，差異以本記錄追溯。MCD-13 的正式上線切換改以 Workers 自訂網域進行。
- 若日後改回 Pages，需建立新的決策記錄，而不是修改本記錄。
