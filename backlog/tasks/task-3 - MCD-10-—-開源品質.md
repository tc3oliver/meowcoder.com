---
id: TASK-3
title: MCD-10 — 開源品質
status: To Do
assignee: []
created_date: '2026-08-08 06:43'
updated_date: '2026-08-08 14:27'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 研究現況：閱讀 MCD-1 既有產出（README.md、LICENSE、LICENSE-CONTENT.md、.github/workflows/ci.yml、.gitignore、package.json）與 PRD §18-24、§39 MCD-10、§41，確認本任務為「擴充」而非重寫。
2. README（AC #1 #2 #6 #7）：維持 PRD §22 的骨架（Stack / Development / License），補上可重現本機環境所需的完整指示（Node 22.12+、nvm、install、dev、build、preview）、品質檢查指令（含新增的 linkcheck）、Repository layout、Contributing 政策與 Security 說明。維持工程導向、不寫個人傳記、不揭露內部自動化開發機制。
3. 授權分割（AC #2）：確認 README 與 LICENSE / LICENSE-CONTENT.md 三處敘述一致（原始碼 MIT、個人內容與品牌資產 © Oliver Yu），並在 LICENSE 檔案本身加上指向 LICENSE-CONTENT.md 的範圍註記，避免 LICENSE 被單獨解讀為涵蓋全部檔案。
4. 相依更新機制（AC #3）：新增 .github/dependabot.yml，涵蓋 npm 與 github-actions 兩個 ecosystem，每週檢查、限制併發 PR 數並統一 commit message 前綴。選用 Dependabot 而非 Renovate：GitHub 原生、無需外部帳號或安裝 App。
5. 連結檢查（AC #4）：新增 devDependency linkinator 與 npm script `linkcheck`，同時檢查 dist/（建置後的網站 HTML，遞迴）與根目錄的 Markdown 文件（--markdown）。在 CI 於 build 之後、test 之前加入 Link check 步驟，符合 PRD §23 建議的 CI 順序。
6. 機密掃描（AC #5）：在 CI 新增獨立的 secret-scan job，以固定版本 + SHA256 checksum 下載官方 gitleaks 二進位檔（MIT 授權）執行 `gitleaks dir`（工作目錄）與 `gitleaks git`（完整歷史，fetch-depth: 0）。不使用 gitleaks-action，理由：該 Action 採商業 EULA 且對組織帳號需要授權金鑰，直接使用 OSS 二進位檔可完全免除外部帳號與授權相依，且可在本機以完全相同的指令驗證。
7. 儲存庫衛生：將 CI 內所有 GitHub Actions 由 tag 釘選改為 commit SHA 釘選（MCD-1 review 遺留項），並在註解記錄對應版本。
8. 驗證：依 PRD §23 順序執行 npm run format:check / lint / typecheck / build / linkcheck / test，全部必須通過；以 YAML 解析器驗證 ci.yml 與 dependabot.yml 語法；在本機以下載的 gitleaks 執行實際掃描取得證據。
9. AC #6 實測：git clone 本 worktree 至 /tmp 的暫存目錄，僅依 README 指示執行 install 與 build，記錄實際輸出後刪除暫存目錄。
10. 記錄 Implementation Notes（含實際指令輸出、以及哪些部分只能在 push 後由 CI 首次執行）、逐項勾選 AC 與 DoD、撰寫 Final Summary，最後提交至 backlog/TASK-3（不 push、不 merge）。
<!-- SECTION:PLAN:END -->
