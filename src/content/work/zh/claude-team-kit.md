---
title: 'Claude Team Kit'
type: '開源 · Agent 工具'
summary: '一個 Claude Code plugin，替 Agent Teams 的 teammate 數量加上硬性上限，並提供唯讀的 Mission Control 面板，顯示 worker、任務相依與用量。'
outcome: '超過 worker 上限的 teammate spawn 會被拒絕，任務維持待處理。上限只計算原生 teammate。'
indexMeta: '公開預覽 · Claude Code plugin · MIT'
evidence: 'github.com/tc3oliver/claude-team-kit · docs/LIMITATIONS.md 與 docs/REVIEW.md 的驗證紀錄'
slug: 'claude-team-kit'
locale: 'zh'
translationKey: 'claude-team-kit'
order: 5
draft: false
meta:
  - label: '狀態'
    value: '公開預覽'
  - label: '執行環境'
    value: 'Claude Code Agent Teams 與 Mods'
  - label: '互動式實測平台'
    value: 'macOS'
---

由 Oliver Yu 獨立設計與開發。

## 問題

Claude Code 的 Agent Teams 讓一個 lead session 把工作分給多個 teammate；teammate 是各自獨立的 session，共用一份任務清單。Claude Code 的文件裡沒有任何設定可以限制同時存活的 teammate 數量，而且團隊在跑的時候，除了對話記錄之外幾乎沒有東西可看：誰在做什麼、哪個任務在等哪個任務、用量額度已經用掉多少。

<a href="https://github.com/tc3oliver/claude-team-kit" target="_blank" rel="noopener noreferrer">Claude Team Kit</a>（CTK）是一個補上限制與檢視的 plugin。它不是排程器，團隊仍由 Claude Code 自己運作。

## 它做什麼

- **硬性 worker 上限。** 預設 5，可設為 1 到 12。超過上限的 teammate spawn 會被拒絕並回報 `TEAM_CAPACITY_REACHED`，該任務維持待處理。讀不到 roster 時，spawn 會被拒絕並回報 `TEAM_GUARD_FAILED`，不會放行。
- **Mission Control。** 唯讀面板，點提示列上方那一行就會開啟，顯示 worker、任務相依圖與用量，不會啟動、停止或更動任何東西。CTK 沒有觀察到的數字會顯示 `unavailable`，不會編一個 0。
- **用量 HUD。** 提示列上方的團隊狀態列，顯示模型、5 小時與每週用量、agent 數對上限、任務與費用，只讀 Claude Code 傳來的資料。
- **Review 與除錯。** `/ctk:review` 依變更風險決定 reviewer 的深度；`/ctk:debug` 要求先有能重現問題的失敗測試，再動手修。
- **可攜的設定。** 選項透過 plugin 管理介面設定；另有選用的 CLI，可經由你自己的 git 儲存庫在不同機器間同步設定檔，每次發布前都會先掃描 secrets。

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Plan</span>
<span class="state-flow__detail">lead 把目標切成每一塊都能單獨驗證的任務。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Coordinate</span>
<span class="state-flow__detail">由相依關係決定哪些任務可以開始，只有就緒的任務才會啟動。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Execute</span>
<span class="state-flow__detail">teammate 平行作業，最多到上限；超出的 spawn 由 mod 拒絕。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Verify</span>
<span class="state-flow__detail">lead 跑完最後的檢查，才宣告目標完成。</span>
</li>
</ol>
<figcaption class="state-flow__caption">CTK 團隊的四個步驟。團隊與任務清單由 Claude Code 提供，引導 lead 的 skill 是模型讀了照著做的流程，真正會強制執行的只有 plugin 的 mod（掛在 `agent.spawn` 上的 hook），它強制的是上限。</figcaption>
</figure>

## 證據與限制

README 自己寫明這是公開預覽。`docs/LIMITATIONS.md` 逐項列出尚未驗證的部分，每項說法都標有證據等級：實機執行過、維護者回報、有測試覆蓋、只讀過程式碼，或尚未驗證。

- Agent Teams 仍是實驗性功能，承載上限與團隊狀態列的 Mods 則是搶先體驗。Claude Code 更新後，即使 CTK 沒有任何改動，兩者都可能壞掉。沒有 Mods 的環境中，`/ctk:team` 會告知上限未啟用。
- 上限只計算原生 teammate。一般 subagent 既不計入也不受限，而且它限制的是同時存活的 teammate 數量，不是花費。
- 獨立驗證對上限做了模擬主機的測試和 mutation 檢查，另有一次把上限設為 1 的實機探測，只跑過一次、只在一個 Claude Code 版本上，結果多出來的 teammate spawn 都被拒絕。
- 維護者另外回報過一次實機測試：上限為 3、同時送出 6 個 spawn，3 個啟動、3 個被拒。這項結果是維護者回報的，沒有重現過。
- 獨立的實機探測也發現一個繞過方式：有名字、但 Claude Code 不當成 teammate 的 spawn（例如帶 `isolation: worktree`）會在上限之上啟動。守衛無法拒絕它，只會計數。
- `/ctk:team` 流程還沒有用實機 agent 完整跑過一遍。
- 被拒絕的 spawn 在對話記錄裡仍可能被畫成「Done」。skill 會把拒絕訊息視為尚未啟動，但它終究只是 skill，模型仍可能誤讀。
- 互動式使用只在 macOS 上測過。Linux 與 Windows 只有 CI 覆蓋。
- README 沒有任何關於速度、費用或節省 token 的宣稱。

<div class="evidence">

- <a href="https://github.com/tc3oliver/claude-team-kit" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/claude-team-kit</code></a>
  — plugin、選用的 CLI 與變更紀錄。
- <a href="https://github.com/tc3oliver/claude-team-kit/blob/main/docs/LIMITATIONS.md" target="_blank" rel="noopener noreferrer"><code>docs/LIMITATIONS.md</code></a>
  — CTK 做不到的事，以及尚未驗證的項目。
- <a href="https://github.com/tc3oliver/claude-team-kit/blob/main/docs/REVIEW.md" target="_blank" rel="noopener noreferrer"><code>docs/REVIEW.md</code></a>
  — 驗證紀錄：設計決策、每項檢查的重現方式與 mutation 結果。
- <a href="https://github.com/tc3oliver/claude-team-kit/releases" target="_blank" rel="noopener noreferrer">Releases</a>
  — 已發布的 pre-release。

</div>
