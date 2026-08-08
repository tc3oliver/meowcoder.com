---
id: TASK-5
title: MCD-5 — 作品內容模型
status: In Progress
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 14:59'
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
- [ ] #1 Astro Content Collections 或 MDX schema 已定義雙語作品項目的必填 metadata（標題、類型、slug、語言、翻譯 key）
- [ ] #2 /work 與 /zh/work 可列出所有已發佈的作品項目
- [ ] #3 共用的 WorkLayout 在兩種語言下一致地呈現作品詳細頁
- [ ] #4 穩定的 slug 與翻譯 key 對應讓語言切換能可靠地在 /work/[slug] 與 /zh/work/[slug] 之間解析
- [ ] #5 缺少必填 metadata 的內容檔會在 build time 失敗並指出問題欄位
- [ ] #6 新增一組雙語案例研究只需新增內容檔，不需新增或修改頁面程式碼
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
