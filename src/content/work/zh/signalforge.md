---
title: 'SignalForge'
type: '開源 · 知識與 Agent 系統'
summary: '自架的情報系統：把十幾個來源的雜訊收進來，整理成去重的事件、跨日的變化、正在成形的趨勢，最後產出一頁每個數字都查得到出處的每日重點。'
outcome: '每天早上自動跑完，不用人顧；每日重點裡的每個來源引用和每個數字，都先經過程式碼驗證才發布。'
indexMeta: 'MIT · TypeScript · Postgres · 雙 session agent runtime'
evidence: 'signal.meowcoder.com · 每天實際產出的每日重點，加上 GitHub 上的完整原始碼'
slug: 'signalforge'
locale: 'zh'
translationKey: 'signalforge'
order: 1
draft: false
meta:
  - label: '狀態'
    value: '線上 · 每天執行 · 單人使用'
  - label: '授權'
    value: 'MIT'
  - label: '技術'
    value: 'TypeScript · Postgres 17 + pgvector · Next.js 閱讀介面'
  - label: '資料來源'
    value: 'RSS、GitHub、Hacker News、arXiv、Reddit、YouTube、SEC、FRED、CoinGecko'
---

由 Oliver Yu 獨立設計、開發、維運。

## 問題

Feed reader 給你的是「今天的文章」，但文章不是對的單位。

五家媒體報同一次 release，是一件事，不是五篇要讀的東西。今天發布的文章，
很多根本不是新資訊：它是上週那件事的評論、一個現在被證實的傳聞，或是一個
早就在追蹤的數字又動了一下。把這些分清楚才是真正的工作，而摘要工具不做這件
事：丟五篇文章進去，拿回來的是五份摘要。

<a href="https://github.com/tc3oliver/signalforge" target="_blank" rel="noopener noreferrer">SignalForge</a>
的單位是**事件，不是文章**。每個 story 都記在 ledger 裡，今天收到的內容先和
已知的狀態比對，記下來的是「什麼變了」：

| 變化類型             | 意義                          |
| -------------------- | ----------------------------- |
| `NEW`                | 第一次看到這個事件            |
| `UPDATE`             | 已知的 story 出現真正的新細節 |
| `ESCALATION`         | 情況變得更嚴重                |
| `RESOLUTION`         | 有結果了                      |
| `REVERSAL`           | 往反方向發展                  |
| `CONFIRMATION`       | 傳聞或單一來源的報導被證實了  |
| `RUMOR`              | 有報導，但來源還不足以定案    |
| `NO_MATERIAL_CHANGE` | 有報導，但沒有新資訊          |

`NO_MATERIAL_CHANGE` 是整個設計的關鍵。被標成這樣的 story 會更新 ledger，
但刻意不進每日重點。「追蹤事件」和「摘要文章」的差別就在這裡。

## 架構

管線是一串階段，中間是一個持久化的資料庫，前後兩個各自獨立的 agent session
只透過 tool 讀寫它。

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">收集</span>
<span class="state-flow__detail">十個 collector 把 watchlist 指定的內容全部抓回來。這一層不做任何編輯判斷。</span>
<span class="state-flow__part"><span class="state-flow__part-label">來源</span>每一筆在進來的那一刻就標為不可信任</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">策展</span>
<span class="state-flow__detail">一個 agent session 讀過當天每一筆，把文章歸成事件、和 ledger 比對、判斷什麼變了。</span>
<span class="state-flow__part"><span class="state-flow__part-label">寫入</span>逐筆決策、story ledger</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">判斷</span>這是哪個 story、變化類型、重要性</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">撰寫</span>
<span class="state-flow__detail">另一個獨立的 session，全新的 context，只看得到策展後的素材，負責寫每日重點。</span>
<span class="state-flow__part"><span class="state-flow__part-label">讀取</span>素材、附掛的來源、結構化事實</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">文字</span>發生了什麼、為什麼重要、和昨天比變了什麼</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">驗證與發布</span>
<span class="state-flow__detail">程式碼逐一檢查每個來源 id 和事實引用。引用了不存在的東西，整份重點退回重寫。</span>
<span class="state-flow__part"><span class="state-flow__part-label">輸出</span>每日重點、story 資料列、正在成形的趨勢</span>
</li>
</ol>
<figcaption class="state-flow__caption">實線框是收集或驗證過的內容，虛線框是模型的判斷或文字。兩者永遠不共用同一列：閱讀介面只渲染已發布的資料列，從不呼叫模型。</figcaption>
</figure>

Postgres 是唯一的正式儲存。收集到的項目、決策、跨日 ledger、素材、草稿、
發布的每日重點和趨勢，全部都是資料列，管線和網頁閱讀介面讀的是同一批資料。
資料列用 lineage 分隔命名空間，所以合成資料或實驗性的執行可以和正式環境共用
一個資料庫，不會互相干擾。

## 工程決策

每個決策底下都寫清楚它守住什麼，以及付出什麼代價。

<div class="decision">

### 需要留下來的東西，都不放在 agent session 裡

**原因** — session 是一段對話，不是記憶。它會結束、會塞爆、會跟著背後的
provider 一起掛掉。每個決策、每個 story、每份草稿，產生的當下就透過 tool
寫進 Postgres。

**結果** — Curator 跑到第 50 筆當掉，可以換另一個模型從第 51 筆接手，因為前
50 筆決策在資料庫裡，不在一段已經死掉的對話裡。從 JSON 檔案搬到 Postgres
的時候，只改了儲存層，其他一行都沒動。

</div>

<div class="decision">

### Curator 和 Editor 是兩個 session，工具集不重疊

**原因** — Curator 看得到原始的資料流，也能改 ledger。Editor 只看得到 Curator
附在素材上的東西，而且完全沒有寫入的工具。所以 Editor 在結構上不可能把
Curator 已經丟掉的 story 撈回來，也不可能拿更差的資訊偷偷重做一次策展。

**結果** — Editor 失敗的代價很低：沒有值得保留的對話，管線直接用存好的素材
開一個全新的 Editor session 重來。

</div>

<div class="decision">

### 數字用引用傳，不用文字寫

**原因** — 只存在於模型輸出裡的數字沒有出處。每日重點裡的每個數字都是一個
fact id，渲染的時候才從結構化事實庫查出數值、單位和時間戳。

**取捨** — 查不到的 fact id 會顯示成一個明顯的缺口，而不是換一個數字補上。
這看起來比一個自信的數字更糟，但那正是用意。

</div>

<div class="decision">

### 驗證是程式碼，不是第二個模型

**原因** — 問模型「你做得好不好」不算信任邊界。驗證器檢查的是：每個引用的
來源 id 是不是真的收集過、每個事實引用查不查得到、每日重點有沒有符合必要的
結構；失敗時直接指出是哪個欄位。

**結果** — 管線從來不從 assistant 訊息裡 parse JSON。兩個 session 都是透過有
驗證的 tool call 提交，驗證失敗的提交會被退回，並附上讓 session 可以據以修正
的理由。

</div>

<div class="decision">

### Agent 看到之前，不做任何編輯過濾

**原因** — 「看起來不重要」是 Curator 的判斷。把這個判斷提前到 collector，
管線就會在沒人發現的情況下慢慢看不到東西。Collector 只能因為完全重複、損壞、
不支援的格式或違反來源政策而丟掉一筆。

**取捨** — Curator 要讀完當天收到的每一筆，忙碌的日子遠超過一千筆。成本
跟著收集量走，不是跟著進入每日重點的數量走，這是最大的一筆營運成本。

</div>

<div class="decision">

### 相似度只負責縮小範圍，從不做決定

**原因** — 兩筆項目是不是在講同一件事，是從文字做出的判斷，而且會明確記錄
下來。系統裡沒有任何一個相似度門檻會自己把兩筆合併。

**結果** — 對當天項目的詞彙搜尋、對 ledger 的歷史搜尋，都只是產生候選，
交給模型之後由模型決定。向量欄位和索引已經建好，但還不在決策路徑上。

</div>

## 安全模型

每一筆收集到的項目都是別人寫的外部文字，runtime 的設計就從這個前提出發。

- **外部內容在進來的那一刻就標為不可信任**，在任何 agent 看到之前就完成，
  後面每一層都不需要再記得這件事。透過收集項目做的 prompt injection 是
  範圍內的弱點。
- **Agent runtime 受限**：沒有 shell、除了一個只能讀政策文件的窄範圍讀取器
  之外沒有檔案系統、沒有任意 HTTP、沒有憑證。每次執行都會斷言並記錄，
  不是只靠設定。
- **Agent 從不持有憑證。** Collector 和研究層在伺服器端執行，交給 agent 的
  是內容，不是金鑰。模型的登入資訊屬於安裝好的 agent runtime，唯讀。
- **閱讀介面只讀、預設只在本機。** Postgres 和網頁應用預設綁 loopback，每個
  回應都帶嚴格的 CSP，還有一個測試會走過閱讀介面底下每個檔案，只要有任何
  一處碰得到模型就讓建置失敗。

## 正在成形的趨勢

趨勢是連續幾天反覆出現、但任何單一天都還不足以構成 story 的微弱訊號。它的
標籤是模型寫的文字，每天都會變，要是拿標籤來比對，同一個趨勢每天早上都會
變成一列新的，它的存在天數（趨勢唯一有意思的屬性）永遠累積不起來。所以改
用它背後的 story 集合當作穩定的身分，以重疊程度來比對。這是管線裡最不成熟、
也最可能再改的部分。

## 限制

直接講清楚，因為這決定了這個設計值不值得參考。

- **單人、自架。** 一個讀者、一個資料庫，閱讀介面前面沒有登入。公開的
  實例是只讀的，只提供管線已經發布的內容。
- **每日重點的品質受限於模型和來源涵蓋範圍。** 管線在能確定的地方都是
  確定性的，判斷的部分不是。
- **個人化有規格，還沒接上。** 興趣設定檔會被驗證，但 agent 還沒讀它，
  也還沒有任何東西會從你實際讀了什麼去學習。
- **歷史價值要靠累積的 ledger。** 全新安裝的前幾天，什麼都是 `NEW`。
- **不提供支援。** 公開是因為這個設計可能值得讀、值得改，不是因為有人
  在待命。

## 開源實作

<div class="evidence">

- <a href="https://signal.meowcoder.com" target="_blank" rel="noopener noreferrer"><code>signal.meowcoder.com</code></a>
  — 我自己的實例，照管線發布的樣子公開：今天的每日重點、歷史和趨勢。
- <a href="https://github.com/tc3oliver/signalforge" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/signalforge</code></a>
  — 管線、閱讀介面、migration 和驗證測試，MIT 授權。
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer"><code>docs/ARCHITECTURE.md</code></a>
  — 為什麼長這樣，以及每個保證是在哪裡強制的。
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/SECURITY.md" target="_blank" rel="noopener noreferrer"><code>docs/SECURITY.md</code></a>
  — 威脅模型，以及每一條背後對應的程式碼和測試。
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/INTELLIGENCE_BACKLOG.md" target="_blank" rel="noopener noreferrer"><code>docs/INTELLIGENCE_BACKLOG.md</code></a>
  — 接下來要做的事，附證據和驗收條件。

</div>

`pnpm verify` 是判斷一個改動能不能進的指令：型別檢查、不允許跳過任何測試的
完整測試、加上閱讀介面的建置。CI 在真實的 Postgres 上跑它。`pnpm demo`
不需要模型、金鑰或網路，就能產生三天的合成歷史，讓你在設定任何東西之前先
看到閱讀介面跑起來的樣子。
