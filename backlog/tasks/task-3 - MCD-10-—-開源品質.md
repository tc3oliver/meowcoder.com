---
id: TASK-3
title: MCD-10 — 開源品質
status: To Do
assignee: []
created_date: '2026-08-08 06:43'
labels: []
dependencies:
  - TASK-1
priority: medium
type: chore
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §19-24（Open Source Scope / Exclusions / Licensing / README / Quality Bar / Relationship to Portfolio）、§39 (MCD-10)

## 目標

讓公開儲存庫本身成為專業工程品質的證據，符合 PRD §23 的最低標準。

## 範圍

- README，結構依 PRD §22
- 明確的授權分割說明（原始碼 MIT / 個人內容與品牌資產保留權利）
- 相依更新機制
- CI 機密掃描步驟
- CI 連結檢查步驟
- 由乾淨 clone 驗證可重現的本機環境建置
- 依是否接受外部貢獻決定 CONTRIBUTING.md

## 不在範圍

- Lighthouse / 無障礙 CI gate（MCD-11）
- 任何頁面內容
- 將儲存庫切換為 public（MCD-13）

## 穩定實作限制

- README 不得變成長篇個人傳記（PRD §22）
- 不得僅為了方便陌生人 fork 而增加抽象層（PRD §18）
- meowcoder.com 原始碼定位為次要開源證據，不得超越 AI Coding Skills 的主要地位（PRD §24）
- 本任務僅新增儲存庫層級檔案與 CI 設定，不修改 src/ 下的頁面程式碼，以便與 MCD-2 平行執行時不衝突

## 驗證

- CI 上機密掃描與連結檢查工作皆通過
- 於暫存目錄 git clone 後，僅依 README 指示即可 install 與 build 成功

## 測試需求

- 以 CI 機密掃描與連結檢查通過作為驗證證據
- 乾淨 clone 建置為人工驗證，需記錄實際指令輸出

## 影響

- 安全性：機密掃描與相依更新政策（PRD §20、§23）
- 資料 / Schema：無
- API / 相容性：無
- 文件：README.md、LICENSE、內容授權聲明、CONTRIBUTING.md（如適用）
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README 依 PRD §22 結構撰寫（Stack、Development、License），維持工程導向且不含個人傳記
- [ ] #2 授權分割在 README 與 LICENSE 明確標示：原始碼採 MIT、個人內容與品牌資產為 © Oliver Yu
- [ ] #3 相依更新機制（Dependabot 或 Renovate）已設定並可產生更新 PR
- [ ] #4 CI 包含連結檢查，能偵測 README 與網站中的失效連結
- [ ] #5 CI 包含機密掃描步驟，能攔截誤加入的憑證或金鑰
- [ ] #6 從乾淨 clone 僅依 README 指示即可完成 install 與 build
- [ ] #7 若接受外部貢獻則存在 CONTRIBUTING.md；若不接受，於 README 明確說明此決定
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
