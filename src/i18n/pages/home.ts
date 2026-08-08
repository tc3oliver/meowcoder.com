import type { Locale } from '../locales';
import type { PageStrings } from './types';

/**
 * Home page content (MCD-4, MCD-16, PRD §9, doc-2 §5).
 *
 * The homepage is a fixed sequence of sections — doc-2 §5's order, which
 * replaces PRD §35 — each answering one question in the visitor journey. Its
 * copy is therefore structured rather than free prose — the same reasoning as
 * `about.ts`: a typed shape per section turns a missing or mismatched
 * translation into a compile error.
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
 * Where PRD §9 or doc-2 states copy verbatim, it is quoted rather than
 * paraphrased; the Chinese side preserves meaning instead of mirroring sentence
 * structure. doc-2 also asks the homepage to shed roughly 40–50% of its copy
 * without losing evidence, so shortening here is only ever safe when the detail
 * that goes still exists on a detail page.
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
   * doc-2 §5. `heading` is the name and `intro` the statement beneath it, so
   * the hero adds only what `PageStrings` has no field for.
   *
   * doc-2 §5 keeps the name, the role line, the two facts, and exactly two
   * actions, and replaces only the supporting statement. `role` and the second
   * entry of `facts` still stay in English in both locales: PRD §9.1 writes the
   * Chinese hero that way, and each is its own standalone line rather than a
   * prose block, so no block mixes languages (PRD §34).
   */
  hero: {
    role: string;
    facts: readonly string[];
    workCta: string;
    writingCta: string;
  };
  /**
   * doc-2 §6 (PRD §9.2). The one product that proves design → ship → operate,
   * and the homepage's visual centrepiece.
   *
   * doc-2 §6 fixes the copy at exactly six things: the eyebrow, the bilingual
   * name, one product statement, three principle names, and two actions. The
   * per-principle sentences and the six-item "Engineering areas" list are gone
   * from the homepage — not from the site. Both were claims rather than
   * evidence at this size, and the engineering detail behind them is on the
   * Shouri case study, which `caseStudyCta` now links to.
   *
   * `summary` keeps its name rather than becoming `statement`: it is also the
   * `SoftwareApplication` description in `src/lib/structured-data.ts`, and the
   * schema wants the product's own one-line description, which is exactly what
   * doc-2 §6's statement is.
   */
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
    /**
     * The three principle names, as doc-2 §6's compact row. Names only: they
     * are the product's own vocabulary and stay in English in both locales,
     * which is why they are plain strings rather than `NamedItem`s now that
     * the localized explanation beneath each one has moved to the case study.
     */
    principles: readonly string[];
    /** Internal; the case-study route is resolved by the component, not here. */
    caseStudyCta: CtaLabel;
    cta: CtaLabel;
  };
  /**
   * doc-2 §8 (Engineering Focus). Four areas, one short line each.
   *
   * The explanatory meta-copy that used to introduce the section is gone: it
   * described the section instead of adding evidence, which is exactly what
   * doc-2 §8 asks to be removed. The four areas signal and navigate; they are
   * not primary evidence, so they carry no section intro of their own.
   */
  expertise: {
    heading: string;
    pillars: readonly ExpertisePillar[];
  };
  /**
   * doc-2 §7. The primary open-source proof; the site source is not (PRD §24).
   *
   * doc-2 §7 cuts this section back to a single statement, the two skill names,
   * a workflow visual, and two actions. The seven-stage pipeline, the two
   * bullet lists, and the attribution paragraph are not deleted from the site —
   * they live on the AI Coding Skills case study, which is what the new
   * `caseStudyCta` links to. That is also where PRD §9.4's attribution
   * requirement is now met: the case study states in full that the bundled
   * `grilling` skill is Matt Pocock's, used under the MIT License, so nothing
   * here presents a third-party skill as original work.
   */
  openSource: {
    eyebrow: string;
    heading: string;
    /** doc-2 §7's one statement, in place of the old summary and lists. */
    statement: string;
    /** The published skills, in doc-2 §7's order: primary first. */
    skills: readonly string[];
    /** Labels for doc-2 §7's workflow visual; see `WorkflowDiagram.astro`. */
    workflow: {
      /** Accessible name for the diagram — it carries no visible caption. */
      caption: string;
      start: string;
      steps: readonly string[];
      end: string;
    };
    /** Internal; the case-study route is resolved by the component, not here. */
    caseStudyCta: CtaLabel;
    cta: CtaLabel;
  };
  /**
   * PRD §9.5, doc-2 §9. One publication, and deliberately no navigation entry
   * for it — it is the left column of the merged editorial section.
   *
   * `heading` is the research area and `paper` the exact citation, which is the
   * hierarchy doc-2 §9 asks for: the area is the headline a visitor reads, the
   * title stays as secondary metadata beneath it.
   *
   * There is no `detail` field. It carried the IND-CCA / OW-CCA analysis, which
   * doc-2 §9 rules out here — "unnecessary for homepage credibility and belongs
   * on About" — and `about.ts` now states it in full in both locales, so the
   * site keeps the sentence and the homepage does not.
   */
  research: {
    eyebrow: string;
    heading: string;
    /** Publication title — a proper noun, so it is never translated. */
    paper: string;
    venue: string;
    summary: string;
    /** PRD §9.5's `View Publication ↗`, resolving through the DOI. */
    cta: CtaLabel;
  };
  /**
   * PRD §9.6, doc-2 §9. Metadata pulled from Study; never article bodies.
   *
   * The section's old intro paragraph is gone. It said that Study is the
   * canonical platform for this writing, which the column now shows rather than
   * states: `eyebrow` names Study above the heading and the call to action goes
   * there. That is doc-2's copy reduction applied without losing the fact.
   */
  writing: {
    /** The platform, as the column's label. A proper noun in both locales. */
    eyebrow: string;
    heading: string;
    /**
     * Language names for the badge on a title published in another language,
     * keyed by the language being named.
     *
     * doc-2 §9 asks the English homepage to keep original Chinese titles and
     * mark them as Chinese, and `resolveTitle` decides when a title needs it.
     * Naming a language is not translating a title, so this does not touch
     * PRD §7 — the title itself is still rendered exactly as Study published
     * it. Both directions are here because the rule is symmetric: an English
     * title on the Chinese homepage is marked the same way.
     */
    languages: Record<Locale, string>;
    cta: CtaLabel;
  };
  /**
   * doc-2 §10. One horizontal credibility strip, not a section.
   *
   * The large "Enterprise Engineering / Current direction" block is gone. What
   * remains is the claim (`heading`), the arc that backs it (`progression`),
   * one sentence of scope (`summary`), and the way to read more (`cta` → the
   * localized About route). PRD §11 still binds every one of them: engineering
   * domains and seniority only, never an employer, an internal project, an
   * infrastructure detail, a private measurement, or a customer.
   */
  experience: {
    heading: string;
    /** The career arc as one line: an arrow chain, not a sentence. */
    progression: string;
    summary: string;
    /** Internal; the About route is resolved by the component, not here. */
    cta: CtaLabel;
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
      'I build reliable AI systems for developer workflows, knowledge retrieval, and model infrastructure.',
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
        'Save first. Organize with AI when needed. Keep the original as the source of truth.',
      screenshot: {
        alt: 'Shouri on desktop and phone. The web app works through a five-unit learning path; behind it the product page shows a saved cooking video beside the structured recipe it became. Two phone screens show the saved library and that recipe broken into summary, ingredients, and steps.',
      },
      principles: ['Save First', 'Explicit AI', 'Recoverable by Design'],
      caseStudyCta: { label: 'View Case Study' },
      cta: { label: 'Visit Shouri' },
    },
    expertise: {
      heading: 'Engineering Focus',
      pillars: [
        {
          name: 'AI & Agent Systems',
          description: 'Agent workflows, tool execution, evaluation and recovery.',
        },
        {
          name: 'Knowledge Systems',
          description: 'Retrieval, grounding and agent-accessible knowledge.',
        },
        {
          name: 'LLM Infrastructure',
          description: 'Serving, optimization, benchmarking and reliability.',
          evidence: { label: 'Read the published analysis on Study' },
        },
        {
          name: 'Software Architecture',
          description: 'Systems, integration, cloud, security and delivery.',
        },
      ],
    },
    openSource: {
      eyebrow: 'Open Source',
      heading: 'AI Coding Skills',
      statement:
        'Versioned workflows for requirement alignment, just-in-time planning, validation, and evidence-based completion.',
      skills: ['backlog-workflow', 'audit-claude-md'],
      workflow: {
        caption:
          'The workflow: a requirement is planned, executed and validated, and ends in evidence.',
        start: 'Requirement',
        steps: ['Plan', 'Execute', 'Validate'],
        end: 'Evidence',
      },
      caseStudyCta: { label: 'View Case Study' },
      cta: { label: 'GitHub' },
    },
    research: {
      eyebrow: 'Research',
      heading: 'Leakage-Resilient Cryptography',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications · 2026',
      summary:
        'Co-authored research on certificate-based encryption designed to remain secure under continual key leakage.',
      cta: { label: 'View Publication' },
    },
    writing: {
      eyebrow: 'Study',
      heading: 'Technical Writing',
      languages: { en: 'English', zh: 'Chinese' },
      cta: { label: 'Explore Technical Writing' },
    },
    experience: {
      heading: '10+ Years of Engineering',
      progression: 'Software engineering → system architecture → AI systems',
      summary: 'Experience across enterprise software, cloud, security, mobile/web and applied AI.',
      cta: { label: 'About Oliver' },
    },
  },
  zh: {
    title: 'Oliver Yu — AI 系統工程師與系統架構師',
    description:
      '擁有 10+ 年軟體工程經驗的 AI 系統工程師與系統架構師，專注於 AI 系統、開發者工具、模型基礎架構與正式產品開發。',
    heading: 'Oliver Yu',
    intro: '打造可實際落地的 AI 系統，聚焦開發者工作流程、知識檢索與模型基礎架構。',
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
      summary: '先完整保存，再依需要交給 AI 整理；原始內容始終保留作為可信來源。',
      screenshot: {
        alt: '收理在桌機與手機上的畫面。網頁應用正進行五個單元的學習路線；後方的產品頁把一段收下的料理影片與整理後的結構化食譜並列。兩個手機畫面則是收藏庫，以及拆成摘要、材料與步驟的同一份食譜。',
      },
      // The principle names are the product's own vocabulary and stay in
      // English in both locales — PRD §34 allows exactly that, and they are a
      // row of names rather than a prose block.
      principles: ['Save First', 'Explicit AI', 'Recoverable by Design'],
      // Word for word the label Open Source uses for the same action, so the
      // two case-study links on the homepage cannot read as different things.
      caseStudyCta: { label: '閱讀案例研究' },
      cta: { label: '前往 Shouri' },
    },
    expertise: {
      heading: '工程重點領域',
      pillars: [
        {
          name: 'AI 與 Agent 系統',
          description: 'Agent 工作流程、工具執行、評估與失敗復原。',
        },
        {
          name: '知識系統',
          description: '檢索、溯源，以及讓 Agent 取用的知識。',
        },
        {
          name: 'LLM 基礎架構',
          description: '模型服務、推論最佳化、效能量測與穩定性。',
          evidence: { label: '閱讀發表於 Study 的公開分析' },
        },
        {
          name: '軟體架構',
          description: '系統設計、系統整合、雲端、資安與交付。',
        },
      ],
    },
    openSource: {
      eyebrow: '開源',
      heading: 'AI Coding Skills',
      statement: '版本化的工作流程，涵蓋需求對齊、即時規劃、驗證，以及用證據判定完成。',
      // The skill names are repository names, so they read the same in both
      // locales; the component joins them with a middot (doc-2 §7).
      skills: ['backlog-workflow', 'audit-claude-md'],
      workflow: {
        caption: '工作流程：需求經過規劃、執行與驗證，最後以證據收尾。',
        start: '需求',
        steps: ['規劃', '執行', '驗證'],
        end: '證據',
      },
      caseStudyCta: { label: '閱讀案例研究' },
      cta: { label: 'GitHub' },
    },
    research: {
      eyebrow: '研究',
      heading: '抗洩漏密碼學',
      // Publication title and journal name are proper nouns (PRD §7).
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications · 2026',
      summary: '共同發表的研究，探討憑證式加密如何在金鑰持續洩漏的情況下仍能維持安全性。',
      cta: { label: '閱讀論文' },
    },
    writing: {
      // The platform's own name, so it reads the same in both locales.
      eyebrow: 'Study',
      heading: '技術文章',
      languages: { en: '英文', zh: '中文' },
      cta: { label: '瀏覽技術文章' },
    },
    experience: {
      heading: '10+ 年工程經驗',
      progression: '軟體工程 → 系統架構 → AI 系統',
      summary: '經歷涵蓋企業軟體、雲端、資安、行動／網頁應用與 AI。',
      cta: { label: '關於 Oliver' },
    },
  },
} satisfies HomeDictionary;
