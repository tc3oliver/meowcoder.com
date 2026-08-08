---
id: TASK-8
title: MCD-4 — 首頁
status: To Do
assignee: []
created_date: '2026-08-08 06:46'
updated_date: '2026-08-08 06:58'
labels: []
dependencies:
  - TASK-4
  - TASK-7
priority: high
type: feature
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 需求來源

- doc-1 §5（Engineering Expertise 四項支柱）、§9（Homepage 全部子節）、§11（Company Experience Policy）、§12（LLM Infrastructure Positioning）、§34（Content Language Rules）、§35（Homepage Final Order）、§39 (MCD-4)

## 目標

首頁在兩種語言下傳達專業身分與可驗證證據，訪客不需深入導覽即可理解 Oliver 是誰、專精什麼、做出了什麼。

## 範圍

- Hero、Featured Product（Shouri）、Engineering Expertise、Open Source（AI Coding Skills）、Research、Technical Writing、Professional Experience、Footer，依 PRD §9.1-9.8
- 英文與中文兩個版本，資訊架構一致
- 將 Technical Writing 區塊接上 MCD-9 的 Study feed 輸出

## 不在範圍

- 作品索引與作品詳細頁（MCD-5、MCD-6、MCD-7）
- About 頁（MCD-8）
- 完整 SEO、結構化資料、分析埋點與 Lighthouse 最佳化（MCD-11）

## 穩定實作限制

- 區塊順序必須完全依 PRD §35，中文版遵循相同架構
- Professional Experience 僅能以安全抽象層級描述，不得出現內部專案名稱、私有 benchmark 或客戶資訊（PRD §11）
- LLM Infrastructure 僅作為 Engineering Expertise 的專長領域呈現；不得因最強證據來自機密的雇主系統就在首頁暗示存在對應的公開案例研究，公開證明應導向 Study 技術文章（PRD §12）
- 內容語言規則依 PRD §34：同一段落不混用中英文，例外僅限產品名、專有名詞、既定技術術語與 Shouri / 收理 這類刻意的雙語識別；中文須為台灣讀者自然可讀，英文須精簡且具技術可信度；翻譯保留語意而非逐句直譯
- 第三方來源的 skill 必須保留明確出處與授權標示，不得呈現為原創作品（PRD §9.4）
- 不得為單一論文建立獨立的 Research 導覽項目（PRD §9.5）
- 不得在本站重製 Study 文章全文（PRD §9.6）
- meowcoder.com 原始碼為次要開源證據，不需要大型首頁卡片（PRD §24）
- 避免 PRD §9.1 與 §25 列出的禁用視覺元素

## 驗證

- 依 .agent-workflow/PROJECT.md 的 lint、typecheck、test、build 指令
- 人工檢查兩種語言的區塊順序、文案與所有 CTA 連結目標
- 人工檢查中英文案是否符合 PRD §34 的語言規則

## 測試需求

- 人工 QA：桌機與行動裝置、英文與中文各一輪
- 首頁為內容組合，無獨立產品邏輯；自動化測試涵蓋由 MCD-9 與 MCD-3 負責

## 影響

- 安全性：需確認 Professional Experience 不含雇主機密（PRD §11、§12）
- 資料 / Schema：無
- API / 相容性：無
- 文件：無
- 遷移 / 回滾：無
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 首頁區塊順序完全符合 PRD §35：Hero、Shouri、Engineering Expertise、Open Source、Research、Technical Writing、Professional Experience、Footer
- [ ] #2 Hero 文案在英文與中文下皆對應 PRD §9.1，且未出現大頭照、裝飾性 AI 圖像、動畫程式碼或打字機效果
- [ ] #3 Shouri 區塊呈現一張產品截圖、Save First 與 Explicit AI 與 Recoverable Architecture 三項產品原則、工程領域清單，以及連往 shouri.app 的 CTA
- [ ] #4 Engineering Expertise 僅呈現 PRD §5 的四項支柱並各附一段簡潔說明，未使用框架名稱清單或技術方格
- [ ] #5 Open Source 區塊以 backlog-workflow 為主要公開作品、audit-claude-md 為次要，且其中任何第三方來源的 skill 皆保留明確出處與授權標示
- [ ] #6 Research 區塊呈現 JISA 論文摘要與 View Publication CTA，且未在導覽新增獨立的 Research 項目
- [ ] #7 Technical Writing 區塊透過 MCD-9 呈現最新 3 至 5 篇 Study 文章的日期、分類與標題並提供外連 CTA，未重製文章全文
- [ ] #8 Professional Experience 傳達 10 年以上工程經驗與現職方向，且不含任何雇主機密資訊
- [ ] #9 Footer 連結 GitHub、Study、ORCID、Shouri 與 Site Source（公開的 meowcoder.com 儲存庫）
- [ ] #10 中文首頁 /zh/ 以相同資訊架構與區塊順序呈現在地化內容
- [ ] #11 Engineering Expertise 的 LLM Infrastructure 支柱僅呈現為專長領域並導向 Study 技術文章，未暗示存在以機密雇主系統為基礎的公開案例研究（PRD §12）
- [ ] #12 中英文案皆符合 PRD §34：同段落不混用語言（產品名、專有名詞、既定技術術語與 Shouri / 收理 除外），中文為台灣讀者自然可讀，且非逐句直譯
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance Criteria all pass
- [ ] #2 Required applicable tests, lint, typecheck, and build pass
- [ ] #3 Documentation and Requirement Matrix are synchronized when applicable
- [ ] #4 Validation evidence is recorded in the task
<!-- DOD:END -->
