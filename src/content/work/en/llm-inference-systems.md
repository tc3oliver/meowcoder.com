---
title: 'LLM Inference Systems'
type: 'Systems Research · LLM Inference'
summary: 'An ongoing inference-systems research program driven by real interactive workloads: instrument the runtime, isolate the mechanism, check correctness, and turn the result into a production decision or an upstream fix. Three completed experiments and three open research threads.'
outcome: 'Three finished experiments — reusable state dynamics, a cost model for speculative decoding, and background recovery of reusable canonical state — three threads that each state the evidence they still lack, four open upstream pull requests, one of them a draft, and a reproducible harness with the full dataset behind every figure.'
indexMeta: 'Apple silicon · Three experiments · Three research threads · Four open upstream PRs'
evidence: 'llm-inference-systems on GitHub · methodology, request-level traces, raw data, and figures'
slug: 'llm-inference-systems'
locale: 'en'
translationKey: 'llm-inference-systems'
order: 2
draft: false
kind: 'case-study'
meta:
  - label: 'Platform'
    value: 'Apple M4 Max · 64GB unified memory'
  - label: 'Models'
    value: '27B dense at 4-bit · 35B-A3B MoE at 6-bit'
  - label: 'Scope'
    value: 'Runtime · Serving · Reusable state · Speculative execution · Correctness · Heterogeneous compute'
  - label: 'Evidence'
    value: 'Public repository · published articles · four open upstream pull requests'
---

Independently researched, measured, and submitted upstream by Oliver Yu.

Inference optimizations often look good under an isolated benchmark and fail under a real interactive workload. This program investigates those failures: instrument the runtime, isolate the mechanism, validate correctness, and translate the finding into a production decision or an upstream improvement.

The scope is runtime, serving, reusable state, speculative execution, correctness, and heterogeneous compute — all of it on one Apple silicon machine.

## How the work runs

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Production observation</span>
<span class="state-flow__detail">Behaviour that shows up in real traffic and not in a benchmark.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Runtime instrumentation</span>
<span class="state-flow__detail">Measure the mechanism, not only the wall clock.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Controlled experiment</span>
<span class="state-flow__detail">Same prompt, one mechanism switched, everything else held.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Mechanism</span>
<span class="state-flow__detail">The quantity that predicts the outcome, not the one everybody reports.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Correctness</span>
<span class="state-flow__detail">Faster does not count unless the output survives it.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Production / upstream</span>
<span class="state-flow__detail">A changed default, a pull request, or a stated refusal to change anything.</span>
</li>
</ol>
<figcaption class="state-flow__caption">Each stage can break the one before it. Both experiments below went the whole way round.</figcaption>
</figure>

Every claim carries an evidence level: observed, measured, derived, inferred, hypothesized, not established. The grading is the point — three subjects in the repository are filed as research threads rather than experiments precisely because each one names the evidence it still lacks.

## From baseline to optimized serving

This study did not start from a prefix-cache problem. The first goal was plain: take a 27B-class dense model at 4-bit on one Apple silicon machine from "it runs" to an inference service you can actually interact with.

At 16K context, dense prefill ran at about 302 tok/s; with heterogeneous prefill and sparse prefill stacked on it, 1,046 tok/s. At 32K, 277 tok/s became 1,112 tok/s. In an isolated qualification with the two mechanisms composed, prefill peaked at roughly 1,328 tok/s. Time to first token followed: 16K from 57.84 s to 19.24 s, 32K from 122.7 s to 33.5 s.

The optimization was not confined to model compute either. Background dense prefix recovery contended with foreground generation on the same executor, and foreground decode fell to 13.5 tok/s. Once the two defects behind that — a request being invisible to the scheduler until its admission ran, and a slice starving the loop that accepts requests — were fixed, foreground decode under the same background work came back to about 47 tok/s, in the one run where it was measured.

<figure class="trajectory" aria-label="Three measurements from baseline to optimized serving: prefill throughput, time to first token, and foreground decode under background recovery">
<div class="trajectory__panel">
<p class="trajectory__title">Prefill throughput</p>
<p class="trajectory__unit">tok/s · higher is better</p>
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
<span class="trajectory__label">Stacked, one smoke run</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 23%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 100%"></span></span>
<span class="trajectory__value">~300 → 1,328<span class="trajectory__ratio">4.4×</span></span>
</li>
</ol>
</div>
<div class="trajectory__panel">
<p class="trajectory__title">Time to first token</p>
<p class="trajectory__unit">seconds · lower is better</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">16K</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 47%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 16%"></span></span>
<span class="trajectory__value">57.84 s → 19.24 s</span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">32K</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 100%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 27%"></span></span>
<span class="trajectory__value">122.7 s → 33.5 s</span>
</li>
</ol>
</div>
<div class="trajectory__panel">
<p class="trajectory__title">Scheduler isolation</p>
<p class="trajectory__unit">tok/s · foreground decode under background recovery</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">Foreground decode</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 29%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 100%"></span></span>
<span class="trajectory__value">13.5 → 47</span>
</li>
</ol>
</div>
<figcaption class="trajectory__caption">Each panel carries its own unit and its own scale; they do not share a Y axis, and in the middle one lower is better, so the solid bar is the shorter one. The stacked row comes from a single isolated smoke run, not from the same measurement as the two rows above it. The last panel is not a general decode baseline — it is the foreground side of one run where background dense recovery and foreground generation were competing for the same executor.</figcaption>
</figure>

By this point the single-request numbers looked good. Then the same configuration was put behind a coding agent that reads files, calls tools, and grows its context turn after turn — and the session came out slower.

That is where EXP-001 actually begins: **if every request is faster, why is the whole interactive workload slower?**

## Reusable State Dynamics (EXP-001)

The question: **does a faster request make the whole interactive session slower, by destroying the reusable state the next request needed?**

Sparse prefill — here SpecPrefill, an attention-based mechanism — delivers on a cold long prompt: 16K time-to-first-token fell from 57.84 s to 19.24 s, and 32K from 122.7 s to 33.5 s. But an agent's next request is mostly its previous request again, and a sparsified suffix does not advance the normal reusable dense prefix state.

The request-level trace is what made the mechanism visible. The reusable checkpoint climbed to 37,888 tokens, collapsed back to 28,672, and stayed pinned there for the following ten requests, while the uncached suffix each request had to recompute grew from 17,060 to 33,979 tokens. The collapse happened before any sparse admission, so sparse prefill did not cause it; but every observed suffix after the collapse was sparsified, the checkpoint never recovered, and the recomputation accumulating from there is the prefix-cache debt.

The correctness defect found along the way mattered more than any of the performance work. The server derived the boundary of the protected prefix by subtraction, and with tools in play it fell as little as 37 tokens short — placing the end of the tool instructions and the start of the operator's system prompt inside the region the optimization was free to drop. The fix measures the boundary instead of inferring it, and went upstream.

<div class="decision">

### The session is the unit of measurement, not the request

**Why** — A cold benchmark reports what one request saved for itself. It cannot see how much reusable state that request left for the next one, and that is the bill an agent workload actually pays.

**Consequence** — Track the reusable checkpoint and the uncached suffix. The real-agent wall-clock gap is the observation that started the investigation, not a measured effect size — the two agents took different trajectories.

</div>

The full findings, data, and limitations are in
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-001-reusable-state-economics" target="_blank" rel="noopener noreferrer">EXP-001</a>; the long-form write-up is
<a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a> (Traditional Chinese).

## Speculative Decoding Cost Model (EXP-002)

The question: **under what conditions does speculative decoding actually save time — is break-even decided by the acceptance rate, or by the cost of one verify cycle?**

By the verify cycle. Acceptance is the number everybody reports for this mechanism, and thirty-six matched runs later it is the wrong one: high acceptance did not guarantee a speedup. What decides whether speculation pays is **the cost of one verify cycle measured in dense decode steps**, and that cost is a property of the model's architecture rather than of the content.

- On a 35B-A3B mixture-of-experts, a four-position verify forward costs 2.43 dense steps. A fixed draft depth of 3 came out 10% slower than dense decoding on code and 44% slower on prose, at acceptance rates of 56% and 25%.
- On a dense 27B, same runtime and same prompts, the identical forward costs 1.37 dense steps and the mechanism decodes 1.81× faster on a matched 13.6K-token coding prompt — 1.05× end to end on the same row — at 79% acceptance.
- A cost model built from the runtime's own timers predicts the measured matched speedup across the whole 0.56×–1.81× range.
- The runtime's existing adaptive depth controller avoided every measured losing region: it turned all four losses into parity or a small deficit, and in the one cell where the fixed depth won it won by a further 12%, by drafting shallower and buying a cheaper cycle.

Because the code under test was already choosing correctly, the finding came with no upstream proposal attached. The production decision is to change nothing and keep the current adaptive MTP.

<div class="decision">

### Evaluate the controller that exists before proposing one that does not

**Why** — Proposing a new policy before establishing whether the current one misdecides trades an unproven problem for an untested solution.

**Consequence** — Once the controller was measured choosing correctly in every cell, there was no pull request to send. That is the honest outcome when the code under test is already right.

</div>

One correctness caveat, flagged here and not opened up: **with speculation on, greedy generation stopped being reproducible** — two runs of one prompt gave two different completions, both different from the dense one, while the dense arm was character-for-character identical. The semantic impact was not measured, so neither degradation nor its absence is claimed. The open question is filed in the correctness thread.

<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-002-speculative-decoding-economics" target="_blank" rel="noopener noreferrer">EXP-002</a>
states each result with its evidence level, alongside the raw measurements for all five workload cells. The long-form write-up is
<a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？</a> (Traditional Chinese).

## Progressive Canonical State Recovery (EXP-003)

The question: **if a sparse prefill leaves no reusable state behind, can that state be rebuilt later without the foreground paying for it?**

Yes — and the correction on the way there matters more than the result. Across a controlled seven-turn session the sparse arm's reusable canonical prefix never left zero while the prompt grew to 43,065 tokens, so every turn recomputed everything. Rebuilding that prefix during foreground-idle windows, publishing only at cache-block boundaries the ordinary serving path could independently restore, took cumulative session latency from 228.38 s to 79.06 s on that workload. The foreground stayed on SpecPrefill in both arms.

Making it safe to serve was the larger half. A share-of-time budget bounds how _often_ background work collides with a request, not how long that request then waits — the worst collision stayed in the same 12–15 s band across a twentyfold budget change. What bounds the wait is the execution slice, and that turned out to be independent of the publication grain: every slice setting that ran reached identical boundaries, and shrinking the slice from the block grain to 512 took the worst client-observed wait from 15.08 s to 1.30 s with recovery throughput unchanged. Shrinking further to 256 did not help: its trace-derived bound is lower and its observed maximum is higher. A second defect held it back from upstream — the recovery budget was owned per engine while the accelerator is shared, so each loaded model multiplied the cap.

<div class="decision">

### Spec Exit was not the outcome. The tail was.

**Why** — The feature was built to return the foreground to dense prefill once the prefix recovered. The fastest configuration measured was the one where that never happened, and the turns that did switch routes were the most expensive turns of their sessions.

**Consequence** — What background recovery is worth is that the next turn has less left to compute, not that it takes a different route. Which route a turn should take is a separate question, filed as its own research thread and not answered here.

</div>

No foreground latency target was defined before those runs, so the 2.39 s worst uninterruptible execution slice the runtime trace recorded — a bound on what a request could have waited for, not a latency anyone observed — is a derived bound and not a verdict on whether it is acceptable.
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-003-progressive-shadow-prefill" target="_blank" rel="noopener noreferrer">EXP-003</a> carries the datasets, the figures and the limitations; the feature is proposed upstream as
<a href="https://github.com/jundot/omlx/pull/3793" target="_blank" rel="noopener noreferrer"><code>omlx#3793</code></a>, a draft. The long-form write-up is
<a href="https://study.meowcoder.com/posts/260921-canonical-state-debt-recovery/" target="_blank" rel="noopener noreferrer">償還 reusable state 的債</a> (Traditional Chinese).

## Systems themes

Neither of these is an experiment, because each is still missing the evidence that would make it one. They sit in the repository as supporting evidence, not as conclusions.

### Correctness — fast but wrong is a regression

Every inference optimization changes the arithmetic that produces the answer, so each one has to answer the same question: does the difference reach the output? Four cases give four different answers.

- **Restoring a cached prefix.** Seven prompts, fourteen runs, byte-identical output every time. The longest case went from 56.3 s to 2.3 s and produced the same bytes.
- **Changing the attention route.** At 68K context, three numerically different builds differ in their logits by up to about 0.4 — and produced one argmax, one top-3 token set, and one output hash.
- **The protected-prefix boundary.** The one that genuinely changed what the model saw, and the one that sounded most like bookkeeping.
- **Speculative decoding.** The output changed and stopped being reproducible.

The ordering is not guessable from how aggressive an optimization sounds. Reusing a cached prefix sounds risky and is exact. Speculative decoding sounds like the most dangerous of the four, and its guessing is the exactly-correct part — what moved the output was the arithmetic underneath.

What this thread is missing is no longer the comparison but the judgement: every comparison so far can say the bytes differ, and none of them says whether the answer got worse.

### Heterogeneous compute — accelerator enabled ≠ accelerator executed

The clearest result here is a null one. The neural-engine prefill path compiles for a fixed tile length, while the serving layer divides prefill into cache blocks. With the deployed block at 512 tokens and the compiled tile at 2048, no delivered chunk could ever fill a tile: the path initialized, compiled, reported itself as enabled, and never executed a single tile.

None of that is visible in a throughput number. The configuration said "neural engine on", the server agreed it was on, and the contribution was exactly zero. What made the path usable was raising the tile alignment to match the block structure — a change to how work is divided, not to how it is computed.

The general form is worth keeping: on a heterogeneous device, the unit of work an accelerator compiles for and the unit of work the serving layer hands out are two different decisions, usually made by two different people.

## Engineering and upstream consequence

None of the findings above was available to someone who only ran benchmarks. Getting to them meant building:

- **A heterogeneous prefill path** splitting each layer's work between the GPU and the neural engine, on a 1024-token tile matched to the cache block.
- **Composition measurement** — sparse prefill on top of it, stacking at 95–97% of the product of their individual speedups in an isolated qualification.
- **A measured protected-prefix boundary**, taken from two throwaway template probes and the token prefix both agree on, replacing a derivation by subtraction.
- **A background dense-prefix recovery job and a cooperative scheduler**, designed to fail closed, with background slices yielding to inbound requests — foreground decode went from 13.5 back to 47 tok/s in the one run measured. This was an experimental branch; a later review found four gaps in it and none of that code is in the served build. EXP-003 below is the rebuilt version, with those gaps closed and the serving safety measured rather than assumed.
- **Request-level instrumentation** of checkpoint position and uncached suffix, which is what made the trace possible at all.
- **A transport-level request policy**, added only after the real workload showed no single configuration was right for every request.
- **A reproducible harness and dataset** — every figure is redrawn by two scripts that read nothing but `data/`, and nothing in it is smoothed, interpolated, or back-generated.

Upstream, three pull requests, all open at the time of writing and none reviewed to a conclusion:

- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a> — the correctness fix for the protected-prefix boundary. It went before the deployment policy because it is the only finding that changed the model's input rather than only its speed.
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a> — per-request SpecPrefill fields on the Anthropic messages endpoint, matching what the OpenAI-compatible endpoint already had. It changes no upstream default.
- <a href="https://github.com/jundot/omlx/pull/3792" target="_blank" rel="noopener noreferrer"><code>omlx#3792</code></a> — a SpecPrefill RoPE cleanup fix on the prefill-OOM requeue path, found while building EXP-003 and sent on its own. It is a correctness fix with its own reproduction, unrelated to the recovery feature.

Plus one draft, opened for review rather than for merge:

- <a href="https://github.com/jundot/omlx/pull/3793" target="_blank" rel="noopener noreferrer"><code>omlx#3793</code></a> — background canonical-state recovery, the EXP-003 feature. It carries an explicit question for the maintainers about whether its background-scheduling primitives should converge with work already in flight upstream.

## Evidence and limits

One machine, one vendor, one runtime. EXP-001 is a single 27B dense model at 4-bit, one run per cell. EXP-002 measures the 35B-A3B MoE and the 27B side by side, which is the closest thing here to a second configuration and is still the same machine. Cross-model and cross-hardware generalization is stated as not established in both experiments.

<div class="evidence">

- <a href="https://github.com/tc3oliver/llm-inference-systems" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/llm-inference-systems</code></a> — the source of truth: methodology, raw data, figures, and limitations.
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/RESEARCH.md" target="_blank" rel="noopener noreferrer">RESEARCH.md</a>
  and <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/EVIDENCE.md" target="_blank" rel="noopener noreferrer">EVIDENCE.md</a> — the research map, and the ladder every claim is graded against.
- <a href="https://github.com/tc3oliver/llm-inference-systems/blob/main/ENGINEERING.md" target="_blank" rel="noopener noreferrer">ENGINEERING.md</a> — the system as it evolved, stage by stage, and what broke each stage's assumption.
- <a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/data" target="_blank" rel="noopener noreferrer">Data</a>
  and <a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/figures" target="_blank" rel="noopener noreferrer">figures</a> — every number behind every figure, with provenance and row counts.
- <a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a> — the long-form EXP-001 article, with charts.
- <a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？從 Acceptance Rate 到 Verify-Cycle Cost</a> — the long-form EXP-002 article.
- <a href="https://study.meowcoder.com/posts/260921-canonical-state-debt-recovery/" target="_blank" rel="noopener noreferrer">償還 reusable state 的債</a> — the long-form EXP-003 article, with charts.

</div>

What I still cannot do is classify a request as it arrives. Until then the caller declares the shape and the server honours it.
