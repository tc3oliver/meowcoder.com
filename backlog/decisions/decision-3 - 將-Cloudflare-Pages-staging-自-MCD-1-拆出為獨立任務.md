---
id: decision-3
title: 將 Cloudflare Pages staging 自 MCD-1 拆出為獨立任務
date: '2026-08-08 14:20'
status: accepted
---
## Context

PRD（`doc-1`）§39 將 `Cloudflare Pages staging` 列在 MCD-1（Repository Bootstrap）的項目清單中，因此 TASK-1 原本以 AC #7「Cloudflare Pages staging 部署可正常提供已推送的 scaffold」承接。

TASK-1 執行時，其餘 9 項 AC 全數完成並通過驗證（本機五項檢查全綠、`npm audit` 0 vulnerabilities、GitHub Actions run 31260481080 六個步驟全 success、儲存庫已建立並推送）。AC #7 則遇到 WORKFLOW.md「True blockers」第 2 項（缺少必要權限、憑證或外部服務）：本機無 `wrangler`、無 `CLOUDFLARE_*` 環境變數、無 `~/.wrangler` 設定；Cloudflare Pages 的 GitHub 整合只能在 Dashboard 完成，`wrangler login` 需要瀏覽器互動，兩者都無法在此環境自動化。

由於 TASK-2 與 TASK-3 都以 TASK-1 為依賴，單一項外部服務憑證會擋住整條實作鏈，且該憑證的取得時程不在專案控制範圍內。

## Decision

將 Cloudflare Pages staging 自 MCD-1 拆出為獨立任務 TASK-14（依賴 TASK-1）。TASK-1 移除 AC #7，以其餘 9 項 AC 正當收斂為 `Done`，不以未達成的 AC 標記完成。

拆出的是**交付時點**，不是需求本身：PRD §39 對 MCD-1 的要求仍然有效，只是由 TASK-14 承接並保留完整驗收。

## Consequences

- TASK-1 的 AC 由 10 項減為 9 項，全部通過，四項 Definition of Done 皆成立，可正當標記 `Done`。
- TASK-2 與 TASK-3 立即解除阻擋，平行批次（`max_parallel_tasks: 3`）可以開始。
- TASK-14 成為新的外部憑證相依點。它不擋住 TASK-2 至 TASK-11 的實作，但**必須在 TASK-13（正式上線切換）之前完成** —— 沒有 staging 就沒有 TASK-11 量測 Lighthouse 與驗證安全標頭的環境，也沒有 TASK-13 部署前的驗證基準。因此 TASK-11 與 TASK-13 都應加上對 TASK-14 的依賴。
- 若 Cloudflare 憑證長期無法取得，風險會累積到 TASK-11：屆時 Lighthouse 95 分門檻與安全標頭將無處驗證，形成比現在更難處理的阻礙。這是本決策明確接受並移轉的風險。
- 本決策未推翻 PRD §39 的任何需求內容，僅調整承接任務。若日後要把 Cloudflare 併回 MCD-1，需建立新的決策記錄，而不是修改本記錄。
