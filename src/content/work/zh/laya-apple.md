---
title: 'Apple Silicon 上的自適應異質推論'
type: '系統研究 · 推論 Runtime'
summary: '從 Python GIL、Core ML 執行路徑一路追到 macOS 的 host 排程，做出一個能自我復原的 MLX GPU + Neural Engine 推論 runtime。'
outcome: 'laya-apple 1.5 讓短請求透過 Core ML 非同步 API 在 Neural Engine 上執行，從自己的 request trace 偵測 host 端的慢狀態，一旦出現就退回已驗證安全的 1.4 路徑。154 個驗證 episode 中，GPU 結果回傳從 4.28–8.60 ms 降到 0.035–0.043 ms，沒有任何輸出不一致、請求遺失或當機。'
indexMeta: 'Apple M4 Max · MLX GPU + Neural Engine · 已隨 laya-apple 1.5 發布 · 上游：apple/coremltools#2876'
evidence: 'GitHub 上的 laya-apple · 研究地圖、預先登錄的 gate，以及每項研究的原始資料'
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
    value: '並行 · Core ML 執行路徑 · Host 排程 · 自適應退回'
  - label: '上游'
    value: 'apple/coremltools#2876 · 審查中'
---

由 Oliver Yu 獨立研究、量測並發布。

<a href="https://github.com/tc3oliver/laya-apple" target="_blank" rel="noopener noreferrer">laya-apple</a> 在同一台 Mac 上用兩個裝置同時服務同一個模型：長請求給 MLX GPU，短請求透過 Core ML 交給 Apple Neural Engine。兩邊一起跑，GPU 的尾端延遲就變差。這一頁記錄 1.4 到 1.5 之間的研究：原因是什麼，以及 runtime 能安全地做到哪裡。

## 成果

- **GPU 結果回傳 P50：7.67 → 0.14 ms。** 2×2 介入實驗證實，延遲來自同步 Core ML `predict` 持有的 GIL，而不是硬體本身。
- **正式環境：4.28–8.60 → 0.035–0.043 ms。** laya-apple 1.5 對比 1.4 路徑，吞吐量為 1.4 的 1.038–1.042 倍。
- **12 個慢 episode 全數復原，最慢 414 ms。** 在對照實驗中，每次觸發都在 164–414 ms 內回到 1.4 水準的延遲並維持住，預先登錄的上限是 1.0 s。
- **154 個正式驗證 episode。** 輸出不一致、路由失敗、請求遺失、當機，全部為 0。

上游：<a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>，在原生 `MLModel.predict()` 執行期間釋放 GIL。目前仍在審查，尚未合併。

<figure class="trajectory" aria-label="GPU 結果回傳時間的前後對照，單位毫秒">
<div class="trajectory__panel">
<p class="trajectory__title">GPU 結果回傳，P50</p>
<p class="trajectory__unit">ms · 越低越好</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">GIL 介入實驗</span>
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
<figcaption class="trajectory__caption">GPU 結果回傳指的是 GPU worker 算完一個請求，到結果交回呼叫端為止的時間，不是 GPU 運算時間。第一列是研究中的介入實驗，後兩列是正式驗證中 1.5 對比 1.4 路徑。</figcaption>
</figure>

## 症狀

把 Neural Engine 放在 GPU 旁邊的 thread 上執行後，typed-decisions 的 GPU 服務時間變成原本的 1.04–1.64 倍，Neural Engine 自己卻幾乎不受影響。第一個懷疑對象是兩個裝置互相干擾，但量測不支持這個說法：16 條 GPU stream 裡有 15 條，MLX `mx.eval` 的時間最多只增加 1.04 倍。GPU 並沒有算得比較慢。

找到延遲位置的是 runtime 本來就會記錄的 `RequestTrace`。延遲出現在 GPU 的回傳段，而且和 Neural Engine `predict` 結束的時間點對齊：回傳段從 0.05 ms 拉長到 7.41 ms，佔了增加時間的 91.1%。GPU 早就算完了，結果卻還在排隊。

## 原因：GIL

Thread profile 顯示結果卡在哪裡：GPU dispatcher 已經讀到回應，卻停在 `take_gil`，一直等到 Core ML 呼叫返回。用 coremltools 時 `take_gil` 取樣到 872 次，換成釋放 GIL 的 binding 則是 0 次。

Profile 只能看出相關，所以接著用 2×2 介入實驗驗證因果。不跑 Core ML、單純持有 GIL，延遲照樣出現；同一個 Core ML `predict` 改成釋放 GIL 執行，延遲就消失。GPU 回傳 P50 從 7.67 ms 降到 0.14 ms。

這個發現後來送到上游，成為 <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>。它只在原生 `predictionFromFeatures:` 呼叫前後釋放 GIL，對呼叫端來說 `predict()` 仍然是同步的。這個 PR 依賴另一個修正（apple/coremltools#2827 或 #2829），處理 NumPy 輸入在沒有持有 GIL 時被釋放的問題。在它合併並正式發布之前，coremltools 仍會在整個原生呼叫期間持有 GIL，所以 1.5 的設計不依賴這個 PR。

<div class="decision">

### 先固定另一個裝置的負載，再判斷是不是成本

**原因**：釋放 GIL 之後，Neural Engine 的吞吐量看起來少了 13.5%。但負載產生器是 closed-loop，GPU 不再被卡住，就多送了 44% 的請求。

**結果**：改用同一份固定種子的到達序列驅動 GPU（46.65 req/s，每個時間窗完全相同），差距縮到 +0.1%。在這個負載下量不到額外成本；更高負載的情況沒有重測。

</div>

## 拿掉 GIL 還不夠

GIL 等待有四種拿掉的方式，四種也都確實拿掉了：

1. 把 Neural Engine 移到獨立的 worker process；
2. 使用會釋放 GIL 的 binding；
3. 使用 prebound binding，把每次 forward 的 Python–Objective-C 往返從 108 次減到 4 次；
4. 使用 Core ML 官方的非同步 API。

但沒有一種通過實際產品的請求組合。Process 隔離在兩個模型上都沒過 gate，短請求 P99 增加 17.5%，上限是 5%。釋放 GIL 的 thread 在三個模型上全部失敗，成本轉嫁到 Neural Engine 的短請求。Prebound binding 在只測異質時段的協定下，兩個模型通過；換成完整協定，在 n = 12 時因無望達標提前停止，短請求 P99 是 1.4 路徑的 1.409 倍。兩個結論都照原樣保留，各自只在自己的協定下成立。

完整協定揭露了第二種狀態。異質時段分成兩群：正常的落在 10.4–12.3 ms，慢的落在 13.6–21.2 ms。慢的時候，GPU thread 每次 forward 的 CPU 時間從 1.8 ms 升到 6.1 ms，原生 Core ML `predict` 卻沒變（慢 9.67 ms，正常 9.62 ms）。變慢的是 host，不是 Neural Engine。

## Host 慢狀態

Core ML 非同步 API 讓 GPU 回傳維持在 0.035 ms，吞吐量也不低於 1.4 路徑，但三個時間窗裡還是有兩個變慢。把這些時間窗拆開看，慢狀態有固定的時間結構：它是每段重疊開始時的一個 episode，持續 0.8–3.4 s。這些 episode 以外，非同步路徑反而比 1.4 快，P99 是 10.4 ms 對 11.9 ms。

Per-thread 的 CPU counter 接著把它和 thread 的執行位置連在一起。在這段過渡期，Neural Engine dispatcher、短請求 client 和 Core ML callback 這幾條 thread 跑在效率核心（E-core）上的比例是 0.91–1.00，穩定狀態下是 0.00；等它們回到效能核心（P-core），過渡期就結束。這也不只發生在某一條 thread 或某個 process：在取樣的六次轉換裡，Neural Engine 這條鏈、父 process 的其他 thread，以及 GPU worker process 全部一起落在 E-core 上。

之後試了兩種排程介入：dependency QoS override，以及把 dispatcher 設成 USER_INITIATED QoS。兩者都確實生效（QoS 讀回來是 0x19），但沒有任何一次把 thread 從 E-core 移走。QoS 這條路就此停止。

這是很強的相關，不是已證實的因果。這裡沒有任何研究能說明 macOS 為什麼把這些 thread 排到 E-core。

## 靜態策略被推翻

如果慢狀態只出現在重疊剛開始的時候，就可以用一個保護期躲過去：每個 episode 的前幾個請求先走 1.4 路徑，之後再切換。保護期設為 64 個請求（H64）時，篩選階段的 10 次轉換、確認階段的 16 次轉換，切換時全都沒有落在 E-core。但確認階段還是記為 FAIL，因為離群值檢查是 +2.43 ms，超過 +2.0 ms 的上限。

真正定案的是正式 runtime 的評估。有一個 episode 在 0.73 s 正常切換，大約 4.7 s 後進入慢狀態，一直持續到時間窗結束。那次執行前有一個背景 process 吃了 92% CPU，但預先登錄的規則沒有排除這種情況，背景負載本來就是實際使用的一部分。慢狀態不只出現在開頭，用請求數計算的保護期就不可靠。這條路因此關閉，預設維持 1.4。

<div class="decision">

### 偵測慢狀態，而不是試圖預防

**原因**：沒有任何介入能預防慢狀態，觸發原因也還沒找到。建立在未證實原因上的策略，最後只會貼合剛好被量到的那幾次執行。

**取捨**：只有在 host 正常時才享有非同步的好處。一旦觸發，該 episode 剩下的時間都走較慢的 1.4 路徑。

</div>

## 偵測與退回

偵測器用的是 runtime 本來就有記錄的訊號：`RequestTrace` 裡的 `prepare_ms`，也就是 Neural Engine 請求被路由之前花在 host 上的時間。超過 0.3 ms 算一次 host 慢，斷路器 C3 在連續三次 host 慢時觸發。

拿所有錄下來的非同步系列 episode 重播，C3 抓到全部 16 個持續變慢的 episode，最長偵測延遲 126 ms，51 個正常 episode 中誤觸發 4 次。C3 是用同一批資料選出來的，所以重播只能說明它可行，不能算驗證；在後續對照實驗之前，它就已經凍結。

後續的對照實驗有預先登錄。沒有斷路器時，6 個 episode 全部出現慢狀態；有斷路器時，12 個 episode 全部觸發，每一次都是自然發生的慢狀態，沒有人為誘發。每次觸發後回到並維持 1.4 水準延遲所需的時間是 215 / 364 / 414 ms（中位數 / P95 / 最差），都在 1.0 s 上限內；退回後的吞吐量是 1.4 路徑的 0.999 倍。

## 1.5 實際發布的內容

在 `execution="workers"` 與 `device="auto"` 下，自適應執行是 laya 和 laya-typed-decisions 的預設。每個重疊 episode 先在 1.4 路徑上跑 64 次同步 forward，再切換到受 C3 監控的 prebound 非同步 Core ML。一旦觸發，該 episode 剩下的部分走 1.4 路徑，episode 結束後斷路器重新啟用。laya-multilingual 維持 process 配置，不使用這個機制。

驗證共 154 個 episode，分三個階段，各自對比 1.4 路徑：

- **laya 產品組合**，12 個 episode：GPU 回傳 0.037 ms 對 4.29 ms，吞吐量 1.042 倍；
- **typed-decisions 產品組合與長時間測試**，78 個 episode：0.043 ms 對 8.60 ms，1.038 倍；
- **含突發流量的產品組合長時間測試**，64 個 episode：0.035 ms 對 4.28 ms，1.042 倍。

所有 episode 都維持在非同步路徑上，沒有觸發過斷路器。三個階段全部通過，輸出不一致、路由失敗、請求遺失、當機皆為 0。

## 證據與限制

- **只有一台機器。** 所有結果都來自同一台 M4 Max、同一個 macOS 版本，不宣稱適用於其他 Apple 晶片或 macOS 版本。
- **正式版的觸發路徑還沒在正式環境中真的觸發過。** 驗證期間沒有自然發生慢狀態。復原的證據來自對照實驗，正式版斷路器的邏輯則由單元測試確保與研究版一致。
- **Episode 中途開始的慢狀態，復原時間沒有量過。** 對照實驗裡的慢狀態都從重疊開頭就出現。重播只證明 C3 偵測得到中途開始的慢狀態，也就是推翻靜態策略的那一種，沒有證明復原時間有上限。
- **偵測門檻只在 laya 上驗證過。** typed-decisions 的驗證改為檢查是否誤觸發。
- **觸發原因仍未解。** Host 慢狀態從何而來還沒有答案，對應的篩選實驗已預先登錄，但尚未執行。

<div class="evidence">

- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/README.md" target="_blank" rel="noopener noreferrer">研究地圖</a>：1.4 到 1.5 的 19 個問題，每個都連到對應的研究、證據類型與結論。
- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/coreml-gil-completion-path/README.md" target="_blank" rel="noopener noreferrer">GIL completion path</a>：2×2 介入實驗。
- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/coreml-adaptive-breaker/README.md" target="_blank" rel="noopener noreferrer">Adaptive breaker</a>：偵測器重播、復原對照實驗與正式驗證。
- <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>：在原生 `MLModel.predict()` 期間釋放 GIL。
- <a href="https://pypi.org/project/laya-apple/" target="_blank" rel="noopener noreferrer">PyPI 上的 laya-apple</a>：已發布的 runtime。

</div>
