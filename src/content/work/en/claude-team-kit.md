---
title: 'Claude Team Kit'
type: 'Open Source · Agent Tooling'
summary: 'A Claude Code plugin that caps native Agent Teams teammates and adds a read-only Mission Control pane for workers, task dependencies, and usage.'
outcome: 'A teammate spawn above the worker limit is refused and its task stays pending. The limit counts native teammates only.'
indexMeta: 'Public preview · Claude Code plugin · MIT'
evidence: 'github.com/tc3oliver/claude-team-kit · docs/LIMITATIONS.md and the verification record in docs/REVIEW.md'
slug: 'claude-team-kit'
locale: 'en'
translationKey: 'claude-team-kit'
order: 5
draft: false
meta:
  - label: 'Status'
    value: 'Public preview'
  - label: 'Runs on'
    value: 'Claude Code Agent Teams and Mods'
  - label: 'Tested interactively on'
    value: 'macOS'
---

Independently designed and built by Oliver Yu.

## The problem

Claude Code's Agent Teams let one lead session hand work to several teammates, which are separate sessions sharing a task list. Claude Code documents no setting that limits how many teammates are alive at once, and while a team runs there is little to see beyond the transcript.

<a href="https://github.com/tc3oliver/claude-team-kit" target="_blank" rel="noopener noreferrer">Claude Team Kit</a> (CTK) is a plugin that adds a limit and a view. It does not add a scheduler; Claude Code still runs the team.

## What it does

- **Worker limit.** The default is 5, settable from 1 to 12. A teammate spawn above the limit is refused with `TEAM_CAPACITY_REACHED` and its task stays pending. If the roster cannot be read, the spawn is refused with `TEAM_GUARD_FAILED` rather than allowed.
- **Mission Control.** A read-only pane opened from a line above the prompt. It shows workers, the task dependency graph, and usage, and it never starts, stops, or changes anything. A figure CTK could not observe reads `unavailable`, never a made-up zero.
- **Usage HUD.** A team line above the prompt with the model, 5-hour and weekly usage, agents against the limit, tasks, and cost. It reads only what Claude Code passes it.
- **Review and debugging.** `/ctk:review` scales reviewer depth to the risk of the change; `/ctk:debug` asks for a failing reproduction before a fix.
- **Portable configuration.** Options are set through the plugin manager; an optional CLI syncs a profile between machines through your own git repository, with a secrets scan before every publish.

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Plan</span>
<span class="state-flow__detail">The lead cuts the goal into tasks that can each be verified alone.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Coordinate</span>
<span class="state-flow__detail">Dependencies decide which tasks are ready; only ready tasks start.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Execute</span>
<span class="state-flow__detail">Teammates work in parallel, up to the limit; the mod refuses the rest.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Verify</span>
<span class="state-flow__detail">The lead runs the final check before calling the goal done.</span>
</li>
</ol>
<figcaption class="state-flow__caption">The four steps of a CTK team. Claude Code provides the team and its task list, a skill the model follows guides the lead, and only the plugin's mod, a hook on `agent.spawn`, enforces anything: the limit.</figcaption>
</figure>

<figure class="shot">
<img src="/images/claude-team-kit/mission-control.svg" width="1040" height="752" alt="Terminal recording of a Claude Code session with a three-worker team on the left and the Mission Control pane docked on the right, showing slots, workers, tasks, and usage." loading="lazy" decoding="async">
<figcaption class="shot__caption">Mission Control docked beside a team of three workers. A recording by the maintainers.</figcaption>
</figure>

## Evidence and limits

The README calls this a public preview, and `docs/LIMITATIONS.md` lists what is unverified, with an evidence level for each claim: run live, reported by the maintainers, covered by tests, read in code only, or not verified.

<figure class="shot">
<img src="/images/claude-team-kit/limit-refusal.svg" width="1040" height="680" alt="Terminal recording of a Claude Code session in which a teammate spawn is refused with TEAM_CAPACITY_REACHED, live=3 and max=3." loading="lazy" decoding="async">
<figcaption class="shot__caption">A recording by the maintainers with the limit at 3. Two finished teammates still held slots, so the next spawn was refused.</figcaption>
</figure>

- Agent Teams are experimental, and Mods, which carry the limit and the team line, are early access. A Claude Code update can break either without any change to CTK. Where Mods are missing, `/ctk:team` says the limit is off.
- The limit counts native teammates only. Ordinary subagents are neither counted nor limited, and it caps how many teammates are alive, not what they spend.
- The independent verification used simulated-host tests and mutation checks, and one live probe with a limit of 1, run once on one Claude Code version. The extra teammate spawns were refused.
- The maintainers also report a live run of six concurrent spawns against a limit of three, with three started and three refused. That result is reported, not reproduced.
- The independent live probe also found a bypass: a named spawn that Claude Code does not treat as a teammate, for example one with `isolation: worktree`, starts above the limit. The guard cannot refuse it and only counts it.
- The `/ctk:team` workflow has not been run end to end with live agents.
- A refused spawn can still be drawn as "Done" in the transcript. The skill treats the refusal text as not started, but it is a skill, so a model can still misread it.
- Interactive use was tested on macOS. Linux and Windows are covered by CI only.
- The README makes no speed, cost, or token-saving claim.

<div class="evidence">

- <a href="https://github.com/tc3oliver/claude-team-kit" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/claude-team-kit</code></a>
  — the plugin, the optional CLI, and the changelog.
- <a href="https://github.com/tc3oliver/claude-team-kit/blob/main/docs/LIMITATIONS.md" target="_blank" rel="noopener noreferrer"><code>docs/LIMITATIONS.md</code></a>
  — what CTK cannot do and what has not been verified.
- <a href="https://github.com/tc3oliver/claude-team-kit/blob/main/docs/REVIEW.md" target="_blank" rel="noopener noreferrer"><code>docs/REVIEW.md</code></a>
  — the verification record: design decisions, how to reproduce each check, and the mutation results.
- <a href="https://github.com/tc3oliver/claude-team-kit/releases" target="_blank" rel="noopener noreferrer">Releases</a>
  — the published pre-releases.

</div>
