---
id: decision-1
title: 在現有 backlog 工作目錄中實作 meowcoder.com 網站
date: '2026-08-08 06:38'
status: accepted
---
## Context

PRD（`doc-1`，逐字匯入自 `meowcoder-personal-site-redesign-plan-v4.md`）指定目標儲存庫為 `github.com/tc3oliver/meowcoder.com`，但規劃當下該儲存庫在 GitHub 上並不存在（`gh repo view tc3oliver/meowcoder.com` 回傳 not found）。同時本機 backlog 工作目錄已建立在 `/home/oliver/meowcoder`，該目錄尚未 git 初始化且沒有任何原始碼。當時無法確定 MCD-1（Repository Bootstrap）應該直接在此目錄建立 Astro 專案，或實作應該發生在另一個本機路徑。

## Decision

直接在此目錄（`/home/oliver/meowcoder`）建立 Astro / TypeScript 網站。MCD-1 會在此執行 `git init`、建立 `tc3oliver/meowcoder.com` GitHub 儲存庫（`gh` CLI 已以 `tc3oliver` 身分完成認證）、設定 remote 並推送。此目錄即為網站實作的永久本機工作副本，而非僅供規劃使用的獨立工作區。

## Consequences

- 後續所有任務（MCD-2 至 MCD-13）都以 `/home/oliver/meowcoder` 為根目錄操作原始碼（例如 `src/`、`astro.config.*`、`package.json`），對應 PRD §26。
- MCD-1 的驗收標準包含建立 GitHub 儲存庫並推送初始 scaffold，不只是本機建置。
- 目錄中既有的 `.agent-workflow/`、`.claude/`、`.omc/`、`backlog/` 會與網站原始碼共存於同一個儲存庫；MCD-1 與 MCD-10（Open Source Quality）必須透過 `.gitignore` 與儲存庫衛生規範，確保純本機狀態（例如 `.omc/`）不會進入公開儲存庫。
- 因為本專案為單一 git 儲存庫，`/backlog-auto` 的平行執行（`max_parallel_tasks: 3`）會在此儲存庫上建立 `git worktree`；這需要 MCD-1 先完成 git 初始化，平行執行才可用。
- 若日後此目錄被證實不適用（例如命名或工具衝突），推翻此決策需要建立新的決策記錄，而不是修改本記錄。
