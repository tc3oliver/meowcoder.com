---
title: 'SignalForge'
type: '開源 · 知識與 Agent 系統'
summary: '自架的情報處理管線，把多來源、充滿雜訊的資訊流整理成去重後的事件、跨日變化、正在浮現的訊號，以及每一句都有來源可查的每日簡報。'
outcome: '以雙 session 的 agent 架構每天早上無人值守執行；簡報裡的每個來源引用與每個數字，都先由程式碼驗證才發布。'
indexMeta: 'MIT · TypeScript · Postgres · 雙 session agent runtime'
evidence: 'github.com/tc3oliver/signalforge · 架構、安全模型與驗證流程全部公開'
slug: 'signalforge'
locale: 'zh'
translationKey: 'signalforge'
order: 1
draft: false
meta:
  - label: '狀態'
    value: '自架 · 單人使用 · 每日執行'
  - label: '授權'
    value: 'MIT'
  - label: '技術'
    value: 'TypeScript · Postgres 17 + pgvector · Next.js 閱讀介面'
  - label: '資料來源'
    value: 'RSS、GitHub、Hacker News、arXiv、Reddit、YouTube、SEC、FRED、CoinGecko'
---

由 Oliver Yu 獨立設計、開發與維運。

## 問題

Feed reader 給你的是「今天的文章」。但文章是錯的單位。

五家媒體報導同一次 release，是一件事，不是五篇要讀的東西。今天發布的文章，
很多時候並不是新資訊：它是上週已經報過的事情的評論、一個現在被證實的傳聞，
或是一個往你早就在追蹤的方向移動的數字。把這些分開才是真正的工作，而摘要工具
不做這件事——摘要五篇文章，得到的是五份摘要。

<a href="https://github.com/tc3oliver/signalforge" target="_blank" rel="noopener noreferrer">SignalForge</a>
以**事件為中心，而不是文章**。每個 story 都存在 ledger 裡，今天的內容會和已知
的狀態比對，記錄下來的是「什麼變了」：

| 變化類型             | 意義                           |
| -------------------- | ------------------------------ |
| `NEW`                | 第一次看到這個事件             |
| `UPDATE`             | 已知 story 出現真正的新細節    |
| `ESCALATION`         | 情況變得更嚴重                 |
| `RESOLUTION`         | 已經有結果                     |
| `REVERSAL`           | 往反方向發展                   |
| `CONFIRMATION`       | 傳聞或單一來源的報導現在被證實 |
| `RUMOR`              | 有報導，但來源還不足以定案     |
| `NO_MATERIAL_CHANGE` | 有報導，但沒有新資訊           |

`NO_MATERIAL_CHANGE` 是整個設計的支點。處於這個狀態的 story 會更新 ledger，
但刻意不進簡報。這就是「追蹤事件」和「摘要文章」的差別。

## 架構

管線是一連串階段，中間是一個持久化的資料庫，兩個短命的 agent session 透過
tool 讀寫它。

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">收集</span>
<span class="state-flow__detail">十個 collector 抓取 watchlist 指定的所有內容。這一層不做任何編輯判斷。</span>
<span class="state-flow__part"><span class="state-flow__part-label">來源</span>每一筆在邊界就標為不可信任</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">策展</span>
<span class="state-flow__detail">一個 agent session 掃過當天每一筆，聚合事件、比對 ledger、判斷什麼變了。</span>
<span class="state-flow__part"><span class="state-flow__part-label">寫入</span>逐筆決策、story ledger</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">判斷</span>story 身分、變化類型、重要性</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">撰寫</span>
<span class="state-flow__detail">另一個獨立 session，全新 context，只看得到策展後的素材，負責寫簡報。</span>
<span class="state-flow__part"><span class="state-flow__part-label">讀取</span>素材、附掛的來源、結構化事實</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">文字</span>發生什麼、為什麼重要、什麼變了</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">驗證與發布</span>
<span class="state-flow__detail">程式碼檢查每個來源 id 與事實引用。引用了不存在的東西的簡報會被退回。</span>
<span class="state-flow__part"><span class="state-flow__part-label">輸出</span>每日簡報、story 列、浮現訊號</span>
</li>
</ol>
<figcaption class="state-flow__caption">實線是收集或驗證過的內容；虛線是模型的判斷或文字。兩者永遠不共用同一列：閱讀介面只渲染已發布的資料列，從不呼叫模型。</figcaption>
</figure>

Postgres 是唯一的正式儲存。收集到的項目、決策、跨日 ledger、素材、草稿、已發布
的簡報與浮現訊號都是資料列，管線和網頁閱讀介面讀的是同一批資料。資料列以
lineage 區隔命名空間，所以合成資料或實驗性的執行可以和正式環境共用一個資料庫，
永遠不會互相干擾。

## 工程決策

以下每個決策都配上它保護的約束，以及付出的代價。

<div class="decision">

### 任何需要持久的東西都不留在 agent session 裡

**原因** — session 是一段對話，不是記憶。它會結束、會溢位、會跟著服務它的
provider 一起死掉。每個決策、每個 story、每份草稿，在產生的當下就透過 tool
寫進 Postgres。

**結果** — 在第 50 筆崩潰的 curator，可以由另一個模型從第 51 筆接手，因為前
50 筆決策在資料庫裡，而不是在一段已經死掉的對話裡。從 JSON 檔案搬到 Postgres
只改了儲存層，其他什麼都沒動。

</div>

<div class="decision">

### Curator 與 Editor 是兩個 session，工具集互不重疊

**原因** — Curator 看得到原始的資訊洪流，也能修改 ledger。Editor 只看得到
Curator 附掛的素材，而且完全沒有寫入工具。所以 Editor 在結構上不可能復活
Curator 已經捨棄的 story，也不可能拿更差的資訊悄悄重做一次策展。

**結果** — Editor 失敗的代價很低：沒有值得保留的對話，管線直接用已儲存的素材
重建一個全新的 editor session 再來一次。

</div>

<div class="decision">

### 數字以引用傳遞，不以文字傳遞

**原因** — 只存在於模型輸出裡的數字沒有出處。簡報用到的每個數字都是一個
fact id，在渲染時才從結構化事實庫解析出數值、單位與時間戳。

**取捨** — 無法解析的 fact id 會渲染成一個明確的缺口，而不是換一個數字補上。
這看起來比一個自信的數字更糟，而這正是刻意的。

</div>

<div class="decision">

### 驗證是程式碼，不是第二個模型

**原因** — 問模型「你做得好不好」不是信任邊界。驗證器檢查每個引用的來源 id
是不是收集過的項目、每個事實引用是否能解析、簡報是否符合必要的結構；失敗時
指名是哪個欄位。

**結果** — 管線從不從 assistant 訊息裡解析 JSON。兩個 session 都透過受驗證
的 tool call 提交，驗證失敗的提交會被退回，並附上 session 可以據以修正的理由。

</div>

<div class="decision">

### Agent 之前不做任何編輯過濾

**原因** — 「看起來不重要」是 curator 的判斷。把這個判斷提前到 collector，
就是管線悄悄變瞎的方式。collector 只能因為完全重複、損壞、不支援的格式或
違反來源政策而丟棄一筆項目。

**取捨** — curator 要掃過當天收集的每一筆，忙碌的一天遠超過一千筆。成本
隨收集量成長，而不是隨進入簡報的數量成長，這是最大的一筆營運成本。

</div>

<div class="decision">

### 相似度只負責縮小範圍，從不做決定

**原因** — 兩筆項目是不是在講同一件真實世界的事件，是從文字做出的判斷，而且
會被明確記錄。系統裡沒有任何一個相似度門檻會自行把兩筆合併。

**結果** — 對當天項目的詞彙搜尋、對 ledger 的歷史搜尋，都只是候選產生器，
交給模型之後由模型決定。向量欄位與索引已經建好，但還不在決策路徑上。

</div>

## 安全模型

每一筆收集到的項目都是別人寫的外部文字，runtime 就建立在這個假設上。

- **外部內容在邊界就標為不可信任**，在任何 agent 看到之前就完成，後面的
  每一層都不需要記得這件事。透過收集項目進行的 prompt injection 屬於範圍內
  的弱點。
- **Agent runtime 受限**：沒有 shell、除了一個範圍極窄的政策讀取器之外
  沒有檔案系統、沒有任意 HTTP、沒有憑證。每次執行都會斷言並記錄，而不只是
  設定。
- **Agent 從不持有憑證。** collector 與研究層在伺服器端執行，交給 agent
  的是內容，從來不是金鑰。模型的認證屬於安裝的 agent runtime，唯讀。
- **閱讀介面只在本機、只讀。** Postgres 與網頁應用預設綁定 loopback，每個
  回應都帶嚴格的 CSP，並有一個測試走過閱讀介面下的每個檔案，只要任何一處
  能觸及模型就讓建置失敗。

## 浮現訊號

訊號是跨日重複出現、但任何單日都不足以構成 story 的微弱模式。它的標籤是模型
寫的文字，每天都會漂移，若用標籤比對，同一個訊號每天早上都會裂成一列新的，
它的年齡——訊號唯一有趣的屬性——永遠累積不起來。所以改用證據 story 集合作為
穩定身分，以重疊程度比對。這是管線裡最不成熟、也最可能改變的部分。

## 限制

直接說清楚，因為這決定了這個設計值不值得參考。

- **單人、自架。** 一個讀者、一個資料庫，閱讀介面前面沒有認證。
- **簡報品質受限於模型與來源涵蓋範圍。** 管線在能確定的地方都是確定性的；
  判斷不是。
- **個人化已經規格化，但還沒接上。** 興趣設定檔會被驗證，但 agent 還沒讀它，
  也沒有任何東西從你實際讀了什麼學習。
- **歷史價值需要累積的 ledger。** 全新安裝的前幾天，所有東西都是 `NEW`。
- **不提供支援。** 公開是因為設計可能值得閱讀與改編，不是因為有人待命。

## 開源實作

<div class="evidence">

- <a href="https://github.com/tc3oliver/signalforge" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/signalforge</code></a>
  — 管線、閱讀介面、migration 與驗證測試，MIT 授權。
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer"><code>docs/ARCHITECTURE.md</code></a>
  — 為什麼長這樣，以及每個保證在哪裡被強制執行。
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/SECURITY.md" target="_blank" rel="noopener noreferrer"><code>docs/SECURITY.md</code></a>
  — 威脅模型，以及每一條背後的程式碼與測試。
- <a href="https://github.com/tc3oliver/signalforge/blob/main/docs/INTELLIGENCE_BACKLOG.md" target="_blank" rel="noopener noreferrer"><code>docs/INTELLIGENCE_BACKLOG.md</code></a>
  — 接下來要做的事，附證據與驗收條件。

</div>

`pnpm verify` 是判斷一個變更好不好的指令：型別檢查、不允許任何測試跳過的
完整測試、以及閱讀介面的建置。CI 在真實的 Postgres 上執行它。`pnpm demo`
不需要模型、金鑰或網路，就能產生三天的合成歷史，讓閱讀介面在任何設定之前
就能看到它運作的樣子。
