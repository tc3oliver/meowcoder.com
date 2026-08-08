---
id: TASK-2
title: MCD-2 — 設計系統
status: To Do
assignee: []
created_date: '2026-08-08 06:43'
labels: []
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §25（Visual Direction）、§26（Technical Architecture）、§39 (MCD-2)

## 目標

建立共用視覺基礎（設計 token、響應式外框、Header/Footer、focus 狀態），供後續所有頁面直接沿用。

## 範圍

- CSS 設計 token：字級、間距、中性色系、單一強調色、細邊框（styles/tokens.css、styles/global.css）
- 響應式頁面外框，內容寬與閱讀寬依 PRD §25
- Header 與 Footer 元件骨架
- focus-visible 狀態與 prefers-reduced-motion 支援
- 可選深色模式

## 不在範圍

- 雙語路由、語言切換與導覽文字（MCD-3）
- 實際頁面內容（MCD-4 起）
- Lighthouse 分數最佳化（MCD-11）

## 穩定實作限制

- static-first，盡量不輸出 client-side JavaScript（PRD §26、§29）
- 採 light-first、暖中性背景、近黑字色、單一克制的強調色
- 嚴禁 PRD §25 列出的視覺元素
- Header/Footer 僅建立結構與樣式，文字內容留給 MCD-3 的 i18n 字典注入，避免與後續任務在同一檔案衝突

## 驗證

- 依 MCD-1 回填 .agent-workflow/PROJECT.md 的 lint、typecheck、build 指令
- 桌機與行動裝置視窗寬度下的人工視覺檢查

## 測試需求

- 人工視覺 QA（桌機與行動裝置）
- 本專案尚無自動化視覺回歸工具，記錄為不適用

## 影響

- 安全性：無
- 資料 / Schema：無
- API / 相容性：設計 token 名稱成為後續所有元件的共用契約
- 文件：styles/tokens.css 中的 token 用途註解
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 設計 token（字級、間距、中性色系、單一強調色、細邊框）已實作於 styles/tokens.css 並由 global.css 套用
- [ ] #2 響應式外框在桌機與行動裝置皆正確：內容寬約 1100-1200px、閱讀寬約 680-760px
- [ ] #3 Header 與 Footer 元件可在任意頁面重複使用
- [ ] #4 所有可聚焦元素具備明顯 focus 樣式，且對比符合 WCAG AA
- [ ] #5 深色模式切換不會出現未套用樣式的閃爍
- [ ] #6 prefers-reduced-motion 生效時停用非必要動態效果
- [ ] #7 頁面未出現 PRD §25 禁用的任何視覺元素（AI 機器人、霓虹漸層、粒子、視差、打字機效果、logo 牆、技能百分比圖等）
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
