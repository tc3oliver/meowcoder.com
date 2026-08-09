---
title: 'AI Coding Skills'
type: 'Open Source · Agent Engineering'
summary: 'Open-source workflow skills that help coding agents align requirements, create just-in-time implementation plans, apply repository-specific validation, and complete work against explicit criteria.'
outcome: 'Released under MIT, installable as an agent skill or Claude Code plugin, and used to build this site.'
indexMeta: 'MIT · backlog-workflow 1.2.0 · Unit Tested'
evidence: 'github.com/tc3oliver/skills · backlog-workflow 1.2.0, with its own unit tests'
slug: 'ai-coding-skills'
locale: 'en'
translationKey: 'ai-coding-skills'
order: 1
draft: false
meta:
  - label: 'Version'
    value: 'backlog-workflow 1.2.0'
  - label: 'License'
    value: 'MIT · bundled skills keep their own'
  - label: 'Requires'
    value: 'Backlog.md CLI · Python 3'
  - label: 'Install'
    value: 'Agent skill or Claude Code plugin'
---

## Problem

An agent that writes correct code is not the same as an agent that can be
trusted to deliver work. The unreliable part is the process around the code:
deciding when a requirement is settled enough to start, which validation
actually applies to this repository, what counts as finished, and when to stop
and ask instead of guessing.

Handed a specification and a repository in one long prompt, that process
collapses in a recognizable way. Implementation begins before the requirement is
agreed. A lint command the project does not have gets run and reported as
passing. The work is marked complete because the model's own output looked
right.

[AI Coding Skills](https://github.com/tc3oliver/skills) is the public collection
of skills I use to constrain that process. The approach is not a better prompt.
It is putting the boundaries into versioned files the agent has to read before
it acts, so the same rules apply to every task and survive into a new session.

The primary work in the collection is `backlog-workflow`: a development policy
and orchestration layer installed into a project on top of
[Backlog.md](https://backlog.md).

## Coding-Agent Failure Modes

The workflow is designed against a specific list of failures, each of which one
of its stages exists to close:

- implementation starts before the requirement is clear;
- a large requirement becomes one oversized coding session;
- implementation plans go stale between planning and execution;
- product behavior is silently reinterpreted during implementation;
- dependent work is executed in the wrong order;
- validation commands are guessed rather than verified;
- documentation is left unsynchronized;
- tasks are marked complete without meeting the defined conditions;
- autonomous execution continues where it should have stopped.

None of these is a model-capability problem, and none is fixed by a stronger
model. Each is a missing process boundary that can be enforced through
versioned project files.

## Workflow Architecture

Four layers, each with exactly one owner:

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">PRD / Specification</span>
<span class="state-flow__detail">Where product intent is written down.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Owns</span>What the product should do</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">backlog-workflow</span>
<span class="state-flow__detail">The one layer here that is my own work.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Owns</span>Execution modes, boundaries, completion conditions</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Backlog.md</span>
<span class="state-flow__detail">Used as published, not reimplemented.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Owns</span>Task schema, lifecycle, dependencies, completion records</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Coding agent</span>
<span class="state-flow__detail">Runs one task at a time.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Owns</span>Implementation, validation, PR, CI, review, merge</span>
</li>
</ol>
<figcaption class="state-flow__caption">Each layer owns exactly one thing and reads down, never up. A task cannot rewrite the requirement above it, and the agent cannot redefine the policy it runs under.</figcaption>
</figure>

<div class="decision">

### Build on Backlog.md rather than reimplement it

**Why** — Backlog.md already owns the task schema, lifecycle, Acceptance
Criteria, Definition of Done, Implementation Plan, notes, dependencies, and its
CLI and JSON interfaces. Reimplementing any of that would create a second source
of truth for it, and its canonical instructions stay authoritative instead.

**Consequence** — The workflow may add only what Backlog.md does not define:
execution modes, requirement authority, approval boundaries, blocker policy,
completion conditions, and deterministic task selection.

</div>

The lifecycle those layers govern runs in seven stages:

1. **Requirement** — requirement-driven development: a requirement source owns
   product intent, and a task may not quietly reinterpret it.
2. **Task decomposition** — Backlog.md integration: the requirement becomes
   tasks, dependencies, and Acceptance Criteria, and nothing else.
3. **Just-in-time planning** — the Implementation Plan is written at execution,
   against the repository as it exists at that moment.
4. **Implementation** — explicit execution boundaries, in manual or autonomous
   execution: one named task, and only what the requirement covers.
5. **Validation** — validation gates run the project's own detected commands,
   never an invented one.
6. **Completion** — explicit completion criteria, with validation results
   recorded in the task.
7. **Delivery** — PR, CI, review, merge.

Managing the agent instruction files all seven stages depend on is the
collection's second skill, and has its own section below.

Installing the workflow into a project writes a small, versioned surface:

```text
.agent-workflow/
├── VERSION
├── config.yml
├── WORKFLOW.md
├── TASK-POLICY.md
└── PROJECT.md

.claude/skills/
├── backlog-plan/
├── backlog-run/
├── backlog-auto/
└── grilling/
```

<div class="decision">

### Detect the project's commands, and record the missing ones as missing

**Why** — A lint or build command that merely looks plausible is exactly how a
run gets reported as passing against a check the project does not have.

**Consequence** — Installation discovers the Backlog.md CLI invocation, the
default branch, the requirement sources, and the setup, format, lint, typecheck,
test, and build commands, and writes them into `PROJECT.md`, which is
project-owned from then on. A command the project does not have is written down
as `not detected`, and the agent is required to report it unavailable rather
than substitute one that looks right.

</div>

A later `upgrade` refreshes the workflow-managed files while leaving that
project-owned configuration, the requirements, and existing tasks untouched.

## Requirement / Backlog Separation

Requirement sources own product intent. Backlog.md owns decomposition, status,
and completion records. The workflow does not let the two merge: a task may not silently
introduce, remove, or reinterpret a requirement, and a conflict has to be
resolved in the authoritative source before implementation continues.

Every task therefore carries a `Requirement source` field naming the document or
decision record it derives from.

<div class="decision">

### A choice that binds future tasks becomes a decision record first

**Why** — Without that rule, "the agent settled this at some point" quietly
becomes a requirement, and a `Requirement source` ends up citing a conversation
nobody can read.

**Consequence** — A choice confined to one task's implementation stays in that
task's record. A choice that binds future tasks, or that a `Requirement source`
would otherwise have nothing to cite, must first become a decision record —
Context, Decision, Consequences — before any task depending on it is created.

</div>

Before a task may enter an active status it passes a Task Ready Gate covering
requirement source, goal, scope, out of scope, stable constraints,
dependencies, objectively verifiable Acceptance Criteria, validation method,
test requirements, and security, data, API, documentation, and migration
impact. Missing product intent is a blocker. Engineering detail that can be
determined from the repository is not.

## JIT Planning

Decomposition and implementation planning are separated on purpose:

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">/backlog-plan</span>
<span class="state-flow__detail">Align the requirement, then decompose it. Reports the decomposition and stops.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Defines WHAT</span>Tasks, dependencies, Acceptance Criteria</span>
<span class="state-flow__part"><span class="state-flow__part-label">May not</span>Write an Implementation Plan, decide function-level design, write product code, set anything active</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">/backlog-run TASK-ID</span>
<span class="state-flow__detail">Research the codebase as it exists right now, then commit to an approach.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Defines HOW</span>The Implementation Plan, recorded before any code is written</span>
<span class="state-flow__part"><span class="state-flow__part-label">Then</span>Implementation, validation, completion</span>
</li>
</ol>
<figcaption class="state-flow__caption">What to build is settled at decomposition. How to build it is settled at execution, against the repository as it actually is by then.</figcaption>
</figure>

<div class="decision">

### Write the Implementation Plan at execution, not at decomposition

**Why** — A plan written at decomposition time describes a codebase that has
since moved. By the time a task near the end of a backlog is reached, an
approach proposed weeks earlier is routinely wrong about files that no longer
exist.

**Consequence** — `/backlog-plan` is forbidden from producing an Implementation
Plan at all, and `/backlog-run` writes one against the repository in front of
it. Recording the plan before coding stays mandatory: the workflow moves _when_
it is written, not _whether_.

</div>

## Execution Boundaries

`/backlog-run TASK-ID` executes exactly one named task and stops. It does not
select the next one.

<div class="decision">

### Invoking the task is the approval

**Why** — The approval boundary should be stated rather than left to the
agent's judgment. Invoking `/backlog-run TASK-ID` authorizes that task through
just-in-time planning, implementation, and validation, so the agent records its
plan and proceeds instead of pausing to have its own plan approved.

**Trade-off** — This is a deliberate override of the upstream recommendation to
wait for plan approval, and it removes the human checkpoint between the plan and
the code. The boundary is drawn narrowly to compensate: what the agent still may
not do is decide something the requirement does not cover.

</div>

Autonomous execution stops only when it cannot proceed safely—for example,
because requirements conflict, required access or an external service is
missing, or an irreversible decision has no authoritative basis. Incomplete
dependencies, changes that cannot be isolated, and defects that materially
exceed the task scope are handled as blockers as well.

<div class="decision">

### Write the blocker list in both directions

**Why** — An agent that stops for implementation patterns, code navigation,
task-scoped refactoring, test fixes, or reversible engineering choices is as
unusable as one that never stops.

**Consequence** — The policy states both the conditions that require a stop and
the engineering choices that explicitly do not, making the execution boundary
clear in both directions.

</div>

Scope discipline belongs to the same boundary: unrelated cleanup is not mixed
into a task, cleanup required for correctness is, and broad cleanup discovered
during execution becomes a separate task.

## Validation & Completion

A task may be marked `Done` only when four conditions hold:

1. Acceptance Criteria all pass;
2. required applicable tests, lint, typecheck, and build pass;
3. documentation and the Requirement Matrix are synchronized;
4. validation results are recorded in the task.

Writing code satisfies none of them on its own.

<div class="decision">

### Bind the four conditions into each task's own Definition of Done

**Why** — A policy that lives only in a workflow document is bypassed by any
task that predates it or was created outside it.

**Consequence** — The four conditions become checkable items in each task's
native Definition of Done, and both execution skills re-read the task before
coding and append any item that is missing.

</div>

The other half of making this enforceable is refusing to invent checks: a check
the project does not have is recorded as unavailable or not applicable, which
removes the incentive to manufacture a passing-looking log.

## Manual vs Autonomous Mode

The default mode is manual. Autonomous execution must be explicitly invoked
rather than enabled as a global setting.

<figure class="mode-flow" aria-label="Manual and autonomous execution flows">
<div class="mode-flow__track">
<span class="mode-flow__label">Manual</span>
<ol class="mode-flow__steps" role="list">
<li>Decompose requirement</li>
<li>Run named task</li>
<li>Validate and stop</li>
</ol>
</div>
<div class="mode-flow__track">
<span class="mode-flow__label">Autonomous</span>
<ol class="mode-flow__steps" role="list">
<li>Select ready task</li>
<li>Complete and validate</li>
<li>Query again</li>
</ol>
</div>
<figcaption class="mode-flow__caption">Manual mode handles one named task. Autonomous mode re-queries after each completed task until no work is executable or a blocker is reached.</figcaption>
</figure>

`/backlog-plan` handles decomposition, `/backlog-run` executes a named task, and
`/backlog-auto` starts continuous execution.

Autonomous selection reads structured task data, filters for dependency-ready
work, and applies priority and task ID to produce a deterministic order. It
re-queries after every completed task rather than retaining an in-memory queue.

<div class="decision">

### At an unresolved product decision, automatic mode stops instead of choosing

**Why** — The two modes differ in exactly one respect, and this is it. Manual
mode can ask, through a structured one-question-at-a-time interview, and record
the outcome. Automatic mode has nobody to ask.

**Consequence** — Automatic mode never asks: it records the available context in
the task, reports it blocked, and stops. It may still make reversible engineering
decisions supported by the repository.

</div>

Parallelism is a further opt-in. Independent, dependency-ready tasks run in
isolated `git worktree` environments, while selection and claiming remain
sequential to prevent duplicate ownership and preserve deterministic merge order.

## Trade-offs

The costs are real and worth stating plainly.

- **Per-task overhead.** Requirement alignment, a just-in-time plan, recorded
  validation results, and a final summary is a great deal of ceremony for a one-line fix.
  The workflow's own guidance is to skip task creation entirely for questions,
  lookups, and obvious mechanical edits.
- **Narrow by design.** It targets Backlog.md and a slash-command agent, and
  requires the Backlog.md CLI and Python 3. It is not a general agent framework,
  and that narrowness is what lets the policy be specific enough to enforce.
- **Instruction files cost context.** Every rule is loaded before work starts,
  which is exactly why the collection's second skill exists: an instruction set
  that is not maintained becomes expensive noise.
- **Parallel execution can waste work.** Independent tasks in separate modules
  parallelize well; tasks likely to touch the same files pay for merge
  conflicts. The documented guidance is to start at `2` and watch how often
  merges collide before going higher.
- **Determinism over cleverness.** Priority, then lowest task ID, is not the
  smartest possible ordering. It is a reproducible one, which matters more when
  the executor itself is nondeterministic.

## Context Quality — audit-claude-md

`backlog-workflow` depends on instruction files the agent reads on every task,
and that dependency has a failure mode of its own. A `CLAUDE.md` accumulates
directory trees that went stale, progress notes from three months ago, rules
that apply to only one subdirectory, and unverifiable requests like "write good
code" — and all of it loads into context on every single task.

`audit-claude-md` is the secondary public skill in the collection, and it is
where instruction design and the long-term maintainability of those files are
addressed directly. It reviews every rule individually — every paragraph and
bullet, with multi-requirement bullets split into atomic rules first — and gives
each one exactly one disposition: keep it at the root; move it to a narrower
path; extract it into a skill; move it into real documentation; rewrite it;
delete it; or flag it as an enforcement gap, where a hard prohibition exists only
as prose and a hook, CI check, or linter belongs instead.

Three design decisions carry the weight. It acts on each rule rather than
returning a list of suggestions. Extracting to a skill or a document is
progressive disclosure — detail leaves always-loaded context for somewhere the
agent loads only when the task calls for it, and the skill explicitly rejects
`@file` imports as a way to fake that, since an imported file still enters the
startup context. Deletion is deliberately conservative: "findable in the code"
is not sufficient grounds on its own, and anything that looks like important
tacit knowledge but cannot be verified from the repository is kept and listed
for human review.

Its write scope is bounded to instruction files. `AGENTS.md` and other agents'
instruction files are read but never written — used only to detect rules that
conflict, which are reported for a human to resolve. It is user-invoked only,
because it edits files, and it checks `git status` first so its own diff cannot
be confused with uncommitted work of yours.

## Open Source Implementation

All of it lives in one public repository:

<div class="evidence">

- [`github.com/tc3oliver/skills`](https://github.com/tc3oliver/skills) — the
  collection, MIT licensed.
- [`backlog-workflow/`](https://github.com/tc3oliver/skills/blob/main/backlog-workflow/README.md)
  — version `1.2.0`: the installer and its project-discovery logic, the workflow
  specification templates (`WORKFLOW.md`, `TASK-POLICY.md`, `config.yml`), the
  three project skills, and the installer's own unit tests and package validator
  (`python3 -m unittest discover -s tests`,
  `python3 scripts/validate_package.py`).
- [`audit-claude-md/`](https://github.com/tc3oliver/skills/blob/main/audit-claude-md/README.md)
  — the instruction auditor described above: context quality, instruction
  design, progressive disclosure, and the maintainability of coding-agent
  instructions.

</div>

It installs either as agent skills (`npx skills add tc3oliver/skills`) or as a
Claude Code plugin (`/plugin marketplace add tc3oliver/skills`).

The workflow is not only published — it is also the process used to build this
site. The skills collection is the primary open-source project; the site's source
repository shows how it is applied in a production project.

## Attribution

`backlog-workflow` and `audit-claude-md` are my own work, released under the MIT License.
The bundled `grilling` skill is adapted from Matt Pocock, as are
`diagnosing-bugs`, `writing-for-agents`, and `resolving-merge-conflicts` from
[`mattpocock/skills`](https://github.com/mattpocock/skills). Each retains its
original MIT license and attribution in its own directory and installed files.
