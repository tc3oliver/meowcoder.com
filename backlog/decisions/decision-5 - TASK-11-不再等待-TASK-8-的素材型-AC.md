---
id: decision-5
title: TASK-11 不再等待 TASK-8 的素材型 AC
date: '2026-08-08 17:00'
status: accepted
---
## Context

TASK-11（MCD-11 — SEO、無障礙與效能）原本依賴 TASK-8、TASK-6、TASK-9、TASK-10、TASK-14 全數完成。該依賴的用意是「頁面要先存在，才有東西可以最佳化與量測」。

TASK-6、TASK-9、TASK-10 已完成。TASK-8 完成 12 項 AC 中的 8 項，四項未過的皆為缺少外部素材，而非實作未完成：

- AC #3 — Shouri 產品截圖，儲存庫內無此圖檔
- AC #6 — JISA 論文網址，PRD 只有名稱沒有網址
- AC #7 — Study feed 未輸出 `<category>`，實測 25 筆 item 僅有 title / link / pubDate / description
- AC #9 — 頁尾 ORCID 連結，PRD §6、§8、§9.8 皆只提及名稱未給網址

首頁的八個區塊、雙語結構、區塊順序與所有版面皆已完成並上線。TASK-11 的工作內容（結構化資料、sitemap、robots、canonical/hreflang 稽核、無障礙修正、圖片最佳化、安全標頭、分析埋點、Lighthouse 最佳化）不需要上述四項素材即可執行與量測。

取得這些素材的時程不在專案控制範圍內，繼續等待會讓唯一剩餘的技術任務停擺。

## Decision

TASK-11 自依賴中移除 TASK-8，改為依賴 TASK-6、TASK-9、TASK-10、TASK-14。TASK-8 維持 `In Progress`，四項素材型 AC 待補齊後各自收斂。

TASK-13 對 TASK-8 的實質相依不受影響：TASK-13 AC #10 要求逐項核對 PRD §38，屆時 TASK-8 若仍未完成即為上線阻礙。

## Consequences

- TASK-11 立即可執行，不再被素材取得時程綁住。
- TASK-11 完成的 Lighthouse 量測是在缺少 Shouri 截圖的狀態下取得。補上截圖後圖片權重改變，**必須重跑 Lighthouse 並更新證據** —— TASK-8 的 AC #3 收斂時需一併處理，否則 TASK-11 的分數證據會失效。
- 同理，TASK-11 產出的 sitemap 與結構化資料不含尚未存在的連結（ORCID、JISA）。補上後需重新產生並驗證。
- 本決策不放寬任何 AC，只調整執行順序。四項素材型 AC 仍須通過，TASK-8 仍須完成才能上線。
- 若日後要恢復原依賴順序，需建立新的決策記錄。
