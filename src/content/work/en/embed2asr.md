---
title: 'Embed2ASR'
type: 'Research · Speech Recognition'
summary: 'Speech recognition from a frozen EmbeddingGemma 2 audio encoder and a small GRU-CTC reader, measured against Whisper large-v3.'
outcome: 'A 9.66M-parameter reader on a frozen encoder transcribes Mandarin, English and code-switched speech, and on one MI300X at batch 1 it runs 4.16× faster than Whisper large-v3 with 76.5% less peak GPU memory.'
indexMeta: 'Research release · Apache-2.0'
evidence: 'github.com/tc3oliver/embed2asr · benchmark data, protocol and limitations published'
slug: 'embed2asr'
locale: 'en'
translationKey: 'embed2asr'
order: 6
draft: false
meta:
  - label: 'Status'
    value: 'Research release'
  - label: 'Built on'
    value: 'EmbeddingGemma 2 audio encoder, frozen'
  - label: 'Trained'
    value: 'GRU-CTC reader, 9.66M parameters'
---

Independently designed and built by Oliver Yu.

<figure class="shot">
<img src="/images/embed2asr/overview.svg" width="880" height="440" alt="Diagram: audio goes into the frozen EmbeddingGemma 2 audio encoder, its pre-pooling last_hidden_state goes into a trainable GRU-CTC reader, and the reader outputs the transcript. The original pooled-embedding path is not used." loading="lazy" decoding="async">
<figcaption class="shot__caption">The encoder is never updated. The reader reads the states before pooling; the original pooled-embedding path is not used.</figcaption>
</figure>

## The problem

EmbeddingGemma 2's audio path pools the encoder output into one vector per clip. That is enough for retrieval and it throws the time axis away. The question was whether the states before pooling still carry enough to transcribe speech, with the encoder untouched.

<a href="https://github.com/tc3oliver/embed2asr" target="_blank" rel="noopener noreferrer">Embed2ASR</a> is that experiment as code. The audio encoder stays frozen, and only a small reader on top is trained. One CTC output of 4,996 units covers Chinese characters and English BPE pieces, so Mandarin, English and code-switched speech share an output layer and need no language tag.

## What it does

- **Reader.** LayerNorm and a linear projection, three residual Conv1d blocks, a 2-layer BiGRU and a linear layer onto the CTC units. 9,655,172 trainable parameters on top of a 304,824,608-parameter frozen encoder. Training runs on cached encoder features, so the encoder runs once per utterance.
- **Speed.** On one MI300X, same 200 clips, batch 1: real-time factor 0.0138 against 0.0576 for Whisper large-v3, which is 4.16× faster, with peak allocated GPU memory (torch, encoder included) of 0.75 GiB against 3.20 GiB. Cold start is slower, 7.9 s against 6.0 s.
- **Accuracy.** It is ahead of Whisper large-v3 on the two parliament test sets and on the ASCEND mixed Mandarin-English sentences. Whisper is more accurate on 11 of the 14 test subsets, and the biggest relative gap is English: 24.5% WER against 4.5% on FLEURS en-US.
- **Where a frozen encoder stops.** More data helped less and less, and even on sentences it had seen many times in training, the reader's error stayed close to its dev error. I read that as the limit of the frozen encoder's representation.

<figure class="shot">
<img src="/images/embed2asr/performance.svg" width="640" height="616" alt="Bar charts: Embed2ASR-v1 against Whisper large-v3 on one MI300X. Real-time factor at two batch sizes, and peak GPU memory. Lower is better." loading="lazy" decoding="async">
<figcaption class="shot__caption">Speed and memory on one MI300X, lower is better. The conditions for each bar are in docs/benchmarks.md.</figcaption>
</figure>

<figure class="shot">
<img src="/images/embed2asr/accuracy.svg" width="760" height="544" alt="Bar chart of error rates on held-out test sets for Embed2ASR greedy, Embed2ASR with a language model, and Whisper large-v3. Whisper is lower on most sets." loading="lazy" decoding="async">
<figcaption class="shot__caption">Error rate per test set, lower is better. The ASCEND and ML2021_ASR_ST rows are the mixed-language subsets.</figcaption>
</figure>

## Evidence and limits

Every number above comes from the repository.

- 9.66M counts trainable parameters only; inference runs the whole model, about 314.5M parameters.
- The speed numbers come from one AMD GPU at batch 1. Reports from CUDA, Apple silicon or CPU are welcome; the repository has a guide.
- The three sets where it leads are in-domain. On ML2021_ASR_ST, the only out-of-domain set, Whisper is clearly ahead: 29.5% MER against 16.0%.
- Offline only, with no streaming. The training data is not part of the release.

The rest, with the evidence for each limit, is in <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/limitations.md" target="_blank" rel="noopener noreferrer"><code>docs/limitations.md</code></a> and <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/benchmarks.md" target="_blank" rel="noopener noreferrer"><code>docs/benchmarks.md</code></a>.

<div class="evidence">

- <a href="https://github.com/tc3oliver/embed2asr" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/embed2asr</code></a>
  — code, training recipe and benchmark data.
- <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/benchmarks.md" target="_blank" rel="noopener noreferrer"><code>docs/benchmarks.md</code></a>
  — the protocol, the full 14-subset table and the speed conditions.
- <a href="https://github.com/tc3oliver/embed2asr/blob/main/docs/limitations.md" target="_blank" rel="noopener noreferrer"><code>docs/limitations.md</code></a>
  — what the results do not show, with the evidence for each limit.
- <a href="https://huggingface.co/tc3oliver/Embed2ASR-v1" target="_blank" rel="noopener noreferrer">Embed2ASR-v1 on Hugging Face</a>
  — the reader weights and model card.
- <a href="https://study.meowcoder.com/posts/261016-embed2asr-frozen-encoder/" target="_blank" rel="noopener noreferrer">Write-up</a>
  — what was tried, what worked and where it stops, in Traditional Chinese.

</div>
