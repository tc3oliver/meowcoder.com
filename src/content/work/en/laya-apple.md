---
title: 'Adaptive Heterogeneous Inference on Apple Silicon'
type: 'Systems Research · Inference Runtime'
summary: 'Debugging Python’s GIL, Core ML execution, and host scheduling to build a self-recovering MLX GPU + Neural Engine runtime.'
outcome: 'laya-apple 1.5 serves short requests on the Neural Engine through Core ML’s asynchronous API, detects a host-side slow state from its own request trace, and falls back to the known-safe 1.4 path. GPU result return fell from 4.28–8.60 ms to 0.035–0.043 ms across 154 validation episodes, with no mismatch, lost request or crash.'
indexMeta: 'Apple M4 Max · MLX GPU + Neural Engine · Shipped in laya-apple 1.5 · Upstream: apple/coremltools#2876'
evidence: 'laya-apple on GitHub · research map, preregistered gates, and the raw data behind every study'
slug: 'laya-apple'
locale: 'en'
translationKey: 'laya-apple'
order: 2
draft: false
kind: 'case-study'
meta:
  - label: 'Platform'
    value: 'Apple M4 Max · MLX GPU + Apple Neural Engine'
  - label: 'Runtime'
    value: 'laya-apple 1.5 · Python, MLX, Core ML'
  - label: 'Scope'
    value: 'Concurrency · Core ML execution · Host scheduling · Adaptive fallback'
  - label: 'Upstream'
    value: 'apple/coremltools#2876 · open'
---

Independently researched, measured, and shipped by Oliver Yu.

<a href="https://github.com/tc3oliver/laya-apple" target="_blank" rel="noopener noreferrer">laya-apple</a> serves one model on two devices of the same Mac at once: long requests on the MLX GPU, short ones on the Apple Neural Engine through Core ML. Running both together made GPU tail latency worse. This is the line of work, from 1.4 to 1.5, that found out why and what the runtime could safely do about it.

## Results

- **GPU result return, 7.67 → 0.14 ms (P50).** A 2×2 intervention showed that the delay was the GIL held by synchronous Core ML `predict`, not the hardware.
- **In production, 4.28–8.60 → 0.035–0.043 ms.** That is laya-apple 1.5 against the 1.4 path, with throughput 1.038–1.042× that of 1.4.
- **12 of 12 slow episodes recovered, the worst in 414 ms.** In a controlled test, every trip reached sustained 1.4-level latency within 164–414 ms, against a preregistered limit of 1.0 s.
- **154 production validation episodes.** There were zero output mismatches, routing failures, lost requests or crashes.

Upstream: <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a> releases the GIL during native `MLModel.predict()`. It is open, not merged.

<figure class="trajectory" aria-label="GPU result return before and after, in milliseconds">
<div class="trajectory__panel">
<p class="trajectory__title">GPU result return, P50</p>
<p class="trajectory__unit">ms · lower is better</p>
<ol class="trajectory__rows" role="list">
<li class="trajectory__row">
<span class="trajectory__label">GIL intervention</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 89%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 2%"></span></span>
<span class="trajectory__value">7.67 → 0.14</span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">1.5, laya</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 50%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 1%"></span></span>
<span class="trajectory__value">4.28 → 0.035</span>
</li>
<li class="trajectory__row">
<span class="trajectory__label">1.5, typed-decisions</span>
<span class="trajectory__track" aria-hidden="true"><span class="trajectory__bar" style="--extent: 100%"></span><span class="trajectory__bar trajectory__bar--after" style="--extent: 1%"></span></span>
<span class="trajectory__value">8.60 → 0.043</span>
</li>
</ol>
</div>
<figcaption class="trajectory__caption">GPU result return is the time from the GPU worker finishing a request to its result reaching the caller. It is not GPU compute time. The first row is the research intervention; the other two are 1.5 against the 1.4 path in production validation.</figcaption>
</figure>

## The symptom

With the Neural Engine on a thread beside the GPU, GPU service time on typed-decisions rose by 1.04–1.64×, while the Neural Engine itself was barely affected. The natural suspect was the two devices interfering with each other, and it did not survive a measurement: MLX `mx.eval` time rose by at most 1.04× in 15 of 16 GPU streams. The GPU was not computing more slowly.

The runtime already recorded a `RequestTrace` for every request, and that is what located the delay. It sat in the GPU reply leg, lined up with the end of the Neural Engine's `predict` call. The return leg grew from 0.05 to 7.41 ms, which accounted for 91.1% of the added occupancy. The GPU had finished its work. The result was waiting.

## The cause: the GIL

A thread profile showed where the result waited. The GPU dispatcher had already read the reply and was sitting in `take_gil` until the Core ML call returned, with 872 samples in `take_gil` under coremltools and none with the GIL released.

A profile shows a correlation, so a 2×2 intervention tested for cause. Holding the GIL without running Core ML reproduced the delay. Running the same Core ML `predict` with the GIL released removed it. GPU return P50 fell from 7.67 to 0.14 ms.

That finding went upstream as <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>. It releases the GIL only around the native `predictionFromFeatures:` call and keeps `predict()` synchronous for its caller. It depends on a separate fix, apple/coremltools#2827 or #2829, for a NumPy-backed input released without the GIL. Until it merges and ships, released coremltools still holds the GIL for the whole native call, which is why 1.5 does not depend on it.

<div class="decision">

### Hold the other device's load fixed before calling something a cost

**Why:** Releasing the GIL appeared to cost the Neural Engine 13.5% of its throughput. The load generator was closed-loop, though, so the unblocked GPU had simply sent 44% more requests.

**Consequence:** When the GPU was replayed from one seeded arrival trace at 46.65 req/s, identical in every window, the difference fell to +0.1%. There was no measurable intrinsic cost at that load. The higher-load case was not re-tested.

</div>

## Removing the GIL was not enough

The GIL wait could be removed in four ways, and every one of them removed it:

1. a worker process;
2. a binding that released the GIL;
3. a prebound binding that cut Python–Objective-C crossings per forward from 108 to 4;
4. Core ML's official asynchronous API.

None of them passed the product mix. Process isolation failed its gate on both models, with the short-request P99 up 17.5% against a 5% limit. The GIL-released thread failed on all three models, and the cost moved to the Neural Engine's short-request stream. The prebound binding passed on two models under a heterogeneous-only protocol. Under the full protocol it stopped for futility at n = 12, with a short-request P99 of 1.409× the 1.4 path. Both verdicts are kept as recorded, each under its own protocol.

What the full protocol exposed was a second state. The heterogeneous windows fell into two groups: normal, at 10.4–12.3 ms, and slow, at 13.6–21.2 ms. In the slow state, the GPU thread's CPU time per forward rose from 1.8 to 6.1 ms. The native Core ML `predict` did not change: 9.67 ms slow, 9.62 ms normal. The host had slowed down, and the Neural Engine had not.

## The host slow state

Core ML's asynchronous API kept GPU return at 0.035 ms and throughput at or above the 1.4 path, and it still went slow in 2 of 3 windows. Taking those windows apart gave the slow state a time structure. It was an episode at the start of each overlap, lasting 0.8–3.4 s. Outside those episodes the asynchronous path beat 1.4, with a P99 of 10.4 against 11.9 ms.

Per-thread CPU counters then tied it to where the threads ran. During the transient, the Neural Engine dispatcher, the short-request client and the Core ML callback threads ran with an Efficiency-core share of 0.91–1.00. In steady state that share was 0.00, and the transient ended when they moved back to the Performance cores. It was not confined to one thread or process: the Neural Engine chain, the parent process's other threads and the GPU worker process were all on the Efficiency cores together, in all six transitions sampled.

Two scheduling interventions followed. A dependency QoS override and USER_INITIATED dispatcher QoS both took effect, with the QoS read back as 0x19, and neither moved a thread off the Efficiency cores. The QoS route was stopped there.

This is a strong correlation, not a proven cause. No study here shows why macOS placed the threads on the Efficiency cores.

## A static policy, falsified

If the slow state lived only at the start of an overlap, a guard could wait it out: run the first requests of each episode on the 1.4 path and hand off afterwards. Sixty-four requests (H64) avoided Efficiency-core residency at the handoff in all 10 screen transitions and all 16 confirmation transitions. The confirmation still recorded a FAIL, because its outlier guard came in at +2.43 ms against a +2.0 ms limit.

The production-runtime evaluation settled the question. One episode handed off normally at 0.73 s. About 4.7 s later it entered the slow state and stayed there until the window ended. A background process had been at 92% CPU before that run, and the preregistered rule did not excuse it, since background load is part of real use. The slow state was not only an onset effect, so a guard counted in requests could not be relied on to cover it. The route was closed, and 1.4 stayed the default.

<div class="decision">

### Detect the slow state instead of trying to prevent it

**Why:** No intervention prevented the slow state, and nobody had shown what triggers it. A policy built on a cause that has not been established ends up tuned to the runs that happened to be measured.

**Trade-off:** The runtime keeps the asynchronous benefit only while the host behaves. When it trips, the rest of that episode runs on the slower 1.4 path.

</div>

## Detect and fall back

The detector uses a signal the runtime already records: `prepare_ms` from `RequestTrace`, the host time spent before a Neural Engine request is routed. A request counts as host-slow above 0.3 ms, and the breaker, C3, trips on three host-slow requests in a row.

Replayed against every recorded asynchronous-family episode, C3 caught all 16 sustained slow episodes. The worst detection delay was 126 ms, and there were 4 false trips in 51 healthy episodes. C3 was chosen on that same data, so replay shows it can work but does not validate it. It was frozen before the controlled test that followed.

That test was preregistered. Without the breaker, the slow state appeared in 6 of 6 episodes. With it, the breaker tripped in 12 of 12, every time on a slow state that occurred naturally; none was induced. Each trip returned to sustained 1.4-level latency in 215 / 364 / 414 ms (median / P95 / worst), inside the 1.0 s limit, and throughput after fallback was 0.999× that of the 1.4 path.

## What shipped in 1.5

Adaptive execution is the default for laya and laya-typed-decisions under `execution="workers"` and `device="auto"`. Each overlap episode starts with 64 synchronous forwards on the 1.4 path. It then switches to prebound asynchronous Core ML under C3. On a trip, the rest of the episode runs on the 1.4 path, and the breaker re-arms when the episode ends. laya-multilingual keeps process placement and does not use it.

Validation ran 154 episodes across three phases, each against the 1.4 path:

- **laya product mix**, 12 episodes: GPU return 0.037 against 4.29 ms, throughput 1.042×;
- **typed-decisions, product and soak**, 78 episodes: 0.043 against 8.60 ms, 1.038×;
- **product-mix soak with bursts**, 64 episodes: 0.035 against 4.28 ms, 1.042×.

Every episode stayed on the asynchronous path, and none tripped. All three phases passed with no mismatch, routing failure, lost request or crash.

## Evidence and limits

- **One machine.** Every result comes from one M4 Max on one macOS version. Nothing is claimed for other Apple chips or macOS releases.
- **The shipped trip path has not yet fired in production.** No natural slow state occurred during validation. Recovery evidence comes from the controlled test, and unit tests match the shipped breaker against the research one.
- **Mid-episode recovery is unmeasured.** Every slow state in the controlled test began at overlap onset. Replay shows that C3 detects one starting mid-episode, the kind that closed the static policy, but not that recovery from it is bounded.
- **The detector threshold is validated on laya only.** For typed-decisions, validation checked for false trips instead.
- **The trigger is still open.** What starts the host slow state is unanswered. Its screen was preregistered and has never run.

<div class="evidence">

- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/README.md" target="_blank" rel="noopener noreferrer">Research map</a>: the 19 questions from 1.4 to 1.5, each linked to its study, evidence kind and verdict.
- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/coreml-gil-completion-path/README.md" target="_blank" rel="noopener noreferrer">GIL completion path</a>: the 2×2 intervention.
- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/coreml-adaptive-breaker/README.md" target="_blank" rel="noopener noreferrer">Adaptive breaker</a>: detector replay, the controlled recovery test, and production validation.
- <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>: releases the GIL during native `MLModel.predict()`.
- <a href="https://pypi.org/project/laya-apple/" target="_blank" rel="noopener noreferrer">laya-apple on PyPI</a>: the released runtime.

</div>
