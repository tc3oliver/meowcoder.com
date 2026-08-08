---
id: TASK-13
title: MCD-13 — 正式上線切換
status: To Do
assignee: []
created_date: '2026-08-08 06:47'
updated_date: '2026-08-08 17:00'
labels: []
dependencies:
  - TASK-3
  - TASK-11
  - TASK-14
priority: high
type: chore
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §32（Security）、§33（Analytics）、§38（Acceptance Criteria）、§39 (MCD-13)
- decision-2（不執行 WordPress 遷移程序，由站長直接刪除舊站）

## 目標

改版後的網站在 meowcoder.com 正式上線，原始碼儲存庫轉為公開。

## 範圍

- Cloudflare Pages 正式環境部署
- DNS 與 TLS 切換及驗證（網域由站長轉指到本站）
- 部署驗證通過後啟用 HSTS（PRD §32）
- 驗證 MCD-11 設定的安全標頭與分析訊號在正式環境正確生效
- sitemap 驗證與全站連結檢查
- 桌機與行動裝置、英文與中文的 QA
- 將 tc3oliver/meowcoder.com 儲存庫轉為 public

## 不在範圍

- 任何新功能或新內容（皆屬先前的 MCD 任務）
- 分析埋點與安全標頭的實作（MCD-11；本任務僅驗證並啟用 HSTS）
- WordPress 舊站的盤點、備份、轉址對應與下線作業；依 decision-2 由站長自行直接刪除

## 穩定實作限制

- 僅提供 HTTPS，安全標頭沿用 MCD-11 的設定，HSTS 僅在部署驗證後才啟用（PRD §32）
- 儲存庫轉為 public 前必須確認不含 PRD §20 列出的任何機密或個人敏感檔案
- 分析不得以總瀏覽量為最佳化目標（PRD §33）
- 依 decision-2，舊 WordPress URL 將回應 404 而非 301 或 410，且本次切換沒有回滾路徑；不得因此臨時新增未經決策的轉址規則

## 驗證

- 依 .agent-workflow/PROJECT.md 的 build 指令確認產出
- 人工驗證 DNS 與 TLS，並以 curl -I 檢視正式環境安全標頭含 HSTS
- 對正式環境 URL 重跑 Lighthouse，確認仍符合 MCD-11 門檻
- 以 curl -I 確認 /wp-admin 等 WordPress 路徑無可存取的執行介面（PRD §32）
- 逐項核對 PRD §38 的驗收條件，並標註第 17 點依 decision-2 由站長自行完成

## 測試需求

- 正式環境 Lighthouse 重測結果須記錄
- 連結檢查結果須記錄
- PRD §38 的驗收逐項核對結果須記錄

## 影響

- 安全性：正式環境 HSTS 啟用與安全標頭驗證；儲存庫可見性切換為 public（PRD §32）
- 資料 / Schema：無
- API / 相容性：公開 URL 結構自此固定；舊 WordPress URL 不提供轉址（decision-2）
- 文件：README 與 .agent-workflow/PROJECT.md 視需要更新為正式上線狀態
- 遷移 / 回滾：無回滾路徑（decision-2 已放棄 WordPress 備份）
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Cloudflare Pages 正式環境部署完成並正確提供建置後的網站
- [ ] #2 meowcoder.com 的 DNS 指向新網站，且 TLS 憑證驗證通過
- [ ] #3 MCD-11 設定的安全標頭在正式環境生效，且部署驗證通過後已啟用 HSTS
- [ ] #4 MCD-11 埋設的 PRD §33 分析訊號在正式環境正確回報，且未追蹤該清單以外的訊號
- [ ] #5 sitemap 已提交或驗證，且全站連結檢查未發現失效的內部連結
- [ ] #6 桌機與行動裝置在英文與中文下的 QA 皆通過
- [ ] #7 正式環境的 /wp-admin 等 WordPress 路徑無可存取的管理或執行介面（PRD §32）
- [ ] #8 tc3oliver/meowcoder.com 儲存庫已轉為 public，且確認不含機密或個人敏感檔案
- [ ] #9 正式環境的 Lighthouse 重測仍符合 MCD-11 的 95 分門檻
- [ ] #10 PRD §38 的驗收條件已逐項核對並記錄結果，第 17 點標註為依 decision-2 由站長自行完成
- [ ] #11 轉為 public 前已就 backlog/ 與 .agent-workflow/ 做出明確的保留或移除決定（doc-1 為完整 PRD，含未發佈的產品定位與內容策略，屬 PRD §20「未發佈產品資訊」），不得只做機密掃描就放行
- [ ] #12 www.meowcoder.com 可正常服務或明確轉址至 apex（目前回應 522：已由 Cloudflare 代理但原伺服器不可達，站長暫時擱置）
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
