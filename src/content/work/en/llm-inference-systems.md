---
title: 'LLM Inference Systems'
type: 'Systems Research · LLM Inference'
summary: 'An ongoing inference-systems research program driven by real interactive workloads: instrument the runtime, isolate the mechanism, check correctness, and turn the result into a production decision or an upstream fix. Three completed experiments and three open research threads.'
outcome: 'Three finished experiments: on reusable state dynamics, on the cost model for speculative decoding, and on background recovery of reusable canonical state. Alongside them, three open research threads that each state the evidence they still lack, ten upstream pull requests — eight open, none a draft, and two merged — and a reproducible harness with the full dataset behind every figure.'
indexMeta: 'Apple silicon · Three experiments · Three open research threads · Eight open upstream PRs, two merged'
evidence: 'llm-inference-systems on GitHub · methodology, request-level traces, raw data, and figures'
slug: 'llm-inference-systems'
locale: 'en'
translationKey: 'llm-inference-systems'
order: 3
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
    value: 'Public repository · published articles · ten upstream pull requests: eight open, two merged'
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
<figcaption class="state-flow__caption">Each stage can break the one before it. The three experiments below each went the whole way round.</figcaption>
</figure>

Every claim in the repository carries an evidence level: observed, measured, derived, inferred, hypothesized, not established. The grading is the point — three subjects in the repository are filed as open research threads rather than experiments precisely because each one names the evidence it still lacks.

## From baseline to optimized serving

This study did not start from a prefix-cache problem. The first goal was plain: take a 27B-class dense model at 4-bit on one Apple silicon machine from "it runs" to an inference service you can actually interact with.

At 16K context, dense prefill ran at about 302 tok/s; with sparse prefill, 1,046 tok/s. At 32K, 277 tok/s became 1,112 tok/s. Time to first token comes from the same two rows: 16K from 57.84 s to 19.24 s, 32K from 122.7 s to 33.5 s. Stacking the heterogeneous prefill path on top of that is a separate measurement, in throughput only — roughly 300 to 1,328 tok/s at 16K, from a single isolated smoke run with one resident engine, and the most fragile number on this page.

The optimization was not confined to model compute. Background dense prefix recovery contended with foreground generation on the same executor, and foreground decode fell to 13.5 tok/s. Two defects were behind that: a request was invisible to the scheduler until its admission ran, and a slice starved the loop that accepts requests. With both fixed, foreground decode under the same background work came back to about 47 tok/s, in the one run where it was measured. That work was an experimental branch; the rebuilt version is EXP-003 below.

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

By this point both the single-request numbers and the background work staying out of the foreground's way looked good. Then the same configuration was put behind a coding agent that reads files, calls tools, and grows its context turn after turn — and the session came out slower.

That is where EXP-001 actually begins: **if every request is faster, why is the whole interactive workload slower?**

## Reusable State Dynamics (EXP-001)

The question: **does a faster request make the whole interactive session slower, by destroying the reusable state the next request needed?**

Sparse prefill — here SpecPrefill, an attention-based mechanism — delivers on a cold long prompt: 16K time-to-first-token fell from 57.84 s to 19.24 s, and 32K from 122.7 s to 33.5 s. But an agent's next request is mostly its previous request again, and a sparsified suffix does not advance the normal reusable dense prefix state.

The request-level trace is what made the mechanism visible. The reusable checkpoint climbed to 37,888 tokens, collapsed back to 28,672, and stayed pinned there for the following ten requests, while the uncached suffix each request had to recompute grew from 17,060 to 33,979 tokens. The collapse happened before any sparse admission, so sparse prefill did not cause it; but every observed suffix after the collapse was sparsified, the checkpoint never recovered, and the recomputation accumulating from there is the prefix-cache debt.

The correctness defect found along the way mattered more than any of the performance work. The server derived the boundary of the protected prefix by subtraction, and with tools in play it fell as little as 37 tokens short — placing the end of the tool instructions and the start of the operator's system prompt inside the region the optimization was free to drop. The fix measures the boundary instead of inferring it, and was sent upstream.

<div class="decision">

### The session is the unit of measurement, not the request

**Why** — A cold benchmark reports what one request saved for itself. It cannot see how much reusable state that request left for the next one, and that is the bill an agent workload actually pays.

**Consequence** — Track the reusable checkpoint and the uncached suffix, not the per-request saving. The slower agent session that started this is an observation, not a measured effect size: the two sessions took different trajectories.

</div>

The full findings, data, and limitations are in
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-001-reusable-state-economics" target="_blank" rel="noopener noreferrer">EXP-001</a>; the long-form write-up is
<a href="https://study.meowcoder.com/posts/260920-inference-reusable-state/" target="_blank" rel="noopener noreferrer">當 prefill 變快，agent 反而變慢</a> (Traditional Chinese).

## Speculative Decoding Cost Model (EXP-002)

The question: **under what conditions does speculative decoding actually save time — is break-even decided by the acceptance rate, or by the cost of one verify cycle?**

By the verify cycle. Acceptance is the number everybody reports for this mechanism, and thirty-six runs later it is the wrong one: high acceptance did not guarantee a speedup. What decides whether speculation pays is **the cost of one verify cycle measured in dense decode steps**, and that cost is a property of the model rather than of the content.

- On a 35B-A3B mixture-of-experts, a four-position verify forward costs 2.43 dense steps. A fixed draft depth of 3 came out 10% slower than dense decoding on code and 44% slower on prose, at acceptance rates of 56% and 25%.
- On a dense 27B, same runtime and the same prompt, the identical forward costs 1.37 dense steps, and at 79% acceptance the mechanism decodes 1.81× faster on a matched 13.6K-token coding prompt — 1.05× end to end on the same row.
- A cost model built from the runtime's own timers predicts the measured speedup to within 5% in ten of the eleven matched pairs, across the 0.56×–1.81× range.
- The runtime's existing adaptive depth controller pulled every measured losing region back to the break-even line: it turned all four losses into parity or a small deficit, and in the one cell where the fixed depth already won, the controller won by a further 12% on top, by drafting shallower and buying a cheaper cycle.

Because the code under test was already choosing correctly, the finding came with no upstream proposal attached. The production decision is to change nothing and keep the current adaptive MTP.

<div class="decision">

### Evaluate the controller that exists before proposing one that does not

**Why** — Proposing a new policy before establishing whether the current one misdecides trades an unproven problem for an untested solution.

**Consequence** — The measurement's product was a decision not to change anything, which is the harder result to publish and the cheaper one to ship.

</div>

One correctness caveat, flagged here and not opened up: **with speculation on, greedy generation stopped being reproducible** — two runs of one prompt gave two different completions, both different from the dense one, while the dense arm was character-for-character identical. The semantic impact was not measured, so neither degradation nor its absence is claimed. The open question is filed in the correctness thread.

<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-002-speculative-decoding-economics" target="_blank" rel="noopener noreferrer">EXP-002</a>
states each result with its evidence level, alongside the raw measurements for all five workload cells. The long-form write-up is
<a href="https://study.meowcoder.com/posts/260920-speculative-decoding-cost-model/" target="_blank" rel="noopener noreferrer">推測解碼何時真的會加速？</a> (Traditional Chinese).

## Progressive Canonical State Recovery (EXP-003)

The question: **if a sparse prefill leaves no reusable state behind, can that state be rebuilt later without the foreground paying for it?**

Yes — and what the feature was expected to buy turned out not to be what it bought. Across a controlled seven-turn session the sparse arm's reusable canonical prefix never left zero while the prompt grew to 43,065 tokens, so every turn recomputed everything. In the recovery arm that prefix was rebuilt during foreground-idle windows and published only at cache-block boundaries the ordinary serving path could independently restore from. That took cumulative session latency from 228.38 s to 79.06 s on that workload. The foreground was pinned to SpecPrefill in both arms.

Making it safe to serve was the larger half. A share-of-time budget bounds how _often_ background work collides with a request, not how long that request then waits — the worst collision stayed in the same 12–15 s band across a twentyfold budget change. What bounds the wait is the execution slice, and that turned out to be independent of the publication grain: every slice setting that ran reached identical boundaries, and shrinking the slice from the block grain to 512 took the worst client-observed wait from 15.08 s to 1.30 s for about 2.4% of recovery throughput at the extreme. Shrinking further to 256 did not clearly help: its trace-derived bound is lower, but its observed maximum is higher. At that point one more defect had to be fixed before it could be proposed upstream: the recovery budget was owned per engine while the accelerator is shared, so each loaded model multiplied the cap.

<div class="decision">

### Returning the foreground to dense prefill was not the outcome. Leaving the next turn less to compute was.

**Why** — The feature was built to return the foreground to dense prefill once the prefix recovered. The fastest configuration measured was the one where that never happened, and the turns that did switch routes were the most expensive turns of their sessions.

**Consequence** — Background recovery earns its keep by leaving the next turn less to compute, not by changing the route that turn takes. Which route a turn should take is a separate question, filed in the repository and not answered here.

</div>

No foreground latency target was defined before those runs, so the worst uninterruptible execution slice in the runtime trace at that 512-token slice, 2.39 s, is a derived bound on what a request could have waited for rather than a latency anyone observed — and not a verdict on whether it is acceptable.
<a href="https://github.com/tc3oliver/llm-inference-systems/tree/main/experiments/exp-003-progressive-shadow-prefill" target="_blank" rel="noopener noreferrer">EXP-003</a> carries the datasets, the figures and the limitations; the feature is proposed upstream as
<a href="https://github.com/jundot/omlx/pull/3793" target="_blank" rel="noopener noreferrer"><code>omlx#3793</code></a>, open for review and not merged. The long-form write-up is
<a href="https://study.meowcoder.com/posts/260921-canonical-state-debt-recovery/" target="_blank" rel="noopener noreferrer">償還 reusable state 的債</a> (Traditional Chinese).

## Systems themes

Neither of the two below is an experiment: one is a configuration history, the other is still missing its judgement. The third open thread, on cross-runtime observations, is not written up here — its content is the absence: no controlled comparison exists, and none was run. All three sit in the repository as supporting evidence, not as conclusions.

### Correctness — fast but wrong is a regression

Every inference optimization changes something between the prompt and the answer — the arithmetic, the input, or the order of operations — so each one has to answer the same question: does the difference reach the output? Four cases give four different answers.

- **Restoring a cached prefix.** Seven prompts, fourteen runs, byte-identical output every time. The longest case went from 56.3 s to 2.3 s.
- **Changing the attention route.** At 68K context, three numerically different builds differed in their logits by up to about 0.4 — and still produced the same argmax, the same top-3 token set, and the same output hash. The route itself was chosen per call from live memory headroom, which is why two identical processes could differ; <a href="https://github.com/jundot/omlx/pull/3685" target="_blank" rel="noopener noreferrer"><code>omlx#3685</code></a> pins it to the bounded path.
- **The protected-prefix boundary.** The output changed, because the model's input changed — the one case that genuinely altered what the model saw, and the one that sounded most like bookkeeping.
- **Speculative decoding.** The output changed and stopped being reproducible.

Which of the four reaches the output is not guessable from how aggressive an optimization sounds. Reusing a cached prefix sounds risky and is exact. Speculative decoding sounds like the most dangerous of the four, and its guessing is the exactly-correct part — what moved the output was the arithmetic underneath.

What this thread is missing is not the comparison but the judgement: once the output does change, every comparison so far can say whether the bytes differ, and none of them says whether the answer got worse.

### Heterogeneous compute — accelerator enabled ≠ accelerator executed

The clearest result here is a null one. The neural-engine prefill path compiles for a fixed tile length, while the serving layer divides prefill into cache blocks. In the deployment where the block was 512 tokens and the compiled tile 2048, no delivered chunk could ever fill a tile: the path initialized, compiled, reported itself as enabled, and never executed a single tile.

None of that is visible in a throughput number. The configuration said "neural engine on", the server agreed it was on, and the contribution was exactly zero. The accelerator will not take a prefill width below 1024 tokens at all, and <a href="https://github.com/jundot/omlx/pull/3746" target="_blank" rel="noopener noreferrer"><code>omlx#3746</code></a> — merged — makes that geometry report itself as impossible instead of warning about a shape it cannot accept. What made the path usable was a compiled tile and a cache block on the same grain — a matter of how work is divided, not how it is computed.

The general form is worth keeping: on a heterogeneous device, the unit of work an accelerator compiles for and the unit of work the serving layer hands out are two different decisions, usually made by two different people.

## Engineering and upstream consequence

None of the findings above was available to someone who only ran benchmarks. Getting to them meant building:

- **A heterogeneous prefill path** splitting each layer's work between the GPU and the neural engine, on a 1024-token tile matched to the 1024-token cache block of the deployed configuration.
- **Composition measurement** — sparse prefill on top of it, stacking at 95–97% of the product of their individual speedups in an isolated qualification.
- **A measured protected-prefix boundary**, taken from two throwaway template probes and the token prefix that both of them agree on, replacing a derivation by subtraction.
- **A background dense-prefix recovery job and a cooperative scheduler**, designed to fail closed, with background slices yielding to inbound requests — foreground decode went from 13.5 back to 47 tok/s in the one run measured. This was an experimental branch; a later review found four gaps in it and none of that code is in the served build. EXP-003 above is the rebuilt version, with those gaps closed and the serving safety measured rather than assumed.
- **Request-level instrumentation** of checkpoint position and uncached suffix, which is what made the trace possible at all.
- **A transport-level request policy**, added only after the real workload showed no single configuration was right for every request.
- **A reproducible harness and dataset** — every figure is redrawn by three scripts that read nothing but `data/`, and nothing in it is smoothed, interpolated, or back-generated.

Upstream, ten pull requests. Eight are open at the time of writing, none a draft and none reviewed to a conclusion; two are merged. An open pull request is a proposal, not an outcome:

- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a> — the correctness fix for the protected-prefix boundary. It was sent before the performance work because it is the only finding that changed the model's input rather than only its speed.
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a> — per-request SpecPrefill fields on the Anthropic messages endpoint, matching what the OpenAI-compatible endpoint already had. It changes no upstream default.
- <a href="https://github.com/jundot/omlx/pull/3685" target="_blank" rel="noopener noreferrer"><code>omlx#3685</code></a> — deterministic SDPA-256 routing. The route was chosen per call from live memory headroom, so two otherwise identical processes could take different floating-point reductions; this pins qualifying prefill to the bounded one.
- <a href="https://github.com/jundot/omlx/pull/3840" target="_blank" rel="noopener noreferrer"><code>omlx#3840</code></a> — on a hybrid model the first layer can be a recurrent cache with no offset, so a restored draft cache was silently read as empty and the prompt was prefilled on top of the state it already held, corrupting the importance scoring the selector runs on. It derives the position from an attention layer instead.
- <a href="https://github.com/jundot/omlx/pull/3842" target="_blank" rel="noopener noreferrer"><code>omlx#3842</code></a> — reusable recurrent state at draft cache block boundaries. It depends on #3840 and should not merge before it.
- <a href="https://github.com/jundot/omlx/pull/3792" target="_blank" rel="noopener noreferrer"><code>omlx#3792</code></a> — a SpecPrefill RoPE cleanup fix on the prefill-OOM requeue path, found while building EXP-003 and sent on its own. It is a correctness fix with its own reproduction, unrelated to the recovery feature.
- <a href="https://github.com/jundot/omlx/pull/3811" target="_blank" rel="noopener noreferrer"><code>omlx#3811</code></a> — on mRoPE VLMs, SpecPrefill wrote its selected tokens at compacted rather than original positions. Validating progressive canonical state recovery (PCSR) is what exposed it; **PCSR did not cause it**, and it is present with background recovery switched off.
- <a href="https://github.com/jundot/omlx/pull/3793" target="_blank" rel="noopener noreferrer"><code>omlx#3793</code></a> — background canonical-state recovery, the EXP-003 feature. It depends on #3811 and should be ordered after it, and it puts an explicit question to the maintainers: whether this PR's own background-scheduling primitives should be merged with work already in flight upstream.
- <a href="https://github.com/jundot/omlx/pull/3746" target="_blank" rel="noopener noreferrer"><code>omlx#3746</code></a> — merged. The ANE prefill scheduler recommended a sequence length the accelerator cannot accept, since it requires a multiple of 64 and at least 1024 tokens; the merged change reports that geometry as impossible instead. It alters no scheduling and no execution — it makes a silent misconfiguration say so.
- <a href="https://github.com/jundot/omlx/pull/3664" target="_blank" rel="noopener noreferrer"><code>omlx#3664</code></a> — merged, and the one item here that did not come from an experiment. Tool groups in the Responses API were dropped before reaching the chat template, because only entries typed as functions survived the conversion, so a client's namespaced tools never reached the model. It is a defect met while running the stack, not a finding produced by one.

Hardening #3793 surfaced six defects that the experiment's own workloads could not reach, under conditions such as a second model in the process, multi-token prediction on, an eviction mid-job, and a prompt whose length is an exact multiple of the cache block. Three of them are not only about this runtime: background work must yield **ownership** and not only execution; foreground arrival must be visible process-wide and before execution begins; and a cache watermark is bookkeeping rather than the cache's actual state, so it has to be able to move backward. The invariants are in EXP-003's <code>HARDENING.md</code>.

Taking that mechanism into a real agent workload, after the experiment closed, then exposed two independent defects — in SpecPrefill's draft-cache path, not in background recovery. The upstream fixes are <code>omlx#3840</code> and <code>omlx#3842</code> above. Neither changes EXP-003's result, and neither is a seventh or eighth hardening finding of it.

## Evidence and limits

One machine, one vendor, one runtime. EXP-001 is a single 27B dense model at 4-bit, one run per cell. EXP-002 measures the 35B-A3B MoE and the 27B side by side, which is the closest thing here to a second configuration — and still the same machine. EXP-003 is that 27B dense model again with multi-token prediction off, a single run per arm — enough to establish a mechanism, not enough to state an effect size. All three state that cross-model and cross-hardware generalization is not established: the mechanism arguments are about this runtime's cache and scheduler; the numbers are about this machine.

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

What I still cannot do is classify a request as it arrives. Until that changes, the caller declares the shape and the server honours it.
