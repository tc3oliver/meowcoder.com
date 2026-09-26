---
title: 'Apple Silicon 上的自適應異質推論'
type: '系統研究 · 推論 Runtime'
summary: '從 Python GIL、Core ML 的執行方式一路追到 macOS 排程，最後做出一套會自己偵測、自己復原的 MLX GPU + Neural Engine 推論 runtime。'
outcome: 'laya-apple 1.5 讓短請求透過 Core ML 非同步 API 交給 Neural Engine，並從自己的 `RequestTrace` 判斷主機是否變慢，一旦變慢就退回 1.4 路徑。在 154 段重疊時段的驗證中，GPU 結果回傳從 4.28–8.60 ms 降到 0.035–0.043 ms，沒有出現輸出不一致、掉請求或當機。'
indexMeta: 'Apple M4 Max · MLX GPU + Neural Engine · 已於 laya-apple 1.5 發布 · 上游 PR：apple/coremltools#2876'
evidence: 'GitHub 上的 laya-apple · 研究地圖、事先登錄的驗收標準，以及每項研究的原始資料'
slug: 'laya-apple'
locale: 'zh'
translationKey: 'laya-apple'
order: 2
draft: false
kind: 'case-study'
meta:
  - label: '硬體'
    value: 'Apple M4 Max · MLX GPU + Apple Neural Engine'
  - label: 'Runtime'
    value: 'laya-apple 1.5 · Python、MLX、Core ML'
  - label: '範圍'
    value: 'GIL 與並行 · Core ML 執行 · macOS 排程 · 退回 1.4 路徑'
  - label: '上游'
    value: 'apple/coremltools#2876 · 尚未合併'
---

Oliver Yu 獨立完成研究、量測與發布。

<a href="https://github.com/tc3oliver/laya-apple" target="_blank" rel="noopener noreferrer">laya-apple</a> 讓同一台 Mac 的 MLX GPU 和 Neural Engine 同時提供服務：長請求走 GPU，短請求透過 Core ML 交給 Apple Neural Engine。

- **GPU 結果回傳 P50：7.67 → 0.14 ms**，來自針對 GIL 的因果實驗。
- **1.5 驗證：4.28–8.60 → 0.035–0.043 ms**，對照 1.4 路徑，吞吐量是它的 1.038–1.042 倍。
- **對照實驗中 12 次變慢全部復原**，從觸發到恢復最久 414 ms，事先訂的上限是 1.0 s。
- **154 段重疊時段的驗證**，輸出不一致、路由錯誤、掉請求、當機都是 0。

上游 PR：<a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>，讓原生 `MLModel.predict()` 執行期間釋放 GIL，目前尚未合併。

<figure class="trajectory" aria-label="GPU 結果回傳時間的前後對照，單位毫秒">
<div class="trajectory__panel">
<p class="trajectory__title">GPU 結果回傳，P50</p>
<p class="trajectory__unit">ms · 越低越好</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">GIL 因果實驗</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 89%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 2%"></span></span>
<span class="trajectory__value">7.67 → 0.14</span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">1.5，laya</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 50%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 1%"></span></span>
<span class="trajectory__value">4.28 → 0.035</span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">1.5，typed-decisions</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 100%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 1%"></span></span>
<span class="trajectory__value">8.60 → 0.043</span>
</li>
</ol>
</div>
<figcaption class="trajectory__caption">「GPU 結果回傳」是 GPU worker 算完一個請求，到結果交回呼叫端的時間，不含 GPU 運算。第一列是研究階段的實驗，後兩列是 1.5 正式版驗證時和 1.4 路徑的比較。</figcaption>
</figure>

## 問題

照原本的設計，兩個裝置應該各做各的：短請求不必排在長時間的 GPU 工作後面，GPU 也不受影響。實際跑起來並不是這樣。Neural Engine 在旁邊的 thread 上一起跑時，typed-decisions 的 GPU 服務時間變成原本的 1.04–1.64 倍，Neural Engine 自己卻幾乎沒受影響。

可能的原因有四個：GPU、Neural Engine、Python，或包在外層的 runtime。每一個的修法都不一樣，沒量過就只能猜。

下文的「重疊時段」（episode），指 GPU 和 Neural Engine 同時在服務的一段時間。

## 找到 GIL

先排除 GPU。16 條 GPU stream 裡有 15 條，MLX `mx.eval` 的時間最多只到原本的 1.04 倍，GPU 運算幾乎沒有變慢。

Runtime 本來就會替每個請求記一筆 `RequestTrace`。從 trace 看，多出來的時間落在 GPU 的回傳階段，而且剛好對上 Neural Engine `predict` 結束的時間點：回傳從 0.05 ms 變成 7.41 ms，占增加時間的 91.1%。GPU 早就算完了，結果卻交不出去。

Thread profile 看得出它在等什麼。GPU dispatcher 已經讀到結果，卻卡在 `take_gil`，要等 Core ML 呼叫返回才拿得到 GIL。用 coremltools 時，有 872 個樣本停在 `take_gil`；換成會釋放 GIL 的 binding，一個也沒有。

Profile 只能說明兩件事同時發生，所以再用 2×2 實驗確認因果：不跑 Core ML、只佔住 GIL，延遲照樣出現；照跑 Core ML `predict`、但釋放 GIL，延遲就消失。GPU 回傳 P50 從 7.67 ms 降到 0.14 ms。

## 修回上游

這不是 laya-apple 才有的問題。只要 Python 程式在一條 thread 上同步呼叫 Core ML，其他 thread 又需要 GIL，就可能卡在同一個地方。只在自己的 runtime 裡繞過去，其他 coremltools 使用者還是會遇到，所以修正直接送給 coremltools：<a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>。

這個修改只在原生 `predictionFromFeatures:` 呼叫期間釋放 GIL，對呼叫端來說 `predict()` 仍然是同步的，並附上多 thread 的回歸測試。它必須等另一個修正（apple/coremltools#2827 或 #2829）先合併；那個修正處理的是 NumPy 輸入在沒拿到 GIL 時被釋放的問題。這個 PR 還沒合併，在它進入正式版 coremltools 之前，整段原生呼叫都會佔著 GIL，所以 1.5 不依賴它。

## 拿掉 GIL 還不夠

為了避開 GIL 等待，試了四種做法，每一種都確實讓等待消失：

1. 把 Neural Engine 移到獨立的 worker process；
2. 改用會釋放 GIL 的 binding；
3. 改用 prebound binding，每次 forward 在 Python 與 Objective-C 之間的來回從 108 次降到 4 次；
4. 改用 Core ML 官方的非同步 API。

但放進實際的請求組合後，沒有一種能確定是安全的。獨立 process 在兩個模型上都沒過驗收：laya 的短請求 P99 多了 17.5%（上限 5%），typed-decisions 多了 73.3%。釋放 GIL 的 thread 在三個模型上全部失敗，代價轉嫁到 Neural Engine 的短請求。Prebound binding 在只測重疊時段的實驗流程下有兩個模型通過，但在同一個流程下，原本失敗的釋放 GIL thread 也通過了，所以這個 PASS 不能歸功於減少 Python 與 Objective-C 之間的來回。換成完整流程後，prebound binding 在 n = 12 時判定幾乎不可能達標，提前停止，短請求 P99 是 1.4 路徑的 1.409 倍。Core ML 非同步 API 在篩選實驗裡照樣會變慢（見下一節），所以只留作快速路徑的候選，不算解法。

Prebound 的 PASS 和 FAIL 各自只在產生它的實驗流程下成立，事後沒有改寫任何一個。

<div class="decision">

### 比較成本之前，先把另一邊的負載固定

**原因**：釋放 GIL 之後，Neural Engine 的吞吐量看起來掉了 13.5%。但壓測用的是 closed-loop，GPU 不再被卡住，就多送出 44% 的請求。

**結果**：改用同一條固定種子的請求序列打 GPU（46.65 req/s，每個量測區間（window）都一樣），差距只剩 +0.1%。在這個負載下量不到額外成本；更高的負載沒有重測。

</div>

## 主機端變慢

完整流程還量到另一種狀態。以短請求 P99 來看，重疊的量測區間分成兩群：正常的在 10.4–12.3 ms，慢的在 13.6–21.2 ms。慢的時候，GPU thread 每次 forward 用掉的 CPU 時間從 1.8 ms 升到 6.1 ms，原生 Core ML `predict` 卻幾乎沒變（慢的 9.67 ms，正常的 9.62 ms）。變慢的是主機，不是 Neural Engine。

Core ML 非同步 API 讓 GPU 回傳維持在 0.035 ms，吞吐量也不輸 1.4 路徑，但三個量測區間裡還是有兩個變慢。事後分析這些區間，發現變慢集中在每段重疊時段剛開始的 0.8–3.4 秒；這段時間以外，非同步路徑反而比 1.4 快，P99 是 10.4 ms 對 11.9 ms。

再看各 thread 的 CPU 計數器，變慢和 thread 跑在哪種核心上有關。變慢期間，Neural Engine dispatcher、短請求 client 和 Core ML callback 這幾條 thread 有 91–100% 的時間跑在節能核心（E-core）上，穩定時則是 0%；它們一回到效能核心（P-core），變慢就結束。範圍也不只一條 thread 或一個 process：取樣到的六次切換裡，Neural Engine 這一串、主 process 的其他 thread，以及 GPU worker process，全都一起落在 E-core 上（這部分同樣是事後分析）。

接著試了兩種排程介入：dependency QoS override，以及把 dispatcher 設為 USER_INITIATED QoS。兩種都確實生效（讀回的 QoS 是 0x19），但沒有一次把 Neural Engine dispatcher 從 E-core 移走。QoS 這條路到此為止。

這是很強的相關，但不是已經證明的因果。目前沒有任何研究能說明 macOS 為什麼把這些 thread 排到 E-core，這裡也不去猜。

## 從預防改成復原

如果只有重疊時段剛開始會變慢，可以加一段保護期：每段重疊時段的前幾個請求先走 1.4 路徑，之後再切換。保護期設為 64 個請求（H64）時，篩選的 10 次切換和確認的 16 次切換都沒有落到 E-core。不過確認階段的離群值檢查是 +2.43 ms，超過 +2.0 ms 的上限，所以確認階段記為 FAIL。

正式版 runtime 的評估推翻了它。有一段重疊時段在 0.73 秒時正常切換，大約 4.7 秒後才開始變慢，一路慢到量測區間結束。那次執行前，背景有個 process 吃掉 92% 的 CPU，但事先登錄的規則沒有把這種情況排除，因為背景負載本來就是真實使用的一部分。既然變慢不只發生在開頭，用請求數計算的保護期就擋不住。這條路關閉，預設維持 1.4。

之後不再試著預測 macOS 怎麼排程，目標改成：runtime 要多快發現變慢，並退回 1.4 路徑。

需要的訊號 runtime 本來就有。`RequestTrace` 原本是為了看清每個請求的時間花在哪裡，其中的 `prepare_ms` 記錄 Neural Engine 請求在路由前花在主機上的時間。超過 0.3 ms 就算一次「主機慢」；斷路器 C3 連續看到三次就觸發，這段重疊時段剩下的請求全部退回 1.4 路徑。

- **重播錄下的資料。** 在所有非同步系列的重疊時段中，C3 抓到全部 16 段持續變慢，最久 126 ms 才發現；51 段正常的重疊時段裡誤判 4 次。C3 是用同一批資料挑出來的，所以重播只能說明它可行，不能當成驗證。下一個實驗開始前，C3 就先固定下來。
- **復原實驗。** 這個實驗有事先登錄。沒有斷路器時，6 段全部變慢；有斷路器時，12 段都觸發了斷路器，而且都是自然發生的變慢，沒有刻意製造。從觸發到穩定回到 1.4 的延遲水準，中位數 215 ms、P95 364 ms、最慢 414 ms；退回後的吞吐量是 1.4 路徑的 0.999 倍。

<div class="decision">

### 不再預防，改成偵測

**原因**：沒有任何介入擋得住變慢，觸發原因也還沒找到。建立在未知原因上的策略，往往只對剛好量到的那幾次有效。

**取捨**：只有主機正常時才享受得到非同步的好處。一旦觸發，這段重疊時段剩下的時間都走比較慢的 1.4 路徑。

</div>

## 1.5 發布的內容

在 `execution="workers"`、`device="auto"` 下，laya 和 laya-typed-decisions 預設啟用自適應執行。每段重疊時段先在 1.4 路徑上跑 64 次同步 forward，再切到有 C3 監控的 prebound 非同步 Core ML。一旦觸發，剩下的時間走 1.4 路徑；這段重疊時段結束後，斷路器重新待命。laya-multilingual 仍然用獨立 process，不走這套機制。

驗證總共 154 段重疊時段，分三個階段，都和 1.4 路徑比較：

- **laya 實際請求組合**，12 段：GPU 回傳 0.037 ms 對 4.29 ms，吞吐量 1.042 倍；
- **typed-decisions 實際請求組合與長時間測試**，78 段：0.043 ms 對 8.60 ms，1.038 倍；
- **含突發流量的長時間測試**，64 段：0.035 ms 對 4.28 ms，1.042 倍。

三個階段全部通過，輸出不一致、路由錯誤、掉請求、當機都是 0。

驗證期間沒有自然出現變慢，斷路器一次都沒觸發，所以正式版的退回機制還沒有在真正的變慢中觸發過。復原的證據來自上面的實驗；正式版斷路器的邏輯，則用單元測試和研究版互相比對。

## 研究方法

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">觀察</span>
<span class="state-flow__detail">Neural Engine 一起跑，GPU 尾端延遲就上升。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">量測</span>
<span class="state-flow__detail">記下每個請求每一段的時間，不只看總時間。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">定位</span>
<span class="state-flow__detail">運算沒變，結果卡在 take_gil。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">介入</span>
<span class="state-flow__detail">GIL 與 Core ML 的 2×2 實驗確認因果。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">排除干擾</span>
<span class="state-flow__detail">固定請求序列後，看似 13.5% 的成本消失。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">推翻</span>
<span class="state-flow__detail">避開了開頭變慢的保護期，在正式版 runtime 失效。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">偵測</span>
<span class="state-flow__detail">原本用來除錯的 trace，變成線上訊號。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">復原</span>
<span class="state-flow__detail">414 ms 內退回 1.4 路徑。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">發布</span>
<span class="state-flow__detail">1.5 預設啟用，經過 154 段重疊時段驗證。</span>
</li>
</ol>
<figcaption class="state-flow__caption">過程中有好幾項研究以 FAIL 收場，全部照原樣留在紀錄裡。</figcaption>
</figure>

GIL 是證實的原因，所以修正送往上游；E-core 只有相關性，所以 runtime 不依賴對它的解釋，而是盯著看得到的症狀，把使用者受影響的時間壓在上限內。

## 證據與限制

- **只有一台機器。** 所有結果都來自同一台 M4 Max、同一版 macOS，不代表其他 Apple 晶片或 macOS 版本。
- **E-core 的資料只涵蓋 laya 自己的兩個 process。** 不能據此說是整台機器的現象。
- **重疊途中才開始的變慢，復原時間沒有量過。** 復原實驗裡的變慢都從重疊一開始就出現。重播只顯示 C3 抓得到途中才開始的變慢（也就是推翻保護期的那一種），不代表復原時間有上限。
- **偵測門檻只在 laya 上驗證過。** typed-decisions 的驗證改為只檢查會不會誤判。
- **觸發原因還不知道。** 主機為什麼會變慢仍是未解的問題，對應的篩選實驗已事先登錄，但還沒跑。

<div class="evidence">

- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/README.md" target="_blank" rel="noopener noreferrer">研究地圖</a>：1.4 到 1.5 的 19 個問題，每一個都連到對應的研究、證據類型與結論。
- <a href="https://github.com/tc3oliver/laya-apple/pull/46" target="_blank" rel="noopener noreferrer">#46</a>（GIL 因果實驗）、<a href="https://github.com/tc3oliver/laya-apple/pull/51" target="_blank" rel="noopener noreferrer">#51</a>（固定負載）、<a href="https://github.com/tc3oliver/laya-apple/pull/88" target="_blank" rel="noopener noreferrer">#88</a>（主機端變慢）、<a href="https://github.com/tc3oliver/laya-apple/pull/96" target="_blank" rel="noopener noreferrer">#96</a>（E-core）、<a href="https://github.com/tc3oliver/laya-apple/pull/103" target="_blank" rel="noopener noreferrer">#103</a>（保護期被推翻）、<a href="https://github.com/tc3oliver/laya-apple/issues/104" target="_blank" rel="noopener noreferrer">#104</a>（偵測與復原）、<a href="https://github.com/tc3oliver/laya-apple/pull/105" target="_blank" rel="noopener noreferrer">#105</a>（1.5 驗證）。
- <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>：原生 `MLModel.predict()` 執行期間釋放 GIL。
- <a href="https://github.com/tc3oliver/laya-apple" target="_blank" rel="noopener noreferrer">GitHub</a> 與 <a href="https://pypi.org/project/laya-apple/" target="_blank" rel="noopener noreferrer">PyPI</a> 上的 laya-apple：runtime 本身。

</div>
