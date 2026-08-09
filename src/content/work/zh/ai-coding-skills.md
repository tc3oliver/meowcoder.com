---
title: 'AI Coding Skills'
type: '開源 · Agent 工程'
summary: '一套開源的開發工作流程 skill，協助 coding agent 對齊需求、在執行前建立符合當下情境的實作計畫、依專案情境驗證，並按明確條件完成工作。'
outcome: '採 MIT 授權，可作為 agent skill 或 Claude Code plugin 安裝，也是本站採用的開發流程。'
indexMeta: 'MIT · backlog-workflow 1.2.0 · 附單元測試'
evidence: 'github.com/tc3oliver/skills · backlog-workflow 1.2.0，附有自己的單元測試'
slug: 'ai-coding-skills'
locale: 'zh'
translationKey: 'ai-coding-skills'
order: 1
draft: false
meta:
  - label: '版本'
    value: 'backlog-workflow 1.2.0'
  - label: '授權'
    value: 'MIT · 內附 skill 保留原有授權'
  - label: '需要'
    value: 'Backlog.md CLI · Python 3'
  - label: '安裝'
    value: 'agent skill 或 Claude Code plugin'
---

## 問題

會寫出正確程式碼的 agent，和能被信任交付工作的 agent，是兩件事。不可靠的部分往往不在程式碼本身，而在程式碼周圍的流程：需求要收斂到什麼程度才能動工、這個儲存庫實際適用哪些驗證、什麼樣才算做完，以及該在哪裡停下來問人，而不是自己猜。

把一份規格和一個儲存庫塞進同一個長 prompt，失效的樣子相當固定：需求還沒對齊就開始實作；跑了一個專案根本沒有的 lint 指令，還回報通過；因為模型自己的輸出看起來沒問題，就把工作標記為完成。

[AI Coding Skills](https://github.com/tc3oliver/skills) 是我用來約束這段流程的公開 skill 集合。做法不是把 prompt 寫得更漂亮，而是把邊界寫進有版本控制的檔案裡，讓 agent 動手之前必須先讀過——同一套規則因此適用於每一個任務，也能延續到新的對話。

集合中的主要作品是 `backlog-workflow`：一套安裝進專案、建立在 [Backlog.md](https://backlog.md) 之上的開發政策與協作層。

## Coding Agent 的失效模式

整套工作流程是針對一份具體的失效清單設計的，每個階段的存在，都是為了關掉其中一項：

- 需求還不明確就開始實作；
- 大型需求被壓縮成一次過於龐大的實作；
- 實作計畫在規劃與執行之間過期；
- 產品行為在實作過程中被悄悄重新詮釋；
- 有相依關係的工作被以錯誤順序執行；
- 驗證指令用猜的，而不是依專案實際設定；
- 文件沒有同步更新；
- 任務在尚未符合完成條件時就被標記完成；
- 該停下來的地方，自動執行仍繼續往前跑。

這些都不是模型能力不足造成的，換一個更強的模型也不會消失。每一項都是缺少一道邊界，因此它是工程問題，而工程問題的答案可以寫成檔案。

## 工作流程架構

四層，每層只負責一件事：

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">PRD / 規格</span>
<span class="state-flow__detail">產品意圖寫在這裡。</span>
<span class="state-flow__part"><span class="state-flow__part-label">負責</span>定義產品需求</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">backlog-workflow</span>
<span class="state-flow__detail">這四層裡唯一由我自己撰寫的一層。</span>
<span class="state-flow__part"><span class="state-flow__part-label">負責</span>執行模式、各項邊界、完成條件</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Backlog.md</span>
<span class="state-flow__detail">照它原本的樣子使用，不重寫一套。</span>
<span class="state-flow__part"><span class="state-flow__part-label">負責</span>任務 Schema、生命週期、相依關係、完成紀錄</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Coding agent</span>
<span class="state-flow__detail">一次只執行一個任務。</span>
<span class="state-flow__part"><span class="state-flow__part-label">負責</span>實作、驗證、PR、CI、審查、合併</span>
</li>
</ol>
<figcaption class="state-flow__caption">各層職責彼此分離，只往下讀取、不往上改寫。任務不能改寫上層需求，Agent 也不能重新定義執行時所依循的政策。</figcaption>
</figure>

<div class="decision">

### 建立在 Backlog.md 之上，而不是重新實作

**原因** — Backlog.md 已定義任務 Schema、生命週期、Acceptance Criteria、Definition of Done、Implementation Plan、筆記、相依關係，以及 CLI 與 JSON 介面。重新實作其中任何一項，都會形成第二套真實來源；因此仍以官方規格為準。

**結果** — 這一層只補充 Backlog.md 未定義的部分：執行模式、需求權威、核准邊界、阻塞政策、完成條件，以及可重現的任務選取規則。

</div>

這幾層共同形成七個任務階段：

1. **需求** — 需求驅動開發：產品意圖由需求來源擁有，任務不得無聲地重新詮釋它。
2. **任務拆解** — 與 Backlog.md 整合：需求變成任務、相依關係與 Acceptance Criteria，除此之外什麼都不做。
3. **執行時規劃** — Implementation Plan 在任務執行時才建立，並以當下的程式碼為準。
4. **實作** — 明確的執行邊界，手動或自動執行皆然：一次一個指定的任務，而且只做需求明確列出的事。
5. **驗證** — 驗證關卡執行從專案實際偵測出的指令，不自行假設。
6. **完成** — 依明確條件判定，並將驗證結果記錄在任務中。
7. **交付** — PR、CI、審查、合併。

至於這七個階段共同仰賴的那些 agent 指令檔要怎麼維護，是集合中第二個 skill 的職責，後面有專門的一節。

安裝到專案後，會留下一組版本化、範圍很小的檔案：

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

### 實際偵測專案指令，不自行假設

**原因** — 一個「看起來很合理」的 lint 或 build 指令，正是「跑了專案根本沒有的檢查、還回報通過」的來源。

**結果** — 安裝過程會實際探查 Backlog.md CLI 的呼叫方式、預設分支、需求來源，以及 setup、format、lint、typecheck、test、build 指令，寫進 `PROJECT.md`，之後這份檔案由專案自己擁有。專案沒有的指令會被記成 `not detected`，agent 必須據實回報「此項不適用」，不得替換成一個看起來合理的指令。

</div>

日後的 `upgrade` 只更新工作流程管理的檔案，專案自有的設定、需求與既有任務都不會被動到。

## 需求與 Backlog 的分離

需求來源負責定義產品意圖；Backlog.md 負責任務拆解、狀態與完成紀錄。兩者彼此分離：任務不得自行新增、移除或重新詮釋需求，遇到衝突時必須先回到權威來源處理，才能繼續實作。

因此每個任務都帶著一個 `Requirement source` 欄位，明確指出它源自哪一份文件或哪一筆決策紀錄。

<div class="decision">

### 會影響後續任務的決策，先留下決策紀錄

**原因** — 少了這條規則，「agent 當時就這樣決定了」會在事後悄悄變成一項需求，而 `Requirement source` 最後只能指向一段沒有人讀得到的對話。

**結果** — 只影響單一任務實作的選擇，記在那個任務裡就好；會綁住後續任務、或某個 `Requirement source` 否則將無據可引的選擇，必須先建立決策紀錄——寫清楚 Context、Decision、Consequences——之後才能建立任何引用它的任務。

</div>

任務要進入進行中的狀態之前，還得通過一道 Task Ready Gate，包含需求來源、目標、範圍、不在範圍、穩定限制、相依、明確的 Acceptance Criteria、驗證方法、測試需求，以及安全性、資料、API、文件、遷移等各項影響。缺少產品意圖構成阻塞；能從儲存庫判斷的工程細節則不構成。

## Just-in-Time 實作計畫

任務拆解與實作計畫刻意分成兩個階段：

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">/backlog-plan</span>
<span class="state-flow__detail">對齊需求，然後拆成任務。報告拆解結果就停下來。</span>
<span class="state-flow__part"><span class="state-flow__part-label">定義「做什麼」</span>任務、相依關係、Acceptance Criteria</span>
<span class="state-flow__part"><span class="state-flow__part-label">明文禁止</span>產出 Implementation Plan、決定函式層級設計、寫產品程式碼、把任務設為進行中</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">/backlog-run TASK-ID</span>
<span class="state-flow__detail">研究此刻真實的程式碼，然後才決定做法。</span>
<span class="state-flow__part"><span class="state-flow__part-label">定義「怎麼做」</span>Implementation Plan，在寫下任何程式碼之前先記錄</span>
<span class="state-flow__part"><span class="state-flow__part-label">接著</span>實作、驗證、完成</span>
</li>
</ol>
<figcaption class="state-flow__caption">「做什麼」在拆解階段就定案；「怎麼做」留到執行當下才定案，對照的是那時候真實的程式碼。</figcaption>
</figure>

<div class="decision">

### Implementation Plan 寫在執行當下，不寫在拆解階段

**原因** — 在拆解階段就寫好的計畫，描述的是一個之後已經改變的儲存庫：等到 backlog 尾端的任務被執行時，幾週前提出的做法經常指著早就不存在的檔案。

**結果** — `/backlog-plan` 被明文禁止產出 Implementation Plan，改由 `/backlog-run` 對著眼前的程式碼寫。「動手前先寫下計畫」這件事並沒有放寬：工作流程移動的是計畫**寫在什麼時候**，而不是**要不要寫**。

</div>

## 執行邊界

`/backlog-run TASK-ID` 只執行指定的那一個任務，然後停止。它不會自己挑下一個。

<div class="decision">

### 執行指令本身即代表核准該任務

**原因** — 核准邊界應明確定義，而不是交由 Agent 自行判斷。呼叫 `/backlog-run TASK-ID` 即代表授權該任務完成執行時規劃、實作與驗證；Agent 記錄計畫後可直接執行，不必再次要求核准。

**取捨** — 這是對上游建議做法的一次明確覆寫，也等於拿掉了計畫與程式碼之間那一道人工檢查點。作為代價，邊界被畫得很窄：agent 仍然不得決定需求沒有涵蓋的事。

</div>

允許停下來的情況只有六種：

1. 產品需求或 Acceptance Criteria 互相矛盾；
2. 缺少必要的權限、憑證、外部服務或硬體；
3. 既有未提交的變更與此任務重疊，且無法安全隔離；
4. 相依任務尚未完成；
5. 不可逆的產品、資料或架構決策，而沒有權威來源可依據；
6. 新發現的重大缺陷，安全修復所需的範圍已明顯超出此任務。

<div class="decision">

### 明確定義哪些情況構成阻塞

**原因** — 為了實作寫法、程式碼導覽、任務範圍內的重構、修測試，或可回復的工程選擇就停下來的 agent，和永遠不停的 agent 一樣不能用。

**結果** — 政策裡除了那六種可以停的條件，也明文列出這些**不算**阻塞的情況。這份清單同時說明什麼時候該停、什麼時候該繼續往前。

</div>

範圍紀律屬於同一道邊界：不相干的清理不併進任務，為了正確性而必須做的清理則屬於範圍內，執行途中發現的大規模清理另開一個任務。

## 驗證與完成

任務要被標記為 `Done`，必須四項條件同時成立：

1. Acceptance Criteria 全數通過；
2. 適用的測試、lint、typecheck 與 build 通過；
3. 文件與需求矩陣已同步；
4. 驗證結果已記錄在任務中。

只把程式碼寫完，一項都不算滿足。

<div class="decision">

### 把四項條件寫進任務本身的 Definition of Done

**原因** — 只寫在工作流程文件裡的政策，任何一個早於它、或繞過它建立的任務都能迴避。

**結果** — 這四項條件會成為每個任務原生 Definition of Done 裡的可勾選項目，兩個執行用的 skill 在動手前都會重讀任務、補上缺少的項目。

</div>

讓這件事真的可以被執行的另一半，是拒絕發明檢查：專案沒有的檢查會被記成「不存在」或「不適用」，這就拿掉了製造一份好看的通過紀錄的動機。

## 手動模式與自動模式

預設是手動模式，而且要不要自動執行是「每次呼叫時決定」，不是一個全域開關：

- `/backlog-plan <需求>`——對齊需求並拆成任務。不寫產品程式碼，不產出 Implementation Plan。
- `/backlog-run <TASK-ID>`——只執行指定的那一個任務，然後停止。
- `/backlog-auto [TASK-ID]`——連續執行，而且只在被明確呼叫時才啟動。

「繼續」、「接著做」、「繼續開發」都不會啟動自動執行，只有 `/backlog-auto` 會。

自動模式的任務選取是可重現的，而且讀的是結構化資料，絕不去解析 Markdown：以 JSON 查詢任務清單，排除不可執行的任務與相依未完成的任務，套用優先順序，同分時取數字最小的任務 ID，執行一個任務，完整收尾，然後重新查詢。任務完成後不保留任何記憶中的佇列。

<div class="decision">

### 碰到未決的產品決策，自動模式停下來，而不是自己選

**原因** — 兩種模式真正的差別只有這一處。手動模式可以問——用一次一題的結構化訪談把決策攤開，再把結論記錄下來；自動模式沒有人可以問。

**結果** — 自動模式從不問：它把現有資訊寫進任務、回報阻塞，然後停止。它仍然可以根據儲存庫內容，做出可回復的工程決定。

</div>

平行執行則是另一個需要明確開啟的選項。`automatic.max_parallel_tasks` 預設為 `1`，也就是上面那條循序流程。調高之後，會同時執行等量的、彼此獨立且相依已備妥的任務，每個任務各自隔離在自己的 `git worktree` 裡。

<div class="decision">

### 先鎖定整批任務，再開始執行

**原因** — 即使執行是平行的，選取與認領仍維持單線：同一批任務會在任何工作開始**之前**逐一被設為進行中，所以兩個 agent 不可能認領到同一個任務。

**結果** — 整批做完之後，再依任務 ID 由小到大依序合併回去；合併衝突只會阻塞它發生的那一個任務——該任務會被移出 `Done`，衝突記錄在任務中，worktree 原地保留供檢查，同批其餘任務照常合併。

</div>

## 取捨

這套流程也有明確成本：

- **每個任務的固定開銷。** 需求對齊、執行時規劃、驗證紀錄與最終摘要，對單行修正而言可能過重。因此提問、資料查詢與明確的機械式修改不必建立任務。
- **刻意限制適用範圍。** 它綁定 Backlog.md 與支援 Slash Command 的 Agent，需要 Backlog.md CLI 與 Python 3。它不是通用 Agent 框架，明確的範圍讓政策能被具體執行。
- **指令檔會占用 Context。** 所有規則都會在工作開始前載入，因此需要集合中的第二個 Skill 定期維護；未經維護的指令集會持續增加不必要的 Context 成本。
- **平行執行可能產生重工。** 位於不同模組的獨立任務適合平行執行；若多項任務可能修改同一批檔案，則容易產生合併衝突。建議從 `2` 個平行任務開始，再依衝突頻率調整。
- **優先確保可重現性。** 「先依優先順序，再取最小任務 ID」未必是最靈活的排序，但結果可以重現；當執行者本身具有不確定性時，可重現性更重要。

## Context 品質 — audit-claude-md

`backlog-workflow` 仰賴 agent 每次任務都會讀的指令檔，而這份仰賴本身也有它的失效模式。`CLAUDE.md` 會逐漸堆積早已過期的目錄樹、三個月前的進度筆記、其實只適用於某一個子目錄的規則，以及像「把程式碼寫好」這種無從驗證的要求——而這些全部都會在每一個任務載入 context。

`audit-claude-md` 是集合中的次要公開作品，負責改善指令設計與檔案的長期可維護性。它逐條檢視每一項規則；若單一項目包含多項要求，會先拆成原子規則再判斷。每一條規則只會得到一種處置：保留在根目錄、移至更精確的路徑範圍、抽成 Skill、移進正式文件、改寫、刪除，或標記為強制執行缺口。強制執行缺口指的是某項硬性規則目前只存在於文字中，實際上應由 Hook、CI 檢查或 Linter 強制執行。

有三個設計決定撐起它的價值。第一，它直接動手處理每一條規則，而不是交回一份建議清單。第二，抽成 skill 或移進文件就是漸進揭露——細節離開恆常載入的 context，改放到 agent 只有在需要時才會載入的位置；而且它明文拒絕用 `@file` 匯入來假裝縮短，因為被匯入的檔案一樣會進入啟動時的 context。第三，刪除刻意保守：「在程式碼裡找得到」本身不構成刪除理由，凡是看起來像重要隱性知識、卻無法從儲存庫確認的內容，一律保留並列出來交給人判斷。

它的寫入範圍被限制在指令檔上。`AGENTS.md` 與其他 agent 的指令檔只讀不寫，僅用來偵測互相衝突的規則，並把衝突列出來交給人處理。它只能由使用者主動呼叫，因為它會修改檔案；而且動手前會先看 `git status`，避免它產生的 diff 與你手邊未提交的修改混在一起。

## 開源實作

以上全部都在同一個公開儲存庫裡：

<div class="evidence">

- [`github.com/tc3oliver/skills`](https://github.com/tc3oliver/skills)——整個 skill 集合，採用 MIT 授權。
- [`backlog-workflow/`](https://github.com/tc3oliver/skills/blob/main/backlog-workflow/README.md)——版本 `1.2.0`：安裝器與它的專案探查邏輯、工作流程規格範本（`WORKFLOW.md`、`TASK-POLICY.md`、`config.yml`）、三個專案 skill，以及安裝器自己的單元測試與封裝驗證（`python3 -m unittest discover -s tests`、`python3 scripts/validate_package.py`）。
- [`audit-claude-md/`](https://github.com/tc3oliver/skills/blob/main/audit-claude-md/README.md)——前面提到的指令稽核 skill：context 品質、指令設計、漸進揭露，以及 coding agent 指令檔的可維護性。

</div>

安裝方式可以是 agent skill（`npx skills add tc3oliver/skills`），也可以是 Claude Code plugin（`/plugin marketplace add tc3oliver/skills`）。

這套工作流程不只公開發佈，也實際用於本站開發。skill 集合是主要的開源專案；網站原始碼則呈現它在正式專案中的使用方式。

## 出處與授權

這個集合是我個人日常實際在用的一套 skill，儲存庫本身也是這樣寫的：並沒有宣稱其中每個想法都源自這裡。

`backlog-workflow` 與 `audit-claude-md` 是我自己的作品，以 MIT 授權發佈（`Copyright (c) 2026 tc3oliver`）。

`backlog-workflow` 一併安裝的 `grilling` 則不是。該檔案帶著這段標示：

> Bundled by backlog-workflow 1.2.0.
> Based on the `grilling` skill by Matt Pocock, used under the MIT License.
> The full license text ships alongside this file as LICENSE.

儲存庫自己的 `LICENSE` 也重申了一次：

> This repository bundles the `grilling` skill by Matt Pocock, used under the
> MIT License. Its full license text is included at
> `backlog-workflow/templates/project/.claude/skills/grilling/LICENSE` and is
> installed alongside the skill into target projects.

完整的 MIT 授權條文——`Copyright (c) 2026 Matt Pocock`——會隨著這個 skill 一起被安裝進每一個使用此工作流程的專案。同一個儲存庫中另外三個 skill，`diagnosing-bugs`、`writing-for-agents` 與 `resolving-merge-conflicts`，同樣改編自 [`mattpocock/skills`](https://github.com/mattpocock/skills)，並在各自的目錄中保留原有的 MIT 授權與出處標示。
