---
id: TASK-1
title: MCD-1 — 儲存庫啟動
status: In Progress
assignee: []
created_date: '2026-08-08 06:41'
updated_date: '2026-08-08 07:04'
labels: []
dependencies: []
priority: high
type: chore
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §18-23（含 §23 Open Source Quality Bar 的建議 CI 流程）、§26、§39 (MCD-1)
- decision-1（在現有 backlog 工作目錄中實作 meowcoder.com 網站）

## 目標

在本目錄建立可建置、可測試、通過 CI 的 Astro + TypeScript 網站骨架，並完成 GitHub 儲存庫與 Cloudflare Pages staging 部署。

## 範圍

- 在 /home/oliver/meowcoder 執行 git init；以 gh CLI（已認證為 tc3oliver）建立並推送 tc3oliver/meowcoder.com
- Astro + TypeScript 專案 scaffold，目錄結構依 PRD §26
- lint / format / typecheck 工具與對應 npm scripts
- 測試執行器（例如 Vitest）與 npm run test script，含一個最小的通過範例測試
- GitHub Actions CI：install、format/lint、typecheck、build、test（順序依 PRD §23）
- Cloudflare Pages staging 環境連接
- .gitignore、原始碼 MIT LICENSE、內容授權聲明（PRD §21）

## 不在範圍

- 任何頁面內容、設計系統、雙語路由（屬後續 MCD 任務）
- 正式網域切換與 DNS（MCD-13）
- 連結檢查、機密掃描、相依更新機制（MCD-10）
- 實際的產品邏輯測試案例（由 MCD-3、MCD-5、MCD-9 各自撰寫）

## 穩定實作限制

- 不得提交 PRD §20 列出的任何機密或私人檔案
- 需與既有 .agent-workflow/、.claude/、backlog/、.omc/ 共存；.omc/ 屬本機執行狀態，不應進入公開儲存庫
- 完成 git 初始化後，/backlog-auto 的平行執行（config.yml max_parallel_tasks: 3）才能建立 git worktree；本任務是所有平行執行的前置條件
- 測試執行器必須在本任務就位：MCD-3、MCD-5、MCD-9 的測試需求都預設有可用的 npm run test，否則那些任務將無處撰寫測試
- 實作完成後必須將實際可用指令回填 .agent-workflow/PROJECT.md（含 Tests），後續任務才有可引用的驗證指令

## 驗證

- npm install、npm run lint、npm run typecheck、npm run test、npm run build（實際 script 名稱於實作時確定，並回填 .agent-workflow/PROJECT.md）
- gh repo view tc3oliver/meowcoder.com 可查到儲存庫
- Cloudflare Pages staging URL 可開啟並顯示 scaffold

## 測試需求

- 建立測試執行器與最小範例測試，證明 npm run test 可執行且在 CI 中生效
- 本任務無產品邏輯，不需為 scaffold 撰寫額外單元測試；以 CI 綠燈（含 test 階段）作為驗證證據

## 影響

- 安全性：儲存庫衛生與機密排除（PRD §20、§32）
- 資料 / Schema：無
- API / 相容性：測試執行器選型成為後續所有任務撰寫測試的共用契約
- 文件：README 骨架、LICENSE、內容授權聲明、.agent-workflow/PROJECT.md
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 /home/oliver/meowcoder 已完成 git 初始化，且包含可建置的 Astro + TypeScript scaffold
- [ ] #2 github.com/tc3oliver/meowcoder.com 已存在，初始 scaffold 已推送到預設分支
- [ ] #3 lint、format、typecheck 指令皆已設定，且在初始 scaffold 上執行通過
- [ ] #4 本機 build 成功產出靜態檔案
- [ ] #5 .gitignore 已排除 node_modules、build 產物、本機機密，以及 .omc/ 本機狀態
- [ ] #6 MIT LICENSE 涵蓋原始碼，另有獨立內容授權聲明說明個人內容與品牌資產不適用 MIT（PRD §21）
- [ ] #7 Cloudflare Pages staging 部署可正常提供已推送的 scaffold
- [ ] #8 .agent-workflow/PROJECT.md 的 Validation commands 已從 not detected 更新為實際可執行指令
- [ ] #9 測試執行器已設定，npm run test 可在乾淨環境執行並通過至少一個範例測試
- [ ] #10 GitHub Actions CI 於 push 與 PR 觸發，並依 PRD §23 順序執行 install、format/lint、typecheck、build、test
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
1. git init（預設分支 main），撰寫 .gitignore：node_modules、dist、.astro、.env*、以及 .omc/ 本機狀態（decision-1）。
2. 手動建立 Astro + TypeScript scaffold（不使用 npm create astro，因為本目錄非空，互動式 scaffold 會拒絕或覆寫既有的 backlog/、.agent-workflow/、CLAUDE.md）：package.json、astro.config.mjs、tsconfig.json（strict）、src/pages/index.astro 佔位頁、src/styles/、src/lib/。
3. 工具鏈：Prettier + prettier-plugin-astro（format）、ESLint 9 flat config + typescript-eslint + eslint-plugin-astro（lint）、astro check（typecheck）、Vitest（test）。對應 npm scripts：format、format:check、lint、typecheck、test、build。
4. 建立最小範例測試證明 npm run test 可執行，供 MCD-3/5/9 後續撰寫真正的產品測試。
5. 授權檔：LICENSE（MIT，涵蓋原始碼）與 LICENSE-CONTENT.md（個人內容與品牌資產 © Oliver Yu，不適用 MIT），對應 PRD §21。
6. README 骨架（Stack / Development / License），完整版由 MCD-10 負責。
7. .github/workflows/ci.yml：push 與 pull_request 觸發，依 PRD §23 順序執行 install → format/lint → typecheck → build → test。
8. 本機執行全部驗證指令並記錄實際輸出作為證據。
9. 以 gh CLI 建立 tc3oliver/meowcoder.com（**private**；轉為 public 是 MCD-13 AC 的範圍，且需先完成機密確認），設定 remote 並推送 main。
10. 將實際可用指令回填 .agent-workflow/PROJECT.md 的 Validation commands（含 Tests）。
11. Cloudflare Pages staging（AC #7）：本機無 wrangler、無 CF_API_TOKEN / CLOUDFLARE_ACCOUNT_ID、無 ~/.wrangler 設定。若無法取得憑證，此項記錄為 true blocker（WORKFLOW.md「True blockers」第 2 項：缺少必要權限、憑證或外部服務），其餘 AC 仍完成後如實回報。
<!-- SECTION:PLAN:END -->
