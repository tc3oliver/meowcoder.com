---
id: TASK-7
title: MCD-9 — Study 文章整合
status: To Do
assignee: []
created_date: '2026-08-08 06:44'
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
- [ ] #1 build time 取得 study.meowcoder.com 的 RSS/Atom feed，並解析出最新 3 至 5 篇文章的日期、分類與標題
- [ ] #2 feed 無法取得或格式錯誤時，production build 仍成功並以優雅降級方式處理
- [ ] #3 英文情境在沒有英文標題時顯示文章原標題，且不在 runtime 進行機器翻譯
- [ ] #4 中文情境以自然的中文呈現 Study 內容
- [ ] #5 未為了此同步引入任何資料庫或 CMS
- [ ] #6 具備涵蓋正常解析與失敗降級兩種路徑的自動化測試
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
