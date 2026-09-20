---
title: 'LLM Inference Systems Research'
type: 'Systems Research · LLM Inference'
summary: 'A study of SpecPrefill, an attention-based sparse prefill mechanism, on one Apple silicon machine: large cold-start wins at long context, a slowdown in one continuation-heavy agent session, and the prefix-cache mechanism that explains both.'
outcome: 'Built and measured a heterogeneous prefill path, sparse prefill on top of it, a background dense-prefix recovery job and the cooperative scheduler it needed; cold 32K time-to-first-token fell from 122.7 s to 33.5 s, a real coding-agent session then exposed a prefix-cache failure mode, and the work produced a correctness fix and per-request control, both submitted upstream.'
indexMeta: 'Apple silicon · One completed study, four research threads · Two upstream PRs'
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
    value: '27B-class MoE, 4-bit'
  - label: 'Evidence'
    value: 'Published article · two open upstream pull requests'
---

Independently researched, measured, and submitted upstream by Oliver Yu.

## Problem

Long-context prefill on a single machine is slow in a way the user feels
directly: nothing appears until the whole prompt has been processed.
Sparse prefill, scoring the prompt and computing only the tokens that matter,
is the standard answer, and on a cold request it works. The implementation used
here is SpecPrefill, an attention-based sparse prefill mechanism.

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
is the record of taking that answer seriously on one Apple silicon machine (M4
Max, 64GB unified memory, a 27B-class MoE model at 4-bit) and then finding out
where it stops being an answer. The cold-start numbers were large. The same
configuration then made a real coding-agent session slower, a comparison too
thin to be a measurement and reason enough to investigate. The investigation is
the actual result.

## Cold-Start Measurement

Cold long-context prefill, no prefix cache in play:

| Context | Time to first token | Prefill throughput |
| ------- | ------------------- | ------------------ |
| 16K     | 57.84 s → 19.24 s   | 302 → 1046 tok/s   |
| 32K     | 122.7 s → 33.5 s    | 277 → 1112 tok/s   |

That is the case the technique is built for: one long prompt, nothing reusable
in front of it, every token paid for at once. That changes what the machine is
usable for, and on that workload there is nothing to argue about.

## Where It Stops Working

An interactive agent session is not that workload. Each turn extends the
previous one, so the expensive prefix has already been computed and the request
should only pay for what is new. The prefix cache is what makes that true, and
it is the state whose economics decide whether a turn is cheap.

SpecPrefill skips most tokens. A KV cache assembled from skipped tokens is not a
faithful representation of the prompt, so its output cannot be written back to
the prefix cache. One sparse request is therefore cheap, but the sparsified
suffix does not advance the normal reusable dense prefix state.

At that point nothing is broken, which is why it is hard to see. The request
that ran sparse was faster than it would have been dense, and the session
continues normally. The cost lands on later requests: the reusable checkpoint
stops advancing while the conversation keeps growing, so each request
recomputes a longer uncached tail than the last.

Two costs therefore move in opposite directions over the life of a session. The
saving from skipping tokens is largest when there is a lot of unreusable prompt
to skip, and an agent session is designed to keep as little of that as possible.
The scorer that decides what to skip is paid in full on every request, and it
reads the whole prompt.

## The Trace

A clean request-level trace over 20 prefix-cache restores shows the mechanism
without inference.

- The reusable checkpoint climbs from 28,672 to 37,888 tokens and collapses back
  at request 11.
- The uncached suffix each request must recompute grows from 17,060 to 33,979
  tokens.
- The scorer's own cost grows with the thing it is scoring: 2.7 s at 8,535
  tokens, 5.7 s at 33,389.

The collapse at request 11 is the event, and its order matters. The checkpoint
dropped from 37,888 to 28,672 tokens because the cache layer rejected a partial
block match, before any sparse admission. The 17,060-token miss it left crossed
the SpecPrefill threshold, so SpecPrefill engaged on every later request, and a
sparsified suffix does not advance the dense checkpoint. The checkpoint stayed
pinned at a point the conversation had already left behind, and the accumulated
recomputation is the prefix-cache debt. SpecPrefill did not cause the cliff; it
is the reason the cliff was never repaired.

The third line decides the outcome. The scorer is overhead paid on every
request, and it scales with the prompt. When the prefix cache is advancing, that
overhead buys a large saving. When the checkpoint is frozen, the saving shrinks
each turn while the overhead grows, and the two cross. Nothing in the server's
per-request metrics reports that crossing: each individual prefill still looks
efficient in isolation, because the recomputation it is doing is counted as work
the request legitimately needed.

## System Evolution

There was no single winning configuration. I built eight things in turn, and
most of them exist because the one before turned out to rest on something
false.

1. **Dense baseline** — fast warm turns from the prefix cache, a 57.84 s wait
   for the first token at 16K.
2. **Heterogeneous prefill** — the GPU shares each layer's prefill work with
   the neural engine, in tiles the same size as a cache block.
3. **Sparse prefill stacked on it** — the two composed cleanly in an isolated
   smoke run; an eight-turn session ran slower anyway, 129.1 s against 108.1 s.
4. **Protected-prefix boundary fixed** — measured through the caller's own
   template instead of inferred by subtraction, after it fell 37 tokens short.
5. **Sparse first, dense later** — a background job, designed to fail closed,
   rebuilds the skipped dense prefix in 1024-token slices; a later safety and
   lifecycle review of the experimental branch found gaps (ENGINEERING.md,
   "Prototype safety review"), and the served build carries no background
   densification.
6. **Cooperative scheduler** — the background job learned to see an arriving
   request and to wait for it; the assistant's typing speed with a job running
   went from 13.5 to 47 tok/s.
7. **Real-workload validation** — context growth outran recovery, and the
   design was set aside.
8. **Transport-level policy** — the caller declares the request shape; the local
   build gained per-request control.

The stages, what each one assumed, and the data behind each number are in
<a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a>.

## Engineering Decisions

<div class="decision">

### Measure the session, not the request

**Why** — A per-request benchmark on a cold prompt reports the best case of a
mechanism whose cost is carried across requests. The prefix cache is session
state, so the unit of measurement has to be a session.

**Consequence** — The cold-start table above and the session behaviour below are
both true, and neither one predicts the other. A benchmark that only ever issues
cold requests cannot observe this class of regression at all, because it never
builds the state the regression is about.

</div>

<div class="decision">

### Trace the checkpoint, not the wall clock

**Why** — Session wall time mixes model quality, tool calls, and the path the
agent happened to take. The reusable checkpoint and the uncached suffix are
properties of the inference server alone, and they are what the mechanism
actually changes.

**Consequence** — The 20-restore trace is reportable evidence; the wall-clock
comparison beside it is not, and is stated as such below. Checkpoint position
and uncached suffix length are also cheap to log continuously, which makes the
condition detectable in a running deployment rather than only in a study.

</div>

<div class="decision">

### Recover the checkpoint in the background, and say when that fails

**Why** — If the only problem is that sparse output cannot be written back, then
a dense pass over the same prefix during idle time restores the checkpoint at no
cost to the user — provided idle time exists.

**Trade-off** — With 15 s of idle between turns, a synthetic session went from
108.7 s to 83.1 s. With zero idle, the same mechanism was 11% slower than dense:
108.1 s against 119.7 s. Background recovery is a bet on a gap between turns,
and a saturated session does not have one.

</div>

<div class="decision">

### Check whether the workload is even susceptible

**Why** — A mechanism that degrades one session is not thereby a general
problem. A third real session never triggered it at all: cache hit rate held at
roughly 84–86%, the largest uncached suffix was about 2.5K tokens, and the
scorer was never called. Those are session-level aggregates, not a trace.

**Consequence** — The answer is workload-shaped, and there are three shapes:
the disposable cold request, where sparse prefill wins; the continuation-heavy
session that reaches the cliff, where it loses; and the healthy incremental
session, where it never triggers. A session whose prefix keeps being reused
never reaches the state where sparse prefill has anything to lose, which is why
the fix is a default rather than a removal.

</div>

<div class="decision">

### Default the agent path to dense, keep the override explicit

**Why** — Two workloads with opposite requirements were being served by one
setting. The long-context path wants sparse prefill and measurably benefits from
it; the agent path wants a prefix cache that keeps advancing.

**Consequence** — Locally the two paths now get different treatment. Agent
traffic runs dense unless the caller says, on that request, that its prompt
is cold; long-context traffic keeps the model-level setting. Only the
per-request switch went upstream, and it is still under review. The default
stayed a local decision.

</div>

## The Correctness Result

One finding outranks all of the performance work.

Sparse prefill may drop tokens only after a protected prefix boundary — the
region holding the system prompt and tool instructions has to be computed in
full. The server was working that boundary out arithmetically, from two
renders of the prompt, and the arithmetic was wrong for this chat template.
With tools present it could land 37 tokens early, and those 37 tokens were
the end of the tool instructions and the start of the operator's own
instructions.

This is not a throughput regression. It silently removes instructions the
operator believes are in force, on exactly the requests — tool-carrying agent
requests — where they matter most, and nothing in the output announces it. The
fix reads the boundary off the caller's own template instead of computing it,
and is submitted upstream and still open, ahead of the deployment policy.

## Research Threads

The completed study above is one of five subjects in the repository. The
other four have real measurement behind them and no answer yet, and are
labelled as threads rather than experiments so the difference stays visible.

- **Reusable state and prefill** — the study above. An earlier configuration
  bake-off, run before it on the same model, already showed the signature:
  nearly 5× faster on an isolated fresh tail, then 7.2× the tokens
  recomputed over a real coding task and a 63.1% final cache hit rate
  against 99.5%. I picked the dense configuration on that evidence without
  recognising it as a finding.
- **Speculative decoding** — 431 drafted sequences across two models of the
  same size class. Acceptance tracks the model, not the kind of work: 78.8%
  against 88.6% median between models, under two points of spread across
  four agent task types within each. No arm with the mechanism disabled
  exists, so it is not a latency result.
- **Correctness** — three optimizations, three different answers on whether
  the arithmetic reaches the output. A restored prefix cut one case from
  56.3 s to 2.3 s and produced identical bytes in 7 of 7 paired cases; three
  attention-routing builds produced three logit vectors and one identical
  output at 68K context; the protected-prefix boundary was the one that
  silently changed the model's input.
- **Heterogeneous compute** — a neural-engine prefill path that compiled,
  reported itself enabled, and never executed, because the serving layer's
  block size never filled its compiled tile.
- **Cross-runtime** — no controlled comparison exists. The page says so
  rather than implying one.

## Limitations

- **The real-agent comparison is one run per arm**, and the two agents took
  different trajectories through the task. No session wall-clock ratio from it
  is presented as a measured slowdown; the request-level trace is what carries
  the argument.
- **One machine, one model, one quantization, one run per cell.** The cold-start
  table is a single run per cell, and the crossover point between scorer
  overhead and prefill saving depends on all three of the platform choices.
- **The idle-recovery result is synthetic.** It shows the mechanism can work
  when a gap exists, including the zero-idle row where it does not.
- **The four threads are not experiments.** Each names the specific evidence
  it is missing, and none of it was gathered in order to write them up.

## Evidence

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>
  — the study: measurement setup, request-level traces, and the analysis.
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>
  — the written article, in Traditional Chinese.
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>
  — the prefix-boundary correctness fix. Both pull requests are open at the
  time of writing.
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>
  — open: adds per-request SpecPrefill fields to the Anthropic messages
  endpoint only, as the OpenAI-compatible endpoint already had; no upstream
  default changes.

</div>

What I still cannot do is tell, when a request arrives, which of the three
regimes the session it belongs to will turn out to be. Until that is possible,
the caller declares it and the server believes them.
