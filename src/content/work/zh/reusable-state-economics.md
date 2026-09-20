---
title: '互動式 LLM 推論中的可重用狀態經濟學'
type: '系統研究 · LLM 推論'
summary: '在一台 Apple silicon 機器上研究 SpecPrefill（一種 attention-based 的 sparse prefill 機制）：冷啟動長 context 大幅變快，但在以延續為主的 agent session 裡出現 prefix cache 失效模式，過程中還挖出一個正確性缺陷。'
outcome: '自行建構並量測異質 prefill 路徑、疊上去的 sparse prefill，以及背景補回 dense 前綴的機制。冷啟動 32K 首個 token 從 122.7 秒降到 33.5 秒；後續從 request-level trace 追到 prefix cache 停在哪裡；最後留下一個正確性修正和一組 per-request 控制欄位，都送了上游。'
indexMeta: 'Apple silicon · 冷啟動 prefill 快約 3 倍 · 兩個審查中的上游 PR'
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
    value: '27B 級 dense 模型，4-bit'
  - label: '證據'
    value: '已發表文章 · 兩個審查中的上游 pull request'
---

由 Oliver Yu 獨立研究、量測並提交上游。

## 問題

單機跑長 context，prefill 的慢使用者直接感受得到：整段 prompt 處理完前，畫面上什麼都不會出現。Sparse prefill 是標準解法——先評分，只算重要的 token——冷啟動時確實有效；這裡用的實作是 SpecPrefill（一種 attention-based 的 sparse prefill 機制）。

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
記錄的是在一台 Apple silicon 機器上把這個解法做到底，並找出它從哪裡失效。冷啟動的數字很漂亮。接著有一次真實的 coding agent 跑起來比較慢，但兩個 agent 走的任務路徑不同，所以那段牆鐘時間差只是觸發追查的觀察，不是量到的效果量。

## 關鍵結果

- **冷啟動 prefill 快了約三倍。** 16K context 下首個 token 從 57.84 秒降到 19.24 秒（302 → 1046 tok/s）；32K 下從 122.7 秒降到 33.5 秒（277 → 1112 tok/s）。一段長 prompt、前面沒有可重用的東西，這正是這個技術的設計情境。
- **Request 層級 trace 看到 prefix cache 凍住。** 涵蓋 20 次還原的 trace 裡，可重用檢查點從 28,672 爬到 37,888 token，在第 11 個 request 塌回 28,672，並在最後十個 request 一直釘在那裡；同時每個 request 必須重算的未命中尾巴從 17,060 token 長到 33,979。評分器的成本跟著長：8,535 token 時 2.7 秒，33,389 token 時 5.7 秒。
- **一個正確性缺陷比所有效能工作都重要。** 伺服器用算術推受保護前綴的邊界，有工具時可能提早 37 個 token，正好切掉工具指令的結尾和操作者自己指令的開頭——那些不該被 sparse 掉的 token 落進了可 sparse 的範圍，發生在最需要這些指令的 request 上。

## 系統演進

整個過程就是一直改、一直撞新的限制：cold prefill 變快之後撞到 cache，補 cache 又撞到 scheduler，scheduler 修完，真實 workload 又證明回填追不上。

1. **先把快的路徑做出來。** Dense 基準線讓後續輪次靠 prefix cache 很快，但 16K 的首個 token 要等 57.84 秒。異質 prefill 讓 GPU 與 ANE 以 cache block 大小的切片分攤每一層的工作；疊上 sparse prefill 後，隔離測試裡兩者疊加得很乾淨。八輪 session 照樣變慢：129.1 秒對 108.1 秒。
2. **找出 session 為什麼輸。** Sparse 化的尾巴寫不回 prefix cache——跳過 token 之後組出來的 KV cache 不再忠實對應那段 prompt。沒有任何東西壞掉，所以很難看見：那個 sparse request 本身很便宜，代價落在它之後的每一個 request 上。改成追檢查點而不是追牆鐘時間，機制才顯形。
3. **試著在背景把檢查點補回來。** 一個設計上要求 fail closed 的背景工作，以 1024 token 一片補回被跳過的 dense 前綴；協作式排程器讓它學會讓路給進來的請求（背景有事在跑時，打字速度從 13.5 回到 47 tok/s）。每輪之間有 15 秒閒置時，合成 session 從 108.7 秒降到 83.1 秒，約快 24%；完全沒有閒置時，同一個機制比 dense 慢約 11%，119.7 秒對 108.1 秒。這是在賭輪與輪之間有空檔，滿載的 session 沒有。後來對這條實驗分支做的生命週期與安全檢視找出缺口，服務的 build 不帶背景補 dense。
4. **改在傳輸層決定。** context 成長快過補回速度，於是改由呼叫端宣告請求的形狀，伺服器照著處理。

每個階段的假設、被推翻的原因，以及每個數字背後的資料，都在
<a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>。

### 這份 trace 證明了什麼、沒證明什麼

第 11 個 request 的 sparse 進場，並不是那次 restore 塌陷的成因：restore 先發生。cache log 指出那是一次 partial prefix 命中，最後一個命中的 block 裡放的是 placeholder，但留下來的 trace 無法確立這個 placeholder 是何時、如何產生的。trace 能確立的是：塌陷之後，所有觀察到的未命中都維持在 SpecPrefill 門檻之上，sparse 化的尾巴不會推進正常可重用的 dense prefix state，而檢查點在其餘十個 request 裡都沒有回復。

## 工程決策

<div class="decision">

### Session 才是量測單位，不是單一 request

**原因** — cold benchmark 只告訴我這次 request 自己省了多少，量不到它留給下一輪多少 reusable state，而那正是 agent workload 在付的帳。

**結果** — 改追 reusable checkpoint 與 uncached suffix；real-agent 的牆鐘時間只當追查的起點，不當效果量。

</div>

<div class="decision">

### Protected prefix 要量出來，不靠推算

**原因** — chat template 的輸出會隨 roles 和 tools 改變，whole render 減掉 non-system render 不保證落在真正的 static prefix boundary 上。

**結果** — 改成從 caller 自己的 template render 量邊界；這個正確性修正就是 oMLX #3756。

</div>

<div class="decision">

### Policy 放在 request，而不是找一個全域最佳設定

**原因** — cold、用過就丟的長 prompt，和以延續為主的 agent，對 reusable state 的需求是相反的。一個全域設定一定會對其中一邊是錯的。

**取捨** — 不做自動分類器，因為手上的證據不足以預測一個 session 屬於哪一種；改由 caller 明確覆寫。oMLX #3762 只提供 per-request 的能力，部署預設值仍然是本機 policy。

</div>

## 落地的改動

- **本機服務策略。** Agent 流量預設走 dense，除非呼叫端在該 request 上宣告自己的 prompt 是冷的；長 context 流量維持模型層級的設定。先前是兩種需求相反的 workload 共用一個開關。預設值留在本機決定。
- **<a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>，審查中** — 把受保護前綴的邊界改成從呼叫端自己的 template 讀出來，而不是用減法推算。它比部署策略先送，因為這是唯一一個改到模型輸入、而不只是改到速度的發現。
- **<a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>，審查中** — 在 Anthropic messages 端點加上 per-request 的 SpecPrefill 欄位，OpenAI 相容端點本來就有。不改上游任何預設值。

## 證據與限制

一台機器、一個模型、一種量化，每格一次。冷啟動表格每格都只跑一次，而評分器成本與 prefill 節省的交叉點，這三個平台選擇都會影響。真實 agent 的比較每邊只跑一次，兩邊路徑又不同，所以 session 總時間的比值不能當成量到的變慢；撐住論點的是 request 層級的 trace。閒置補回的結果是合成的，包含沒有空檔、機制反而輸的那一列。第三個真實 session 則根本沒觸發這個失效模式：cache 命中率大約 84–86%，最大的未命中尾巴約 2.5K token，評分器一次都沒被呼叫。repo 裡還有另外四條研究線——speculative decoding、正確性、異質運算、跨 runtime——每一條都標成研究線而不是實驗，因為每一條都寫明自己還缺什麼證據。

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>——整份研究：量測設定、request 層級 trace 與分析。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>——完整的中文文章。
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>
  與 <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>——撰寫時兩個都仍在審查中。

</div>

我還做不到的是：在請求進來的當下判斷它屬於哪一種。在那之前由呼叫端宣告，伺服器照單全收。
