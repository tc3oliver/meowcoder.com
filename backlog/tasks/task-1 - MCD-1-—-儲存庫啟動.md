---
id: TASK-1
title: MCD-1 — 儲存庫啟動
status: In Progress
assignee: []
created_date: '2026-08-08 06:41'
updated_date: '2026-08-08 07:14'
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
- [x] #1 /home/oliver/meowcoder 已完成 git 初始化，且包含可建置的 Astro + TypeScript scaffold
- [x] #2 github.com/tc3oliver/meowcoder.com 已存在，初始 scaffold 已推送到預設分支
- [x] #3 lint、format、typecheck 指令皆已設定，且在初始 scaffold 上執行通過
- [x] #4 本機 build 成功產出靜態檔案
- [x] #5 .gitignore 已排除 node_modules、build 產物、本機機密，以及 .omc/ 本機狀態
- [x] #6 MIT LICENSE 涵蓋原始碼，另有獨立內容授權聲明說明個人內容與品牌資產不適用 MIT（PRD §21）
- [ ] #7 Cloudflare Pages staging 部署可正常提供已推送的 scaffold
- [x] #8 .agent-workflow/PROJECT.md 的 Validation commands 已從 not detected 更新為實際可執行指令
- [x] #9 測試執行器已設定，npm run test 可在乾淨環境執行並通過至少一個範例測試
- [x] #10 GitHub Actions CI 於 push 與 PR 觸發，並依 PRD §23 順序執行 install、format/lint、typecheck、build、test
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [x] #2 Required applicable tests, lint, typecheck, and build pass
- [x] #3 Documentation and Requirement Matrix are synchronized when applicable
- [x] #4 Validation evidence is recorded in the task
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作結果

Scaffold 完成並推送，CI 全綠。10 項 AC 完成 9 項，AC #7（Cloudflare Pages staging）因缺少憑證受阻。

## 驗證證據

本機（Node v22.23.2、npm 10.9.8）：

- `npx prettier --check .` → `All matched files use Prettier code style!`
- `npx eslint .` → exit 0，無輸出
- `npx astro check` → `Result (6 files): 0 errors, 0 warnings, 0 hints`
- `npx vitest run` → `Test Files 1 passed (1) / Tests 3 passed (3)`
- `npx astro build` → `1 page(s) built in 266ms / Complete!`
- `npm audit` → `found 0 vulnerabilities`

GitHub Actions run 31245653657（main，push）→ `completed success`，30s：
`Install: success / Format check: success / Lint: success / Typecheck: success / Build: success / Test: success`

儲存庫：`gh repo view` → `visibility: PRIVATE`、`defaultBranchRef: main`、
`url: https://github.com/tc3oliver/meowcoder.com`。遠端 tree 共 45 個 blob。

推送前稽核（全部無命中）：
- 金鑰樣式（`gh[pousr]_`、`github_pat_`、`AKIA`、`BEGIN PRIVATE KEY`、`xox[baprs]-`、`sk-`）
- 賦值型 secret（`api_key|secret|token|password` = "..."）
- email 與電話號碼
- `.omc/`、`node_modules/`、`dist/`、`.astro/`、`.env` 皆未追蹤（本機與遠端各驗一次）

## 執行中做出的工程決策

**1. Astro 7 + Node 22.12+，而非 Astro 5 或 6**

初次安裝取得 Astro 6.0.5，但本機 Node 為 v20.20.2，Astro 6 要求 `>=22.12.0`，
`astro check` 與 `astro build` 直接拒絕執行。先降到 Astro 5.18.2 讓 Node 20 可用，
但 `npm audit` 顯示 `astro <=7.0.9` 全數為 high severity（8 條 XSS/SSRF advisory），
外加 `esbuild` 與 `sharp`/libvips 的漏洞。

多數 advisory 屬 SSR、server islands 或 dev-server 範疇，對純靜態站不適用；但
`sharp`/libvips 那組與 PRD §29 的 AVIF/WebP 圖片處理直接相關，且 PRD §23 明訂
「衛生不良的公開儲存庫會削弱而非強化網站」。因此改採乾淨路徑：以 nvm 安裝
Node 22.23.2 並設為 nvm 預設，升級至 Astro 7.2.0，`npm audit` 歸零。

Node 20 仍保留在 nvm 中，`nvm alias default 20` 即可還原，屬可逆決策。
`.nvmrc` 記為 22，CI 以 `node-version-file: .nvmrc` 取用，本機與 CI 一致。

**注意**：本次執行的 shell 於變更前啟動，`PATH` 仍解析到 Node 20，需明確指定
`$HOME/.nvm/versions/node/v22.23.2/bin`。新啟動的 shell 會自動取得 22。後續任務
若遇 `Node.js v20.x is not supported by Astro`，先確認 `node -v`。此點已寫入
`.agent-workflow/PROJECT.md` 的專案限制。

**2. 未啟用 eslint-plugin-jsx-a11y**

`eslint-plugin-astro` 的 `flat/jsx-a11y-recommended` 需要 `eslint-plugin-jsx-a11y`，
但其 6.10.2 版 peer 相依為 `eslint <=9`，無法在 ESLint 10 下安裝（ERESOLVE）。
以 `--legacy-peer-deps` 硬裝違反 PRD §23 的衛生要求，故不啟用，並在
`eslint.config.js` 留下註解說明原因與重啟條件。無障礙驗證改由 MCD-11 的
axe + Lighthouse + 人工鍵盤測試承擔（TASK-11 既有的測試需求已涵蓋）。

**3. 手動 scaffold 而非 `npm create astro`**

本目錄非空（既有 `backlog/`、`.agent-workflow/`、`.claude/`、`CLAUDE.md`、
`AGENTS.md`），互動式 scaffold 會拒絕執行或覆寫既有檔案。

**4. 儲存庫建為 private**

AC #2 僅要求儲存庫存在且已推送；轉為 public 是 MCD-13 AC #9 的範圍，且需先完成
PRD §20 機密確認。依 decision-1，`backlog/`（含 `doc-1` 完整 PRD）一併進入儲存庫，
這正是 MCD-13 轉 public 前必須明確決定的事項，已記入 `.agent-workflow/PROJECT.md`。

## Blocker — AC #7 Cloudflare Pages staging

真實阻礙，屬 WORKFLOW.md「True blockers」第 2 項：缺少必要權限、憑證或外部服務。

證據：
- `wrangler` 未安裝
- 無 `CLOUDFLARE_*` / `CF_*` 環境變數（`env | grep -c CLOUDFLARE` → 0）
- 無 `~/.wrangler` 設定目錄

Cloudflare Pages 的 GitHub 整合只能在 Cloudflare Dashboard 完成，`wrangler login`
需要瀏覽器互動，兩者都無法在此環境自動化。

解除阻礙所需（擇一）：
- 於 Cloudflare Dashboard 連接 `tc3oliver/meowcoder.com`，建置設定為
  Framework preset `Astro`、Build command `npm run build`、Output directory `dist`、
  環境變數 `NODE_VERSION=22`；或
- 提供具 Pages 權限的 `CLOUDFLARE_API_TOKEN` 與 `CLOUDFLARE_ACCOUNT_ID`，改以
  wrangler 建立 Pages 專案。

其餘 9 項 AC 已完成，程式碼已推送，CI 已綠。此項解除後即可勾選 AC #7 並收尾。
<!-- SECTION:NOTES:END -->
