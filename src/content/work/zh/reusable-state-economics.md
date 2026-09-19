---
title: '互動式 LLM 推論中的可重用狀態經濟學'
type: '系統研究 · LLM 推論'
summary: '在一台 Apple silicon 機器上研究 speculative prefill：冷啟動長 context 大幅變快，但在一次以延續為主的 agent session 裡反而變慢，而解釋這兩件事的是同一個 prefix cache 機制。'
outcome: '自行建構並量測異質 prefill 路徑、疊在其上的 sparse prefill、背景補回 dense 前綴的機制，以及它所需要的協作式排程器。冷啟動 32K 首個 token 從 122.7 秒降到 33.5 秒，真實 coding agent session 隨即暴露出 prefix cache 的失效模式；整段工作產出一個正確性修正與 per-request 控制欄位，兩者都已提交上游。'
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
    value: '已發表文章 · 兩個審查中的上游 pull request'
---

由 Oliver Yu 獨立研究、量測，並提交上游。

## 問題

單機跑長 context，prefill 的慢是使用者直接感受得到的：整段 prompt 處理完之前，畫面上什麼都不會出現。Speculative prefill 是標準解法——先評分，只算重要的 token——冷啟動時確實有效。

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
記錄的是在一台 Apple silicon 機器（M4 Max、64GB 統一記憶體、27B 級 MoE 模型 4-bit）上把這個解法做到底，然後找出它從哪裡開始失效。冷啟動的數字很漂亮，但同一組設定接著讓真實的 coding agent session 變慢；那次比較每邊只跑一次、兩個 agent 走的路也不同，所以那只是追查的起點，算不上量測。真正有價值的是後面這段追查。

## 冷啟動量測

完全沒有 prefix cache 可用的長 context prefill：

| Context | 首個 token 時間     | Prefill 吞吐量   |
| ------- | ------------------- | ---------------- |
| 16K     | 57.84 秒 → 19.24 秒 | 302 → 1046 tok/s |
| 32K     | 122.7 秒 → 33.5 秒  | 277 → 1112 tok/s |

這正是這個技術的設計情境：一段長 prompt，前面沒有任何可重用的東西，所有 token 一次付清。在這種 workload 上沒什麼好爭的。

## 它在哪裡失效

互動式 agent session 不是這種 workload。每一輪都接著上一輪，昂貴的前綴早就算過，這個 request 理應只付新增的部分。這件事靠的是 prefix cache；一輪對話便宜還是貴，就看它有沒有命中。

Speculative prefill 會跳過大部分 token。跳過之後組出來的 KV cache 不再忠實對應那段 prompt，所以寫不回 prefix cache。單一個 sparse request 因此又快、又什麼都沒留下。session 一輪一輪接下去，這筆帳就越積越多：可重用的檢查點停在原地，對話卻繼續變長，每個後續 request 要重算的尾巴就一次比一次長。

## Trace

一份涵蓋 20 次 prefix cache 還原的 request 層級 trace，機制直接看得到，不用推測。

- 可重用檢查點從 28,672 爬到 37,888 token，在第 11 個 request 塌回 28,672，之後再也沒有回升。
- 每個 request 必須重算的未命中尾巴，從 17,060 token 長到 33,979。
- 評分器本身的成本隨著它評分的對象一起長：8,535 token 時 2.7 秒，33,389 token 時 5.7 秒。

最後一行決定了結果。評分器是每個 request 都要付的成本，而且隨 prompt 長度成長。prefix cache 還在前進時，這筆成本換得大量節省；檢查點一凍住，節省逐輪縮小、成本逐輪變大，兩條線終究交叉。

## 系統演進

沒有哪一組設定是最後的贏家。我依序做了八件事，其中大半是因為前一件的前提被推翻，才不得不做的。

1. **Dense 基準線** — prefix cache 讓後續輪次很快，但 16K 的首個 token 要等 57.84 秒。
2. **異質 prefill** — GPU 與 ANE 分攤每一層的 prefill，切片大小跟 cache block 一樣。
3. **疊上 sparse prefill** — 隔離測試裡兩者疊加得很乾淨；八輪 session 照樣變慢，129.1 秒對 108.1 秒。
4. **修正受保護前綴的邊界** — 從用減法推算改成用呼叫端自己的 template 實際量出來，起因是它曾短少 37 個 token。
5. **先 sparse，後 dense** — 背景工作以 1024 token 一片補回被跳過的 dense 前綴，每完成一個 block 就發布。
6. **協作式排程器** — 背景工作改成能察覺有請求進來，並先讓它過；背景有事在跑時 assistant 的打字速度從 13.5 回到 47 tok/s。
7. **真實 workload 驗證** — context 成長快過補回速度，這套設計因此放下。
8. **端點層級的策略** — 由呼叫端宣告請求的形狀，本機的伺服器多了 per-request 控制欄位。

每個階段的假設、被推翻的原因，以及每個數字背後的資料，都在
<a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>。

## 工程決策

<div class="decision">

### 量測單位是 session，不是 request

**為什麼** — 對冷 prompt 做單一 request 的 benchmark，量到的只是最好的情況；這個機制的成本是跨 request 累積的，單看一個 request 看不到。prefix cache 是 session 層級的狀態，量測單位也就必須是 session。

**後果** — 上面的冷啟動表格和 session 行為都是真的，而且從任何一邊都推不出另一邊。

</div>

<div class="decision">

### 追檢查點，不追牆鐘時間

**為什麼** — Session 總時間混進了模型品質、工具呼叫，以及 agent 當下剛好選的路徑。可重用檢查點與未命中尾巴只屬於推論伺服器，也正是這個機制真正改動的東西。

**後果** — 那份 20 次還原的 trace 是能拿來報告的證據；旁邊那組牆鐘時間不是，下面的限制段落會直說。

</div>

<div class="decision">

### 用閒置時間在背景補回檢查點，並說清楚它何時失效

**為什麼** — 如果問題只是 sparse 的輸出寫不回去，那在閒置時對同一段前綴補一次 dense pass，就能在使用者無感的情況下把檢查點補回來——前提是真的有閒置時間。

**取捨** — 每輪之間有 15 秒閒置時，合成 session 從 108.7 秒降到 83.1 秒。完全沒有閒置時，同一個機制比 dense 慢 11%：108.1 秒對 119.7 秒。背景補回是在賭輪與輪之間有空檔，而滿載的 session 沒有。

</div>

<div class="decision">

### 先確認這個 workload 會不會中招

**為什麼** — 一個機制在某個 session 上退化，不代表它是普遍問題。第三個真實 session 根本沒觸發：cache 命中率大約 84–86%，最大的未命中尾巴約 2.5K token，評分器一次都沒被呼叫。這些是 session 層級的彙總值，不是 trace。

**後果** — 答案取決於 workload 的形狀，而形狀有三種：一次性的冷請求，sparse prefill 贏；持續延伸並撞上 cliff 的 session，它輸；健康的漸進式 session，它根本不會觸發。前綴一直被重用的 session，根本不會走到讓 sparse prefill 吃虧的那一步，所以修法是改預設值，不是拿掉功能。

</div>

<div class="decision">

### Agent 路徑預設 dense，覆寫必須明講

**為什麼** — 兩種需求相反的 workload，先前吃同一個設定。長 context 路徑要 sparse prefill，量測上也確實受益；agent 路徑要的是一個持續前進的 prefix cache。

**後果** — 本機上線的是一條 API 端點層級的策略：agent 走的 Anthropic messages 端點預設 dense，呼叫端若知道自己的 prompt 是冷的，可以逐 request 覆寫成 sparse；長 context 路徑維持原樣。送上游的是 per-request 的開關；預設值留在本機決定。

</div>

## 正確性結果

上面所有效能工作，都比不上這一項發現重要。

Sparse prefill 只能在受保護的前綴邊界之後丟棄 token；放系統提示與工具指令的區段必須完整計算。伺服器當時是拿兩次 render 的結果做算術來推這個邊界，而這套算術在這個 chat template 上不成立。有工具時，邊界可能提早 37 個 token，而那 37 個 token 正好是工具指令的結尾和操作者自己指令的開頭。

這不是吞吐量退化。它會在操作者以為規則仍然生效時悄悄拿掉那些指令，而且偏偏發生在最需要它們的 request——帶工具的 agent request——上，輸出裡看不出任何跡象。修法是把邊界實際量出來而不是推算，這個修正單獨送上游，而且比部署策略先送。

## 限制

- **真實 agent 的比較每邊只跑一次**，而且兩個 agent 走了不同的任務路徑。所以 session 總時間的比值不算數，不能當成量到的變慢；撐住論點的是 request 層級的 trace。
- **一台機器、一個模型、一種量化，每格一次。** 冷啟動表格每一格只跑一次；評分器成本與 prefill 節省的交叉點，三個平台選擇都會影響。
- **閒置補回的結果是合成的。** 它證明有空檔時這個機制能運作，也包含沒有空檔的那一列：108.1 秒對 119.7 秒，比 dense 慢 11%。

## 證據

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>——整份研究：量測設定、request 層級 trace 與分析。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>——完整的中文文章。
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>——前綴邊界的正確性修正。兩個 pull request 在撰寫時都仍在審查中。
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>——讓 Anthropic messages 端點的客戶端也能逐 request 開關 sparse prefill，OpenAI 相容端點本來就可以；不改任何預設值。

</div>

我還做不到的是：在請求進來的當下，判斷它屬於三種情況中的哪一種。在那之前，由呼叫端自己宣告，伺服器照單全收。
