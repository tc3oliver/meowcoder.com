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

<a href="https://github.com/tc3oliver/laya-apple" target="_blank" rel="noopener noreferrer">laya-apple</a> is concurrent MLX GPU + Neural Engine serving on one Mac: long requests go to the GPU, short ones to the Apple Neural Engine through Core ML.

- **GPU result return, 7.67 → 0.14 ms (P50)** in a causal intervention on the GIL.
- **4.28–8.60 → 0.035–0.043 ms in production validation**: laya-apple 1.5 against the 1.4 path, at 1.038–1.042× its throughput.
- **12 of 12 slow episodes recovered**, the worst in 414 ms, against a preregistered limit of 1.0 s.
- **154 production validation episodes**, with zero output mismatches, routing failures, lost requests or crashes.

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

## The problem

The two devices were supposed to work in parallel. Short requests would stop queueing behind long GPU work, and the GPU would carry on as before. It did not: with the Neural Engine on a thread beside it, GPU service time on typed-decisions rose by 1.04–1.64×, while the Neural Engine itself was barely affected.

That left four suspects: the GPU, the Neural Engine, Python, or the runtime around them. In what follows, an episode is one period in which the GPU and the Neural Engine serve at the same time. Each one implies a different fix, and without a measurement there was no way to choose between them.

## Finding the GIL

The GPU came off the list first. MLX `mx.eval` time rose by at most 1.04× in 15 of 16 GPU streams, so GPU compute was barely slower.

The runtime already recorded a `RequestTrace` for every request, and it placed the delay in the GPU reply leg, lined up with the end of the Neural Engine's `predict` call. The return leg grew from 0.05 to 7.41 ms, 91.1% of the added occupancy. The GPU had finished its work; the result was waiting.

A thread profile showed what it was waiting for. The GPU dispatcher had already read the reply and sat in `take_gil` until the Core ML call returned: 872 samples in `take_gil` under coremltools, none with the GIL released.

A profile shows correlation, so a 2×2 intervention tested for cause. Holding the GIL without running Core ML reproduced the delay. Running the same Core ML `predict` with the GIL released removed it. GPU return P50 fell from 7.67 to 0.14 ms.

## Taking it upstream

The GIL hold is not specific to laya-apple. Any Python process that runs synchronous Core ML prediction on one thread while other threads need the interpreter can hit the same wait. A workaround inside this runtime would not help other coremltools users, so the fix was proposed to the framework: <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>.

The change releases the GIL only around the native `predictionFromFeatures:` call and keeps `predict()` synchronous for its caller, with a threading regression test. It depends on a separate fix, apple/coremltools#2827 or #2829, for a NumPy-backed input being released without the GIL. It is open, and until it merges and ships, released coremltools still holds the GIL for the whole native call. 1.5 therefore does not depend on it.

## Fixing the GIL wasn't enough

The GIL wait could be removed in four ways, and every one of them removed it:

1. a worker process;
2. a binding that released the GIL;
3. a prebound binding that cut Python–Objective-C crossings per forward from 108 to 4;
4. Core ML's official asynchronous API.

None of them could be made safe on the product mix. Process isolation failed its gate on both models: laya's short-request P99 rose 17.5% against a 5% limit, and typed-decisions' rose 73.3%. The GIL-released thread failed on all three models, and the cost moved to the Neural Engine's short-request stream. The prebound binding passed on two models under a heterogeneous-only protocol, but the GIL-released thread, which had failed, passed under that protocol too. Under the full protocol the prebound binding stopped for futility at n = 12, with a short-request P99 of 1.409× the 1.4 path. Core ML's asynchronous API still went slow in its screen, described below. It stayed the candidate fast path, but not as a fix.

Those results are kept as recorded. The prebound PASS and FAIL each stand under the protocol that produced them, and neither was rewritten after the fact.

<div class="decision">

### Hold the other device's load fixed before calling something a cost

**Why:** Releasing the GIL appeared to cost the Neural Engine 13.5% of its throughput. The load generator was closed-loop, though, so the unblocked GPU had simply sent 44% more requests.

**Consequence:** When the GPU was replayed from one seeded arrival trace at 46.65 req/s, identical in every window, the difference fell to +0.1%. There was no measurable intrinsic cost at that load. The higher-load case was not re-tested.

</div>

## The host slow state

The full protocol exposed a second state. Heterogeneous windows fell into two groups by short-request P99: normal, at 10.4–12.3 ms, and slow, at 13.6–21.2 ms. In the slow state the GPU thread's CPU time per forward rose from 1.8 to 6.1 ms. The native Core ML `predict` did not change: 9.67 ms slow, 9.62 ms normal. The host had slowed down, and the Neural Engine had not.

Core ML's asynchronous API kept GPU return at 0.035 ms and throughput at or above the 1.4 path, and still went slow in 2 of 3 windows. A post-hoc analysis of those windows gave the state a time structure: an episode at the start of each overlap, lasting 0.8–3.4 s. Outside those episodes the asynchronous path beat 1.4, with a P99 of 10.4 against 11.9 ms.

Per-thread CPU counters tied it to where the threads ran. During the transient, the Neural Engine dispatcher, the short-request client and the Core ML callback threads ran with an Efficiency-core share of 0.91–1.00. In steady state that share was 0.00, and the transient ended when they moved back to the Performance cores. It was not confined to one thread or process: the Neural Engine chain, the parent process's other threads and the GPU worker process were on the Efficiency cores together in all six transitions sampled (also post-hoc).

Two scheduling interventions followed. A dependency QoS override and USER_INITIATED dispatcher QoS both took effect, with the QoS read back as 0x19, and neither moved the Neural Engine dispatcher off the Efficiency cores. The QoS route stopped there.

This is a strong correlation, not a proven cause. No study here shows why macOS placed the threads on the Efficiency cores, and this page does not guess.

## From prevention to recovery

If the slow state only happened at the start of an overlap, a guard could wait it out: run each episode's first requests on the 1.4 path and hand off afterwards. At 64 requests (H64), the handoff avoided Efficiency-core residency in all 10 screen transitions and all 16 confirmation transitions. Its confirmation still failed an outlier guard, at +2.43 ms against a +2.0 ms limit, and that FAIL stands.

The production-runtime evaluation falsified it. One episode handed off normally at 0.73 s, entered the slow state about 4.7 s later, and stayed there until the window ended. A background process had been at 92% CPU before that run. The preregistered rule did not excuse it, since background load is part of real use. The slow state was not only an onset effect, so a guard counted in requests could not cover it. The route was closed, and 1.4 stayed the default.

That ended the attempt to predict the macOS scheduler. The question changed from how to prevent the slow state to how quickly the runtime could notice it and get out.

The runtime already recorded a usable signal. `RequestTrace` had been added as observability, to show where a request's time went, and one of its fields, `prepare_ms`, is the host time spent before a Neural Engine request is routed. Above 0.3 ms a request counts as host-slow. The breaker, C3, trips on three host-slow requests in a row and sends the rest of the episode back to the 1.4 path.

- **Replay.** Against every recorded asynchronous-family episode, C3 caught all 16 sustained slow episodes. The worst detection delay was 126 ms, with 4 false trips in 51 healthy episodes. C3 was chosen on that same data, so replay shows it can work but does not validate it. It was frozen before the next test.
- **Controlled recovery.** That test was preregistered. Without the breaker, the slow state appeared in 6 of 6 episodes. With it, the breaker tripped in 12 of 12, every time on a slow state that occurred naturally; none was induced. Each trip returned to sustained 1.4-level latency in 215 / 364 / 414 ms (median / P95 / worst), and throughput after fallback was 0.999× that of the 1.4 path.

<div class="decision">

### Detect the slow state instead of trying to prevent it

**Why:** No intervention prevented it, and nobody had shown what triggers it. A policy built on an unestablished cause ends up tuned to the runs that happened to be measured.

**Trade-off:** The runtime keeps the asynchronous benefit only while the host behaves. After a trip, the rest of that episode runs on the slower 1.4 path.

</div>

## What shipped in 1.5

Adaptive execution is the default for laya and laya-typed-decisions under `execution="workers"` and `device="auto"`. Each overlap episode starts with 64 synchronous forwards on the 1.4 path, then switches to prebound asynchronous Core ML under C3. On a trip, the rest of the episode runs on the 1.4 path, and the breaker re-arms when the episode ends. laya-multilingual keeps process placement and does not use it.

Validation ran 154 episodes in three phases, each against the 1.4 path:

- **laya product mix**, 12 episodes: GPU return 0.037 against 4.29 ms, throughput 1.042×;
- **typed-decisions, product and soak**, 78 episodes: 0.043 against 8.60 ms, 1.038×;
- **product-mix soak with bursts**, 64 episodes: 0.035 against 4.28 ms, 1.042×.

All three phases passed, with no output mismatch, routing failure, lost request or crash.

No natural slow state occurred during validation, so the breaker never tripped, and the shipped trip path has not yet fired in production. The recovery evidence is the controlled test above. Unit tests match the shipped breaker against the research one.

## Method

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Observe</span>
<span class="state-flow__detail">GPU tail latency rises when the Neural Engine runs beside it.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Instrument</span>
<span class="state-flow__detail">A per-request trace of every leg, not only the total.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Isolate</span>
<span class="state-flow__detail">Compute is unchanged; the reply leg is waiting in take_gil.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Intervene</span>
<span class="state-flow__detail">A 2×2 on the GIL and Core ML makes it causal.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Deconfound</span>
<span class="state-flow__detail">A fixed arrival trace removes an apparent 13.5% cost.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Falsify</span>
<span class="state-flow__detail">A guard that avoided the onset slow state fails in the real runtime.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Detect</span>
<span class="state-flow__detail">The debugging trace becomes an online signal.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Recover</span>
<span class="state-flow__detail">Fall back to the known-safe path within 414 ms.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Ship</span>
<span class="state-flow__detail">A default in 1.5, validated over 154 episodes.</span>
</li>
</ol>
<figcaption class="state-flow__caption">Several studies along the way ended in FAIL, and all of them remain on record.</figcaption>
</figure>

The useful outcome was a clear line between what was understood and what was not. The GIL is a proven cause, and the fix is proposed upstream. The Efficiency-core residency is a correlation, so the runtime was built not to depend on explaining it: it measures the symptom it can observe and limits how long a user sees it.

## Evidence and limits

- **One machine.** Every result comes from one M4 Max on one macOS version. Nothing is claimed for other Apple chips or macOS releases.
- **Mid-episode recovery is unmeasured.** Every slow state in the controlled test began at overlap onset. Replay shows that C3 detects one starting mid-episode, the kind that falsified the static guard, but not that recovery from it is bounded.
- **The residency data covers only laya's own two processes.** It is not shown system-wide.
- **The detector threshold is validated on laya only.** For typed-decisions, validation checked for false trips instead.
- **The trigger is still open.** What starts the host slow state is unanswered. Its screen was preregistered and has never run.

<div class="evidence">

- <a href="https://github.com/tc3oliver/laya-apple/blob/main/research/README.md" target="_blank" rel="noopener noreferrer">Research map</a>: the 19 questions from 1.4 to 1.5, each linked to its study, evidence kind and verdict.
- <a href="https://github.com/tc3oliver/laya-apple/pull/46" target="_blank" rel="noopener noreferrer">#46</a> (GIL intervention), <a href="https://github.com/tc3oliver/laya-apple/pull/51" target="_blank" rel="noopener noreferrer">#51</a> (fixed-load deconfounding), <a href="https://github.com/tc3oliver/laya-apple/pull/88" target="_blank" rel="noopener noreferrer">#88</a> (host slow state), <a href="https://github.com/tc3oliver/laya-apple/pull/96" target="_blank" rel="noopener noreferrer">#96</a> (Efficiency-core residency), <a href="https://github.com/tc3oliver/laya-apple/pull/103" target="_blank" rel="noopener noreferrer">#103</a> (static guard falsified), <a href="https://github.com/tc3oliver/laya-apple/issues/104" target="_blank" rel="noopener noreferrer">#104</a> (detector and recovery), <a href="https://github.com/tc3oliver/laya-apple/pull/105" target="_blank" rel="noopener noreferrer">#105</a> (1.5 validation).
- <a href="https://github.com/apple/coremltools/pull/2876" target="_blank" rel="noopener noreferrer"><code>apple/coremltools#2876</code></a>: releases the GIL during native `MLModel.predict()`.
- <a href="https://github.com/tc3oliver/laya-apple" target="_blank" rel="noopener noreferrer">laya-apple on GitHub</a> and <a href="https://pypi.org/project/laya-apple/" target="_blank" rel="noopener noreferrer">on PyPI</a>: the runtime itself.

</div>
