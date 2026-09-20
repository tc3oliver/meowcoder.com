---
title: 'LLM Inference Systems'
type: 'Systems Research · LLM Inference'
summary: 'An ongoing inference-systems research program driven by real interactive workloads: instrument the runtime, isolate the mechanism, check correctness, and turn the result into a production decision or an upstream fix. Two completed experiments and three open research threads.'
outcome: 'Two finished experiments — reusable state dynamics, and a cost model for speculative decoding — three threads that each state the evidence they still lack, two open upstream pull requests, and a reproducible harness with the full dataset behind every figure.'
indexMeta: 'Apple silicon · Two experiments · Three research threads · Two open upstream PRs'
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
    value: 'Public repository · published article · two open upstream pull requests'
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

- On a 35B-A3B mixture-of-experts, a four-position verify forward costs 2.43 dense steps. A fixed draft depth of 3 came out 10% slower than dense decoding on code and 43% slower on prose, at acceptance rates of 56% and 25%.
- On a dense 27B, same runtime and same prompts, the identical forward costs 1.37 dense steps and the mechanism is 1.81× faster on a matched 13.6K-token coding prompt — at 79% acceptance.
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
states each result with its evidence level, alongside the raw measurements for all five workload cells.

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
- **A background dense-prefix recovery job and a cooperative scheduler**, designed to fail closed, with background slices yielding to inbound requests — foreground decode went from 13.5 back to 47 tok/s in the one run measured. This was an experimental branch; a later review found four gaps in it and none of that code is in the served build.
- **Request-level instrumentation** of checkpoint position and uncached suffix, which is what made the trace possible at all.
- **A transport-level request policy**, added only after the real workload showed no single configuration was right for every request.
- **A reproducible harness and dataset** — every figure is redrawn by two scripts that read nothing but `data/`, and nothing in it is smoothed, interpolated, or back-generated.

Upstream, two pull requests, both open at the time of writing:

- <a href="https://github.com/jundot/omlx/pull/3756" target="_blank" rel="noopener noreferrer"><code>omlx#3756</code></a> — the correctness fix for the protected-prefix boundary. It went before the deployment policy because it is the only finding that changed the model's input rather than only its speed.
- <a href="https://github.com/jundot/omlx/pull/3762" target="_blank" rel="noopener noreferrer"><code>omlx#3762</code></a> — per-request SpecPrefill fields on the Anthropic messages endpoint, matching what the OpenAI-compatible endpoint already had. It changes no upstream default.

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

</div>

What I still cannot do is classify a request as it arrives. Until then the caller declares the shape and the server honours it.
