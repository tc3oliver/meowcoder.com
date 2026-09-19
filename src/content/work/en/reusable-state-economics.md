---
title: 'Reusable State Economics in Interactive LLM Inference'
type: 'Systems Research · LLM Inference'
summary: 'A study of speculative prefill on one Apple silicon machine: large cold-start wins at long context, a slowdown in one continuation-heavy agent session, and the prefix-cache mechanism that explains both.'
outcome: 'Cold 32K time-to-first-token fell from 122.7 s to 33.5 s, then the same configuration cost time in a single paired coding-agent session; the request-level trace explaining why produced a correctness fix and a transport-level default, both sent upstream.'
indexMeta: 'Apple silicon · 27B-class MoE at 4-bit · Two upstream PRs'
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
    value: 'Published article · two upstream pull requests'
---

Independently researched, measured, and upstreamed by Oliver Yu.

## Problem

Long-context prefill on a single machine is slow in a way the user feels
directly: nothing appears until the whole prompt has been processed. Speculative
prefill — scoring the prompt and computing only the tokens that matter — is the
standard answer, and on a cold request it works.

<a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer">llm-inference-systems</a>
is the record of taking that answer seriously on one Apple silicon machine (M4
Max, 64GB unified memory, a 27B-class MoE model at 4-bit) and then finding out
where it stops being an answer. The cold-start numbers were large. The same
configuration then made a real coding-agent session slower — one run per arm,
and the two agents took different paths through the task, so that comparison
is a reason to investigate rather than a measurement. The investigation is the
actual result.

## Cold-Start Measurement

Cold long-context prefill, no prefix cache in play:

| Context | Time to first token | Prefill throughput |
| ------- | ------------------- | ------------------ |
| 16K     | 57.84 s → 19.24 s   | 302 → 1046 tok/s   |
| 32K     | 122.7 s → 33.5 s    | 277 → 1112 tok/s   |

That is the case the technique is built for: one long prompt, nothing reusable
in front of it, every token paid for at once. A 32K prompt that took 122.7 s to
produce its first token now takes 33.5 s, which changes what the machine is
usable for, and on that workload there is nothing to argue about.

## Where It Stops Working

An interactive agent session is not that workload. Each turn extends the
previous one, so the expensive prefix has already been computed and the request
should only pay for what is new. The prefix cache is what makes that true, and
it is the state whose economics decide whether a turn is cheap.

Speculative prefill skips most tokens. A KV cache assembled from skipped tokens
is not a faithful representation of the prompt, so its output cannot be written
back to the prefix cache. One sparse request is therefore cheap and leaves
nothing behind.

Nothing is broken at that point, and that is what makes it hard to see. The
request that ran sparse was faster than it would have been dense, and the
session continues normally. The cost lands on later requests. The reusable
checkpoint stops advancing while the conversation keeps growing, so the gap
between what is cached and what the next turn needs widens by roughly one turn's
worth of tokens every turn, and each request recomputes a longer uncached tail
than the last.

Two costs therefore move in opposite directions over the life of a session. The
saving from skipping tokens is largest when there is a lot of unreusable prompt
to skip, and an agent session is designed to keep as little of that as possible.
The scorer that decides what to skip is paid in full on every request, and it
reads the whole prompt.

## The Trace

A clean request-level trace over 20 prefix-cache restores shows the mechanism
without inference.

- The reusable checkpoint climbs from 28,672 to 37,888 tokens, collapses back to
  28,672 at request 11, and never recovers.
- The uncached suffix each request must recompute grows from 17,060 to 33,979
  tokens.
- The scorer's own cost grows with the thing it is scoring: 2.7 s at 8,535
  tokens, 5.7 s at 33,389.

The collapse at request 11 is the event. Before it, the checkpoint is tracking
the conversation and the session behaves the way the cold-start table suggests
it should. After it, the checkpoint is pinned at a point the conversation has
already left behind, and the two quantities that matter — what can be reused and
what must be recomputed — separate and keep separating.

The third line decides the outcome. The scorer is overhead paid on every
request, and it scales with the prompt. When the prefix cache is advancing, that
overhead buys a large saving. When the checkpoint is frozen, the saving shrinks
each turn while the overhead grows, and the two cross. Nothing in the server's
per-request metrics reports that crossing: each individual prefill still looks
efficient in isolation, because the recomputation it is doing is counted as work
the request legitimately needed.

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
84–86%, the largest uncached suffix stayed under 2.5K tokens, and the scorer was
never called.

**Consequence** — The answer is workload-shaped. A session whose prefix keeps
being reused never reaches the state where sparse prefill has anything to lose,
which is why the fix is a default rather than a removal. It also means a single
global setting is the wrong shape for the decision: the same server serves both
kinds of traffic within minutes of each other.

</div>

<div class="decision">

### Default the agent path to dense, keep the override explicit

**Why** — Two workloads with opposite requirements were being served by one
setting. The long-context path wants sparse prefill and measurably benefits from
it; the agent path wants a prefix cache that keeps advancing.

**Consequence** — What shipped is a transport-level policy: the agent path
defaults to dense, with a per-request sparse override for a caller that knows
its prompt is cold, and the long-context path is unchanged.

</div>

## The Correctness Result

One finding outranks all of the performance work.

Sparse prefill may drop tokens only after a protected prefix boundary — the
region holding the system prompt and tool instructions has to be computed in
full. That boundary was being derived by subtraction, and it fell short of the
real boundary. With tools present the shortfall was as little as 37 tokens,
which placed the tail of the tool instructions and the operator's system prompt
inside the region sparse prefill is permitted to drop.

This is not a throughput regression. It silently removes instructions the
operator believes are in force, on exactly the requests — tool-carrying agent
requests — where they matter most, and nothing in the output announces it. It
was fixed upstream, separately from and ahead of the deployment policy.

## Limitations

- **The real-agent comparison is one run per arm**, and the two agents took
  different trajectories through the task. No session wall-clock ratio from it
  is presented as a measured slowdown; the request-level trace is what carries
  the argument.
- **One machine, one model, one quantization.** The crossover point between
  scorer overhead and prefill saving depends on all three.
- **The idle-recovery result is synthetic.** It shows the mechanism can work
  when a gap exists, including the zero-idle row where it does not: 108.1 s
  against 119.7 s, 11% slower than dense.

## Evidence

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a>
  — the study: measurement setup, request-level traces, and the analysis.
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/publications/article.zh.md" target="_blank" rel="noopener noreferrer"><code>publications/article.zh.md</code></a>
  — the written article, in Traditional Chinese.
- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a>
  — the prefix-boundary correctness fix.
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a>
  — the transport-level deployment policy.

</div>

What I still cannot do is tell, when a request arrives, which of the three
regimes the session it belongs to will turn out to be. Until that is possible,
the caller declares it and the server believes them.
