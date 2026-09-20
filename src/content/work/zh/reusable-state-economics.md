---
title: 'LLM 推論系統研究'
type: '系統研究 · LLM 推論'
summary: '在一台 Apple silicon 機器上研究 SpecPrefill（一種 attention-based 的 sparse prefill 機制）：冷啟動長 context 大幅變快，但在一次以延續為主的 agent session 裡反而變慢，而解釋這兩件事的是同一個 prefix cache 機制。'
outcome: '自行建構並量測異質 prefill 路徑、疊上去的 sparse prefill、背景補回 dense 前綴的機制與其協作式排程器。冷啟動 32K 首個 token 從 122.7 秒降到 33.5 秒，真實 coding agent session 隨即暴露出 prefix cache 的失效模式；整段工作產出一個正確性修正與 per-request 控制欄位，兩者都已提交上游。'
indexMeta: 'Apple silicon · 一個完整研究、四條研究線 · 兩個上游 PR'
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

單機跑長 context，prefill 的慢使用者直接感受得到：整段 prompt 處理完前，畫面上什麼都不會出現。Sparse prefill 是標準解法——先評分，只算重要的 token——冷啟動時確實有效；這裡用的實作是 SpecPrefill（一種 attention-based 的 sparse prefill 機制）。

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
記錄的是在一台 Apple silicon 機器（M4 Max、64GB 統一記憶體、27B 級 MoE 模型 4-bit）上把這個解法做到底，並找出它從哪裡失效。冷啟動的數字很漂亮，但同一組設定接著讓真實的 coding agent session 變慢；那次比較太薄，只是追查的起點，算不上量測。真正有價值的是後面這段追查。

## 冷啟動量測

完全沒有 prefix cache 可用的長 context prefill：

| Context | 首個 token 時間     | Prefill 吞吐量   |
| ------- | ------------------- | ---------------- |
| 16K     | 57.84 秒 → 19.24 秒 | 302 → 1046 tok/s |
| 32K     | 122.7 秒 → 33.5 秒  | 277 → 1112 tok/s |

這正是這個技術的設計情境：一段長 prompt，前面沒有可重用的東西，所有 token 一次付清。這種 workload 上沒什麼好爭的。

## 它在哪裡失效

互動式 agent session 不是這種 workload。每一輪都接著上一輪，昂貴的前綴早算過，理應只付新增的部分，靠的是 prefix cache。

SpecPrefill 會跳過大部分 token。跳過之後組出來的 KV cache 不再忠實對應那段 prompt，所以寫不回 prefix cache：sparse 化的尾巴不會推進正常可重用的 dense prefix state。單一個 sparse request 因此很便宜，代價落在後面的 request 上。

## Trace

一份涵蓋 20 次 prefix cache 還原的 request 層級 trace，機制直接看得到。

- 可重用檢查點從 28,672 爬到 37,888 token，在第 11 個 request 塌回 28,672。
- 每個 request 必須重算的未命中尾巴，從 17,060 token 長到 33,979。
- 評分器的成本隨它評分的對象一起長：8,535 token 時 2.7 秒，33,389 token 時 5.7 秒。

第 11 個 request 的塌陷是關鍵事件，順序很重要：檢查點從 37,888 掉到 28,672 token，是因為 cache 層拒絕了一次 partial block 命中，發生在 sparse 進場之前。它留下的 17,060 token 未命中跨過了 SpecPrefill 門檻，之後每個 request 都走 SpecPrefill，而 sparse 化的尾巴不會推進 dense 檢查點，累積的重算就是 prefix cache 的債。SpecPrefill 不是 cliff 的成因；它是 cliff 之後 checkpoint 一直沒被修回來的原因。

評分器是每個 request 都要付的成本，且隨 prompt 長度成長。prefix cache 還在前進時換得大量節省；檢查點一凍住，節省逐輪縮小、成本逐輪變大，兩條線終究交叉。

## 系統演進

沒有哪一組設定是最後的贏家。我依序做了八件事，大半是因為前一件的前提被推翻。

1. **Dense 基準線** — prefix cache 讓後續輪次很快，但 16K 的首個 token 要等 57.84 秒。
2. **異質 prefill** — GPU 與 ANE 分攤每一層的 prefill，切片大小跟 cache block 一樣。
3. **疊上 sparse prefill** — 隔離測試裡兩者疊加得很乾淨；八輪 session 照樣變慢，129.1 秒對 108.1 秒。
4. **修正受保護前綴的邊界** — 從減法推算改成用呼叫端自己的 template 量出來，起因是它曾短少 37 個 token。
5. **先 sparse，後 dense** — 背景工作以 1024 token 一片補回被跳過的 dense 前綴，設計上要求 fail closed；後來的安全與生命週期檢視找出缺口（見 ENGINEERING.md「Prototype safety review」），服務的 build 不帶背景補 dense。
6. **協作式排程器** — 背景工作改成能察覺請求進來並先讓它過；背景有事在跑時 assistant 打字速度從 13.5 回到 47 tok/s。
7. **真實 workload 驗證** — context 成長快過補回速度，這套設計因此放下。
8. **端點層級的策略** — 由呼叫端宣告請求的形狀，本機的伺服器多了 per-request 控制欄位。

每個階段的假設、被推翻的原因，以及每個數字背後的資料，都在
<a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>。

## 工程決策

<div class="decision">

### 量測單位是 session，不是 request

**為什麼** — 對冷 prompt 做單一 request 的 benchmark，量到的只是最好的情況；這個機制的成本是跨 request 累積的。prefix cache 是 session 層級的狀態，量測單位也就必須是 session。

**後果** — 冷啟動表格和 session 行為都是真的，從任何一邊都推不出另一邊。

</div>

<div class="decision">

### 追檢查點，不追牆鐘時間

**為什麼** — Session 總時間混進了模型品質、工具呼叫，以及 agent 剛好選的路徑。可重用檢查點與未命中尾巴只屬於推論伺服器，也正是這個機制真正改動的東西。

**後果** — 那份 20 次還原的 trace 是能拿來報告的證據；旁邊那組牆鐘時間不是，下面的限制段落會直說。

</div>

<div class="decision">

### 用閒置時間在背景補回檢查點，並說清楚它何時失效

**為什麼** — 如果問題只是 sparse 的輸出寫不回去，閒置時對同一段前綴補一次 dense pass，就能在使用者無感下把檢查點補回來——前提是真的有閒置。

**取捨** — 每輪之間有 15 秒閒置時，合成 session 從 108.7 秒降到 83.1 秒。完全沒有閒置時，同一個機制比 dense 慢 11%：108.1 秒對 119.7 秒。背景補回是在賭輪與輪之間有空檔，滿載的 session 沒有。

</div>

<div class="decision">

### 先確認這個 workload 會不會中招

**為什麼** — 一個機制在某個 session 退化，不代表它是普遍問題。第三個真實 session 根本沒觸發：cache 命中率大約 84–86%，最大的未命中尾巴約 2.5K token，評分器一次都沒被呼叫。這些是 session 層級的彙總值，不是 trace。

**後果** — 答案取決於 workload 的形狀，有三種：一次性的冷請求，sparse prefill 贏；持續延伸並撞上 cliff 的 session，它輸；健康的漸進式 session，根本不會觸發。前綴一直被重用的 session 不會走到讓 sparse prefill 吃虧的那一步，所以修法是改預設值，不是拿掉功能。

</div>

<div class="decision">

### Agent 路徑預設 dense，覆寫必須明講

**為什麼** — 兩種需求相反的 workload 先前吃同一個設定。長 context 路徑要 sparse prefill，量測上也確實受益；agent 路徑要的是持續前進的 prefix cache。

**後果** — 本機上線的是端點層級策略：agent 走的 Anthropic messages 端點預設 dense，呼叫端知道 prompt 是冷的就逐 request 覆寫成 sparse；長 context 路徑維持原樣。送上游的是 per-request 開關，仍在審查中；預設值留在本機決定。

</div>

## 正確性結果

所有效能工作都比不上這一項發現重要。

Sparse prefill 只能在受保護的前綴邊界之後丟棄 token；放系統提示與工具指令的區段必須完整計算。伺服器當時拿兩次 render 做算術推這個邊界，而這套算術在這個 chat template 上不成立。有工具時，邊界可能提早 37 個 token，而那 37 個 token 正好是工具指令的結尾和操作者自己指令的開頭。

這不是吞吐量退化。它會在操作者以為規則仍生效時悄悄拿掉那些指令，偏偏發生在最需要它們的 request——帶工具的 agent request——上，輸出裡看不出跡象。修法是把邊界實際量出來而不是推算，這個修正單獨送上游、目前仍在審查中，而且比部署策略先送。

## 研究線

上面那個完整研究只是 repo 裡五個主題之一。另外四條都有實際量測，但還回答不了自己
提出的問題，所以標成研究線而不是實驗，讓兩者的差別看得出來。

- **可重用狀態與 prefill** — 就是上面這個研究。在它之前，我用同一顆模型做過一次
  設定比較，其實已經出現同樣的特徵：隔離測試快了將近 5 倍，但在真實 coding 任務上
  重算的 token 多了 7.2 倍，最後的 cache 命中率 63.1% 對 99.5%。我當時照那份證據
  選了 dense，卻沒意識到那是一個發現。
- **Speculative decoding** — 兩顆同級模型、431 條 draft 序列。接受率跟著模型走，
  不跟著工作類型走：模型之間中位數 78.8% 對 88.6%，而同一顆模型跨所有任務分組
  分別只差 4.0 與 1.7 個百分點。沒有關掉這個機制的對照臂，所以它不是延遲結論。
- **正確性** — 三個最佳化，三種不同答案。還原快取前綴讓其中一筆從 56.3 秒降到
  2.3 秒，而 7 組配對案例的輸出全部逐 byte 相同；三個 attention routing build 在
  68K context 下產生三組不同的 logits，輸出卻完全一樣；真正悄悄改掉模型輸入的，
  是保護前綴的邊界計算。
- **異質運算** — 一條 ANE prefill 路徑會編譯、會回報自己已啟用，然後一次都沒執行，
  因為服務層的 block 大小永遠填不滿它編譯出來的 tile。
- **跨 runtime** — 沒有受控比較。那一頁就是用來把這件事講清楚，而不是暗示有。

## 限制

- **真實 agent 的比較每邊只跑一次**，兩個 agent 走的任務路徑也不同，所以 session 總時間的比值不能當成量到的變慢；撐住論點的是 request 層級的 trace。
- **一台機器、一個模型、一種量化，每格一次。** 評分器成本與 prefill 節省的交叉點，三個平台選擇都會影響。
- **閒置補回的結果是合成的。** 它證明有空檔時這個機制能運作，也包含沒有空檔、比 dense 慢 11% 的那一列。
- **那四條研究線不是實驗。** 每一條都寫明自己缺什麼證據，而且沒有為了寫它們去補跑任何東西。

## 證據

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>——整份研究：量測設定、request 層級 trace 與分析。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>——完整的中文文章。
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>——前綴邊界的正確性修正。兩個 pull request 在撰寫時都仍在審查中。
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>——審查中：只在 Anthropic messages 端點加上 per-request 的 SpecPrefill 欄位，OpenAI 相容端點本來就有；不改上游任何預設值。

</div>

我還做不到的是：在請求進來的當下判斷它屬於哪一種。在那之前由呼叫端宣告，伺服器照單全收。
