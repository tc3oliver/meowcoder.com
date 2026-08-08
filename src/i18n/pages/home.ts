import type { Locale } from '../locales';
import type { PageStrings } from './types';

/**
 * Home page content (MCD-4, PRD §9).
 *
 * The homepage is a fixed sequence of sections (PRD §35), each answering one
 * question in the visitor journey. Its copy is therefore structured rather than
 * free prose — the same reasoning as `about.ts`: a typed shape per section
 * turns a missing or mismatched translation into a compile error.
 *
 * Four content rules constrain everything here:
 *
 *   - PRD §11 — employer work appears only at a safe abstraction level. No
 *     internal project name, repository, infrastructure detail, private
 *     measurement, or customer appears in these strings.
 *   - PRD §12 — LLM infrastructure is an expertise area whose public proof is
 *     technical writing. Nothing here implies a public case study built on
 *     confidential employer systems.
 *   - PRD §34 — no locale mixes languages inside one prose block. Product names
 *     (Shouri / 收理, Backlog.md, Study), proper nouns, and established
 *     technical terms (AI, Agent, RAG, MCP, vLLM, ROCm, PWA, CI/CD, LLM) are
 *     the stated exceptions.
 *   - PRD §37 — engineering evidence over marketing adjectives. Every claim
 *     below points at something built, published, measured, open-sourced, or
 *     researched.
 *
 * Where PRD §9 states copy verbatim, it is quoted rather than paraphrased; the
 * Chinese side preserves meaning instead of mirroring sentence structure.
 */

/** A named item with one line of explanation: a pillar, a principle, a claim. */
export interface NamedItem {
  name: string;
  description: string;
}

/** An off-site call to action. `href` is supplied by the component, not here. */
export interface CtaLabel {
  label: string;
}

/**
 * One PRD §5 pillar.
 *
 * `evidence` carries the link to whatever proves that pillar publicly, and only
 * LLM Infrastructure has one: PRD §12 keeps it an expertise area whose public
 * proof is technical writing, precisely because the strongest evidence sits in
 * confidential employer systems. Marking the pillar here rather than matching
 * its name in a component is what keeps the rule intact in both locales — the
 * Chinese pillar is not called "LLM Infrastructure".
 */
export interface ExpertisePillar extends NamedItem {
  evidence?: CtaLabel;
}

export interface HomeStrings extends PageStrings {
  /**
   * PRD §9.1. `heading` is the name and `intro` the statement beneath it, so
   * the hero adds only what `PageStrings` has no field for.
   *
   * `role` and the second entry of `facts` stay in English in both locales:
   * PRD §9.1 writes the Chinese hero that way, and each is its own standalone
   * line rather than a prose block, so no block mixes languages (PRD §34).
   */
  hero: {
    role: string;
    facts: readonly string[];
    workCta: string;
    writingCta: string;
  };
  /** PRD §9.2. The one product that proves design → ship → operate. */
  shouri: {
    eyebrow: string;
    /** Intentional bilingual identity, explicitly allowed by PRD §34. */
    heading: string;
    summary: string;
    /**
     * The product screenshot PRD §9.2 asks for, as an asset/alt-text pair.
     *
     * Absent until both halves exist: the image at `src/assets/shouri/` (see
     * `src/components/home/shouri-screenshot.ts`) and the alt text describing
     * that specific image. Writing alt text for an image that does not exist
     * yet would describe something nobody has seen, so this stays optional and
     * the figure renders only once both are supplied.
     */
    screenshot?: { alt: string };
    principlesHeading: string;
    /** Named product principles; the names are the product's own vocabulary. */
    principles: readonly NamedItem[];
    areasHeading: string;
    areas: readonly string[];
    cta: CtaLabel;
  };
  /** PRD §9.3 and §5: four pillars, one concise explanation each. */
  expertise: {
    heading: string;
    intro: string;
    pillars: readonly ExpertisePillar[];
  };
  /** PRD §9.4. The primary open-source proof; the site source is not (PRD §24). */
  openSource: {
    eyebrow: string;
    heading: string;
    summary: string;
    primaryLabel: string;
    primaryName: string;
    /** The requirement-to-delivery stages PRD §9.4 lists, in order. */
    pipeline: readonly string[];
    highlightsHeading: string;
    highlights: readonly string[];
    secondaryLabel: string;
    secondaryName: string;
    secondaryHeading: string;
    secondaryPoints: readonly string[];
    /**
     * PRD §9.4: third-party skills keep clear attribution and are never shown
     * as original work. The wording follows `.claude/skills/grilling/SKILL.md`
     * and its bundled `LICENSE`.
     */
    attribution: string;
    cta: CtaLabel;
  };
  /** PRD §9.5. One publication, and deliberately no navigation entry for it. */
  research: {
    eyebrow: string;
    heading: string;
    /** Publication title — a proper noun, so it is never translated. */
    paper: string;
    venue: string;
    summary: string;
    detail: string;
    /** PRD §9.5's `View Publication ↗`, resolving through the DOI. */
    cta: CtaLabel;
  };
  /** PRD §9.6. Metadata pulled from Study; never article bodies. */
  writing: {
    heading: string;
    intro: string;
    cta: CtaLabel;
  };
  /** PRD §9.7. Scope and seniority at a safe abstraction level (PRD §11). */
  experience: {
    eyebrow: string;
    heading: string;
    summary: string;
    currentLabel: string;
    current: string;
  };
}

/**
 * `HomeStrings extends PageStrings`, so this dictionary still satisfies the
 * shared contract `SiteShell` and the SEO metadata read.
 */
export type HomeDictionary = Record<Locale, HomeStrings>;

export const home = {
  en: {
    title: 'Oliver Yu — AI Systems Engineer & System Architect',
    description:
      'AI Systems Engineer and System Architect with 10+ years of software engineering experience, building AI systems, developer tooling, model infrastructure, and production software.',
    heading: 'Oliver Yu',
    intro:
      'I design and build production AI systems that connect models, knowledge, developer tools, and software infrastructure.',
    hero: {
      role: 'AI Systems Engineer · System Architect',
      facts: ['10+ Years in Software Engineering', 'Taiwan'],
      workCta: 'View Selected Work',
      writingCta: 'Technical Writing',
    },
    shouri: {
      eyebrow: 'Featured Product',
      heading: 'Shouri / 收理',
      summary:
        'An AI-powered information organizer for capturing webpages, files and media, then turning them into structured, searchable knowledge.',
      screenshot: {
        alt: 'Shouri on desktop and phone. The web app works through a five-unit learning path; behind it the product page shows a saved cooking video beside the structured recipe it became. Two phone screens show the saved library and that recipe broken into summary, ingredients, and steps.',
      },
      principlesHeading: 'Product principles',
      principles: [
        {
          name: 'Save First',
          description: 'Original content is persisted before AI processing.',
        },
        {
          name: 'Explicit AI',
          description: 'AI organization is intentionally triggered by the user.',
        },
        {
          name: 'Recoverable Architecture',
          description: 'Source content and AI-derived information are separated.',
        },
      ],
      areasHeading: 'Engineering areas',
      areas: [
        'Product Design',
        'System Architecture',
        'AI Processing',
        'Search & Retrieval',
        'Web / PWA',
        'Production Operations',
      ],
      cta: { label: 'Visit Shouri' },
    },
    expertise: {
      heading: 'Engineering Expertise',
      intro: 'Four problem areas I work in, rather than a list of technologies.',
      pillars: [
        {
          name: 'AI & Agent Systems',
          description:
            'Agentic workflows, tool execution, MCP, evaluation, validation, permissions, and recovery.',
        },
        {
          name: 'Knowledge Systems',
          description:
            'RAG, source grounding, graph retrieval, knowledge integration, and agent-accessible context.',
        },
        {
          name: 'LLM Infrastructure',
          description:
            'Model serving, vLLM, ROCm, inference optimization, benchmarking, reliability, and capacity analysis.',
          evidence: { label: 'Read the published analysis on Study' },
        },
        {
          name: 'Software Architecture',
          description:
            'System design, integration, backend services, cloud infrastructure, security, CI/CD, and software quality.',
        },
      ],
    },
    openSource: {
      eyebrow: 'Open Source',
      heading: 'AI Coding Skills',
      summary:
        'Development workflows for making coding agents more structured, predictable, and evidence-driven.',
      primaryLabel: 'Primary public work',
      primaryName: 'backlog-workflow',
      pipeline: [
        'Requirement',
        'Task Decomposition',
        'Just-in-Time Planning',
        'Implementation',
        'Validation',
        'Evidence',
        'Delivery',
      ],
      highlightsHeading: 'What it defines',
      highlights: [
        'Requirement-driven development',
        'Backlog.md integration',
        'Manual and autonomous execution',
        'Explicit execution boundaries',
        'Validation gates',
        'Evidence-based completion',
        'Agent instruction management',
      ],
      secondaryLabel: 'Secondary public work',
      secondaryName: 'audit-claude-md',
      secondaryHeading: 'What it demonstrates',
      secondaryPoints: [
        'Context quality',
        'Instruction design',
        'Progressive disclosure',
        'Maintainability of coding-agent instructions',
      ],
      attribution:
        'backlog-workflow is my own work. The grilling skill it bundles is based on the grilling skill by Matt Pocock and is used under the MIT License, with that license shipped alongside it.',
      cta: { label: 'View on GitHub' },
    },
    research: {
      eyebrow: 'Research',
      heading: 'Leakage-Resilient Cryptography',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications, 2026',
      summary:
        'Co-authored research on leakage-resilient certificate-based encryption designed to preserve security under continual key leakage.',
      detail:
        'The paper proposes LR-CBEET, combining equality testing with resistance to side-channel leakage through key-update mechanisms, with formal analysis under IND-CCA and OW-CCA security notions.',
      cta: { label: 'View Publication' },
    },
    writing: {
      heading: 'Technical Writing',
      intro:
        'I publish continuous technical analysis on Study, which remains the canonical platform for it.',
      cta: { label: 'Explore Technical Writing' },
    },
    experience: {
      eyebrow: 'Professional Experience',
      heading: 'Enterprise Engineering',
      summary:
        '10+ years of software engineering experience spanning enterprise systems, system architecture, cloud platforms, security, mobile/web applications, and applied AI.',
      currentLabel: 'Current direction',
      current:
        'Current work focuses on enterprise AI systems, coding agents, knowledge infrastructure, and LLM serving.',
    },
  },
  zh: {
    title: 'Oliver Yu — AI 系統工程師與系統架構師',
    description:
      '擁有 10+ 年軟體工程經驗的 AI 系統工程師與系統架構師，專注於 AI 系統、開發者工具、模型基礎架構與正式產品開發。',
    heading: 'Oliver Yu',
    intro: '專注於設計與打造可投入實際使用的 AI 系統，整合模型、知識、開發工具與軟體基礎架構。',
    hero: {
      // PRD §9.1 keeps the role line and `Taiwan` in English in the Chinese
      // hero; both are standalone lines, so neither mixes languages.
      role: 'AI Systems Engineer · System Architect',
      facts: ['10+ 年軟體工程經驗', 'Taiwan'],
      workCta: '精選作品',
      writingCta: '技術文章',
    },
    shouri: {
      eyebrow: '精選產品',
      heading: 'Shouri / 收理',
      summary: '以 AI 驅動的資訊整理工具，能收下網頁、檔案與影音，再整理成結構化、可搜尋的知識。',
      screenshot: {
        alt: '收理在桌機與手機上的畫面。網頁應用正進行五個單元的學習路線；後方的產品頁把一段收下的料理影片與整理後的結構化食譜並列。兩個手機畫面則是收藏庫，以及拆成摘要、材料與步驟的同一份食譜。',
      },
      principlesHeading: '產品原則',
      principles: [
        // The principle names are the product's own vocabulary and stay in
        // English in both locales; the explanation beneath each is localized.
        {
          name: 'Save First',
          description: '原始內容會先完整保存，之後才進入 AI 處理。',
        },
        {
          name: 'Explicit AI',
          description: 'AI 整理一律由使用者主動觸發。',
        },
        {
          name: 'Recoverable Architecture',
          description: '原始來源與 AI 產生的資訊分開存放。',
        },
      ],
      areasHeading: '工程領域',
      areas: ['產品設計', '系統架構', 'AI 處理', '搜尋與檢索', '網頁與 PWA', '正式環境維運'],
      cta: { label: '前往 Shouri' },
    },
    expertise: {
      heading: '工程專長',
      intro: '這裡列的是我實際處理的四類問題，而不是技術清單。',
      pillars: [
        {
          name: 'AI 與 Agent 系統',
          description: 'Agent 工作流程、工具執行、MCP、評估、驗證、權限控管與失敗復原。',
        },
        {
          name: '知識系統',
          description: 'RAG、來源溯源、圖譜檢索、知識整合，以及讓 Agent 能取用的上下文。',
        },
        {
          name: 'LLM 基礎架構',
          description: '模型服務、vLLM、ROCm、推論最佳化、效能量測、穩定性與容量分析。',
          evidence: { label: '閱讀發表於 Study 的公開分析' },
        },
        {
          name: '軟體架構',
          description: '系統設計、系統整合、後端服務、雲端基礎架構、資安、CI/CD 與軟體品質。',
        },
      ],
    },
    openSource: {
      eyebrow: '開源',
      heading: 'AI Coding Skills',
      summary: '一套開發流程，讓 coding agent 的行為更有結構、更可預期，也更倚賴證據。',
      primaryLabel: '主要公開作品',
      primaryName: 'backlog-workflow',
      pipeline: ['需求', '任務拆解', '即時規劃', '實作', '驗證', '證據', '交付'],
      highlightsHeading: '它定義了什麼',
      highlights: [
        '需求驅動的開發流程',
        'Backlog.md 整合',
        '手動與自動兩種執行模式',
        '明確的執行邊界',
        '驗證關卡',
        '以證據判定完成',
        'Agent 指令管理',
      ],
      secondaryLabel: '次要公開作品',
      secondaryName: 'audit-claude-md',
      secondaryHeading: '它展示了什麼',
      secondaryPoints: ['Context 品質', '指令設計', '漸進式揭露', 'Coding agent 指令的可維護性'],
      attribution:
        'backlog-workflow 是我本人的作品；其中隨附的 grilling skill 係基於 Matt Pocock 的 grilling skill，依 MIT License 使用，授權條款隨檔附上。',
      cta: { label: '在 GitHub 上查看' },
    },
    research: {
      eyebrow: '研究',
      heading: '抗洩漏密碼學',
      // Publication title and journal name are proper nouns (PRD §7).
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications, 2026',
      summary: '共同發表的研究，探討抗洩漏的憑證式加密，目標是在金鑰持續洩漏下仍能維持安全性。',
      detail:
        '論文提出 LR-CBEET，以金鑰更新機制把等值測試與側通道洩漏防護結合起來，並在 IND-CCA 與 OW-CCA 安全性定義下給出形式化分析。',
      cta: { label: '閱讀論文' },
    },
    writing: {
      heading: '技術文章',
      intro: '我持續在 Study 發表技術分析，那裡是這些文章的正式發表平台。',
      cta: { label: '瀏覽技術文章' },
    },
    experience: {
      eyebrow: '職業經歷',
      heading: '企業級工程',
      summary:
        '超過十年的軟體工程經驗，橫跨企業系統、系統架構、雲端平台、資安、行動與網頁應用，以及應用型 AI。',
      currentLabel: '目前方向',
      current: '目前的工作重心是企業級 AI 系統、coding agent、知識基礎架構與 LLM 服務。',
    },
  },
} satisfies HomeDictionary;
