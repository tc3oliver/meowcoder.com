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

/** The research programs the homepage features; each maps to its links in the component. */
export type ResearchProjectId = 'laya-apple' | 'llm-inference-systems' | 'deepseek-v4-flash-mi300x';

/**
 * One research program: a name, the one measured result it leads with, one
 * statement, and one line of facts. `stat.value` must be quoted from the
 * project's case study, which names the data behind it.
 */
export interface ResearchProject {
  id: ResearchProjectId;
  /** A repository name, identical in both locales. */
  name: string;
  stat: { value: string; label: string };
  statement: string;
  meta: string;
  /**
   * Overrides the section's `articleCta` when this project's article exists in
   * the reader's language: the section label marks an article as Chinese-only.
   */
  articleCta?: CtaLabel;
}

/** One upstream pull request, or a stacked pair shown as one item. */
export interface UpstreamItem {
  /** `owner/repo#number`, as GitHub prints it; never translated. */
  name: string;
  href: string;
  merged?: boolean;
  description: string;
}

export interface HomeStrings extends PageStrings {
  /**
   * doc-2 §5. `heading` is the name and `intro` the statement beneath it, so
   * the hero adds only what `PageStrings` has no field for.
   *
   * doc-2 §5 keeps the name, the role line, the facts, and exactly two
   * actions, and replaces only the supporting statement. `role` stays in
   * English in both locales: PRD §9.1 writes the Chinese hero that way, and it
   * is its own standalone line rather than a prose block, so no block mixes
   * languages (PRD §34).
   *
   * `facts` carried a second entry, `Taiwan`, also in English in both
   * locales. It was the only fact that was not about the work, which put a
   * bare country name at the same weight as a decade of engineering, and in
   * the Chinese hero it told a Taiwanese reader nothing, in English. A
   * location is worth stating when it answers something — a timezone for
   * someone deciding whether to work together — and the bare name did not.
   */
  hero: {
    role: string;
    facts: readonly string[];
    workCta: string;
    writingCta: string;
    /** Optional sentence suffix that should remain intact when CJK text wraps. */
    noBreakSuffix?: string;
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
    /**
     * The second project in the section, first in reading order: the public
     * system proof. It has what Skills does not — a running instance — so it
     * carries three actions where Skills carries two: the live reader, the
     * case study, and the repository. `meta` is one compact line of facts
     * (licence, language, what runs), the same role `skills` plays beside it.
     */
    signalforge: {
      heading: string;
      statement: string;
      meta: string;
      liveCta: CtaLabel;
      /** Internal; the case-study route is resolved by the component, not here. */
      caseStudyCta: CtaLabel;
      cta: CtaLabel;
    };
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
    /**
     * Pull requests to projects this site's author does not maintain — the
     * upstream half of the section. Only pull requests whose state cannot go
     * stale are marked: `merged` is final, and an open one carries no status
     * rather than one that would be wrong the day it merges.
     */
    upstream: {
      heading: string;
      items: readonly UpstreamItem[];
      /** The state label printed beside a merged pull request. */
      merged: string;
      /** The full, generated record on the GitHub profile. */
      cta: CtaLabel;
    };
    /** Internal; the case-study route is resolved by the component, not here. */
    caseStudyCta: CtaLabel;
    cta: CtaLabel;
  };
  /**
   * The research proof: two programs, each led by one measured result, with
   * three actions each — the case study, the Study article, and the repository.
   */
  systems: {
    eyebrow: string;
    heading: string;
    /**
     * The research programs, laya-apple first: it is the one that shipped. The
     * MI300X baseline is here so the section does not read as Apple-only work.
     */
    projects: readonly ResearchProject[];
    /** Internal; each case-study route is resolved by the component, not here. */
    caseStudyCta: CtaLabel;
    /** The Study article. Both are published in Chinese only, which `en` says. */
    articleCta: CtaLabel;
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
      'I build AI products and the LLM inference systems under them, on Apple silicon and AMD GPUs, and trace performance problems to a measured cause.',
    hero: {
      role: 'AI Systems Engineer · System Architect',
      facts: [
        'laya-apple 1.5 on PyPI',
        'Upstream: Apple coremltools · oMLX',
        '10+ Years in Software Engineering',
      ],
      workCta: 'View Selected Work',
      writingCta: 'Technical Writing',
      noBreakSuffix: 'measured cause.',
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
    openSource: {
      eyebrow: 'Open Source',
      heading: 'Open Source and Upstream',
      signalforge: {
        heading: 'SignalForge',
        statement:
          'An event-centric intelligence pipeline that runs every morning. It collects from multiple sources, tracks stories across days in a ledger, and writes a daily brief that is validated by code.',
        meta: 'MIT · TypeScript · Postgres · Live',
        liveCta: { label: 'Read Today' },
        caseStudyCta: { label: 'View Case Study' },
        cta: { label: 'GitHub' },
      },
      statement:
        'Versioned workflows for requirement alignment, just-in-time planning, validation, and explicit completion criteria.',
      skills: ['backlog-workflow', 'audit-claude-md'],
      workflow: {
        caption:
          'The workflow: a requirement is planned, executed, validated, and completed against explicit criteria.',
        start: 'Requirement',
        steps: ['Plan', 'Execute', 'Validate'],
        end: 'Complete',
      },
      upstream: {
        heading: 'Upstream',
        merged: 'Merged',
        items: [
          {
            name: 'apple/coremltools#2876',
            href: 'https://github.com/apple/coremltools/pull/2876',
            description:
              'Releases the GIL only for the duration of the native Core ML prediction call. Found during the laya-apple research.',
          },
          {
            name: 'jundot/omlx#3685',
            href: 'https://github.com/jundot/omlx/pull/3685',
            merged: true,
            description:
              'Keeps SDPA256 prefill on one route, so an identical request gives the same temperature-0 output in every process.',
          },
          {
            name: 'jundot/omlx#3840 + #3842',
            href: 'https://github.com/jundot/omlx/pull/3842',
            merged: true,
            description:
              'Makes the SpecPrefill draft cache produce usable hits on hybrid attention–recurrent models.',
          },
          {
            name: 'jundot/omlx#3664',
            href: 'https://github.com/jundot/omlx/pull/3664',
            merged: true,
            description:
              'Keeps namespace tool groups intact through the Responses API, which is the format Codex uses for MCP servers.',
          },
        ],
        cta: { label: 'All upstream pull requests' },
      },
      caseStudyCta: { label: 'View Case Study' },
      cta: { label: 'GitHub' },
    },
    systems: {
      eyebrow: 'Featured Research',
      heading: 'Inference Systems Research',
      projects: [
        {
          id: 'laya-apple',
          name: 'laya-apple',
          stat: {
            value: '7.67 → 0.14 ms',
            label: 'GPU result return (P50), once synchronous Core ML stopped holding the GIL',
          },
          statement:
            'Serves requests on the MLX GPU and the Apple Neural Engine at the same time. The research traced the added GPU latency to Python’s GIL and sent the fix upstream. laya-apple 1.5 detects a host-side slow state from its own request trace and falls back to the known-safe path.',
          meta: 'Apple M4 Max · MLX + Core ML · laya-apple 1.5 on PyPI',
          articleCta: { label: 'Read the Article' },
        },
        {
          id: 'llm-inference-systems',
          name: 'llm-inference-systems',
          stat: {
            value: '228.38 → 79.06 s',
            label:
              'Cumulative latency of a seven-turn session, once reusable prefix state is rebuilt in idle time',
          },
          statement:
            'Measures what an inference optimization leaves behind for the next request. Three experiments, each published with its raw data and figures, cover reusable prefix state, the cost model of speculative decoding, and background recovery.',
          meta: 'Apple M4 Max · oMLX · Three experiments · Raw data and figures',
        },
        {
          id: 'deepseek-v4-flash-mi300x',
          name: 'deepseek-v4-flash-mi300x',
          stat: {
            value: '1,474 tok/s',
            label:
              'Aggregate output with 32 concurrent coding sub-agents, 2× MI300X at TP=2; specific to that host and image',
          },
          statement:
            'Kernel-level work to serve DeepSeek V4 Flash on two MI300X GPUs, building on a single-GPU stack: 64-bit addressing across 20 sites in the paged-MQA kernel, a dropped activation argument fixed in the Triton MoE path, and 84 AITER GEMM shapes retuned for TP=2 on gfx942.',
          meta: 'AMD MI300X · ROCm · vLLM · AITER · Triton',
        },
      ],
      caseStudyCta: { label: 'View Case Study' },
      articleCta: { label: 'Read the Article (Chinese)' },
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
      'AI 系統工程師與系統架構師，有 10+ 年軟體工程經驗，開發 AI 系統、開發者工具、模型基礎架構與正式上線的軟體。',
    heading: 'Oliver Yu',
    intro:
      '我開發 AI 產品與 LLM 推論系統，跑在 Apple silicon 和 AMD GPU 上。遇到效能問題，就一路追到能用量測證明的原因。',
    hero: {
      // PRD §9.1 keeps the role line in English in the Chinese hero; it is a
      // standalone line, so it mixes no languages inside a prose block.
      role: 'AI Systems Engineer · System Architect',
      facts: [
        'laya-apple 1.5 已發布到 PyPI',
        '上游貢獻：Apple coremltools · oMLX',
        '10+ 年軟體工程經驗',
      ],
      workCta: '精選作品',
      writingCta: '技術文章',
      noBreakSuffix: '證明的原因。',
    },
    shouri: {
      eyebrow: '精選產品',
      heading: 'Shouri / 收理',
      summary: '先完整保存，再依需要交給 AI 整理；原始內容始終保留，不會被 AI 整理結果覆蓋。',
      screenshot: {
        alt: '收理在桌機與手機上的畫面。網頁應用正進行五個單元的學習路線；後方的產品頁把一段收下的料理影片與整理後的結構化食譜並列。兩個手機畫面則是收藏庫，以及拆成摘要、材料與步驟的同一份食譜。',
      },
      // The principle names are the product's own vocabulary and stay in
      // English in both locales — PRD §34 allows exactly that, and they are a
      // row of names rather than a prose block.
      principles: ['Save First', 'Explicit AI', 'Recoverable by Design'],
      // Word for word the label Open Source uses for the same action, so the
      // two case-study links on the homepage cannot read as different things.
      caseStudyCta: { label: '查看完整案例' },
      cta: { label: '前往 Shouri' },
    },
    openSource: {
      eyebrow: '開源',
      heading: '開源與上游貢獻',
      signalforge: {
        heading: 'SignalForge',
        statement:
          '事件導向的情報管線。每天早上從多個來源收集資料，用跨日紀錄追蹤事件發展，再產出經程式驗證的每日重點。',
        // Facts, not prose: licence, language, store, state (PRD §34).
        meta: 'MIT · TypeScript · Postgres · 線上運作中',
        liveCta: { label: '看今天的重點' },
        caseStudyCta: { label: '查看完整案例' },
        cta: { label: 'GitHub' },
      },
      statement:
        '可版本控管的 AI coding workflow：先對齊需求，執行前才規劃，依專案實際設定驗證，最後用明確條件判斷是否完成。',
      // The skill names are repository names, so they read the same in both
      // locales; the component joins them with a middot (doc-2 §7).
      skills: ['backlog-workflow', 'audit-claude-md'],
      workflow: {
        caption: '工作流程：需求經過規劃、執行與驗證，最後依明確條件完成。',
        start: '需求',
        steps: ['規劃', '執行', '驗證'],
        end: '完成',
      },
      upstream: {
        heading: '上游貢獻',
        merged: '已合併',
        items: [
          {
            name: 'apple/coremltools#2876',
            href: 'https://github.com/apple/coremltools/pull/2876',
            description:
              'laya-apple 的研究定位到 Core ML prediction 持有 GIL 的問題；修正方式是只在原生 prediction 呼叫期間釋放 GIL。',
          },
          {
            name: 'jundot/omlx#3685',
            href: 'https://github.com/jundot/omlx/pull/3685',
            merged: true,
            description:
              '讓 SDPA256 prefill 固定走一致的路徑，確保同一請求在不同 process 下的 temperature=0 輸出一致。',
          },
          {
            name: 'jundot/omlx#3840 + #3842',
            href: 'https://github.com/jundot/omlx/pull/3842',
            merged: true,
            description:
              '修正 hybrid attention/recurrent 模型上的 SpecPrefill draft cache reuse，讓 cache hit 真正生效。',
          },
          {
            name: 'jundot/omlx#3664',
            href: 'https://github.com/jundot/omlx/pull/3664',
            merged: true,
            description:
              '讓 Responses API 完整保留 namespace 工具群組；Codex 就是用這種格式接 MCP server。',
          },
        ],
        cta: { label: '所有上游 PR' },
      },
      caseStudyCta: { label: '查看完整案例' },
      cta: { label: 'GitHub' },
    },
    systems: {
      eyebrow: '精選研究',
      heading: '推論系統研究',
      projects: [
        {
          id: 'laya-apple',
          name: 'laya-apple',
          stat: {
            value: '7.67 → 0.14 ms',
            label: 'GPU 結果回傳時間（P50）：同步 Core ML 釋放 GIL 前後的差異',
          },
          statement:
            '同時用 MLX GPU 和 Apple Neural Engine 處理請求。研究最後定位到 Core ML prediction 持有 Python GIL，導致 GPU 額外延遲，修正也已送回上游。laya-apple 1.5 會透過 RequestTrace 偵測主機端變慢，發生時自動退回已知安全的路徑。',
          meta: 'Apple M4 Max · MLX + Core ML · laya-apple 1.5 已發布於 PyPI',
          articleCta: { label: '閱讀長文' },
        },
        {
          id: 'llm-inference-systems',
          name: 'llm-inference-systems',
          stat: {
            value: '228.38 → 79.06 s',
            label: '七輪 session 累積延遲：在閒置時重建可重用前綴狀態前後的差異',
          },
          statement:
            '研究單次推論的最佳化，會怎麼影響後續請求。三個實驗都公開原始資料與圖表，分別研究前綴狀態重用、推測解碼成本，以及背景重建。',
          meta: 'Apple M4 Max · oMLX · 三個實驗 · 原始資料與圖表',
        },
        {
          id: 'deepseek-v4-flash-mi300x',
          name: 'deepseek-v4-flash-mi300x',
          stat: {
            value: '1,474 tok/s',
            label:
              '32 個 coding sub-agent 同時執行時的總輸出，2× MI300X、TP=2；結果僅適用於該次測試環境',
          },
          statement:
            '以單 GPU 版本為基礎，從 kernel 層級著手，讓 DeepSeek V4 Flash 能在兩張 MI300X 上服務：將 paged-MQA kernel 的 20 處定址改為 64 位元，補上 Triton MoE 路徑遺漏的 activation function 參數，並針對 gfx942 + TP=2 重新調校 84 組 AITER GEMM shape。',
          meta: 'AMD MI300X · ROCm · vLLM · AITER · Triton',
        },
      ],
      caseStudyCta: { label: '查看完整案例' },
      articleCta: { label: '閱讀長文' },
      cta: { label: 'GitHub' },
    },
    research: {
      eyebrow: '研究',
      heading: '抗洩漏密碼學',
      // Publication title and journal name are proper nouns (PRD §7).
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications · 2026',
      summary: '共同發表的研究，探討如何讓憑證式加密在金鑰持續洩漏的情況下維持安全性。',
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
      summary: '經歷涵蓋企業軟體、雲端、資安、行動／網頁應用與 AI 系統。',
      cta: { label: '關於 Oliver' },
    },
  },
} satisfies HomeDictionary;
