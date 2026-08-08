---
id: TASK-6
title: MCD-8 — 研究與關於頁
status: In Progress
assignee: []
created_date: '2026-08-08 06:44'
updated_date: '2026-08-08 14:59'
labels: []
dependencies:
  - TASK-4
priority: medium
type: feature
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §11（Company Experience Policy）、§13（About）、§14（Career Snapshot）、§15（Research & Education）、§16（Selected Credentials）、§17（Engineering Principles）、§34（Content Language Rules）、§39 (MCD-8)

## 目標

About 頁在兩種語言下傳達專業深度、研究可信度與工程原則，且不淪為履歷牆。

## 範圍

- About 開場文案與 Engineering Background（PRD §13）
- Career Snapshot（PRD §14）
- Research 與 Education（PRD §15）
- Selected Credentials（PRD §16）
- Engineering Principles（PRD §17）
- 英文與中文兩個版本

## 不在範圍

- 首頁的 Research 區塊（MCD-4）
- 可下載 CV 或 LinkedIn 整合（PRD §14 說明為非必要）

## 穩定實作限制

- 不得將原始履歷 PDF 放入儲存庫或頁面（PRD §14、§20）
- 不得將課程完訓證明標示為專業證照，且不做證照 logo 牆（PRD §16）
- 公司經歷僅能以安全抽象層級描述，不得出現內部專案名稱或機密資訊（PRD §11）
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 平行執行考量：僅新增 about 專屬的 i18n 模組，不修改共用字典檔

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的 About 內容、區塊順序與禁用項目
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 人工內容 QA；本任務無產品邏輯，無自動化內容測試，記錄為不適用

## 影響

- 安全性：需確認不含雇主機密資訊（PRD §11）
- 資料 / Schema：無
- API / 相容性：無
- 文件：無
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 About 開場文案在兩種語言下皆對應 PRD §13 的三段內容
- [ ] #2 Engineering Background 以精簡清單呈現，未形成履歷牆
- [ ] #3 Career Snapshot 依 Today、Earlier、Foundation 三層緊湊呈現（PRD §14）
- [ ] #4 Research 與 Education 呈現 JISA 論文與國立臺灣海洋大學碩士學位，作為精簡的可信度訊號
- [ ] #5 Selected Credentials 僅列出 PRD §16 建議的兩項證照，且未出現證照 logo 牆
- [ ] #6 未將 PMP 課程或 GKE 入門課程等完訓證明標示為專業證照
- [ ] #7 Engineering Principles 六項原則呈現於 About 頁，而非首頁的大型區塊
- [ ] #8 儲存庫與頁面皆未包含原始履歷 PDF
- [ ] #9 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
