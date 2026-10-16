---
title: 'Embed2ASR'
type: '研究 · 語音辨識'
summary: '用凍結的 EmbeddingGemma 2 audio encoder 加一個小的 GRU-CTC reader 做語音辨識，並和 Whisper large-v3 對照。'
outcome: '凍結的 encoder 上只接一個 9.66M 參數的 reader，中文、英文和中英夾雜都轉得出來；一張 MI300X、batch 1，速度是 Whisper large-v3 的 4.16 倍，峰值 GPU 記憶體少 76.5%。'
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

<a href="https://github.com/tc3oliver/embed2asr" target="_blank" rel="noopener noreferrer">Embed2ASR</a> 就是把這個實驗做成程式。Audio encoder 維持凍結，只訓練上面一個小的 reader。CTC 輸出共 4,996 個 unit，中文字和英文 BPE piece 都在裡面，所以中文、英文和中英夾雜共用一個輸出層，不需要語言標記。

## 它做什麼

- **Reader。** LayerNorm 加 linear projection、三個 residual Conv1d block、2 層 BiGRU，最後一個 linear 接到 CTC unit。可訓練的參數是 9,655,172 個，接在 304,824,608 個參數的凍結 encoder 上。訓練用的是預先 cache 好的 encoder feature，每段音訊只過一次 encoder。
- **速度。** 一張 MI300X、同樣 200 段音訊、batch 1：RTF 是 0.0138，Whisper large-v3 是 0.0576，快 4.16 倍；峰值 GPU 記憶體（torch 的 peak allocated，含 encoder）0.75 GiB 對 3.20 GiB。Cold start 比較慢，7.9 秒對 6.0 秒。
- **準確率。** 兩個 Parliament 測試集和 ASCEND 的中英夾雜句子，Embed2ASR 比 Whisper large-v3 準。14 個測試子集裡有 11 個是 Whisper 比較準，相對差距最大的是英文，FLEURS en-US 的 WER 是 24.5% 對 4.5%。
- **凍結 encoder 停在哪裡。** 資料越加，進步越少；訓練量大的時候，連訓練時看過的句子，error 也和 dev 差不多。我的解讀是卡在凍結 encoder 給的 representation。

<figure class="shot">
<img src="/images/embed2asr/performance.svg" width="640" height="616" alt="長條圖：Embed2ASR-v1 與 Whisper large-v3 在同一張 MI300X 上兩種 batch size 的 RTF 與峰值 GPU 記憶體，越低越好。" loading="lazy" decoding="async">
<figcaption class="shot__caption">一張 MI300X 上的速度與記憶體，越低越好。每一條的量測條件見 docs/benchmarks.md。</figcaption>
</figure>

<figure class="shot">
<img src="/images/embed2asr/accuracy.svg" width="760" height="544" alt="長條圖：Embed2ASR greedy、加語言模型，以及 Whisper large-v3 在各測試集的 error rate，大部分測試集 Whisper 比較低。" loading="lazy" decoding="async">
<figcaption class="shot__caption">各測試集的 error rate，越低越好。ASCEND 與 ML2021_ASR_ST 兩列是中英夾雜子集。</figcaption>
</figure>

## 證據與限制

上面每個數字都來自 repo。

- 9.66M 只算可訓練的參數，推論時跑的是整個模型，約 314.5M 參數。
- 速度數字都來自一張 AMD GPU、batch 1。在 CUDA、Apple silicon 或 CPU 上跑過的話，歡迎照 repo 裡的指南回報。
- 領先的三組都是 in-domain。唯一 out-of-domain 的 ML2021_ASR_ST，Whisper 明顯比較準，MER 29.5% 對 16.0%。
- 只支援離線辨識，沒有 streaming。訓練資料沒有一起釋出。

其他限制和各自的證據，見 <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/limitations.md" target="_blank" rel="noopener noreferrer"><code>docs/limitations.md</code></a> 和 <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/benchmarks.md" target="_blank" rel="noopener noreferrer"><code>docs/benchmarks.md</code></a>。

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
  — 試過什麼、哪些有用，以及這個做法停在哪裡。

</div>
