---
title: 'PiShip'
type: '開源 · Agent 基礎設施'
summary: '一套工具鏈，讓公司不必 fork Pi 就能把它做成自家的 coding agent，並補上 OIDC 登入、短效 gateway 憑證、policy 與 sandbox。'
outcome: 'v0.13.0 的 qualification run 一次就通過：9 個附 attestation 的封存檔各 build 兩次，payload 全部相同。'
indexMeta: 'Pre-release · Linux、macOS、Windows'
evidence: 'github.com/tc3oliver/piship · docs/status.md、v0.13.0 release 與它的 qualification run'
slug: 'piship'
locale: 'zh'
translationKey: 'piship'
order: 4
draft: false
meta:
  - label: '狀態'
    value: 'Pre-release'
  - label: '建構於'
    value: '上游 Pi，未修改'
  - label: '發行檔'
    value: '附 attestation 的封存檔 · linux-x64、darwin-arm64、win32-x64'
---

由 Oliver Yu 獨立設計與開發。

## 問題

公司讓開發者用上 <a href="https://github.com/earendil-works/pi" target="_blank" rel="noopener noreferrer">Pi</a> 這類 coding agent 之後，很快會需要四樣它沒有內建的東西：單一登入、筆電上不放任何模型供應商的 API key、每條指令都套上 sandbox，以及 agent 做過什麼的紀錄。常見做法是 fork，代價是只要還在用，就得持續合併每一個上游版本。

<a href="https://github.com/tc3oliver/piship" target="_blank" rel="noopener noreferrer">PiShip</a> 的做法是：公司只要寫一份 `piship.yaml`，PiShip 就據此建出一個帶有公司品牌的指令；儲存庫內的範例是 `acmecode`、`mypi` 與 `devcode`。Pi 維持上游原樣，v0.13.0 固定在 1.1.0。Pi 出新版時，只需更新版本鎖定、跑相容性測試。

## 它做什麼

- **登入。** OIDC 搭配 PKCE。PiShip 拿身分 token 去公司的 credential broker 換一張短效的 gateway 憑證，預設存進作業系統的鑰匙圈、自動續期，登出時撤銷。gateway 只看得到這張憑證。
- **模型。** 請求送往公司內部、相容 OpenAI API 的 gateway，而且只能用 manifest 允許的模型。
- **Policy。** 工具呼叫、檔案存取、shell 指令與 MCP 工具在執行前先檢查，`policy explain` 會指出是哪一條規則做的決定。runtime 無法強制執行的 `deny` 或 `ask` 規則，會讓啟動直接失敗，並回報 `POLICY_UNENFORCEABLE`。
- **Sandbox。** bubblewrap、Seatbelt 或遠端 backend。manifest 要求 sandbox、但 sandbox 無法啟動時，指令不會在主機上執行。
- **Audit。** 只含 metadata 的 audit 事件會送到公司自己架的 HTTP collector。

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">OIDC 登入</span>
<span class="state-flow__detail">開發者透過公司的 identity provider 登入。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">公司身分系統</span>
<span class="state-flow__detail">簽發身分 token。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Credential broker</span>
<span class="state-flow__detail">用身分 token 換一張 gateway 憑證。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Gateway 憑證</span>
<span class="state-flow__detail">短效，預設存在作業系統的鑰匙圈。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Pi runtime</span>
<span class="state-flow__detail">帶著這張憑證送出模型請求。</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">公司 LLM gateway</span>
<span class="state-flow__detail">只會看到這張憑證，筆電上沒有模型供應商的 API key。</span>
</li>
</ol>
<figcaption class="state-flow__caption">從登入到公司 gateway 的路徑。</figcaption>
</figure>

PiShip 不取代公司的 identity provider、broker 或 gateway。公司需要提供哪些 endpoint，寫在 <a href="https://github.com/tc3oliver/piship/blob/main/docs/enterprise-integration.md" target="_blank" rel="noopener noreferrer"><code>docs/enterprise-integration.md</code></a>。

## 每個版本怎麼驗證

v0.13.0 的一次 release 有 9 個封存檔：3 個範例 distribution，各有 3 個平台的版本。每個都 build 兩次再互相比對。v0.13.0 的 qualification run 中，9 個全部 payload 一致。兩次 build 出來的 `devcode` 封存檔位元組不同，只是因為 `vulnerabilities.json` 記錄了掃描時間。同一次 run 驗證了 attestation，檢查了 registry 簽章，也跑過漏洞檢查（後兩項都是 9 個全過）；另外測試了拒絕被竄改的封存檔，以及離線安裝。

Run 37887824632 在打了 tag 的那個 commit 上第一次就通過：54 個 job 通過，2 個略過，因為回報 issue 的 job 只在排程時執行。

## 證據與限制

`docs/status.md` 是目前 `main` 支援範圍的唯一依據，限制也都列在裡面。主要的幾項：

- 尚未在正式環境對真實的公司 identity provider 或公司 gateway 做過驗證。
- 原生 Windows 沒有 sandbox adapter。要求 sandbox 的 distribution 在那裡會因 `SANDBOX_UNAVAILABLE` 被拒絕執行。
- 專案本身沒有提供經過簽章的更新管道。發布的封存檔停用更新，使用者要固定版本，直接安裝通過 qualification 的那個封存檔。
- `acmecode` 的 win32 封存檔以 `sandbox.required: false` 發行。
- macOS 上 sandbox 的 heartbeat 測試偶爾失敗，至今找不到根本原因。
- 內嵌（vendored）的 Pi 套件沒有檢查 registry 簽章。
- v0.13.0 沒有驗證過真實的 pi-code isolated 或 background agent 執行。

<div class="evidence">

- <a href="https://github.com/tc3oliver/piship" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/piship</code></a>
  — 原始碼、範例與變更紀錄。
- <a href="https://github.com/tc3oliver/piship/blob/main/docs/status.md" target="_blank" rel="noopener noreferrer"><code>docs/status.md</code></a>
  — 支援範圍、每項主張背後的證據，以及已知限制。
- <a href="https://github.com/tc3oliver/piship/releases/tag/v0.13.0" target="_blank" rel="noopener noreferrer">v0.13.0 pre-release</a>
  — 9 個封存檔，附 SHA-256 檔與 attestation。

</div>
