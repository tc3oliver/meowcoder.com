---
id: TASK-11
title: MCD-11 — SEO、無障礙與效能
status: To Do
assignee: []
created_date: '2026-08-08 06:47'
updated_date: '2026-08-08 14:21'
labels: []
dependencies:
  - TASK-8
  - TASK-6
  - TASK-9
  - TASK-10
  - TASK-14
priority: medium
type: feature
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §29（Performance & Accessibility）、§30（SEO）、§32（Security）、§33（Analytics）、§39 (MCD-11)

## 目標

所有已完成頁面在兩種語言下皆達到 PRD 的 Lighthouse、無障礙與 SEO 目標，並在 staging 完成安全標頭與分析埋點，讓 MCD-13 只需驗證而非新增實作。

## 範圍

- 結構化資料：Person、WebSite、Shouri 的 SoftwareApplication 或 Product
- sitemap.xml 與 robots.txt
- 全站 canonical、hreflang 與在地化 Open Graph metadata 稽核
- 無障礙修正：語意化 HTML、focus、對比、alt 文字、標題階層
- 圖片最佳化（AVIF / WebP、明確尺寸）
- 安全標頭與 CSP，於 Cloudflare Pages staging 設定並對齊實際相依（PRD §32）
- 分析方案選型與埋點：頁面瀏覽、外連點擊、案例研究互動、語言使用（PRD §33）
- 英文與中文路由的 Lighthouse 最佳化

## 不在範圍

- 新增頁面內容（已由 MCD-4、MCD-6、MCD-7、MCD-8、MCD-9 完成）
- 正式環境部署、DNS/TLS、HSTS 啟用與上線後重測（MCD-13）

## 穩定實作限制

- 不得引入非必要的第三方腳本；分析方案必須在 Performance 與 Best Practices 皆達 95 分的前提下選擇（PRD §29、§32、§33）
- 分析不得以總瀏覽量為最佳化目標，只追蹤 PRD §33 列出的訊號
- 不得在前端放入任何機密（PRD §32）
- HSTS 不在本任務啟用，需待 MCD-13 完成部署驗證後才開啟（PRD §32）
- 必須支援 prefers-reduced-motion
- 英文與中文路由適用相同品質標準，不得只最佳化其中一種語言
- 本任務會橫跨多個頁面檔案，建議不與其他任務排入同一平行批次，以免 merge 衝突

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 對英文與中文的首頁、About、Work 路由執行 Lighthouse，並記錄四項分數
- 檢視產出 HTML 的 canonical、hreflang、Open Graph 與結構化資料
- 於 staging 以 curl -I 檢視安全標頭實際回應
- 於 staging 實際點擊各外連 CTA，確認分析事件如期回報

## 測試需求

- Lighthouse 實測涵蓋兩種語言的主要路由，分數須記錄為證據
- 無障礙檢查以自動化工具加人工鍵盤操作驗證
- 分析埋點以 staging 手動點擊驗證，並記錄實際回報結果

## 影響

- 安全性：安全標頭與 CSP 於本任務定案（HSTS 除外）；分析設定不得外洩金鑰（PRD §32）
- 資料 / Schema：無
- API / 相容性：新增 sitemap.xml 與 robots.txt 兩個公開端點
- 文件：分析訊號清單與安全標頭設定說明
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 英文與中文首頁的 title 與 description 完全對應 PRD §30 指定的文字
- [ ] #2 結構化資料包含 Person、WebSite，以及 Shouri 的 SoftwareApplication 或 Product，且使用對應語言的頁面內容
- [ ] #3 sitemap.xml 與 robots.txt 已產生且內容正確
- [ ] #4 全站每個路由的 canonical 與 hreflang（en、zh-Hant、x-default）皆正確無誤
- [ ] #5 無障礙檢查通過：語意化 HTML、鍵盤可操作、可見 focus、WCAG AA 對比、有意義的 alt 文字、正確標題階層
- [ ] #6 英文與中文路由的 Lighthouse Performance、Accessibility、Best Practices、SEO 四項皆達 95 分以上
- [ ] #7 圖片使用最佳化的 AVIF 或 WebP 並標註明確尺寸，且未引入非必要的第三方腳本
- [ ] #8 Lighthouse 實測分數已記錄於任務中作為驗證證據
- [ ] #9 安全標頭與 CSP 已於 Cloudflare Pages staging 設定並對齊實際相依，HTTPS only，前端不含任何機密；HSTS 保留給 MCD-13
- [ ] #10 分析已埋設 PRD §33 的全部訊號：首頁瀏覽、Work 頁瀏覽，以及 Shouri、Study、GitHub、論文、Site Source 的外連點擊、案例研究互動與語言使用
- [ ] #11 所選分析方案未使 Lighthouse Performance 或 Best Practices 低於 95 分
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
