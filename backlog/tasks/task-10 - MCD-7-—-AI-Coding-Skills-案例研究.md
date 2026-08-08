---
id: TASK-10
title: MCD-7 — AI Coding Skills 案例研究
status: In Progress
assignee: []
created_date: '2026-08-08 06:46'
updated_date: '2026-08-08 15:24'
labels: []
dependencies:
  - TASK-5
priority: medium
type: feature
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §9.4（Open Source — AI Coding Skills）、§10（Work — AI Coding Skills 詳細結構）、§34（Content Language Rules）、§37（Content Quality Rule）、§39 (MCD-7)

## 目標

以 MCD-5 的內容模型在兩種語言下發佈 AI Coding Skills 案例研究，作為網站的主要 Open Source Proof，並正確標示第三方出處。

## 範圍

- src/content/work/en/ai-coding-skills 與 src/content/work/zh/ai-coding-skills 內容檔
- PRD §10 要求的全部區塊
- backlog-workflow 為主要公開作品、audit-claude-md 為次要
- 第三方來源 skill 的出處與授權標示

## 不在範圍

- 首頁的 Open Source 摘要區塊（已由 MCD-4 完成）
- Shouri 案例研究（MCD-6）

## 穩定實作限制

- 第三方來源的 skill 必須保留明確出處與授權標示，不得呈現為原創作品（PRD §9.4）。依儲存庫證據，backlog-workflow 為本人原創，其內含的 grilling 係基於 Matt Pocock 的 MIT 授權作品，需保留該標示
- 僅呈現可公開檢視的證據（PRD §10）
- 內容品質須符合 PRD §37：以工程證據取代行銷形容詞
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 平行執行考量：本任務僅新增 ai-coding-skills 的內容檔，不修改共用版面或字典

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的區塊完整性、出處標示與語言切換對應
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 內容須通過 MCD-5 的 content schema 驗證（build time 強制）
- 人工內容 QA 與出處正確性檢查

## 影響

- 安全性：無
- 資料 / Schema：無（使用 MCD-5 既有 schema）
- API / 相容性：新增 /work/ai-coding-skills 與 /zh/work/ai-coding-skills 兩個公開 URL
- 文件：第三方出處與授權標示
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AI Coding Skills 作品詳細頁在英文與中文下皆發佈，且包含 PRD §10 要求的全部區塊：Problem、Coding-Agent Failure Modes、Workflow Architecture、Requirement/Backlog Separation、JIT Planning、Execution Boundaries、Validation & Evidence、Manual vs Autonomous Mode、Trade-offs、GitHub Evidence
- [ ] #2 backlog-workflow 呈現為主要公開作品，涵蓋需求驅動開發、Backlog.md 整合、手動與自動執行、明確執行邊界、驗證關卡與證據導向完成
- [ ] #3 audit-claude-md 呈現為次要公開作品，用於展示 context 品質、指令設計、漸進揭露與可維護性
- [ ] #4 任何第三方來源的 skill（例如基於 Matt Pocock 的 grilling）皆保留明確出處與授權標示，未呈現為原創作品
- [ ] #5 /work/ai-coding-skills 與 /zh/work/ai-coding-skills 可透過語言切換正確互相對應
- [ ] #6 兩種語言的內容皆通過 MCD-5 的 content schema 驗證
- [ ] #7 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
- [ ] #8 內容符合 PRD §37：每項主張以工程證據支撐，未使用行銷形容詞堆砌
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
