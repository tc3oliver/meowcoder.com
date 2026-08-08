---
id: TASK-14
title: MCD-1a — Cloudflare Pages staging 環境
status: To Do
assignee: []
created_date: '2026-08-08 14:21'
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

- doc-1 §39 (MCD-1 的 Cloudflare Pages staging 項目)、§29（Performance & Accessibility）、§32（Security）
- decision-3（將 Cloudflare Pages staging 自 MCD-1 拆出為獨立任務）

## 目標

meowcoder.com 具備可用的 Cloudflare Pages staging 環境，每次推送 main 都自動部署，供 MCD-11 量測 Lighthouse 與驗證安全標頭。

## 範圍

- 建立 Cloudflare Pages 專案並連接 tc3oliver/meowcoder.com
- 建置設定：framework preset Astro、build command npm run build、output directory dist
- 環境變數 NODE_VERSION 對齊 .nvmrc（22.12.0）
- 驗證推送 main 後自動觸發部署且 staging URL 可正常提供網站
- 將 staging URL 記錄於 .agent-workflow/PROJECT.md

## 不在範圍

- 正式環境部署、DNS 與 TLS 切換（MCD-13）
- 安全標頭與 CSP 的實際設定內容（MCD-11 於 staging 上設定）
- 分析埋點（MCD-11）

## 穩定實作限制

- 本任務需要 Cloudflare 帳號存取權。Dashboard 的 GitHub 整合需互動式登入，wrangler 需 CLOUDFLARE_API_TOKEN 與 CLOUDFLARE_ACCOUNT_ID；兩者皆非本專案可自動取得
- Cloudflare API token 與 account ID 絕不可提交至儲存庫；.gitignore 已排除 .dev.vars 與 .wrangler/（PRD §20、§32）
- NODE_VERSION 必須與 .nvmrc 一致，否則 Astro 7 會拒絕建置
- 必須在 TASK-11 之前完成：沒有 staging 就沒有量測 Lighthouse 與驗證安全標頭的環境

## 驗證

- 推送一個 commit 至 main，確認 Cloudflare Pages 自動觸發建置且成功
- curl staging URL 取得 HTTP 200 並確認回傳的是建置後的網站
- Cloudflare 建置日誌顯示使用的 Node 版本符合 .nvmrc

## 測試需求

- 無自動化測試適用；以實際部署結果與 curl 輸出作為人工驗證證據，並記錄於任務中

## 影響

- 安全性：Cloudflare 憑證的保管；不得進入儲存庫或 CI artifact（PRD §20、§32）
- 資料 / Schema：無
- API / 相容性：新增一個公開可存取的 staging URL
- 文件：.agent-workflow/PROJECT.md 記錄 staging URL
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Cloudflare Pages 專案已建立並連接 tc3oliver/meowcoder.com
- [ ] #2 建置設定為 build command npm run build、output directory dist，且 NODE_VERSION 與 .nvmrc（22.12.0）一致
- [ ] #3 推送至 main 會自動觸發 Cloudflare Pages 建置並成功完成
- [ ] #4 staging URL 回應 HTTP 200 並正常提供已建置的網站
- [ ] #5 Cloudflare API token 與 account ID 未進入儲存庫或 CI artifact
- [ ] #6 staging URL 已記錄於 .agent-workflow/PROJECT.md
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
