---
title: 'AI Coding Skills'
type: 'Open Source · Agent Engineering'
summary: 'Published workflow skills that give coding agents an explicit requirement boundary, just-in-time implementation plans, and evidence-based completion.'
slug: 'ai-coding-skills'
locale: 'en'
translationKey: 'ai-coding-skills'
order: 1
draft: false
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
- tasks are marked complete without evidence;
- autonomous execution continues where it should have stopped.

None of these is a model-capability problem, and none is fixed by a stronger
model. Each one is a missing boundary, which makes it an engineering problem
with a file-shaped answer.

## Workflow Architecture

Four layers, each with exactly one owner:

```text
PRD / Specification    product intent
        ↓
backlog-workflow       development policy and orchestration
        ↓
Backlog.md             tasks, status, dependencies, evidence
        ↓
Coding agent           implementation → validation → PR → CI → review → merge
```

`backlog-workflow` deliberately does not reimplement Backlog.md. Backlog.md owns
the task schema, lifecycle, Acceptance Criteria, Definition of Done,
Implementation Plan, notes, dependencies, and its CLI and JSON interfaces; its
canonical instructions stay the single source of truth for all of that. The
workflow adds only what Backlog.md has no opinion on: execution modes,
requirement authority, approval boundaries, blocker policy, completion
conditions, and deterministic task selection.

Installing it into a project writes a small, versioned surface:

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

Installation runs project discovery rather than assuming a stack. The Backlog.md
CLI invocation, default branch, requirement sources, and the setup, format,
lint, typecheck, test, and build commands are detected and written into
`PROJECT.md`, which then becomes project-owned. A command the project does not
have is recorded as `not detected`, and the agent is required to report it as
unavailable rather than substitute one that looks plausible. `upgrade` later
refreshes the workflow-managed files while leaving that project-owned
configuration, the requirements, and existing tasks untouched.

## Requirement / Backlog Separation

Requirement sources own product intent. Backlog.md owns decomposition, status,
and evidence. The workflow does not let the two merge: a task may not silently
introduce, remove, or reinterpret a requirement, and a conflict has to be
resolved in the authoritative source before implementation continues.

Every task therefore carries a `Requirement source` field naming the document or
decision record it derives from. Where a decision is reached in conversation
rather than in a document, the policy forces the split explicitly:

- a choice confined to one task's implementation stays in that task's record;
- a choice that binds future tasks, or that a `Requirement source` would
  otherwise have nothing to cite, must first become a decision record —
  Context, Decision, Consequences — before any task depending on it is created.

That rule is what keeps "the agent settled this at some point" from quietly
becoming a requirement.

Before a task may enter an active status it passes a Task Ready Gate covering
requirement source, goal, scope, out of scope, stable constraints,
dependencies, objectively verifiable Acceptance Criteria, validation method,
test requirements, and security, data, API, documentation, and migration
impact. Missing product intent is a blocker. Engineering detail that can be
determined from repository evidence is not.

## JIT Planning

Decomposition and implementation planning are separated on purpose:

```text
/backlog-plan
    ↓ define WHAT: tasks, dependencies, Acceptance Criteria

/backlog-run TASK-ID
    ↓ research the current codebase
    ↓ decide HOW, record it, then implement
```

`/backlog-plan` aligns the requirement and decomposes it into tasks, and is
explicitly forbidden from producing an Implementation Plan, deciding
function-level design, writing product code, or setting anything active. It
reports the decomposition and stops.

The Implementation Plan is written just in time by `/backlog-run`, against the
repository as it exists at execution. A plan written at decomposition time
describes a codebase that has since moved: by the time a task near the end of a
backlog is reached, an approach proposed weeks earlier is routinely wrong about
files that no longer exist. Recording the plan before coding stays mandatory —
the workflow moves _when_ it is written, not _whether_.

## Execution Boundaries

`/backlog-run TASK-ID` executes exactly one named task and stops. It does not
select the next one.

The approval boundary is stated rather than left to the agent's judgment.
Invoking `/backlog-run TASK-ID` authorizes that task through just-in-time
planning, implementation, and validation, so the agent records its plan and
proceeds instead of pausing to have its own plan approved. This is a deliberate
override of the upstream recommendation to wait for plan approval, and it is
narrow: what the agent still may not do is decide something the requirement does
not cover.

Stopping is restricted to six conditions:

1. contradictory product requirements or Acceptance Criteria;
2. a missing permission, credential, external service, or hardware;
3. existing uncommitted changes overlapping the task that cannot be safely
   isolated;
4. an incomplete task dependency;
5. an irreversible product, data, or architecture decision with no authoritative
   source;
6. a newly discovered critical defect whose safe resolution materially exceeds
   the task's scope.

Implementation patterns, code navigation, task-scoped refactoring, test fixes,
and reversible engineering choices are explicitly _not_ blockers. An agent that
stops for those is as unusable as one that never stops, so the list is written
in both directions.

Scope discipline belongs to the same boundary: unrelated cleanup is not mixed
into a task, cleanup required for correctness is, and broad cleanup discovered
during execution becomes a separate task.

## Validation & Evidence

A task may be marked `Done` only when four conditions hold:

1. Acceptance Criteria all pass;
2. required applicable tests, lint, typecheck, and build pass;
3. documentation and the Requirement Matrix are synchronized;
4. the task record contains validation evidence.

Writing code satisfies none of them on its own.

Two details make this enforceable rather than aspirational. First, the four
conditions are bound into each task's native Definition of Done as checkable
items, and both execution skills re-read the task before coding and append any
missing item — so a task created before the policy existed, or created outside
the workflow, cannot bypass it. Second, a check the project does not have is
recorded as unavailable or not applicable instead of being invented, which
removes the incentive to manufacture a passing-looking log.

## Manual vs Autonomous Mode

The default mode is manual, and autonomy is opted into per invocation rather
than configured globally:

- `/backlog-plan <requirement>` — aligns the requirement and decomposes it into
  tasks. No product code, no Implementation Plan.
- `/backlog-run <TASK-ID>` — executes exactly one named task, then stops.
- `/backlog-auto [TASK-ID]` — continuous execution, and only on explicit
  invocation.

"Continue", "keep going", and "continue development" do not start autonomous
execution. Only `/backlog-auto` does.

Autonomous selection is deterministic and reads structured data, never parsed
Markdown: query the task list as JSON, exclude tasks that are not executable and
tasks whose blocking dependencies are incomplete, apply priority, break ties on
the lowest numeric task ID, execute one task, finalize it completely, then
re-query. No in-memory queue survives a completed task.

The two modes differ in exactly one respect: what happens at an unresolved
product decision. Manual mode asks, through a structured one-question-at-a-time
interview, and records the outcome. Automatic mode never asks — it records the
evidence in the task, reports it blocked, and stops. It may still make
reversible engineering decisions that repository evidence supports.

Parallelism is a further opt-in. `automatic.max_parallel_tasks` defaults to `1`,
which is exactly the sequential flow above. Raising it runs that many
independent, dependency-ready tasks at once, each isolated in its own
`git worktree`. Selection and claiming stay single-threaded — every task in a
batch is set active sequentially _before_ any work starts, so two agents can
never claim the same task — and the batch merges back in ascending task-ID order
once all of it has finished. A merge conflict blocks only the task it happened
on: that task moves back out of `Done` with the conflict recorded as blocker
evidence and its worktree left in place for inspection, while the rest of the
batch merges normally.

## Trade-offs

The costs are real and worth stating plainly.

- **Per-task overhead.** Requirement alignment, a just-in-time plan, recorded
  evidence, and a final summary is a great deal of ceremony for a one-line fix.
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

`audit-claude-md` is the secondary public skill in the collection and addresses
that directly. It reviews every rule individually — every paragraph and bullet,
with multi-requirement bullets split into atomic rules first — and gives each
one exactly one disposition: keep it at the root; move it to a narrower path;
extract it into a skill; move it into real documentation; rewrite it; delete it;
or flag it as an enforcement gap, where a hard prohibition exists only as prose
and a hook, CI check, or linter belongs instead.

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

## GitHub Evidence

All of it lives in one public repository:

- [`github.com/tc3oliver/skills`](https://github.com/tc3oliver/skills) — the
  collection, MIT licensed.
- [`backlog-workflow/`](https://github.com/tc3oliver/skills/blob/main/backlog-workflow/README.md)
  — version `1.2.0`: the installer and its project-discovery logic, the workflow
  specification templates (`WORKFLOW.md`, `TASK-POLICY.md`, `config.yml`), the
  three project skills, and the installer's own unit tests and package validator
  (`python3 -m unittest discover -s tests`,
  `python3 scripts/validate_package.py`).
- [`audit-claude-md/`](https://github.com/tc3oliver/skills/blob/main/audit-claude-md/README.md)
  — the instruction auditor described above.

It installs either as agent skills (`npx skills add tc3oliver/skills`) or as a
Claude Code plugin (`/plugin marketplace add tc3oliver/skills`).

The workflow is not only published — it is the process this site was built
with. The site's source repository, `github.com/tc3oliver/meowcoder.com`, is
secondary engineering evidence; the skills collection is the primary open-source
work.

## Attribution

The collection is a personal working set, and the repository says so rather than
claiming every idea in it originated there.

`backlog-workflow` and `audit-claude-md` are my own work, published under the
MIT License (`Copyright (c) 2026 tc3oliver`).

The `grilling` skill that `backlog-workflow` installs alongside them is not.
Its file carries the notice:

> Bundled by backlog-workflow 1.2.0.
> Based on the `grilling` skill by Matt Pocock, used under the MIT License.
> The full license text ships alongside this file as LICENSE.

and the repository's own `LICENSE` repeats it:

> This repository bundles the `grilling` skill by Matt Pocock, used under the
> MIT License. Its full license text is included at
> `backlog-workflow/templates/project/.claude/skills/grilling/LICENSE` and is
> installed alongside the skill into target projects.

That full MIT text — `Copyright (c) 2026 Matt Pocock` — travels with the skill
into every project the workflow is installed into. Three further skills in the
same repository, `diagnosing-bugs`, `writing-for-agents`, and
`resolving-merge-conflicts`, are likewise adapted from
[`mattpocock/skills`](https://github.com/mattpocock/skills) and retain their
original MIT license and attribution in their own directories.
