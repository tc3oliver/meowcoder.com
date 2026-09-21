---
title: 'LLM Inference Systems'
type: '系統研究 · LLM 推論'
summary: '一個持續進行的推論系統研究計畫：從真實互動式 workload 出發，對 runtime 下儀器、建立受控實驗、追到機制、檢查正確性，最後轉成 production 決策或上游修正。目前含兩個已完成實驗與三條研究線。'
outcome: '兩個完成的實驗（可重用狀態與互動延遲、推測解碼成本模型）、三條標明缺什麼證據的研究線、兩個審查中的上游 pull request，以及一套可重跑的量測工具與完整資料集。'
indexMeta: 'Apple silicon · 兩個實驗 · 三條研究線 · 兩個審查中的上游 PR'
evidence: 'GitHub 上的 llm-inference-systems · 實驗方法、request 層級 trace、原始資料與圖表'
slug: 'llm-inference-systems'
locale: 'zh'
translationKey: 'llm-inference-systems'
order: 2
draft: false
kind: 'case-study'
meta:
  - label: '硬體'
    value: 'Apple M4 Max · 64GB 統一記憶體'
  - label: '模型'
    value: '27B dense 4-bit · 35B-A3B MoE 6-bit'
  - label: '範圍'
    value: 'Runtime · Serving · 可重用狀態 · 推測執行 · 正確性 · 異質運算'
  - label: '證據'
    value: '公開 repo · 已發表文章 · 兩個審查中的上游 pull request'
---

由 Oliver Yu 獨立研究、量測並提交上游。

推論最佳化在隔離的 benchmark 上通常很好看，放進真實的互動式 workload 才開始失效。這個研究計畫在做的就是把那些失效挖出來：對 runtime 下儀器、隔離出機制、檢查正確性，再把結論轉成 production 決策或上游修正。

範圍是 Runtime · Serving · 可重用狀態 · 推測執行 · 正確性 · 異質運算，全部在一台 Apple silicon 機器上。

## 研究方式

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Production 觀察</span>
<span class="state-flow__detail">真實流量上出現、benchmark 上看不到的行為。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Runtime 儀器</span>
<span class="state-flow__detail">量到機制本身，而不是只量牆鐘時間。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">受控實驗</span>
<span class="state-flow__detail">同一個 prompt，只切換被研究的那一個機制。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">機制</span>
<span class="state-flow__detail">能預測結果的那個量，而不是最常被報的那個。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">正確性</span>
<span class="state-flow__detail">變快不算數，除非輸出還撐得住。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Production / 上游</span>
<span class="state-flow__detail">改一個部署預設值、送一個 PR，或明講證據不足以改任何東西。</span>
</li>
</ol>
<figcaption class="state-flow__caption">每一階段都可能推翻上一階段的假設；下面兩個實驗都是這樣走完的。</figcaption>
</figure>

每一項結論都標上證據等級：observed、measured、derived、inferred、hypothesized、not established。這個分級是刻意的——repo 裡有三條主題被標成研究線而不是實驗，正因為它們各自寫明了還缺什麼證據。

## 從 baseline 到 optimized serving

這個研究不是從 prefix cache 的問題開始的。最初的目標很直接：讓一個 27B-class dense 模型在 4-bit 下、在單機 Apple silicon 上，從「跑得動」變成真正可互動的推論服務。

在 16K context，dense prefill 約 302 tok/s；把異質 prefill 與 sparse prefill 疊上去之後是 1,046 tok/s。32K 從 277 tok/s 到 1,112 tok/s。在隔離的驗證環境裡兩種機制疊加，prefill 最高量到約 1,328 tok/s。對應的首個 token，16K 從 57.84 秒降到 19.24 秒，32K 從 122.7 秒降到 33.5 秒。

優化也不是只發生在模型計算本身。背景的 dense 前綴補回一度與前景生成搶同一個 executor，前景 decode 掉到 13.5 tok/s；把到達可見性與 executor 飢餓這兩個缺陷分別修掉之後，同樣條件下的前景 decode 回到約 47 tok/s——這一格只量過一次。

<figure class="trajectory" aria-label="從 baseline 到 optimized serving 的三組量測：prefill throughput、首字延遲，以及背景補回期間的前景 decode">
<div class="trajectory__panel">
<p class="trajectory__title">Prefill 吞吐</p>
<p class="trajectory__unit">tok/s · 越高越好</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">16K</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 23%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 79%"></span></span>
<span class="trajectory__value">302 → 1,046<span class="trajectory__ratio">3.5×</span></span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">32K</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 21%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 84%"></span></span>
<span class="trajectory__value">277 → 1,112<span class="trajectory__ratio">4.0×</span></span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">疊加（單次 smoke run）</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 23%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 100%"></span></span>
<span class="trajectory__value">~300 → 1,328<span class="trajectory__ratio">4.4×</span></span>
</li>
</ol>
</div>
<div class="trajectory__panel">
<p class="trajectory__title">首個 token 的延遲</p>
<p class="trajectory__unit">秒 · 越低越好</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">16K</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 47%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 16%"></span></span>
<span class="trajectory__value">57.84 → 19.24</span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">32K</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 100%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 27%"></span></span>
<span class="trajectory__value">122.7 → 33.5</span>
</li>
</ol>
</div>
<div class="trajectory__panel">
<p class="trajectory__title">排程器隔離</p>
<p class="trajectory__unit">tok/s · 背景補回進行中的前景 decode</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">前景 decode</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 29%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 100%"></span></span>
<span class="trajectory__value">13.5 → 47</span>
</li>
</ol>
</div>
<figcaption class="trajectory__caption">三個面板各自有自己的單位與自己的尺標，不共用一條 Y 軸；中間那格越低越好，實心條因此比空心條短。疊加那一列來自一次隔離的 smoke run，與上面兩列不是同一次量測。最後一格不是 decode 的一般基準，而是背景 dense 補回與前景生成搶執行資源時、前景這一側在唯一一次量測中的數字。</figcaption>
</figure>

到這裡，單次 request 的數字已經很好看。但同一套設定真正接上一個持續讀檔、呼叫工具、把 context 越疊越長的 coding agent 之後，整個 session 反而變慢了。

這才是 EXP-001 真正的起點：**如果每一次 request 都更快了，為什麼整個互動式 workload 會更慢？**

## 可重用狀態與互動延遲（EXP-001）

這個實驗問的是：**一次 request 的加速，會不會因為破壞了可重用狀態，反而讓整個互動 session 變慢？**

Sparse prefill（此處為 SpecPrefill，一種 attention-based 機制）在冷啟動長 prompt 上效果很實在：16K 首個 token 從 57.84 秒降到 19.24 秒，32K 從 122.7 秒降到 33.5 秒。但一個 agent 的下一個 request，大部分就是上一個 request 再來一次——而 sparse 化過的尾巴，不會推進正常可重用的 dense prefix state。

Request 層級的 trace 讓機制現形：可重用檢查點爬到 37,888 token 後塌回 28,672，並在其後十個 request 一直釘在那裡；同一段期間，每個 request 必須重算的未命中尾巴從 17,060 長到 33,979。那次塌陷發生在 sparse 進場之前，所以 sparse 不是塌陷的成因；但塌陷之後的每一個未命中尾巴都被 sparse 化，檢查點再也沒有回復，累積下來的重算就是 prefix-cache 的欠債。

過程中挖到的正確性缺陷比效能工作更重要：伺服器用減法推算受保護前綴的邊界，有工具在場時可能少算 37 個 token，正好把工具指令的結尾和操作者系統提示的開頭落進可被 sparse 掉的範圍。修法是量邊界而不是推算，已送上游。

<div class="decision">

### Session 才是量測單位，不是單一 request

**原因** — 冷 benchmark 只說得出這次 request 省了多少，量不到它留給下一輪多少 reusable state，而那正是 agent workload 在付的帳。

**結果** — 改追 reusable checkpoint 與 uncached suffix。真實 agent 的牆鐘時間差只當追查的起點，不當量到的效果量——兩個 agent 走的任務路徑不同。

</div>

完整的 finding、資料與限制在
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-001-reusable-state-economics" target="_blank" rel="noopener noreferrer">EXP-001</a>，長文版本在
<a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a>。

## 推測解碼成本模型（EXP-002）

這個實驗問的是：**推測解碼在什麼條件下真的省時間？決定 break-even 的是 acceptance rate，還是一次 verify cycle 的成本？**

答案是後者。acceptance rate 是這個機制被報得最多的數字，而 36 次配對量測之後的結論是：那是錯的數字——高接受率並不保證變快。真正決定划不划算的是**一次 verify cycle 的代價，以 dense decode step 為單位**，而這個代價屬於模型架構，不屬於內容。

- 35B-A3B MoE 上，一次四位置的 verify forward 值 2.43 個 dense step；固定 draft depth 3 在 code 上比 dense 慢 10%、在 prose 上慢 43%，而當下的 acceptance 分別是 56% 與 25%。
- 同一個 runtime、同一批 prompt，dense 27B 上同樣的 forward 只值 1.37 個 dense step，機制在配對的 13.6K coding prompt 上快 1.81 倍——acceptance 是 79%。
- 一個只用 runtime 自己的計時器算出來的成本模型，能預測整段 0.56x–1.81x 的配對加速比。
- Runtime 既有的 adaptive depth controller 避開了所有量到的虧損區：它把四格虧損全部轉成打平或小幅落後，而在固定 depth 會贏的那一格，它靠 draft 得更淺、買到更便宜的 cycle，比固定 depth 再快 12%。

因為受測的程式本來就選對了，這個 finding 沒有附帶上游提案。Production 決策是不動：維持現行的 adaptive MTP。

<div class="decision">

### 先評估既有的 controller，再談要不要換 policy

**原因** — 在確認現行 policy 會不會做錯決策之前就提新的 policy，等於拿一個沒被證明的問題換一個沒被測過的解。

**結果** — 量到 controller 在每一格都選對之後，就沒有 PR 可送。程式已經是對的時候，這才是誠實的結果。

</div>

一個正確性 caveat，這裡只標不展開：**開啟 MTP 後，greedy 生成不再可重現**——同一個 prompt 兩次執行給出兩份不同的完成，也都與 dense 不同；dense 那一邊則是逐字元完全一致。語意上的影響沒有被量測，所以不宣稱有退化，也不宣稱沒有。這個未解問題被歸進正確性研究線。

<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-002-speculative-decoding-economics" target="_blank" rel="noopener noreferrer">EXP-002</a>
逐項標出每個結論的證據等級，以及五格 workload 的原始量測；長文版本在
<a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？</a>。

## 系統主題

這兩條沒有做成實驗，因為它們各自還缺關鍵證據。它們留在 repo 裡是當支撐證據，不是當結論。

### 正確性：快而錯就是 regression

每一個推論最佳化都在改變產生答案的算術，所以每一個都要回答同一個問題：這個差異有沒有走到輸出？目前四個案例給出四種不同的答案——

- **還原 cache 前綴**：七組 prompt、十四次執行，輸出逐 byte 相同。最長的一格從 56.3 秒降到 2.3 秒，輸出不變。
- **改變 attention 路由**：68K context、三個數值上不同的 build，logit 差到約 0.4，但 argmax、top-3 token 集合與輸出 hash 都只有一種。
- **受保護前綴的邊界**：這一個真的改到了模型看到的輸入，而且是四個之中最像「記帳」的那個。
- **推測解碼**：輸出改變，且不再可重現。

排序不能從「這個最佳化聽起來多激進」猜出來：重用 cache 聽起來最危險卻是精確的；推測解碼聽起來最危險，而它「用猜的」那部分恰好是精確的，動到輸出的是底下的算術。

這條線缺的不是比較，是判斷：目前所有比較都只能說 byte 不同，沒有任何一項說得出答案有沒有變差。

### 異質運算：accelerator 有開，不等於有跑

最清楚的結果是一個 null result。Neural engine 的 prefill 路徑為固定 tile 長度編譯，而 serving 層把 prefill 切成 cache block。部署的 block 是 512 token、編譯的 tile 是 2048 時，沒有任何一個交付的 chunk 填得滿一個 tile：這條路徑完成初始化、完成編譯、回報自己已啟用，然後一個 tile 都沒有執行過。

在任何 throughput 數字上都看不出來——設定寫著「neural engine on」，伺服器也同意它是 on，貢獻正好是零。修法是把 tile 對齊改成配合 block 結構：改的是工作怎麼被切分，不是怎麼被計算。

一般化的形式值得留著：在異質裝置上，accelerator 編譯時假設的工作單位，和 serving 層實際發出的工作單位，是兩個不同的決定，通常由兩個不同的人做。

## 工程與上游成果

這個計畫不是只有 benchmark。要走到上面的 finding，得先把東西做出來——

- **異質 prefill 路徑**：以對齊 cache block 的 1024-token tile，把每一層的工作分攤到 GPU 與 neural engine。
- **疊加量測**：sparse prefill 疊上去之後，在隔離的驗證中兩者疊到理想乘積的 95–97%。
- **量測式的受保護前綴邊界**：用兩個 throwaway 探針 render，取兩次都同意的 token 前綴，取代減法推算。
- **背景 dense 前綴補回與協作式排程器**：設計上 fail closed，讓背景切片對進來的請求讓路（前景 decode 從 13.5 回到 47 tok/s）。這是實驗分支，後來的檢視找出四個缺口，服務的 build 不帶這段程式。
- **Request 層級儀器**：checkpoint 位置與 uncached suffix，這是 trace 能成立的前提。
- **傳輸層的 request policy**：真實 workload 證明沒有單一設定對每個 request 都對之後才加的。
- **可重跑的 harness 與資料集**：所有圖表由兩個只讀 `data/` 的腳本重畫，沒有任何一格被平滑、內插或反推。

上游部分只列 repo 已確認的兩個，兩個在撰寫時都仍在審查中：

- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>——受保護前綴邊界的正確性修正。它比部署策略先送，因為這是唯一一個改到模型輸入、而不只是改到速度的發現。
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>——在 Anthropic messages 端點補上 per-request 的 SpecPrefill 欄位，OpenAI 相容端點本來就有。不改上游任何預設值。

## 證據與限制

一台機器、一個廠商、一個 runtime。EXP-001 是單一 27B dense 4-bit 模型，每格一次；EXP-002 把 35B-A3B MoE 與 27B 並排量，這是這裡最接近第二組設定的東西，而它仍然是同一台機器。跨模型、跨硬體的推廣，兩個實驗都明講沒有建立。

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>——研究的 source of truth：方法、原始資料、圖表與限制。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/RESEARCH.md" target="_blank" rel="noopener noreferrer">RESEARCH.md</a>
  與 <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/EVIDENCE.md" target="_blank" rel="noopener noreferrer">EVIDENCE.md</a>——研究地圖，以及結論被分級的那把尺。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>——系統怎麼一階段一階段長成現在這樣，以及每一階段被什麼推翻。
- <a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/data" target="_blank" rel="noopener noreferrer">資料</a>
  與 <a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/figures" target="_blank" rel="noopener noreferrer">圖表</a>——每張圖背後的每個數字，附出處與列數。
- <a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a>——EXP-001 的完整長文，含圖表。
- <a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？從 Acceptance Rate 到 Verify-Cycle Cost</a>——EXP-002 的完整長文。

</div>

還做不到的是：在請求進來的當下判斷它屬於哪一種 workload。在那之前由呼叫端宣告，伺服器照單全收。
