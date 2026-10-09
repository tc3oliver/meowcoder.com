---
title: 'Claude Team Kit'
type: 'Open Source · Agent Tooling'
summary: 'A Claude Code plugin that puts a hard limit on Agent Teams teammates and adds a read-only Mission Control pane for workers, task dependencies, and usage.'
outcome: 'A spawn above the worker limit is refused and its task stays pending. The limit counts native teammates only.'
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

Claude Code's Agent Teams let one lead session hand work to several teammates, which are separate sessions sharing a task list. Claude Code documents no setting that limits how many teammates are alive at once, and while a team runs there is little to look at except the transcript: who is working on what, which tasks wait on which, and how much of the usage window is gone.

<a href="https://github.com/tc3oliver/claude-team-kit" target="_blank" rel="noopener noreferrer">Claude Team Kit</a> (CTK) is a plugin that adds a limit and a view. It does not add a scheduler; Claude Code still runs the team.

## What it does

- **Hard worker limit.** The default is 5, settable from 1 to 12. A teammate spawn above the limit is refused with `TEAM_CAPACITY_REACHED` and its task stays pending. If the roster cannot be read, the spawn is refused with `TEAM_GUARD_FAILED` rather than allowed.
- **Mission Control.** A read-only pane opened from a line above the prompt. It shows workers, the task dependency graph, and usage, and it never starts, stops, or changes anything. A figure CTK could not observe reads `unavailable`, never a made-up zero.
- **Usage HUD.** A team line above the prompt with the model, 5-hour and weekly usage, agents against the limit, tasks, and cost. It reads only what Claude Code passes it, with no network or model calls.
- **Risk-based review.** `/ctk:review` scales reviewer depth to the risk of the change.
- **Debugging workflow.** `/ctk:debug` asks for a failing reproduction before a fix.
- **Portable configuration.** Options are set through the plugin manager, and an optional CLI syncs a profile between machines through a git repository you own, with a secrets scan before every publish.

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
<figcaption class="state-flow__caption">The four steps of a CTK team. Claude Code provides the team and its task list, a skill guides the lead, and the plugin's mod enforces the limit.</figcaption>
</figure>

## Who does what

CTK separates three layers and labels each claim with one. Claude Code itself provides the team, the shared task list, and the rule that a task with open blockers cannot be claimed. CTK's skills are Markdown procedures that the model reads and follows. CTK's mod, a hook on `agent.spawn`, is the only part that enforces anything, and what it enforces is the limit on teammate spawns.

## Evidence and limits

The README calls this a public preview, and `docs/LIMITATIONS.md` lists what is unverified, with an evidence level for each claim: run live, reported by the maintainers, covered by tests, read in code only, or not verified.

- Agent Teams are experimental, and Mods, which carry the limit and the team line, are early access. A Claude Code update can break either without any change to CTK. Where Mods are missing, `/ctk:team` says the limit is off.
- The limit counts native teammates only. Ordinary subagents are neither counted nor limited, and it caps how many teammates are alive, not what they spend.
- The maintainers ran one live probe: six concurrent spawns against a limit of three started three and refused three. That result is reported, not reproduced; the independent verification covered the limit with simulated-host tests and mutation checks, and no live run.
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
