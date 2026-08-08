---
id: TASK-3
title: MCD-10 — 開源品質
status: Done
assignee: []
created_date: '2026-08-08 06:43'
updated_date: '2026-08-08 14:41'
labels: []
dependencies:
  - TASK-1
priority: medium
type: chore
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §19-24（Open Source Scope / Exclusions / Licensing / README / Quality Bar / Relationship to Portfolio）、§39 (MCD-10)

## 目標

讓公開儲存庫本身成為專業工程品質的證據，符合 PRD §23 的最低標準。

## 範圍

- README，結構依 PRD §22
- 明確的授權分割說明（原始碼 MIT / 個人內容與品牌資產保留權利）
- 相依更新機制
- CI 機密掃描步驟
- CI 連結檢查步驟
- 由乾淨 clone 驗證可重現的本機環境建置
- 依是否接受外部貢獻決定 CONTRIBUTING.md

## 不在範圍

- Lighthouse / 無障礙 CI gate（MCD-11）
- 任何頁面內容
- 將儲存庫切換為 public（MCD-13）

## 穩定實作限制

- README 不得變成長篇個人傳記（PRD §22）
- 不得僅為了方便陌生人 fork 而增加抽象層（PRD §18）
- meowcoder.com 原始碼定位為次要開源證據，不得超越 AI Coding Skills 的主要地位（PRD §24）
- 本任務僅新增儲存庫層級檔案與 CI 設定，不修改 src/ 下的頁面程式碼，以便與 MCD-2 平行執行時不衝突

## 驗證

- CI 上機密掃描與連結檢查工作皆通過
- 於暫存目錄 git clone 後，僅依 README 指示即可 install 與 build 成功

## 測試需求

- 以 CI 機密掃描與連結檢查通過作為驗證證據
- 乾淨 clone 建置為人工驗證，需記錄實際指令輸出

## 影響

- 安全性：機密掃描與相依更新政策（PRD §20、§23）
- 資料 / Schema：無
- API / 相容性：無
- 文件：README.md、LICENSE、內容授權聲明、CONTRIBUTING.md（如適用）
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README 依 PRD §22 結構撰寫（Stack、Development、License），維持工程導向且不含個人傳記
- [x] #2 授權分割在 README 與 LICENSE 明確標示：原始碼採 MIT、個人內容與品牌資產為 © Oliver Yu
- [x] #3 相依更新機制（Dependabot 或 Renovate）已設定並可產生更新 PR
- [x] #4 CI 包含連結檢查，能偵測 README 與網站中的失效連結
- [x] #5 CI 包含機密掃描步驟，能攔截誤加入的憑證或金鑰
- [x] #6 從乾淨 clone 僅依 README 指示即可完成 install 與 build
- [x] #7 若接受外部貢獻則存在 CONTRIBUTING.md；若不接受，於 README 明確說明此決定
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
1. 研究現況：閱讀 MCD-1 既有產出（README.md、LICENSE、LICENSE-CONTENT.md、.github/workflows/ci.yml、.gitignore、package.json）與 PRD §18-24、§39 MCD-10、§41，確認本任務為「擴充」而非重寫。
2. README（AC #1 #2 #6 #7）：維持 PRD §22 的骨架（Stack / Development / License），補上可重現本機環境所需的完整指示（Node 22.12+、nvm、install、dev、build、preview）、品質檢查指令（含新增的 linkcheck）、Repository layout、Contributing 政策與 Security 說明。維持工程導向、不寫個人傳記、不揭露內部自動化開發機制。
3. 授權分割（AC #2）：確認 README 與 LICENSE / LICENSE-CONTENT.md 三處敘述一致（原始碼 MIT、個人內容與品牌資產 © Oliver Yu），並在 LICENSE 檔案本身加上指向 LICENSE-CONTENT.md 的範圍註記，避免 LICENSE 被單獨解讀為涵蓋全部檔案。
4. 相依更新機制（AC #3）：新增 .github/dependabot.yml，涵蓋 npm 與 github-actions 兩個 ecosystem，每週檢查、限制併發 PR 數並統一 commit message 前綴。選用 Dependabot 而非 Renovate：GitHub 原生、無需外部帳號或安裝 App。
5. 連結檢查（AC #4）：新增 devDependency linkinator 與 npm script `linkcheck`，同時檢查 dist/（建置後的網站 HTML，遞迴）與根目錄的 Markdown 文件（--markdown）。在 CI 於 build 之後、test 之前加入 Link check 步驟，符合 PRD §23 建議的 CI 順序。
6. 機密掃描（AC #5）：在 CI 新增獨立的 secret-scan job，以固定版本 + SHA256 checksum 下載官方 gitleaks 二進位檔（MIT 授權）執行 `gitleaks dir`（工作目錄）與 `gitleaks git`（完整歷史，fetch-depth: 0）。不使用 gitleaks-action，理由：該 Action 採商業 EULA 且對組織帳號需要授權金鑰，直接使用 OSS 二進位檔可完全免除外部帳號與授權相依，且可在本機以完全相同的指令驗證。
7. 儲存庫衛生：將 CI 內所有 GitHub Actions 由 tag 釘選改為 commit SHA 釘選（MCD-1 review 遺留項），並在註解記錄對應版本。
8. 驗證：依 PRD §23 順序執行 npm run format:check / lint / typecheck / build / linkcheck / test，全部必須通過；以 YAML 解析器驗證 ci.yml 與 dependabot.yml 語法；在本機以下載的 gitleaks 執行實際掃描取得證據。
9. AC #6 實測：git clone 本 worktree 至 /tmp 的暫存目錄，僅依 README 指示執行 install 與 build，記錄實際輸出後刪除暫存目錄。
10. 記錄 Implementation Notes（含實際指令輸出、以及哪些部分只能在 push 後由 CI 首次執行）、逐項勾選 AC 與 DoD、撰寫 Final Summary，最後提交至 backlog/TASK-3（不 push、不 merge）。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 實作內容

- `README.md`：在 MCD-1 骨架（PRD §22 的 Stack / Development / License）上補齊「乾淨 clone 可重現」所需的完整指示（Node 22.12+ 與 `nvm install`、install / dev / build / preview），品質檢查清單改為 CI 實際順序並加入 `npm run linkcheck`，新增 Repository layout、Continuous integration、Contributing、Security 段落。維持工程導向，未加入個人傳記，未提及任何內部自動化開發機制。
- `.github/workflows/ci.yml`：
  - `verify` job 在 Build 之後、Test 之前加入 `Link check` 步驟，符合 PRD §23 建議的 Install → Format/Lint → Typecheck → Build → Link Validation → Tests 順序。
  - 新增獨立的 `secret-scan` job：`fetch-depth: 0` 完整歷史 checkout，以固定版本 + SHA256 驗證下載官方 gitleaks 二進位檔，分別掃描工作目錄（`gitleaks dir .`）與完整 git 歷史（`gitleaks git .`）。
  - 所有 GitHub Actions 由 tag 釘選改為 commit SHA 釘選（MCD-1 review 遺留的儲存庫衛生項目），並在同行註解保留對應版本。
- `.github/dependabot.yml`：新增 `npm` 與 `github-actions` 兩個 ecosystem，每週一排程、限制同時開啟 5 個 PR、統一 commit message 前綴；開發相依的 minor/patch 更新分組為單一 PR。
- `package.json` / `package-lock.json`：新增 devDependency `linkinator@^8.0.3` 與 `linkcheck` script（同時檢查 `dist/` 與根目錄 Markdown）。
- 未修改：`LICENSE`、`LICENSE-CONTENT.md`（MCD-1 既有內容已足以描述授權分割與路徑對照）、`src/**`（依任務「不修改頁面程式碼」限制，避免與 MCD-2 平行執行衝突）。

## 決策紀錄

1. **機密掃描不採用 `gitleaks/gitleaks-action`**：該 Action 以商業 EULA 發布（`action.yml` 標頭指向 gitleaks.io 商業授權，組織帳號需 `GITLEAKS_LICENSE`）。改用官方 release 二進位檔（gitleaks 本體為 MIT），以版本 + SHA256 雙重釘選，完全不需要外部帳號或金鑰，且本機能以完全相同的指令重現。
2. **連結檢查採 `linkinator`**：單一工具即可同時處理建置後的 `dist/` HTML（`--recurse`）與儲存庫 Markdown（`--markdown`），且是 npm devDependency，開發者在本機就能執行，不必等 push 才知道結果。目前未設定 skip 清單，因為 README 與網站外部連結數量極少；若日後出現第三方站點誤判再視情況加入。
3. **Actions 版本**：SHA 釘選同時升級至目前主要版本 `actions/checkout` v7.0.1、`actions/setup-node` v7.0.0；已查閱兩者 v7 release notes 確認對本專案使用的輸入參數（`persist-credentials`、`node-version-file`、`cache`）無破壞性變更。後續 SHA 與版本註解由 Dependabot 的 `github-actions` ecosystem 維護，避免釘選後永久停滯。
4. **AC #7 判定：不接受外部貢獻**，因此不新增 `CONTRIBUTING.md`，改在 README 的 Contributing 段落明確聲明並保留 issue 回報管道。依據 PRD §18（不為了方便陌生人 fork 而增加抽象層、不定位為通用 portfolio template）與 §24（本儲存庫是次要工程證據）。此為可逆決策，日後改為接受貢獻時再新增 `CONTRIBUTING.md` 即可。
5. **偏離實作計畫第 3 步**：原計畫要在 `LICENSE` 內加註指向 `LICENSE-CONTENT.md` 的範圍說明，實作時改為不修改 `LICENSE`。理由是保持標準 MIT 全文不變才能被 GitHub 的授權偵測正確辨識為 MIT；授權分割的敘述已同時存在於 README 與 `LICENSE-CONTENT.md`（後者已含路徑對照表與「LICENSE 中的 the Software 指哪些路徑」的說明），AC #2 因此仍然成立。

## 驗證證據（本機實測，Node v22.23.2）

依 PRD §23 順序執行，全部通過：

```text
$ npm run format:check
Checking formatting...
All matched files use Prettier code style!

$ npm run lint
(無輸出，exit 0)

$ npm run typecheck
Result (7 files):
- 0 errors
- 0 warnings
- 0 hints

$ npm run build
[build] 1 page(s) built in 221ms
[build] Complete!

$ npm run linkcheck
→ crawling dist README.md LICENSE-CONTENT.md
✓ Successfully scanned 8 links in 0.765 seconds.

$ npm test
Test Files  1 passed (1)
     Tests  10 passed (10)
```

連結檢查具備偵測能力（在 README 暫時插入 `[probe](./does-not-exist.md)` 後執行，隨即還原）：

```text
$ npm run linkcheck ; echo "EXIT=$?"
[404] does-not-exist.md
README.md
  [404] does-not-exist.md
ERROR: Detected 1 broken links. Scanned 9 links in 0.162 seconds.
EXIT=1
```

機密掃描以 CI 相同版本與指令在本機執行（gitleaks 8.30.1，SHA256 校驗通過）：

```text
$ echo "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb  gitleaks.tar.gz" | sha256sum -c -
gitleaks.tar.gz: OK

$ gitleaks dir . --redact --no-banner
INF scanned ~174068 bytes (174.07 KB) in 29.8ms
INF no leaks found

$ gitleaks git . --redact --no-banner
INF 6 commits scanned.
INF scanned ~442092 bytes (442.09 KB) in 159ms
INF no leaks found
```

機密掃描具備攔截能力（暫時放入一個高熵度的假 token 後執行，隨即刪除該檔）：

```text
$ gitleaks dir . --redact --no-banner ; echo "EXIT=$?"
WRN leaks found: 1
EXIT=1
```

設定檔語法驗證：

```text
$ actionlint 1.7.7（.github/workflows/ci.yml）
(無輸出，exit 0)

$ python3 -c "yaml.safe_load(...)"
.github/workflows/ci.yml -> OK; jobs: ['verify', 'secret-scan']
.github/dependabot.yml -> OK; top-level keys: ['version', 'updates']

$ jsonschema 驗證 .github/dependabot.yml 對 schemastore dependabot-2.0.json
dependabot.yml validates against schemastore dependabot-2.0.json
```

AC #6 乾淨 clone 實測（clone 至 `/tmp/mcd10-clean-clone`，僅依 README 指示操作，驗證後已刪除該暫存目錄）：

```text
$ git clone <repo> /tmp/mcd10-clean-clone
$ node -v
v22.23.2            # README 要求 Node.js 22.12+，.nvmrc 為 22.12.0
$ npm install
added 443 packages, and audited 444 packages in 6s
found 0 vulnerabilities
$ npm run build
[build] 1 page(s) built in 292ms
[build] Complete!
```

同一個乾淨 clone 內，README 所列的其餘檢查亦全部通過：`format:check`（All matched files use Prettier code style!）、`lint`（exit 0）、`typecheck`（0 errors）、`linkcheck`（Successfully scanned 8 links）、`test`（1 passed / 10 tests）。

## 本機無法驗證、需 push 後首次執行的部分

- CI workflow 的實際執行結果（`verify` 與 `secret-scan` 兩個 job、Actions SHA 是否能被 GitHub 解析、CI 環境中的 gitleaks 下載步驟）只能在推送到 GitHub 後才會首次執行。本機已完成的替代驗證：actionlint 1.7.7 靜態檢查通過、YAML 可解析、gitleaks 以完全相同的版本與指令在本機實際掃描通過。
- Dependabot 是否實際產生更新 PR，需儲存庫推送至 GitHub 並由 Dependabot 排程觸發後才能觀察。本機已完成的替代驗證：設定檔位於 GitHub 要求的 `.github/dependabot.yml` 路徑，且通過 schemastore 官方 `dependabot-2.0.json` schema 驗證。
- 儲存庫目前仍為 private（轉為 public 屬 MCD-13 範圍），Dependabot 與 CI 的實際排程行為以轉公開後為準。

## 文件同步

本專案無 Requirement Matrix 文件；PRD（doc-1）為需求來源且本任務未變更任何需求，因此不需同步。README 即為本任務的文件產出本身。

## 批次合併後的修正（由 orchestrator 於 main 上處理）

AC #4（CI 連結檢查）在本任務 worktree 內的驗證是**假綠**，合併後才暴露。

原指令 `linkinator dist README.md LICENSE-CONTENT.md --recurse --markdown --silent`
同時傳入目錄與 markdown 檔，linkinator 的 static server root 會落在 repo 根目錄而非
`dist/`，導致 `dist/index.html` 內的絕對路徑（`/`、`/_astro/*.css`）全部解析錯誤。

在本任務的 worktree 中之所以通過，是因為當時 `dist/index.html` 仍是 MCD-1 的純佔位頁，
沒有 CSS 資產也沒有絕對連結，等於沒有可壞的連結可測。TASK-2 的設計系統合併進來後，
index.html 開始輸出 `href="/"` 與 `/_astro/index.*.css`，linkcheck 立刻回報 2 個 404。

修正：拆成兩個指令，站台掃描以 `--server-root dist` 並將路徑指定為相對於該 root 的
`index.html`；markdown 另外掃描。

- `linkcheck:site`: `linkinator index.html --server-root dist --recurse --silent`
- `linkcheck:docs`: `linkinator README.md LICENSE-CONTENT.md --markdown --silent`

反向驗證（確認不是又一個假綠）：於 `dist/index.html` 插入 `<a href="/definitely-missing/">`
後重跑，輸出 `[404] definitely-missing/` 與 `ERROR: Detected 1 broken links`；
`astro build` 重建後回復 `Successfully scanned 4 links` 與 `6 links`。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
以 MCD-1 既有的 README/LICENSE/CI 為基礎，補齊 PRD §19-24 要求的開源品質：README 補上乾淨 clone 可重現的環境建置、CI 檢查清單、Repository layout、CI 說明、明確不接受外部貢獻的政策與安全回報方式，並維持原始碼 MIT / 個人內容與品牌資產 © Oliver Yu 的授權分割敘述；CI 於 Build 之後新增 linkinator 連結檢查步驟，並新增獨立的 secret-scan job 以版本 + SHA256 釘選的官方 gitleaks 二進位檔掃描工作目錄與完整 git 歷史；新增 .github/dependabot.yml 讓 npm 與 github-actions 每週產生更新 PR，同時將所有 Actions 改為 commit SHA 釘選。驗證方式：本機依 PRD §23 順序執行 format:check / lint / typecheck / build / linkcheck / test 全數通過；以暫時插入的失效連結與高熵度假 token 分別證明連結檢查與機密掃描確實會失敗（exit 1）；ci.yml 通過 actionlint 1.7.7、dependabot.yml 通過 schemastore schema 驗證；並實際 git clone 至暫存目錄，僅依 README 指示完成 npm install 與 npm run build。CI 於 GitHub 上的首次實際執行與 Dependabot 產生 PR 需待推送後才能觀察，已在 Implementation Notes 中明確區分。
<!-- SECTION:FINAL_SUMMARY:END -->
