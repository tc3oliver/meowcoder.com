---
title: '互動式 LLM 推論中的可重用狀態經濟學'
type: '系統研究 · LLM 推論'
summary: '在一台 Apple silicon 機器上研究 speculative prefill：冷啟動長 context 大幅變快，但在一次以延續為主的 agent session 裡反而變慢，而解釋這兩件事的是同一個 prefix cache 機制。'
outcome: '冷啟動 32K 的首個 token 時間從 122.7 秒降到 33.5 秒；同一組設定卻在一次成對測試的 coding agent session 裡付出額外時間。追出原因的過程產出一個正確性修正與一個傳輸層預設值，兩者都已送往上游。'
indexMeta: 'Apple silicon · 27B 級 MoE 4-bit · 兩個上游 PR'
evidence: 'GitHub 上的 llm-inference-systems · 文章、request 層級 trace，以及兩個 oMLX pull request'
slug: 'reusable-state-economics'
locale: 'zh'
translationKey: 'reusable-state-economics'
order: 4
draft: false
kind: 'case-study'
meta:
  - label: '硬體'
    value: 'Apple M4 Max · 64GB 統一記憶體'
  - label: '模型'
    value: '27B 級 MoE，4-bit'
  - label: '證據'
    value: '已發表文章 · 兩個上游 pull request'
---

由 Oliver Yu 獨立研究、量測，並提交上游。

## 問題

單機跑長 context 的 prefill，慢法是使用者直接感受得到的：整段 prompt 處理完之前，畫面上什麼都不會出現。Speculative prefill——先評分，只算重要的 token——是標準解法，在冷啟動的情況下它確實有效。

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
記錄的是把這個解法認真放到一台 Apple silicon 機器（M4 Max、64GB 統一記憶體、27B 級 MoE 模型 4-bit）上跑，然後找出它在哪裡不再是解法。冷啟動的數字很大，但同一組設定接著讓實際的 coding agent session 變慢——追查原因的過程，才是真正的結果。

## 冷啟動量測

完全沒有 prefix cache 可用的長 context prefill：

| Context | 首個 token 時間   | Prefill 吞吐量   |
| ------- | ----------------- | ---------------- |
| 16K     | 57.84 秒 → 19.24 秒 | 302 → 1046 tok/s |
| 32K     | 122.7 秒 → 33.5 秒  | 277 → 1112 tok/s |

這正是這個技術設計來處理的情境：一段長 prompt，前面沒有任何可重用的東西，所有 token 一次付清。在這種 workload 上沒什麼好爭的。

## 它在哪裡失效

互動式 agent session 不是這種 workload。每一輪都延續上一輪，昂貴的前綴早就算過了，這個 request 理應只付新增的部分。讓這件事成立的是 prefix cache，而它的經濟學決定了一輪對話便宜還是貴。

Speculative prefill 會跳過大部分 token。用被跳過的 token 組出來的 KV cache 並不忠實對應那段 prompt，所以它的輸出不能寫回 prefix cache。單一個 sparse request 因此又快又不留下任何東西。在以延續為主的 session 裡，這件事會累積：可重用的檢查點停止前進，對話卻繼續變長，每一個後續 request 要重算的未命中尾巴就一次比一次長。

## Trace

一份跨 20 次 prefix cache 還原的 request 層級 trace，不需要推測就能看到機制本身。

- 可重用檢查點從 28,672 爬到 37,888 token，在第 11 個 request 塌回 28,672，之後再也沒有回升。
- 每個 request 必須重算的未命中尾巴，從 17,060 token 長到 33,979。
- 評分器本身的成本隨著它評分的對象一起長：8,535 token 時 2.7 秒，33,389 token 時 5.7 秒。

最後一行決定了結果。評分器是每個 request 都要付的額外成本，而且隨 prompt 長度成長。當 prefix cache 還在前進時，這筆成本換來很大的節省；當檢查點凍住，節省逐輪縮小、成本逐輪變大，兩條線就會交叉。

## 工程決策

<div class="decision">

### 量測單位是 session，不是 request

**為什麼** — 針對冷 prompt 的單一 request benchmark，報出的是一個「成本跨 request 累積」機制的最好情況。prefix cache 是 session 狀態，量測單位就必須是 session。

**後果** — 上面的冷啟動表格和下面的 session 行為都是真的，而且任何一邊都無法預測另一邊。

</div>

<div class="decision">

### 追檢查點，不追牆鐘時間

**為什麼** — Session 的總時間混雜了模型品質、工具呼叫，以及 agent 當下剛好選的路徑。可重用檢查點與未命中尾巴只屬於推論伺服器，也正是這個機制真正改變的東西。

**後果** — 那份 20 次還原的 trace 是可以拿來報告的證據；旁邊那組牆鐘時間比較不是，下面的限制段落會直說。

</div>

<div class="decision">

### 用閒置時間在背景補回檢查點，並說清楚它何時失效

**為什麼** — 如果問題只在於 sparse 的輸出寫不回去，那麼在閒置時對同一段前綴做一次 dense pass，就能在使用者無感的情況下補回檢查點——前提是真的有閒置時間。

**取捨** — 每輪之間有 15 秒閒置時，一個合成 session 從 108.7 秒降到 83.1 秒。完全沒有閒置時，同一個機制比 dense 慢 11%：108.1 秒對 119.7 秒。背景補救是在賭輪與輪之間有空檔，而滿載的 session 沒有空檔。

</div>

<div class="decision">

### 先確認這個 workload 會不會中招

**為什麼** — 一個機制在某個 session 上退化，不代表它就是普遍問題。第三個實際 session 根本沒觸發：cache 命中率維持在 84–86%，最大的未命中尾巴始終低於 2.5K token，評分器一次都沒被呼叫。

**後果** — 答案取決於 workload 的形狀。前綴一直被重用的 session，永遠走不到「sparse prefill 有東西可以損失」的狀態，所以修法是改預設值，而不是移除功能。

</div>

<div class="decision">

### Agent 路徑預設 dense，覆寫必須明講

**為什麼** — 兩種需求相反的 workload，先前被同一個設定服務。長 context 路徑要 sparse prefill，而且量測上確實受益；agent 路徑要的是一個持續前進的 prefix cache。

**後果** — 實際出貨的是一個傳輸層策略：agent 路徑預設 dense，呼叫端若知道自己的 prompt 是冷的，可以逐 request 覆寫成 sparse；長 context 路徑維持原樣。

</div>

## 正確性結果

有一項發現的重要性高過上面所有效能工作。

Sparse prefill 只能在受保護的前綴邊界之後丟棄 token——放系統提示與工具指令的區段必須完整計算。而這個邊界當時是用減法推導出來的，算出來的位置比真正的邊界短。有工具存在時，差距最小只有 37 個 token，這讓工具指令的尾端與操作者的系統提示落進了 sparse prefill 可以丟棄的範圍。

這不是吞吐量退化。它會在操作者以為規則仍然生效時，悄悄拿掉那些指令，而且偏偏發生在最需要它們的 request——帶工具的 agent request——上，輸出裡沒有任何跡象。這一項已修正並提交上游，與部署策略分開，而且排在它前面。

## 限制

- **實際 agent 的比較每一組只有一次執行**，而且兩個 agent 走了不同的任務路徑。因此不會把任何 session 牆鐘時間的比值當成量測到的變慢；撐住論點的是 request 層級的 trace。
- **一台機器、一個模型、一種量化。** 評分器成本與 prefill 節省的交叉點，三者都會影響。
- **閒置補救的結果是合成的。** 它證明有空檔時這個機制能運作，也包含沒有空檔的那一列：108.1 秒對 119.7 秒，比 dense 慢 11%。

## 證據

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>——整份研究：量測設定、request 層級 trace 與分析。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>——完整的中文文章。
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>——前綴邊界的正確性修正。
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>——傳輸層的部署策略。

</div>

我還做不到的是：在請求進來的當下判斷它屬於三種情況中的哪一種。在那之前，由呼叫端自己宣告，伺服器相信它。
