<!-- backlog-workflow:begin version=1.2.0 -->
## Backlog Task Execution

- Default workflow mode is manual.
- Planning: align requirements and decompose into Backlog.md tasks without
  implementation. In Claude Code use `/backlog-plan`.
- Execute one task: `/backlog-run <TASK-ID>`; automatic: `/backlog-auto [TASK-ID]`.
- Read `.agent-workflow/WORKFLOW.md` for development policy and
  `.agent-workflow/PROJECT.md` for repository configuration.
- Backlog.md canonical instructions (`backlog instructions ...`) define how
  Backlog.md is operated; do not duplicate their mechanics. Prefer the Backlog.md
  CLI (`backlog task ...`) for task mutation; do not parse/rewrite
  `backlog/tasks/*.md` for normal task operations.
- Product requirements in the files listed in `.agent-workflow/PROJECT.md` remain
  authoritative. Do not expose internal autonomous-development mechanics in
  public README or product documentation.
<!-- backlog-workflow:end -->
