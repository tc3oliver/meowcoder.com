---
id: TASK-9
title: MCD-6 — Shouri 案例研究
status: In Progress
assignee: []
created_date: '2026-08-08 06:46'
updated_date: '2026-08-08 15:24'
labels: []
dependencies:
  - TASK-5
priority: medium
type: feature
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §4（Evidence Model）、§9.2、§10（Work — Shouri 詳細結構）、§34（Content Language Rules）、§37（Content Quality Rule）、§39 (MCD-6)

## 目標

以 MCD-5 的內容模型在兩種語言下發佈 Shouri 案例研究，作為網站的主要 Product Proof。

## 範圍

- src/content/work/en/shouri 與 src/content/work/zh/shouri 內容檔
- PRD §10 要求的全部區塊：Problem、Product Principles、Architecture、Engineering Decisions、AI Processing、Search & Retrieval、Mobile / PWA Integration、Production Considerations、Result、Evidence

## 不在範圍

- 首頁的 Shouri 摘要區塊（已由 MCD-4 完成）
- AI Coding Skills 案例研究（MCD-7）

## 穩定實作限制

- 僅呈現可公開檢視的證據（PRD §10、§38 第 10 點）
- 不得包含雇主機密、專有原始碼或未發佈的產品資訊（PRD §20）
- 內容品質須符合 PRD §37：以工程證據取代行銷形容詞
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 平行執行考量：本任務僅新增 shouri 的內容檔，不修改共用版面或字典

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的區塊完整性與語言切換對應
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 內容須通過 MCD-5 的 content schema 驗證（build time 強制）
- 人工內容 QA

## 影響

- 安全性：需確認不含機密或未發佈資訊
- 資料 / Schema：無（使用 MCD-5 既有 schema）
- API / 相容性：新增 /work/shouri 與 /zh/work/shouri 兩個公開 URL
- 文件：無
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Shouri 作品詳細頁在英文與中文下皆發佈，且包含 PRD §10 要求的全部區塊：Problem、Product Principles、Architecture、Engineering Decisions、AI Processing、Search & Retrieval、Mobile/PWA Integration、Production Considerations、Result、Evidence
- [ ] #2 內容支撐 Shouri 作為主要 Product Proof 的定位，展現端對端產品執行力（PRD §4、§9.2）
- [ ] #3 內容僅包含可公開檢視的證據，不含雇主機密、專有原始碼或未發佈的產品資訊
- [ ] #4 /work/shouri 與 /zh/work/shouri 可透過語言切換正確互相對應
- [ ] #5 兩種語言的內容皆通過 MCD-5 的 content schema 驗證
- [ ] #6 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
- [ ] #7 內容符合 PRD §37：每項主張以工程證據支撐，未使用行銷形容詞堆砌
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
