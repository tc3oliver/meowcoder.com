---
title: 'Embed2ASR'
type: 'Research · Speech Recognition'
summary: 'Speech recognition built on a frozen EmbeddingGemma 2 audio encoder and a small GRU-CTC reader, measured against Whisper large-v3, including the results where it loses.'
outcome: 'On one MI300X at batch 1 it runs 4.16× faster than Whisper large-v3 with 76.5% lower peak GPU memory, and it is less accurate on 11 of 14 test subsets.'
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
- **Speed.** On one MI300X, same 200 clips, batch 1: real-time factor 0.0138 against 0.0576 for Whisper large-v3, which is 4.16× faster, with peak allocated GPU memory (torch, encoder included) of 0.75 GiB against 3.20 GiB. At batch 16, with the non-default `cross_file` option, it is 3.06× faster. Cold start is slower, 7.9 s against 6.0 s.
- **Accuracy.** Whisper large-v3 is more accurate on 11 of the 14 test subsets. Embed2ASR is ahead on two parliament test sets and on the ASCEND mixed Mandarin-English sentences, which are in-domain sets. On the mixed Mandarin-English subset of ML2021_ASR_ST, the only out-of-domain set, it scores 29.5% MER against 16.0%.
- **Reproducing numbers.** A speed script and a short guide for reporting results from CUDA, Apple silicon and CPU. All the speed numbers on this page come from one AMD GPU.

<figure class="shot">
<img src="/images/embed2asr/performance.svg" width="640" height="616" alt="Bar charts: Embed2ASR-v1 against Whisper large-v3 on one MI300X. Real-time factor at batch 1 and batch 16, and peak GPU memory. Lower is better." loading="lazy" decoding="async">
<figcaption class="shot__caption">Speed and memory on one MI300X. It holds for this GPU, these two batch sizes and this audio mix.</figcaption>
</figure>

<figure class="shot">
<img src="/images/embed2asr/accuracy.svg" width="760" height="544" alt="Bar chart of error rates on held-out test sets for Embed2ASR greedy, Embed2ASR with a language model, and Whisper large-v3. Whisper is lower on most sets." loading="lazy" decoding="async">
<figcaption class="shot__caption">Error rate per test set, lower is better. The ASCEND and ML2021_ASR_ST rows are the mixed-language subsets.</figcaption>
</figure>

## Evidence and limits

Every number above comes from the repository, and the limitations page says what each result does not show.

- The speed gap is not broken down. The candidates are the smaller loaded model, one-pass CTC decoding against autoregressive decoding, and the test setup, and none of them was measured on its own. It applies to this pipeline only.
- With a large training pool, the error on sentences the reader has already seen stays close to its dev error. That points at the frozen encoder as the limit, but it is an inference: a partial fine-tuning probe did not help, and that probe ran in an overfitting regime, so it is not conclusive. Encoder LoRA is on the roadmap only as a research direction.
- The main Mandarin error on dev is homophone substitution, which CTC cannot fix without output-side context. A character 5-gram language model recovers part of it, but its weight was tuned on one dev set and sat at the edge of the grid, so the dev gain is optimistic.
- "9.66M" counts trainable parameters only. Inference runs the whole 304.8M-parameter encoder.
- Offline only, with no streaming, and the output is normalised text with no punctuation.
- The training data is not part of the release.

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
  — what was tried and what did not work, in Traditional Chinese.

</div>
