---
title: 'Embed2ASR'
type: '研究 · 語音辨識'
summary: '用凍結的 EmbeddingGemma 2 audio encoder 加一個小的 GRU-CTC reader 做語音辨識，和 Whisper large-v3 比較，輸的結果也一起列出。'
outcome: '在一張 MI300X 上、batch 1，速度是 Whisper large-v3 的 4.16 倍，峰值 GPU 記憶體少 76.5%；14 個測試子集裡有 11 個準確率比較低。'
indexMeta: '研究釋出 · Apache-2.0'
evidence: 'github.com/tc3oliver/embed2asr · 公開 benchmark 資料、量測方式與限制'
slug: 'embed2asr'
locale: 'zh'
translationKey: 'embed2asr'
order: 6
draft: false
meta:
  - label: '狀態'
    value: '研究釋出'
  - label: '建立在'
    value: 'EmbeddingGemma 2 audio encoder（凍結）'
  - label: '訓練的部分'
    value: 'GRU-CTC reader，9.66M 參數'
---

由 Oliver Yu 獨立設計與開發。

<figure class="shot">
<img src="/images/embed2asr/overview.svg" width="880" height="440" alt="示意圖：音訊進入凍結的 EmbeddingGemma 2 audio encoder，pooling 之前的 last_hidden_state 交給可訓練的 GRU-CTC reader，reader 輸出逐字稿；原本的 pooled embedding 路徑沒有用到。" loading="lazy" decoding="async">
<figcaption class="shot__caption">Encoder 完全不更新。Reader 讀的是 pooling 之前的 states，原本的 pooled embedding 路徑沒有用到。</figcaption>
</figure>

## 問題

EmbeddingGemma 2 的 audio path 會把 encoder 的輸出 pool 成每段音訊一個 vector。做 retrieval 夠用，但時間軸也跟著丟了。這個實驗要看的是：不動 encoder，只靠 pool 之前的 states 留下的資訊，夠不夠轉出文字。

<a href="https://github.com/tc3oliver/embed2asr" target="_blank" rel="noopener noreferrer">Embed2ASR</a> 就是把這個實驗做成程式。Audio encoder 維持凍結，只訓練上面一個小的 reader。輸出是一個 4,996 個 unit 的 CTC 層，同時涵蓋中文字和英文 BPE piece，所以中文、英文和中英夾雜共用一個輸出層，不需要語言標記。

## 它做什麼

- **Reader。** LayerNorm 加 linear projection、三個 residual Conv1d block、2 層 BiGRU，最後一個 linear 接到 CTC unit。可訓練的參數是 9,655,172 個，接在 304,824,608 個參數的凍結 encoder 上。訓練用的是預先 cache 好的 encoder feature，每段音訊只過一次 encoder。
- **速度。** 一張 MI300X、同樣 200 段音訊、batch 1：RTF 是 0.0138，Whisper large-v3 是 0.0576，快 4.16 倍；峰值 GPU 記憶體（torch 的 peak allocated，含 encoder）0.75 GiB 對 3.20 GiB。Batch 16 開了非預設的 `cross_file`，快 3.06 倍。Cold start 比較慢，7.9 秒對 6.0 秒。
- **準確率。** 14 個測試子集裡，Whisper large-v3 比較準的有 11 個。Embed2ASR 領先的是兩個 Parliament 測試集和 ASCEND 的中英夾雜句子，這幾組是 in-domain。唯一 out-of-domain 的 ML2021_ASR_ST 上，中英夾雜子集的 MER 是 29.5% 對 16.0%。
- **重現數字。** 有測速腳本，也有一份指南說明怎麼回報 CUDA、Apple silicon 和 CPU 上的結果。這頁的速度數字都只來自一張 AMD GPU。

<figure class="shot">
<img src="/images/embed2asr/performance.svg" width="640" height="616" alt="長條圖：Embed2ASR-v1 與 Whisper large-v3 在同一張 MI300X 上的 RTF（batch 1 和 batch 16）與峰值 GPU 記憶體，越低越好。" loading="lazy" decoding="async">
<figcaption class="shot__caption">一張 MI300X 上的速度與記憶體。只代表這張 GPU、這兩個 batch size 和這批音訊。</figcaption>
</figure>

<figure class="shot">
<img src="/images/embed2asr/accuracy.svg" width="760" height="544" alt="長條圖：Embed2ASR greedy、加語言模型，以及 Whisper large-v3 在各測試集的 error rate，大部分測試集 Whisper 比較低。" loading="lazy" decoding="async">
<figcaption class="shot__caption">各測試集的 error rate，越低越好。ASCEND 與 ML2021_ASR_ST 兩列是中英夾雜子集。</figcaption>
</figure>

## 證據與限制

上面每個數字都來自 repo，限制頁也寫明每個結果不能代表什麼。

- 速度差距沒有拆開量過。可能的來源是載入的模型比較小、CTC 一次 decode 完對上 autoregressive decoding，以及測試設定，三者都沒有單獨測。結果只適用於這條 pipeline。
- 訓練量大的時候，就算是 reader 已經看過的句子，error 也跟 dev error 差不多。這讓我推測上限在凍結的 encoder，但沒有驗證：部分微調的 probe 沒有幫助，不過它是在 overfitting 下跑的，不能當證據。Encoder LoRA 只列在 roadmap 當研究方向。
- 在 dev 上，中文最主要的錯誤是同音字替換，CTC 沒有輸出端的上下文，自己很難修正。中文字元 5-gram 語言模型可以補回一部分，但它的權重只在一個 dev set 上調過，最佳值落在搜尋範圍的邊緣，所以 dev 上的增益偏樂觀。
- 「9.66M」只算可訓練的參數，推論時要跑完整的 304.8M encoder。
- 只支援離線辨識，沒有 streaming，輸出是正規化後的文字，沒有標點。
- 訓練資料沒有一起釋出。

<div class="evidence">

- <a href="https://github.com/tc3oliver/embed2asr" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/embed2asr</code></a>
  — 程式、訓練流程與 benchmark 資料。
- <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/benchmarks.md" target="_blank" rel="noopener noreferrer"><code>docs/benchmarks.md</code></a>
  — 量測方式、14 個子集的完整表格與速度測試條件。
- <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/limitations.md" target="_blank" rel="noopener noreferrer"><code>docs/limitations.md</code></a>
  — 結果不能代表的事，以及每項限制的證據。
- <a href="https://huggingface.co/tc3oliver/Embed2ASR-v1" target="_blank" rel="noopener noreferrer">Hugging Face 上的 Embed2ASR-v1</a>
  — reader 權重與 model card。
- <a href="https://study.meowcoder.com/posts/261016-embed2asr-frozen-encoder/" target="_blank" rel="noopener noreferrer">研究筆記</a>
  — 試過什麼、哪些沒用。

</div>
