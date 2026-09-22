---
title: 'LLM Inference Systems'
type: '系統研究 · LLM 推論'
summary: '一個持續進行的推論系統研究計畫：從真實互動式 workload 出發，對 runtime 加上量測、隔離出機制、檢查正確性，最後轉成 production 決策或上游修正。目前含三個已完成實驗與三條還開著的研究線。'
outcome: '三個完成的實驗（可重用狀態與互動延遲、推測解碼成本模型、可重用 canonical 狀態的背景補回）、三條各自寫明還缺什麼證據、都還開著的研究線、七個上游 pull request（六個開著、都不是草稿，一個已合併），以及一套可重跑的量測工具與完整資料集。'
indexMeta: 'Apple silicon · 三個實驗 · 三條開著的研究線 · 六個開著的上游 PR、一個已合併'
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
    value: '公開 repo · 已發表文章 · 七個上游 pull request：六個開著、一個已合併'
---

由 Oliver Yu 獨立研究、量測並提交上游。

推論最佳化在隔離的 benchmark 上通常很好看，放進真實的互動式 workload 才開始失效。這個研究計畫在做的就是把那些失效挖出來：對 runtime 加上量測、隔離出機制、檢查正確性，再把結論轉成 production 決策或上游修正。

範圍是 Runtime · Serving · 可重用狀態 · 推測執行 · 正確性 · 異質運算，全部在一台 Apple silicon 機器上。

## 研究方式

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Production 觀察</span>
<span class="state-flow__detail">真實流量上出現、benchmark 上看不到的行為。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Runtime 量測</span>
<span class="state-flow__detail">量到機制本身，而不是只量總共花了多久。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">受控實驗</span>
<span class="state-flow__detail">同一個 prompt，只切換被研究的那一個機制。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">機制</span>
<span class="state-flow__detail">找出真正能預測結果的那個數字，而不是最常被拿來報的那個。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">正確性</span>
<span class="state-flow__detail">輸出禁不起檢查的話，變快就不算數。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Production / 上游</span>
<span class="state-flow__detail">改一個部署預設值、送一個 PR，或明講不改任何東西。</span>
</li>
</ol>
<figcaption class="state-flow__caption">每一階段都可能推翻上一階段的假設；下面三個實驗都是這樣走完的。</figcaption>
</figure>

每一項結論都標上證據等級：observed、measured、derived、inferred、hypothesized、not established。分級本身就是重點——repo 裡有三條主題被列為還開著的研究線而不是實驗，正是因為它們各自寫明了還缺什麼證據。

## 從 baseline 到 optimized serving

這個研究不是從 prefix cache 的問題開始的。最初的目標很直接：讓一個 27B-class dense 模型在 4-bit 下、在單機 Apple silicon 上，從「跑得動」變成真正可互動的推論服務。

在 16K context，dense prefill 約 302 tok/s；加上 sparse prefill 之後是 1,046 tok/s。32K 從 277 tok/s 到 1,112 tok/s。首個 token 的延遲來自同樣這兩列：16K 從 57.84 秒降到 19.24 秒，32K 從 122.7 秒降到 33.5 秒。再把異質 prefill 疊上去是另一次量測，而且只有吞吐量：16K 從約 300 到 1,328 tok/s，出自一次隔離的 smoke run、行程裡只有一個 engine，是這一頁最脆弱的數字。

最佳化也不是只發生在模型計算本身。背景的 dense 前綴補回一度與前景生成搶同一個 executor，前景 decode 掉到 13.5 tok/s；背後是兩個缺陷：一個是請求在被受理之前，排程器根本看不到它；另一個是背景切片會讓負責收請求的迴圈一直拿不到執行機會。兩個都修掉之後，同樣條件下的前景 decode 回到約 47 tok/s——這一格只量過一次。那是實驗分支上的工作，重做過的版本是下面的 EXP-003。

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

到這裡，不管是單次 request 的數字，還是背景工作不再擋住前景，都已經很好看。但把同一套設定接到真正的 coding agent 後面——它會一直讀檔、呼叫工具，把 context 越疊越長——整個 session 反而變慢了。

這才是 EXP-001 真正的起點：**如果每一次 request 都更快了，為什麼整個互動式 workload 會更慢？**

## 可重用狀態與互動延遲（EXP-001）

這個實驗問的是：**一次 request 的加速，會不會因為破壞了可重用狀態，反而讓整個互動 session 變慢？**

Sparse prefill（此處為 SpecPrefill，一種 attention-based 機制）在冷啟動長 prompt 上效果很實在：16K 首個 token 從 57.84 秒降到 19.24 秒，32K 從 122.7 秒降到 33.5 秒。但一個 agent 的下一個 request，有很大一部分就是上一個 request 再來一次——偏偏 sparse 化過的尾巴，並不會把平常可以重用的 dense prefix state 往前推。

Request 層級的 trace 讓機制現形：可重用 checkpoint 爬到 37,888 token 後塌回 28,672，接下來十個 request 都釘在那裡；同一段期間，每個 request 必須重算的 uncached suffix 從 17,060 長到 33,979。那次塌陷發生在 sparse 進場之前，所以 sparse 不是塌陷的成因；但塌陷之後的每一個 uncached suffix 都被 sparse 化，checkpoint 再也沒有回復，累積下來的重算就是 prefix-cache 的欠債。

過程中挖到的正確性缺陷，比這個實驗的效能結論更重要：伺服器用減法推算受保護前綴的邊界，有工具參與時至少會少算 37 個 token，於是工具指令的結尾和操作者系統提示的開頭，就落進了可以被 sparse 掉的範圍。改法是量邊界，而不是推算。

<div class="decision">

### Session 才是量測單位，不是單一 request

**原因** — 冷 benchmark 只說得出這次 request 省了多少，量不到它留給下一輪多少 reusable state，而那正是 agent workload 在付的帳。

**結果** — 改追 reusable checkpoint 與 uncached suffix。兩個 agent 走的任務路徑本來就不同，跑完的時間差只當追查的起點，不當成量到的效果。

</div>

完整的 finding、資料與限制在
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-001-reusable-state-economics" target="_blank" rel="noopener noreferrer">EXP-001</a>，長文版本在
<a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a>。

## 推測解碼成本模型（EXP-002）

這個實驗問的是：**推測解碼在什麼條件下真的省時間？決定 break-even 的是 acceptance rate，還是一次 verify cycle 的成本？**

答案是後者。acceptance rate 是這個機制最常被拿來報的數字，而 36 次量測之後的結論是：那是錯的數字——高 acceptance rate 並不保證變快。真正決定划不划算的是**一次 verify cycle 的代價，以 dense decode step 為單位**，而這個代價屬於模型本身，不屬於內容。

- 在 35B-A3B MoE 上，一次驗證四個位置的 verify forward 相當於 2.43 個 dense step；固定 draft depth 3 在 code 上比 dense 慢 10%、在 prose 上慢 44%，而這兩格量到的 acceptance 分別是 56% 與 25%。
- 在同一個 runtime 上，dense 27B 的同樣一次 forward 只相當於 1.37 個 dense step；在配對的 13.6K coding prompt 上，推測解碼 decode 快 1.81 倍（同一列的端到端是 1.05 倍）——acceptance 是 79%。
- 成本模型只用 runtime 自己的計時器，十一組配對裡有十組預測誤差在 5% 以內，範圍涵蓋 0.56×–1.81×。
- Runtime 既有的 adaptive depth controller 把每一格量到的虧損都拉回打平附近：四格虧損全部變成打平或小幅落後；而在固定 depth 會贏的那一格，它把 draft 放得更淺，換到更便宜的 cycle，比固定 depth 再快 12%。

因為受測的程式本來就選對了，這個 finding 沒有附帶上游提案。Production 決策是不動：維持現行的 adaptive MTP。

<div class="decision">

### 先評估既有的 controller，再談要不要換 policy

**原因** — 在確認現行 policy 會不會做錯決策之前就提新的 policy，等於拿一個沒被證明的問題換一個沒被測過的解。

**結果** — 量到 controller 在每一格都選對之後，就沒有 PR 可送。程式已經是對的時候，這才是誠實的結果。

</div>

一個正確性 caveat，這裡只交代結論：**開啟推測解碼後，greedy 生成不再可重現**——同一個 prompt 跑兩次，給出兩份不同的 completion，而且都與 dense 不同；dense 那一邊則是逐字元完全一致。語意上的影響沒有被量測，所以不宣稱有退化，也不宣稱沒有。這個未解問題被歸進正確性研究線。

<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-002-speculative-decoding-economics" target="_blank" rel="noopener noreferrer">EXP-002</a>
逐項標出每個結論的證據等級，也附上五格 workload 的原始量測；長文版本在
<a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？</a>。

## 可重用 canonical 狀態的背景補回（EXP-003）

這個實驗問的是：**如果 sparse prefill 不留下任何可重用狀態，這份狀態能不能事後補回來，而且不讓前景付代價？**

可以——但中途對「什麼才是重點」的那次修正，比結果本身更值得記。在一組受控的七輪 session 裡，sparse 那一邊的可重用 canonical 前綴始終停在 0，prompt 卻長到 43,065 tokens，於是每一輪都把整份重算一次。改成在前景閒置的空檔重建這段前綴，而且只在 cache block 邊界上發布——這些邊界是一般 serving 路徑自己就能獨立還原的。累積 session 延遲在該 workload 上因此從 228.38 s 降到 79.06 s。兩邊的前景都被釘在 SpecPrefill。

真正花掉大半力氣的，是讓它能安全上線。以時間比例設的 budget 只框得住背景工作「多常」撞到請求，框不住撞到之後那個請求要等多久——budget 調了二十倍，最糟的一次碰撞仍落在同樣的 12–15 s 區間。真正決定等待時間的是 execution slice，而它和 publication grain 是兩件事：跑過的每一種 slice 設定，都發布在完全相同的邊界上，把 slice 從 block grain 縮到 512 之後，client 端觀測到的最糟等待從 15.08 s 降到 1.30 s，代價是補回的吞吐量在最極端的一格約掉 2.4%。再縮到 256 並沒有更好——它從 trace 推導出來的上界更低，實際觀測到的最糟值反而更高。當時還有一個缺陷必須先修掉，才談得上送上游——recovery budget 是每個 engine 各持一份，但 accelerator 是共用的，於是每多載入一個模型，上限就被乘一次。

<div class="decision">

### 重點不是前景有沒有退回 dense prefill，而是下一輪要算的東西變少

**原因** — 這個功能本來是為了在前綴補回之後，讓前景能退回 dense prefill。但量到最快的那個設定，正好是從來沒有退回去的那個；而真的換了路徑的那幾輪，都是各自 session 裡最貴的一輪。

**結果** — 背景補回的價值在於下一輪要算的東西變少，不在於下一輪換一條路徑走。某一輪該走哪條路徑是另一個問題，這裡不回答。

</div>

這一組七輪 session 跑之前並沒有先定義前景的延遲目標。把 slice 縮到 512 之後，runtime trace 記錄到的最糟不可中斷 execution slice 是 2.39 s，那是一個請求「可能」要等多久的上界，不是任何人觀測到的延遲；它是一個推導值，不是一個「可以接受」的判斷。
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-003-progressive-shadow-prefill" target="_blank" rel="noopener noreferrer">EXP-003</a>
收了資料集、圖表與限制；功能本身以
<a href="https://github.com/jundot/omlx/pull/3793" target="_blank" rel="noopener noreferrer"><code>omlx#3793</code></a>
送上游（已開放審查，不是草稿，也還沒有被合併），長文版本在
<a href="https://study.meowcoder.com/posts/260921-canonical-state-debt-recovery/" target="_blank" rel="noopener noreferrer">償還 reusable state 的債</a>。

## 系統主題

下面這兩條沒有做成實驗，因為它們各自還缺關鍵證據。第三條開著的研究線是跨 runtime 的比較，這裡沒有寫；那條線的內容本來就是一句話：受控比較不存在，也沒有人跑過。三條在 repo 裡都有支撐證據，但都還不是結論。

### 正確性：快而錯就是 regression

每一個推論最佳化都在改動產生答案的那段運算，所以每一個都要回答同一個問題：這個差異最後會不會影響到輸出？目前四個案例給出四種不同的答案——

- **還原 cache 前綴**：七組 prompt、十四次執行，輸出逐 byte 相同。最長的一格從 56.3 秒降到 2.3 秒，輸出不變。
- **改變 attention 路由**：68K context、三個數值上不同的 build，logit 差到約 0.4，但 argmax、top-3 token 集合與輸出 hash 都只有一種。路由本身是每次呼叫看當下記憶體餘裕才決定的，所以兩個一模一樣的行程也可能走不同路；<a href="https://github.com/jundot/omlx/pull/3685" target="_blank" rel="noopener noreferrer"><code>omlx#3685</code></a>把它釘在 bounded 那條路上。
- **受保護前綴的邊界**：輸出會變，因為這一個真的改到了模型看到的輸入，而不只是改到運算——而它是四個之中最像「記帳」的那個。
- **推測解碼**：輸出改變，且不再可重現。

風險的排序不能從「這個最佳化聽起來多激進」猜出來：重用 cache 聽起來有風險，實際上是精確的；推測解碼是四個裡面聽起來最危險的，但它「用猜的」那一部分恰好完全精確，真正動到輸出的是底下的運算。

這條線缺的不是比較，是判斷：輸出一旦真的變了，目前所有比較都只能說 byte 有沒有不同，沒有任何一項說得出答案有沒有變差。

### 異質運算：accelerator 有開，不等於有跑

最清楚的結果是一個 null result。Neural engine 的 prefill 路徑是照固定的 tile 長度編譯的，而 serving 層把 prefill 切成 cache block。部署的 block 是 512 token、編譯的 tile 是 2048 token，這時沒有任何一個送進來的 chunk 填得滿一個 tile：這條路徑完成初始化、完成編譯、回報自己已啟用，然後一個 tile 都沒有執行過。

這件事在任何 throughput 數字上都看不出來——設定寫著「neural engine on」，伺服器也回報它是 on，貢獻正好是零。accelerator 根本不接受小於 1024 token 的 prefill 寬度，而<a href="https://github.com/jundot/omlx/pull/3746" target="_blank" rel="noopener noreferrer"><code>omlx#3746</code></a>（已合併）讓這種幾何直接回報「不可能」，而不是去建議一個它根本收不下的形狀。讓這條路徑真的能用的，是編譯的 tile 和 cache block 落在同一個粒度上：差別在工作怎麼被切分，不在怎麼被計算。

這個結論值得留成一條通則：在異質裝置上，accelerator 編譯時假設的工作單位，和 serving 層實際發出的工作單位，是兩個不同的決定，通常由兩個不同的人做。

## 工程與上游成果

上面這些 finding，只跑 benchmark 的人一個都拿不到。要走到這一步，得先把東西做出來——

- **異質 prefill 路徑**：以 1024-token tile 把每一層的工作分攤到 GPU 與 neural engine，tile 對齊該部署設定裡 1024-token 的 cache block。
- **疊加量測**：sparse prefill 疊上去之後，在隔離的驗證中兩者疊到理想乘積的 95–97%。
- **量測式的受保護前綴邊界**：用兩個 throwaway 探針各 render 一次，取兩次一致的 token 前綴，取代減法推算。
- **背景 dense 前綴補回與協作式排程器**：設計上 fail closed，讓背景切片對進來的請求讓路（前景 decode 從 13.5 回到 47 tok/s，這一格只量過一次）。這是實驗分支，後來的檢視找出四個缺口，服務的 build 不帶這段程式。上面的 EXP-003 就是把這個分支重做過的版本：那四個缺口補上了，serving 安全性是量出來的，不是假設的。
- **Request 層級量測**：checkpoint 位置與 uncached suffix，這是 trace 能成立的前提。
- **傳輸層的 request policy**：等真實 workload 證明沒有哪一組設定對每個 request 都適用，才補上這一層。
- **可重跑的 harness 與資料集**：所有圖表由三個只讀 `data/` 的腳本重畫，沒有任何一格被平滑、內插或反推。

上游的部分共七個。撰寫本文時六個還開著、都不是草稿，也都還沒有審出結論，另一個已經合併。開著的 pull request 是提案，不是成果：

- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>——受保護前綴邊界的正確性修正。它比部署策略先送，因為這是唯一一個改到模型輸入、而不只是改到速度的發現。
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>——在 Anthropic messages 端點補上 per-request 的 SpecPrefill 欄位，OpenAI 相容端點本來就有。不改上游任何預設值。
- <a href="https://github.com/jundot/omlx/pull/3685" target="_blank" rel="noopener noreferrer"><code>omlx#3685</code></a>——讓 SDPA-256 的路由變成決定性的。原本每次呼叫都看當下記憶體餘裕才選路，兩個一模一樣的行程因此可能走到不同的浮點歸約；這個修正把符合條件的 prefill 釘在 bounded 那一條。
- <a href="https://github.com/jundot/omlx/pull/3792" target="_blank" rel="noopener noreferrer"><code>omlx#3792</code></a>——prefill OOM 重排路徑上的 SpecPrefill RoPE 清理修正，是做 EXP-003 時發現、獨立送出的。它有自己的重現條件，和背景補回這個功能無關。
- <a href="https://github.com/jundot/omlx/pull/3811" target="_blank" rel="noopener noreferrer"><code>omlx#3811</code></a>——在 mRoPE VLM 上，SpecPrefill 把選中的 token 寫在壓縮後的位置而不是原始位置。這個獨立的正確性缺陷，是在驗證背景補回（PCSR）時暴露出來的；**PCSR 沒有造成它**，把背景補回關掉，它一樣存在。
- <a href="https://github.com/jundot/omlx/pull/3793" target="_blank" rel="noopener noreferrer"><code>omlx#3793</code></a>——背景 canonical 狀態補回，也就是 EXP-003 的功能本身，相依於 #3811，順序應該排在 #3811 後面，並且向維護者提了一個明確的問題：這個 PR 自己那套背景排程原語，是否應該和上游正在進行的相關工作整合。
- <a href="https://github.com/jundot/omlx/pull/3746" target="_blank" rel="noopener noreferrer"><code>omlx#3746</code></a>——目前唯一合併的一個。ANE 的 prefill 排程器會建議一個 accelerator 根本收不下的 sequence length，因為它要求 64 的倍數、而且至少 1024 token；這個修正改成直接回報這種幾何不可能。它不改排程、也不改執行，只是讓一個沉默的錯誤設定開口說話。

在把 #3793 整理到可以送審的過程中，又找出六個缺陷，都是實驗本身的 workload 碰不到的——行程裡有第二個模型、MTP 打開、補回途中遇到 eviction、prompt 長度剛好是 cache block 的整數倍。其中三個不只是這個 runtime 的問題：背景工作要讓出的是**所有權**而不只是執行；前景請求一進來就要被看到，而且要在執行開始之前、跨行程都看得到；cache 的 watermark 是記帳，不是 cache 的實際狀態，所以它必須能往回走。細節與不變式在 EXP-003 的 <code>HARDENING.md</code>。

## 證據與限制

一台機器、一個廠商、一個 runtime。EXP-001 只有一個 27B dense 4-bit 模型，每格跑一次。EXP-002 把 35B-A3B MoE 和 27B 並排量，是這裡最接近第二組設定的一次，機器仍然是同一台。EXP-003 又回到那個 27B dense 4-bit 模型，關掉 MTP，每組設定各跑一次——夠確立機制，不夠給出效果量。能不能推廣到別的模型、別的硬體，三個實驗都寫明沒有建立：機制講的是這個 runtime 的 cache 與排程器，數字講的是這台機器。

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>——研究的 source of truth：方法、原始資料、圖表與限制。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/RESEARCH.md" target="_blank" rel="noopener noreferrer">RESEARCH.md</a>
  與 <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/EVIDENCE.md" target="_blank" rel="noopener noreferrer">EVIDENCE.md</a>——研究地圖，以及結論被分級的那把尺。
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>——系統怎麼一階段一階段長成現在這樣，以及每一階段被什麼推翻。
- <a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/data" target="_blank" rel="noopener noreferrer">資料</a>
  與 <a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/figures" target="_blank" rel="noopener noreferrer">圖表</a>——每張圖背後的每個數字，附出處與列數。
- <a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a>——EXP-001 的完整長文，含圖表。
- <a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？從 Acceptance Rate 到 Verify-Cycle Cost</a>——EXP-002 的完整長文。
- <a href="https://study.meowcoder.com/posts/260921-canonical-state-debt-recovery/" target="_blank" rel="noopener noreferrer">償還 reusable state 的債</a>——EXP-003 的完整長文，含圖表。

</div>

還做不到的是：在請求進來的當下判斷它屬於哪一種 workload。在那之前由呼叫端宣告，伺服器照單全收。
