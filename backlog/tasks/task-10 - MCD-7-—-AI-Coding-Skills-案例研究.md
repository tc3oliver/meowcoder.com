---
id: TASK-10
title: MCD-7 — AI Coding Skills 案例研究
status: Done
assignee: []
created_date: '2026-08-08 06:46'
updated_date: '2026-08-08 15:38'
labels: []
dependencies:
  - TASK-5
priority: medium
type: feature
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §9.4（Open Source — AI Coding Skills）、§10（Work — AI Coding Skills 詳細結構）、§34（Content Language Rules）、§37（Content Quality Rule）、§39 (MCD-7)

## 目標

以 MCD-5 的內容模型在兩種語言下發佈 AI Coding Skills 案例研究，作為網站的主要 Open Source Proof，並正確標示第三方出處。

## 範圍

- src/content/work/en/ai-coding-skills 與 src/content/work/zh/ai-coding-skills 內容檔
- PRD §10 要求的全部區塊
- backlog-workflow 為主要公開作品、audit-claude-md 為次要
- 第三方來源 skill 的出處與授權標示

## 不在範圍

- 首頁的 Open Source 摘要區塊（已由 MCD-4 完成）
- Shouri 案例研究（MCD-6）

## 穩定實作限制

- 第三方來源的 skill 必須保留明確出處與授權標示，不得呈現為原創作品（PRD §9.4）。依儲存庫證據，backlog-workflow 為本人原創，其內含的 grilling 係基於 Matt Pocock 的 MIT 授權作品，需保留該標示
- 僅呈現可公開檢視的證據（PRD §10）
- 內容品質須符合 PRD §37：以工程證據取代行銷形容詞
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 平行執行考量：本任務僅新增 ai-coding-skills 的內容檔，不修改共用版面或字典

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的區塊完整性、出處標示與語言切換對應
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 內容須通過 MCD-5 的 content schema 驗證（build time 強制）
- 人工內容 QA 與出處正確性檢查

## 影響

- 安全性：無
- 資料 / Schema：無（使用 MCD-5 既有 schema）
- API / 相容性：新增 /work/ai-coding-skills 與 /zh/work/ai-coding-skills 兩個公開 URL
- 文件：第三方出處與授權標示
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 AI Coding Skills 作品詳細頁在英文與中文下皆發佈，且包含 PRD §10 要求的全部區塊：Problem、Coding-Agent Failure Modes、Workflow Architecture、Requirement/Backlog Separation、JIT Planning、Execution Boundaries、Validation & Evidence、Manual vs Autonomous Mode、Trade-offs、GitHub Evidence
- [x] #2 backlog-workflow 呈現為主要公開作品，涵蓋需求驅動開發、Backlog.md 整合、手動與自動執行、明確執行邊界、驗證關卡與證據導向完成
- [x] #3 audit-claude-md 呈現為次要公開作品，用於展示 context 品質、指令設計、漸進揭露與可維護性
- [x] #4 任何第三方來源的 skill（例如基於 Matt Pocock 的 grilling）皆保留明確出處與授權標示，未呈現為原創作品
- [x] #5 /work/ai-coding-skills 與 /zh/work/ai-coding-skills 可透過語言切換正確互相對應
- [x] #6 兩種語言的內容皆通過 MCD-5 的 content schema 驗證
- [x] #7 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
- [x] #8 內容符合 PRD §37：每項主張以工程證據支撐，未使用行銷形容詞堆砌
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance Criteria all pass
- [x] #2 Required applicable tests, lint, typecheck, and build pass
- [x] #3 Documentation and Requirement Matrix are synchronized when applicable
- [x] #4 Validation evidence is recorded in the task
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 讀取工作流程政策（WORKFLOW.md、PROJECT.md、TASK-POLICY.md、CLAUDE.md、AGENTS.md）與 Backlog.md canonical instructions（overview、task-execution）。
2. 讀取 doc-1 的 §9.4、§10、§18、§19、§20、§24、§34、§37、§39（MCD-7），確認必要區塊與語言／品質規則。
3. 研究現行內容模型：src/content.config.ts（work collection glob 為 {en,zh}/*.md）、src/lib/work.ts（workEntrySchema 為 strictObject、assertWorkContentIsConsistent 的四項跨檔不變式）、src/layouts/WorkLayout.astro（h1 由版面提供，內文標題自 ## 起）、src/content/work/README.md 的撰寫規範。不修改 schema、版面、字典或頁面。
4. 蒐集可查證的事實來源，取代記憶敘述：
   - 本儲存庫內的 .claude/skills/backlog-plan、backlog-run、backlog-auto、grilling 與 .agent-workflow/*（WORKFLOW.md 的 Task Ready Gate、四項完成條件、六項 true blocker、平行執行協定；config.yml 的 max_parallel_tasks）。
   - 公開儲存庫 github.com/tc3oliver/skills（README、LICENSE、backlog-workflow/README.md、backlog-workflow/VERSION、audit-claude-md/README.md、audit-claude-md/SKILL.md），以 gh api 讀取確認。
5. 撰寫 src/content/work/en/ai-coding-skills.md 與 src/content/work/zh/ai-coding-skills.md：frontmatter 共用 slug/translationKey ai-coding-skills、order 1（PRD §10 將 Shouri 排在前）、draft false、locale 各自對應；內文依 PRD §10 的十個區塊，另加 MCD-7 要求的 attribution 區塊。
6. 內容規則：backlog-workflow 為主要公開作品、audit-claude-md 為次要（PRD §9.4）；AI Coding Skills 為主要 Open Source Proof、meowcoder.com 原始碼為次要（PRD §24）；每項主張綁定儲存庫或公開檔案證據（PRD §37）；僅描述公開的 skill 設計，不揭露本站私有 backlog 任務內容。
7. 出處與授權依實際檔案引用，不憑記憶改寫：.claude/skills/grilling/SKILL.md 的標示、grilling/LICENSE 的 MIT 與 Copyright (c) 2026 Matt Pocock、以及 tc3oliver/skills 的 LICENSE 與 README「Origins & Attribution」對 mattpocock/skills 來源的說明。
8. 語言依 PRD §34：同段落不混用中英文（產品名、專有名詞、既定技術術語、指令與路徑除外）；中文為台灣讀者自然可讀且非逐句直譯。
9. 驗證：npm run format:check、npm run lint、npm run typecheck、npm run build、npm test（PROJECT.md 的 CI 順序），並確認 build 產出 /work/ai-coding-skills/ 與 /zh/work/ai-coding-skills/ 兩個頁面。
10. 逐條以客觀證據核對 AC #1..#8 與 DoD，寫入 Implementation Notes 與 Final Summary，提交至 backlog/TASK-10。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

新增兩個內容檔（僅此二檔，未動 schema、版面、字典、頁面）：

- `src/content/work/en/ai-coding-skills.md`
- `src/content/work/zh/ai-coding-skills.md`

共用 frontmatter：`slug: ai-coding-skills`、`translationKey: ai-coding-skills`、`order: 1`（PRD §10 將 Shouri 排在 AI Coding Skills 之前）、`draft: false`；`locale`、`title`、`type`、`summary` 各自對應語系。

區塊結構依 PRD §10：Problem、Coding-Agent Failure Modes、Workflow Architecture、Requirement / Backlog Separation、JIT Planning、Execution Boundaries、Validation & Evidence、Manual vs Autonomous Mode、Trade-offs、GitHub Evidence，另加 MCD-7 明列的 attribution 區塊，以及承載 AC #3 的 `Context Quality — audit-claude-md` 區塊。

## 事實來源（未憑記憶撰寫）

- 本儲存庫：`.agent-workflow/WORKFLOW.md`（Task Ready Gate、四項完成條件、六項 true blocker、核准邊界覆寫、平行執行的認領／合併協定）、`.agent-workflow/config.yml`（`max_parallel_tasks`）、`.claude/skills/backlog-plan|backlog-run|backlog-auto|grilling`。
- 公開儲存庫 `github.com/tc3oliver/skills`（以 `gh api` 讀取）：README（失效模式清單、Origins & Attribution）、`LICENSE`、`backlog-workflow/README.md`、`backlog-workflow/VERSION`（`1.2.0`）、`audit-claude-md/README.md` 與 `SKILL.md`（七種處置、保守刪除、寫入範圍、`disable-model-invocation`）。
- 全部外部連結以 `curl` 與 `linkinator` 實測為 200。

## 決策

- **不使用 Markdown 表格。** `src/styles/global.css` 的 `.prose` 沒有表格樣式，改以條列呈現處置類型與模式對照，避免產生無樣式表格。
- **私有儲存庫不做成超連結。** `github.com/tc3oliver/meowcoder.com` 目前為 private（`gh repo view` 顯示 `isPrivate: true`），CI 的 `npm run linkcheck` 會實際請求外部連結，因此該儲存庫僅以行內程式碼形式提及，不加超連結；PRD §24 的主／次順序照原樣呈現（AI Coding Skills 為主要開源證據）。
- **不揭露本站私有 backlog 內容。** 依 CLAUDE.md，僅描述公開的 skill 設計，網站僅以一句「本站以此工作流程開發」帶過，不列出任務內容。

## 驗證證據

於 `.worktrees/TASK-10`（Node v22.23.2），依 PROJECT.md 的 CI 順序執行：

```text
npm run format:check  → Checking formatting... All matched files use Prettier code style!
npm run lint          → eslint . （無輸出，0 問題）
npm run typecheck     → Result (44 files): - 0 errors - 0 warnings - 0 hints
npm run build         → /work/ai-coding-skills/index.html
                        /zh/work/ai-coding-skills/index.html
                        8 page(s) built in 695ms / Complete!
npm run linkcheck     → Successfully scanned 8 links / Successfully scanned 6 links
npm test              → Test Files 7 passed (7) / Tests 178 passed (178)
```

補充逐頁連結檢查（首頁目前尚未連到 /work，故單獨檢查詳細頁）：

```text
npx linkinator work/ai-coding-skills/index.html --server-root dist --skip "^https://meowcoder\.com"
[200] https://github.com/tc3oliver/skills
[200] https://github.com/tc3oliver/skills/blob/main/backlog-workflow/README.md
[200] https://github.com/tc3oliver/skills/blob/main/audit-claude-md/README.md
[200] https://github.com/mattpocock/skills
[200] https://backlog.md/
[200] zh/work/ai-coding-skills/
✓ Successfully scanned 14 links in 1.461 seconds.
```

語言切換對應（build 產物）：

```text
dist/work/ai-coding-skills/index.html
  <link rel="canonical" href="https://meowcoder.com/work/ai-coding-skills/">
  <link rel="alternate" hreflang="zh-Hant" href="https://meowcoder.com/zh/work/ai-coding-skills/">
  href="/zh/work/ai-coding-skills/" lang="zh-Hant" hreflang="zh-Hant"
dist/zh/work/ai-coding-skills/index.html
  <link rel="canonical" href="https://meowcoder.com/zh/work/ai-coding-skills/">
  <link rel="alternate" hreflang="en" href="https://meowcoder.com/work/ai-coding-skills/">
  href="/work/ai-coding-skills/" lang="en" hreflang="en"
```

兩語系 h2 區塊（build 產物）：

```text
en: Problem / Coding-Agent Failure Modes / Workflow Architecture /
    Requirement / Backlog Separation / JIT Planning / Execution Boundaries /
    Validation & Evidence / Manual vs Autonomous Mode / Trade-offs /
    Context Quality — audit-claude-md / GitHub Evidence / Attribution
zh: 問題 / Coding Agent 的失效模式 / 工作流程架構 / 需求與 Backlog 的分離 /
    Just-in-Time 實作計畫 / 執行邊界 / 驗證與證據 / 手動模式與自動模式 / 取捨 /
    Context 品質 — audit-claude-md / GitHub 證據 / 出處與授權
```

出處標示（兩語系 blockquote 的實際 render 結果一致，逐字取自檔案）：

```text
來源 .claude/skills/grilling/SKILL.md：
Bundled by backlog-workflow 1.2.0.
Based on the `grilling` skill by Matt Pocock, used under the MIT License.
The full license text ships alongside this file as LICENSE.

來源 .claude/skills/grilling/LICENSE：
MIT License / Copyright (c) 2026 Matt Pocock

來源 github.com/tc3oliver/skills 的 LICENSE：
This repository bundles the `grilling` skill by Matt Pocock, used under the MIT
License. Its full license text is included at
backlog-workflow/templates/project/.claude/skills/grilling/LICENSE and is
installed alongside the skill into target projects.
```

依該儲存庫 README 的 Origins & Attribution，來自 `mattpocock/skills` 的還包含 `diagnosing-bugs`、`writing-for-agents`、`resolving-merge-conflicts`，內容中一併標示，避免低估第三方範圍；`backlog-workflow` 與 `audit-claude-md` 則明確標示為本人原創、MIT（`Copyright (c) 2026 tc3oliver`）。

## 不適用項目

- 需求矩陣：本專案無獨立需求矩陣文件，不適用。
- 自動化內容測試：AC #7、#8 屬人工內容 QA，以上述逐節審閱與證據綁定為準；schema 驗證由 build 強制（AC #6）。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
以 MCD-5 的 work 內容模型新增 AI Coding Skills 案例研究的英文與中文內容檔（`src/content/work/{en,zh}/ai-coding-skills.md`），未修改 schema、版面、字典或頁面。

內容涵蓋 PRD §10 的十個必要區塊，另加 MCD-7 明列的 attribution 區塊；backlog-workflow 為主要公開作品，audit-claude-md 為次要（context 品質、指令設計、漸進揭露、可維護性）；PRD §24 的主／次順序維持不變，AI Coding Skills 為主要開源證據。所有主張綁定可查證來源：本儲存庫的 `.agent-workflow/` 與 `.claude/skills/`，以及公開儲存庫 `github.com/tc3oliver/skills`（README、LICENSE、`backlog-workflow/VERSION` = 1.2.0、`audit-claude-md/`），未使用任何未經查證的數字或日期。

出處逐字取自檔案：`.claude/skills/grilling/SKILL.md` 的「Based on the `grilling` skill by Matt Pocock, used under the MIT License.」、`grilling/LICENSE` 的 MIT 與 `Copyright (c) 2026 Matt Pocock`，以及該公開儲存庫 LICENSE 的同義聲明；並依其 README 一併標示 `diagnosing-bugs`、`writing-for-agents`、`resolving-merge-conflicts` 亦源自 `mattpocock/skills`。

驗證（Node v22.23.2，依 PROJECT.md 的 CI 順序）：format:check、lint、typecheck（0 errors）、build（產出 `/work/ai-coding-skills/` 與 `/zh/work/ai-coding-skills/`，8 頁）、linkcheck（8 + 6 links，外部連結另以 linkinator 逐頁實測 14 links 全數 200）、test（7 files / 178 tests 全數通過）。語言切換以 build 產物的 canonical、hreflang 與切換連結互指確認。
<!-- SECTION:FINAL_SUMMARY:END -->
