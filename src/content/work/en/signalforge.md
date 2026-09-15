---
title: 'SignalForge'
type: 'Open Source · Knowledge & Agent Systems'
summary: 'A self-hosted intelligence pipeline that turns noisy multi-source feeds into deduplicated events, tracked changes, emerging signals, and a source-grounded daily brief.'
outcome: 'Runs unattended every morning on a two-session agent architecture, with every source reference and every number in the brief validated by code before publication.'
indexMeta: 'MIT · TypeScript · Postgres · Two-session agent runtime'
evidence: 'github.com/tc3oliver/signalforge · architecture, security model, and verify pipeline all published'
slug: 'signalforge'
locale: 'en'
translationKey: 'signalforge'
order: 1
draft: false
meta:
  - label: 'Status'
    value: 'Self-hosted · Single user · Runs daily'
  - label: 'License'
    value: 'MIT'
  - label: 'Stack'
    value: 'TypeScript · Postgres 17 + pgvector · Next.js reader'
  - label: 'Sources'
    value: 'RSS, GitHub, Hacker News, arXiv, Reddit, YouTube, SEC, FRED, CoinGecko'
---

Independently designed, built, and operated by Oliver Yu.

## Problem

A feed reader gives you today's articles. That is the wrong unit.

Five outlets writing about one release is one event, not five things to read.
An article published today is frequently not new information: it is commentary
on something reported last week, a rumour that has now been confirmed, or a
number that moved in a direction already being tracked. Sorting that out is the
work, and it is the work a summarizer does not do — summarizing five articles
produces five summaries.

<a href="https://github.com/tc3oliver/signalforge" target="_blank" rel="noopener noreferrer">SignalForge</a>
is **event-centric, not article-centric**. Every story persists in a ledger,
today is compared against what was already known, and what gets recorded is
what _changed_:

| Change type          | Meaning                                              |
| -------------------- | ---------------------------------------------------- |
| `NEW`                | First time this event has been seen                  |
| `UPDATE`             | Genuinely new detail on a known story                |
| `ESCALATION`         | The situation got more serious                       |
| `RESOLUTION`         | It concluded                                         |
| `REVERSAL`           | It went the other way                                |
| `CONFIRMATION`       | A rumour or single-source report is now corroborated |
| `RUMOR`              | Reported, but not yet from a source that settles it  |
| `NO_MATERIAL_CHANGE` | Coverage happened; information did not               |

`NO_MATERIAL_CHANGE` is the load-bearing one. A story in that state is updated
in the ledger and deliberately kept out of the brief. That is the difference
between tracking events and summarizing articles.

## Architecture

The pipeline is a sequence of stages with one durable store in the middle and
two short-lived agent sessions that read and write it through tools.

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Collect</span>
<span class="state-flow__detail">Ten collectors fetch everything the watchlists name. No editorial filtering happens here.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Source</span>Every item tagged untrusted at the boundary</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Curate</span>
<span class="state-flow__detail">One agent session scans every item, clusters events, compares against the ledger, and judges what changed.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Writes</span>Item decisions, story ledger</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">Judgement</span>Story identity, change type, importance</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Write</span>
<span class="state-flow__detail">A separate session, fresh context, sees only the curated materials and writes the brief.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Reads</span>Materials, attached sources, structured facts</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">Prose</span>What happened, why it matters, what changed</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Validate & publish</span>
<span class="state-flow__detail">Code checks every source id and fact reference. A brief that cites something that does not exist is rejected.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Output</span>Daily brief, story rows, emerging signals</span>
</li>
</ol>
<figcaption class="state-flow__caption">A solid outline is collected or validated content; a dashed outline is model judgement or model prose. The two never share a row: the reader renders published rows and never invokes a model.</figcaption>
</figure>

Postgres is the canonical store. Collected items, decisions, the cross-day
ledger, materials, drafts, published briefs, and emerging signals are all rows,
and the same rows feed both the pipeline and the web reader. Rows are
namespaced by lineage, so a synthetic or experimental run can share a database
with production and never collide with it.

## Engineering Decisions

Each decision below is paired with the constraint it protects and what it costs.

<div class="decision">

### Nothing durable lives inside an agent session

**Why** — A session is a conversation, not a memory. It ends, it overflows, and
it dies with the provider that was serving it. Every decision, every story, and
every draft is written to Postgres through a tool the moment it exists.

**Consequence** — A curator that crashes at item 50 can be replaced by a
different model that picks up at item 51, because the first fifty decisions are
in the database rather than in a dead conversation. Moving from JSON files to
Postgres changed the storage layer and nothing else.

</div>

<div class="decision">

### Curator and Editor are separate sessions with disjoint tools

**Why** — The Curator sees the raw firehose and can mutate the ledger. The
Editor sees only the materials the Curator attached and has no mutation tool at
all. The Editor therefore cannot resurrect a story the Curator discarded, and
cannot quietly redo the curation with worse information.

**Consequence** — An Editor failure is cheap: there is no conversation worth
saving, so the pipeline rebuilds a fresh editor session from the stored
materials and starts again.

</div>

<div class="decision">

### Numbers travel by reference, never as prose

**Why** — A number that exists only in model output has no provenance. Every
figure a brief uses is a fact id that resolves, at render time, to a value, a
unit, and an as-of stamp in a structured fact store.

**Trade-off** — An unresolvable fact id renders as an explicit gap rather than
a substituted figure, which is visibly worse than a confident number and
deliberately so.

</div>

<div class="decision">

### Validation is code, not a second model

**Why** — Asking a model whether it did a good job is not a trust boundary.
The validator checks that every cited source id is a collected item, every
fact reference resolves, and the brief has the required shape; a failure names
the field.

**Consequence** — Agent output is never parsed out of an assistant message. Both
sessions submit through a validated tool call, and a submission that fails
validation is rejected with a reason the session can act on.

</div>

<div class="decision">

### No editorial filtering before the agent

**Why** — "Looks unimportant" is the curator's judgement. Making it earlier, in
a collector, is how a pipeline silently stops seeing things. A collector may
drop an item only for being an exact duplicate, corrupt, unsupported, or a
source-policy violation.

**Trade-off** — The curator scans every item collected that day, well over a
thousand on a busy one. Cost scales with how much is collected, not with how
much reaches the brief, and that is the single largest operating cost.

</div>

<div class="decision">

### Similarity narrows the field; it never decides

**Why** — Whether two items describe the same real-world event is a judgement
made from the text, and it is recorded explicitly. There is no similarity
threshold anywhere that merges two items on its own.

**Consequence** — Lexical search over the day's items and history search over
the ledger are candidate generators handed to a model that then has to decide.
The vector column and index are provisioned but not yet in the decision path.

</div>

## Security Model

Every collected item is external text written by someone else, and the runtime
is built on that assumption.

- **External content is marked untrusted at the boundary**, before any agent
  sees it, so no later layer has to remember to do it. Prompt injection through
  a collected item is an in-scope vulnerability.
- **The agent runtime is restricted**: no shell, no filesystem beyond one
  narrowly-rooted policy reader, no arbitrary HTTP, no credentials. This is
  asserted per run and recorded, not merely configured.
- **The agent never holds a credential.** Collectors and the research layer run
  server-side and hand the agent content, never keys. Model authentication
  belongs to the installed agent runtime, read-only.
- **The reader is local and read-only.** Postgres and the web app bind to
  loopback by default, a strict CSP is set on every response, and a test walks
  every file under the reader to fail the build if any of it can reach a model.

## Emerging Signals

A signal is a weak pattern repeated across days before any single day would
justify a story. Its label is model-written prose and drifts day to day, so
matching on the label would split one signal into a new row every morning and
its age — the only interesting thing about a signal — would never accumulate.
The evidence story set is the stable identity instead, matched by overlap.
This is the least mature part of the pipeline and the part most likely to change.

## Limitations

Stated plainly, because they decide whether the design is worth adapting.

- **Single-user, self-hosted.** One reader, one database, no authentication
  in front of the reader.
- **Brief quality is bounded by the model and the source coverage.** The
  pipeline is deterministic where it can be; the judgement is not.
- **Personalization is specified but not yet wired.** The interest profile is
  validated but not consumed by the agents, and nothing learns from what is
  read.
- **Historical value needs an accumulated ledger.** A fresh install sees
  everything as `NEW` for the first few days.
- **Not supported.** Published because the design may be useful to read and
  adapt, not because anyone is on call.

## Open Source Implementation

<div class="evidence">

- <a href="https://github.com/tc3oliver/signalforge" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/signalforge</code></a>
  — the pipeline, the reader, the migrations, and the verify suite, MIT licensed.
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer"><code>docs/ARCHITECTURE.md</code></a>
  — why it is shaped this way, and where each guarantee is enforced.
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/SECURITY.md" target="_blank" rel="noopener noreferrer"><code>docs/SECURITY.md</code></a>
  — the threat model, and the code and tests behind each line of it.
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/INTELLIGENCE_BACKLOG.md" target="_blank" rel="noopener noreferrer"><code>docs/INTELLIGENCE_BACKLOG.md</code></a>
  — what comes next, with evidence and acceptance criteria.

</div>

`pnpm verify` is the command that decides whether a change is good: typecheck,
the full suite with no test permitted to skip, and the reader build. CI runs it
against a real Postgres. `pnpm demo` produces a three-day synthetic history with
no model, no key, and no network, so the reader can be seen working before
anything is configured.
