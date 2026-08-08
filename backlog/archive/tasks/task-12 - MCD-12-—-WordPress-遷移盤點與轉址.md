---
id: TASK-12
title: MCD-12 — WordPress 遷移盤點與轉址
status: To Do
assignee: []
created_date: '2026-08-08 06:47'
updated_date: '2026-08-08 06:58'
labels: []
dependencies:
  - TASK-8
  - TASK-6
  - TASK-9
  - TASK-10
priority: low
type: chore
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §31（WordPress Migration）、§20（Open Source Exclusions）、§39 (MCD-12)

## 目標

完成既有 WordPress 內容的盤點、私有備份與轉址對應，讓 MCD-13 能安全地下線 WordPress。

## 範圍

- 現有 WordPress 的 URL、標題、文章、媒體、外部連結與已索引頁面盤點
- WordPress 資料庫與 wp-content/uploads 的私有備份（存放於公開儲存庫之外）
- 依 PRD §31 政策建立轉址對應表

## 不在範圍

- 實際執行 DNS 與正式環境切換（MCD-13）
- 將轉址部署至正式環境（MCD-13）

## 穩定實作限制

- 備份絕不可進入公開 Git 儲存庫或 CI artifact（PRD §20、§31）
- 不得將所有舊 URL 一律轉址至首頁（PRD §31）
- 本任務依賴新網站頁面已存在，才能確認 301 目標有效

## 驗證

- 人工驗證：確認備份存在於非儲存庫的私有位置，且 git status 未顯示備份檔案
- 抽樣比對轉址對應表與盤點清單，確認涵蓋率與目標 URL 有效性
- 本專案未偵測到 WordPress 匯出或盤點的自動化指令，故以人工驗證並記錄實際輸出作為證據

## 測試需求

- 無自動化測試適用；以人工驗證證據取代，並於任務中記錄實際檢查結果

## 影響

- 安全性：私有備份不得外洩至公開儲存庫或 CI（PRD §20）
- 資料 / Schema：WordPress 資料庫與媒體匯出
- API / 相容性：舊 WordPress URL 將轉址至新的 URL 結構
- 文件：轉址對應表與盤點清單記錄於任務證據中
- 遷移 / 回滾：本任務建立的備份即為 MCD-13 的回滾依據
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 WordPress 資料庫與 wp-content/uploads 的私有備份存在於公開 Git 儲存庫之外的位置
- [ ] #2 已記錄現有 WordPress 的 URL、標題、文章、有價值媒體、外部連結與已索引頁面盤點清單
- [ ] #3 轉址對應表已建立：有對應 Study 文章者 301 至 Study、舊 About 與首頁路由 301 至新頁面、無替代內容者回應 410 Gone
- [ ] #4 未採用將所有舊 URL 一律轉址至 / 的作法
- [ ] #5 轉址對應表中的每個 301 目標 URL 都確實存在於新網站
- [ ] #6 備份與盤點產物皆未進入公開儲存庫或 CI artifact
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
