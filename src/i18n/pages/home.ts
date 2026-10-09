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
export type ResearchProjectId =
  'laya-apple' | 'llm-inference-systems' | 'deepseek-v4-flash-mi300x' | 'qwen3.8-27b-5070ti-eval';

/**
 * One research program: a name and the one measured result it leads with.
 * `stat.value` must be quoted from the project's case study, which names the
 * data behind it. `note` is a negative result that stays beside the number.
 */
export interface ResearchProject {
  id: ResearchProjectId;
  /** A repository name, identical in both locales. */
  name: string;
  stat: { value: string; label: string };
  note?: string;
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
   * bare country name at the same weight as the work facts (a career-length
   * fact sat beside it then and has since been dropped), and in the Chinese
   * hero it told a Taiwanese reader nothing, in English. A
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
   * Shouri's row in Products. `heading` and `summary` are also the
   * `SoftwareApplication` name and description in `src/lib/structured-data.ts`,
   * which wants the product's own one-line description.
   */
  shouri: {
    /** Intentional bilingual identity, explicitly allowed by PRD §34. */
    heading: string;
    summary: string;
    cta: CtaLabel;
  };
  /**
   * The products list: SignalForge and PiShip after Shouri. Each row is a name
   * linked to its case study (resolved by the component), one sentence, and
   * text links. The upstream half moved to `systems`.
   */
  products: {
    heading: string;
    signalforge: {
      heading: string;
      statement: string;
      liveCta: CtaLabel;
      cta: CtaLabel;
    };
    piship: {
      heading: string;
      statement: string;
      cta: CtaLabel;
    };
  };
  /**
   * The research proof: four programs, each a measured result linked to its
   * case study (or repository) and, where one exists, its Study article; then
   * the upstream pull requests.
   */
  systems: {
    heading: string;
    /** Heading of the measured-results list. */
    resultsHeading: string;
    /**
     * The research programs, laya-apple first: it is the one that shipped. The
     * MI300X baseline is here so the section does not read as Apple-only work.
     */
    projects: readonly ResearchProject[];
    /** The Study article. Both are published in Chinese only, which `en` says. */
    articleCta: CtaLabel;
    /**
     * Pull requests to projects this site's author does not maintain. Only
     * pull requests whose state cannot go stale are marked: `merged` is final,
     * and an open one carries no status rather than one that would be wrong the
     * day it merges.
     */
    upstream: {
      heading: string;
      items: readonly UpstreamItem[];
      /** The state label printed beside a merged pull request. */
      merged: string;
      /** The full, generated record on the GitHub profile. */
      cta: CtaLabel;
    };
  };
  /**
   * PRD §9.5. One publication, and deliberately no navigation entry for it:
   * it is the last row of the Writing list, a year, a venue and a linked title.
   */
  research: {
    /** Publication title — a proper noun, so it is never translated. */
    paper: string;
    venue: string;
    year: string;
  };
  /**
   * PRD §9.6. Metadata pulled from Study; never article bodies. A date and
   * title list, with the journal paper as its last row.
   */
  writing: {
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
    /** The link to all of Study. */
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
      facts: ['laya-apple 1.5 on PyPI', 'Upstream: Apple coremltools · oMLX'],
      workCta: 'View Selected Work',
      writingCta: 'Technical Writing',
      noBreakSuffix: 'measured cause.',
    },
    shouri: {
      heading: 'Shouri / 收理',
      summary:
        'Save first. Organize with AI when needed. Keep the original as the source of truth.',
      cta: { label: 'Visit Shouri' },
    },
    products: {
      heading: 'Products',
      signalforge: {
        heading: 'SignalForge',
        statement: 'An event-centric intelligence pipeline that runs every morning.',
        liveCta: { label: 'Read Today' },
        cta: { label: 'GitHub' },
      },
      piship: {
        heading: 'PiShip',
        statement:
          'A toolchain that lets a company ship Pi as its own coding agent without forking it, with OIDC sign-in, short-lived gateway credentials, policy, and a sandbox.',
        cta: { label: 'GitHub' },
      },
    },
    systems: {
      heading: 'Inference Systems Research',
      resultsHeading: 'Results',
      projects: [
        {
          id: 'laya-apple',
          name: 'laya-apple',
          stat: {
            value: '7.67 → 0.14 ms',
            label: 'GPU result return (P50), once synchronous Core ML stopped holding the GIL',
          },
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
        },
        {
          id: 'deepseek-v4-flash-mi300x',
          name: 'deepseek-v4-flash-mi300x',
          stat: {
            value: '1,474 tok/s',
            label:
              'Aggregate output with 32 concurrent coding sub-agents, 2× MI300X at TP=2; specific to that host and image',
          },
        },
        {
          id: 'qwen3.8-27b-5070ti-eval',
          name: 'qwen3.8-27b-5070ti-eval',
          stat: {
            value: '92.1 %',
            label:
              'HumanEval+ pass@1, 151 of 164 tasks (95 % CI 86.9–95.3 %), on a single 16 GB RTX 5070 Ti',
          },
          note: 'Round 1 makes no comparison: the first competitor spilled out of VRAM mid-run, and that run was declared invalid.',
        },
      ],
      articleCta: { label: 'Read the Article (Chinese)' },
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
    },
    research: {
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications',
      year: '2026',
    },
    writing: {
      heading: 'Technical Writing',
      languages: { en: 'English', zh: 'Chinese' },
      cta: { label: 'All writing' },
    },
    experience: {
      heading: 'Engineering Background',
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
      facts: ['laya-apple 1.5 已發布到 PyPI', '上游貢獻：Apple coremltools · oMLX'],
      workCta: '精選作品',
      writingCta: '技術文章',
      noBreakSuffix: '證明的原因。',
    },
    shouri: {
      heading: 'Shouri / 收理',
      summary: '先完整保存，再依需要交給 AI 整理；原始內容始終保留，不會被 AI 整理結果覆蓋。',
      cta: { label: '前往 Shouri' },
    },
    products: {
      heading: '產品',
      signalforge: {
        heading: 'SignalForge',
        statement: '事件導向的情報管線。',
        liveCta: { label: '看今天的重點' },
        cta: { label: 'GitHub' },
      },
      piship: {
        heading: 'PiShip',
        statement:
          '讓公司不必 fork Pi，就能把它做成自家的 coding agent，並補上 OIDC 登入、短效 gateway 憑證、policy 與 sandbox。',
        cta: { label: 'GitHub' },
      },
    },
    systems: {
      heading: '推論系統研究',
      resultsHeading: '成果',
      projects: [
        {
          id: 'laya-apple',
          name: 'laya-apple',
          stat: {
            value: '7.67 → 0.14 ms',
            label: 'GPU 結果回傳時間（P50）：同步 Core ML 釋放 GIL 前後的差異',
          },
          articleCta: { label: '閱讀長文' },
        },
        {
          id: 'llm-inference-systems',
          name: 'llm-inference-systems',
          stat: {
            value: '228.38 → 79.06 s',
            label: '七輪 session 累積延遲：在閒置時重建可重用前綴狀態前後的差異',
          },
        },
        {
          id: 'deepseek-v4-flash-mi300x',
          name: 'deepseek-v4-flash-mi300x',
          stat: {
            value: '1,474 tok/s',
            label:
              '32 個 coding sub-agent 同時執行時的總輸出，2× MI300X、TP=2；結果僅適用於該次測試環境',
          },
        },
        {
          id: 'qwen3.8-27b-5070ti-eval',
          name: 'qwen3.8-27b-5070ti-eval',
          stat: {
            value: '92.1 %',
            label:
              'HumanEval+ pass@1：164 題通過 151 題（95 % CI 86.9–95.3 %），只用一張 16 GB 的 RTX 5070 Ti',
          },
          note: '第一個對手模型跑到一半 VRAM 溢出，那次結果作廢，所以第 1 輪不做任何比較。',
        },
      ],
      articleCta: { label: '閱讀長文' },
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
    },
    research: {
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications',
      year: '2026',
    },
    writing: {
      heading: '技術文章',
      languages: { en: '英文', zh: '中文' },
      cta: { label: '全部文章' },
    },
    experience: {
      heading: '工程背景',
      progression: '軟體工程 → 系統架構 → AI 系統',
      summary: '經歷涵蓋企業軟體、雲端、資安、行動／網頁應用與 AI 系統。',
      cta: { label: '關於 Oliver' },
    },
  },
} satisfies HomeDictionary;
