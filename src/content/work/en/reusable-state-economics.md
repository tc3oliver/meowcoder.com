---
title: 'Reusable State Economics in Interactive LLM Inference'
type: 'Systems Research · LLM Inference'
summary: 'A study of SpecPrefill, an attention-based sparse prefill mechanism, on one Apple silicon machine: large cold-start wins at long context, a prefix-cache failure mode in a continuation-heavy agent session, and a correctness defect found along the way.'
outcome: 'Built and measured a heterogeneous prefill path, sparse prefill on top of it, and a background dense-prefix recovery job; cold 32K time-to-first-token fell from 122.7 s to 33.5 s, a request-level trace then exposed a prefix cache that stopped advancing, and the work produced a correctness fix and per-request control, both submitted upstream.'
indexMeta: 'Apple silicon · Cold prefill 3× faster · Two open upstream PRs'
evidence: 'llm-inference-systems on GitHub · the article, the request-level traces, and two oMLX pull requests'
slug: 'reusable-state-economics'
locale: 'en'
translationKey: 'reusable-state-economics'
order: 4
draft: false
kind: 'case-study'
meta:
  - label: 'Platform'
    value: 'Apple M4 Max · 64GB unified memory'
  - label: 'Model'
    value: '27B-class dense model at 4-bit'
  - label: 'Evidence'
    value: 'Published article · two open upstream pull requests'
---

Independently researched, measured, and submitted upstream by Oliver Yu.

## Problem

Long-context prefill on a single machine is slow in a way the user feels
directly: nothing appears until the whole prompt has been processed. Sparse
prefill, scoring the prompt and computing only the tokens that matter, is the
standard answer, and on a cold request it works. The implementation used here is
SpecPrefill, an attention-based sparse prefill mechanism.

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
is the record of taking that answer seriously on one Apple silicon machine (M4
Max, 64GB unified memory, a 27B-class dense model at 4-bit) and then finding out
where it stops being an answer. The cold-start numbers were large. One real
coding-agent run with the same configuration then came out slower, but the two
agents took different trajectories through the task, so that wall-clock gap is
the observation that triggered the investigation, not a measured effect size.
The investigation is the actual result.

## Key Results

- **Cold prefill got roughly three times faster.** At 16K context, time to first
  token fell from 57.84 s to 19.24 s (302 → 1046 tok/s); at 32K, from 122.7 s to
  33.5 s (277 → 1112 tok/s). One long prompt, nothing reusable in front of it:
  that is the case the technique is built for, and on that workload there is
  nothing to argue about.
- **A request-level trace showed the prefix cache freezing.** Over 20 restores,
  the reusable checkpoint climbed from 28,672 to 37,888 tokens, collapsed back
  to 28,672 at request 11, and stayed pinned there for the final ten requests
  while the uncached suffix each request had to recompute grew from 17,060 to
  33,979 tokens. The scorer's own cost grew with it: 2.7 s at 8,535 tokens,
  5.7 s at 33,389.
- **A correctness defect outranked all of the performance work.** The server
  computed the protected-prefix boundary arithmetically, and with tools present
  it could land 37 tokens early — cutting off the end of the tool instructions
  and the start of the operator's own instructions, silently, on exactly the
  requests where they matter most.

## System Evolution

There was no single winning configuration. Each phase exists because the one
before it rested on something false.

1. **Build the fast path.** A dense baseline gave fast warm turns from the
   prefix cache and a 57.84 s wait at 16K. A heterogeneous prefill path let the
   GPU share each layer's work with the neural engine in cache-block-sized
   tiles, and sparse prefill stacked on top of it composed cleanly in an
   isolated smoke run. An eight-turn session ran slower anyway: 129.1 s against
   108.1 s.
2. **Find out why the session lost.** A sparsified suffix cannot be written back
   to the prefix cache, because a KV cache assembled from skipped tokens is not a
   faithful representation of the prompt. Nothing breaks, which is why it is hard
   to see: the sparse request itself is cheap, and the cost lands on every
   request after it. Measuring the checkpoint rather than the wall clock is what
   made the mechanism visible.
3. **Try to repair the checkpoint in the background.** A job designed to fail
   closed rebuilt the skipped dense prefix in 1024-token slices, and a
   cooperative scheduler taught it to yield to an arriving request (typing speed
   with a job running went from 13.5 back to 47 tok/s). With 15 s of idle between
   turns a synthetic session went from 108.7 s to 83.1 s, about 24% faster. With
   zero idle the same mechanism was about 11% slower than dense, 119.7 s against
   108.1 s. It is a bet on a gap between turns, and a saturated session has none.
   A later lifecycle and safety review of the experimental branch found gaps, and
   the served build carries no background densification.
4. **Decide it at the transport layer instead.** Context growth outran recovery,
   so the caller declares the request shape and the server acts on it.

The stages, their assumptions, and the data behind each number are in
<a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>.

### What the trace does and does not establish

The request-11 sparse admission did not cause the request-11 restore cliff: the
restore happened first. The cache log identifies a partial prefix match whose
last matched block held a placeholder, but the surviving trace does not
establish when or how that placeholder was created. What the trace does
establish is that after the cliff every observed miss stayed above the
SpecPrefill threshold, the sparsified suffix did not advance the normal reusable
dense prefix state, and the checkpoint did not recover over the remaining ten
requests.

## What Changed

- **Local serving policy.** Agent traffic runs dense unless the caller says, on
  that request, that its prompt is cold; long-context traffic keeps the
  model-level setting. Two workloads with opposite requirements were being served
  by one switch. The default stayed a local decision.
- **<a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>, open** — reads the protected-prefix boundary off the
  caller's own template instead of computing it by subtraction. Submitted ahead
  of the deployment policy, because it is the one finding that changed the
  model's input rather than its speed.
- **<a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>, open** — adds per-request SpecPrefill fields to the
  Anthropic messages endpoint, as the OpenAI-compatible endpoint already had. No
  upstream default changes.

## Evidence & Limitations

One machine, one model, one quantization, one run per cell. The cold-start table
is a single run per cell, and the crossover point between scorer overhead and
prefill saving depends on all three platform choices. The real-agent comparison
is one run per arm with divergent trajectories, so no session wall-clock ratio
is presented as a measured slowdown; the request-level trace is what carries the
argument. The idle-recovery result is synthetic, including the zero-idle row
where the mechanism loses. A third real session never triggered the failure mode
at all: cache hit rate held at roughly 84–86%, the largest uncached suffix was
about 2.5K tokens, and the scorer was never called. The repository also carries
four further threads — speculative decoding, correctness, heterogeneous compute,
cross-runtime — each labelled a thread rather than an experiment because each
names evidence it is still missing. The repository also carries four research threads — speculative decoding, correctness, heterogeneous compute and cross-runtime — each labelled a thread rather than an experiment, because each one names the evidence it still lacks.

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>
  — the study: measurement setup, request-level traces, and the analysis.
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>
  — the written article, in Traditional Chinese.
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>
  and <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>
  — both open at the time of writing.

</div>

What I still cannot do is tell, when a request arrives, which regime the session
it belongs to will turn out to be. Until that is possible, the caller declares
it and the server believes them.
