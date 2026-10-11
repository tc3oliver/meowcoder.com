import type { Locale } from '../locales';
import type { PageStrings } from './types';
import {
  INFERENCE_SYSTEMS_ARTICLE_URL,
  LAYA_APPLE_ARTICLE_EN_URL,
  LAYA_APPLE_ARTICLE_URL,
  QWEN38_5070TI_ARTICLE_URL,
} from '../../lib/external';

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

/** An editor-selected investigation: the label is an editorial topic, not the article's title. */
export interface SelectedWriting {
  topic: string;
  description: string;
  href: string;
  language: Locale;
  area: string;
}

/** One upstream OSS project, linked to its repository with a short contribution summary. */
export interface UpstreamProject {
  name: string;
  href: string;
  description: string;
}

export interface HomeStrings extends PageStrings {
  /**
   * doc-2 §5. `heading` is the name and `intro` the statement beneath it, so
   * the hero adds only what `PageStrings` has no field for.
   *
   * doc-2 §5 keeps the name, the role line and the facts, and replaces only
   * the supporting statement; round 3 drops the two hero actions, because the
   * numbered sections below are the page's navigation. `role` stays in
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
    thesis: string;
    facts: readonly string[];
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
    moreHeading: string;
    labels: { product: string; infrastructure: string };
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
    /** The same shape as PiShip; the statement is the case-study card's summary. */
    claudeTeamKit: {
      heading: string;
      statement: string;
      cta: CtaLabel;
    };
  };
  /**
   * The research proof: four programs, each a measured result linked to its
   * case study (or repository) and, where one exists, its Study article; then
   * the upstream project contributions.
   */
  systems: {
    heading: string;
    flagship: { title: string; summary: string; method: string; linkLabel: string };
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
     * Selected upstream projects. The homepage presents one summary per
     * project; the GitHub profile owns individual PRs and their live status.
     */
    upstream: {
      heading: string;
      items: readonly UpstreamProject[];
      /** The full, generated PR record on the GitHub profile. */
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
   * The page-closing About block (round 3 replaces the career-arc colophon):
   * a title and one line saying what About carries. PRD §11 still binds
   * both. Internal; the About route is resolved by the component, not here.
   */
  aboutNav: {
    title: string;
    description: string;
  };
  /**
   * PRD §9.6. Metadata pulled from Study; never article bodies. A date and
   * title list, with the journal paper as its last row.
   */
  writing: {
    heading: string;
    selected: readonly SelectedWriting[];
    latestHeading: string;
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
      'AI Systems Engineer and System Architect with 10+ years of software engineering experience, building AI systems, developer tooling, and model infrastructure.',
    heading: 'Oliver Yu',
    intro:
      'I build enterprise AI agent systems and investigate inference performance across AMD, NVIDIA, and Apple Silicon—connecting measured bottlenecks, upstream fixes, and deployable runtimes.',
    hero: {
      role: 'AI Systems Engineer · System Architect',
      thesis: 'From unexplained latency to systems that recover.',
      facts: ['laya-apple on PyPI', 'Upstream: MLX · oMLX · coremltools'],
      noBreakSuffix: 'runtimes.',
    },
    shouri: {
      heading: 'Shouri / 收理',
      summary:
        'Saves webpages, files, and media first, then uses AI to turn them into structured, searchable knowledge. The original is always kept and can be exported.',
      cta: { label: 'Visit Shouri' },
    },
    products: {
      heading: 'Selected Systems',
      moreHeading: 'Tools & Experiments',
      labels: { product: 'Independent product', infrastructure: 'Agent infrastructure' },
      signalforge: {
        heading: 'SignalForge',
        statement: 'An event-centric intelligence pipeline that runs every morning.',
        liveCta: { label: 'Read Today' },
        cta: { label: 'GitHub' },
      },
      piship: {
        heading: 'PiShip',
        statement:
          'A toolchain that lets a company ship Pi as its own coding agent without forking it, adding OIDC login, short-lived gateway credentials, policy, and a sandbox.',
        cta: { label: 'GitHub' },
      },
      claudeTeamKit: {
        heading: 'Claude Team Kit',
        statement:
          'A Claude Code plugin that caps native Agent Teams teammates and adds a read-only Mission Control pane for workers, task dependencies, and usage.',
        cta: { label: 'GitHub' },
      },
    },
    systems: {
      heading: 'Featured Research',
      flagship: {
        title: 'When the accelerator is fast, but returning a result is slow',
        summary:
          'Running MLX GPU and Apple Neural Engine requests side by side exposed host-side contention that raw accelerator benchmarks missed.',
        method: 'Measure the handoff · Isolate GIL contention · Ship adaptive GPU + ANE serving',
        linkLabel: 'Explore the full investigation',
      },
      resultsHeading: 'More measured work',
      projects: [
        {
          id: 'laya-apple',
          name: 'laya-apple',
          stat: {
            value: '7.67 → 0.14 ms',
            label: 'GPU result return (P50), once synchronous Core ML stopped holding the GIL',
          },
          articleCta: { label: 'Read the article on X' },
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
        heading: 'OSS Contributions',
        items: [
          {
            name: 'MLX',
            href: 'https://github.com/ml-explore/mlx',
            description:
              'Fixed lost rank output in the distributed launcher by draining both pipes after the process exits.',
          },
          {
            name: 'oMLX',
            href: 'https://github.com/jundot/omlx',
            description:
              'Improved SpecPrefill cache reuse, deterministic prefill routing, and Responses API tool routing.',
          },
          {
            name: 'Apple coremltools',
            href: 'https://github.com/apple/coremltools',
            description:
              'Proposed releasing the Python GIL during native Core ML prediction to prevent other threads from stalling. Under review.',
          },
        ],
        cta: { label: 'View all upstream pull requests' },
      },
    },
    research: {
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications',
      year: '2026',
    },
    aboutNav: {
      title: 'About Oliver',
      description: 'More about my engineering background and research interests.',
    },
    writing: {
      heading: 'Selected Writing',
      selected: [
        {
          topic: 'When host-side contention hides accelerator performance',
          description:
            'Tracing the GIL and latency costs of concurrent GPU and Neural Engine serving.',
          href: LAYA_APPLE_ARTICLE_EN_URL,
          language: 'en',
          area: 'Apple Silicon · Inference',
        },
        {
          topic: 'Recovering reusable state between inference requests',
          description:
            'Why saving one request is not enough when the following session pays the cost.',
          href: INFERENCE_SYSTEMS_ARTICLE_URL,
          language: 'zh',
          area: 'LLM Inference · State',
        },
        {
          topic: 'Evaluating a 27B coding model on a single consumer GPU',
          description:
            'An evidence-first account of correctness and memory limits on a 16 GB RTX 5070 Ti.',
          href: QWEN38_5070TI_ARTICLE_URL,
          language: 'zh',
          area: 'GPU Evaluation · Methodology',
        },
      ],
      latestHeading: 'Latest on Study',
      languages: { en: 'English', zh: 'Chinese' },
      cta: { label: 'Explore all technical writing' },
    },
  },
  zh: {
    title: 'Oliver Yu — AI 系統工程師與系統架構師',
    description:
      'AI 系統工程師與系統架構師，有 10 年以上軟體工程經驗，開發 AI 系統、開發者工具與模型基礎架構。',
    heading: 'Oliver Yu',
    intro:
      '我打造企業 AI Agent 系統，並研究 AMD、NVIDIA 與 Apple Silicon 上的推論效能，從量測瓶頸、上游修正到可部署的系統。',
    hero: {
      role: 'AI Systems Engineer · System Architect',
      thesis: '從難以解釋的延遲，到能恢復的系統。',
      facts: ['laya-apple 已發布到 PyPI', '上游貢獻：MLX · oMLX · coremltools'],
      noBreakSuffix: '系統。',
    },
    shouri: {
      heading: 'Shouri / 收理',
      summary:
        '先完整保存網頁、檔案與媒體，再由 AI 整理成結構化、可搜尋的知識。原始內容一律完整保留，也隨時可以匯出。',
      cta: { label: '前往 Shouri' },
    },
    products: {
      heading: '代表系統',
      moreHeading: '工具與實驗',
      labels: { product: '獨立產品', infrastructure: 'Agent 基礎設施' },
      signalforge: {
        heading: 'SignalForge',
        statement: '每天早上執行的事件導向情報管線。',
        liveCta: { label: '看今天的重點' },
        cta: { label: 'GitHub' },
      },
      piship: {
        heading: 'PiShip',
        statement:
          '一套工具鏈，讓公司不必 fork Pi 就能把它做成自家的 coding agent，並補上 OIDC 登入、短效 gateway 憑證、policy 與 sandbox。',
        cta: { label: 'GitHub' },
      },
      claudeTeamKit: {
        heading: 'Claude Team Kit',
        statement:
          '一個 Claude Code plugin，限制 Agent Teams 原生 teammate 的數量，並提供唯讀的 Mission Control 面板，顯示 worker、任務相依與用量。',
        cta: { label: 'GitHub' },
      },
    },
    systems: {
      heading: '代表研究',
      flagship: {
        title: '加速器很快，結果卻回得很慢',
        summary:
          '讓 MLX GPU 與 Apple Neural Engine 同時服務請求時，發現加速器本身的基準測試無法揭露的主機端競爭問題。',
        method: '量測資料交接 · 定位 GIL 競爭 · 發布自適應 GPU + ANE 服務',
        linkLabel: '深入閱讀完整研究',
      },
      resultsHeading: '其他實測研究',
      projects: [
        {
          id: 'laya-apple',
          name: 'laya-apple',
          stat: {
            value: '7.67 → 0.14 ms',
            label: 'GPU 結果回傳時間（P50），在同步 Core ML 不再佔住 GIL 之後',
          },
          articleCta: { label: '閱讀長文' },
        },
        {
          id: 'llm-inference-systems',
          name: 'llm-inference-systems',
          stat: {
            value: '228.38 → 79.06 s',
            label: '七輪 session 的累積延遲，在閒置時重建可重用前綴狀態之後',
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
        heading: '開源貢獻',
        items: [
          {
            name: 'MLX',
            href: 'https://github.com/ml-explore/mlx',
            description:
              '修正 distributed launcher 在 rank 行程結束後遺失最後輸出的問題，確保兩條輸出管線完整讀取。',
          },
          {
            name: 'oMLX',
            href: 'https://github.com/jundot/omlx',
            description:
              '改善 SpecPrefill 快取重用、prefill 路徑一致性，以及 Responses API 的工具路由。',
          },
          {
            name: 'Apple coremltools',
            href: 'https://github.com/apple/coremltools',
            description:
              '提交在 Core ML 原生推論期間釋放 Python GIL 的修正，避免其他執行緒被阻塞；目前審查中。',
          },
        ],
        cta: { label: '查看完整上游 PR 紀錄' },
      },
    },
    research: {
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      venue: 'Journal of Information Security and Applications',
      year: '2026',
    },
    aboutNav: {
      title: '關於 Oliver',
      description: '更多關於我的工程背景與研究方向。',
    },
    writing: {
      heading: '精選技術文章',
      selected: [
        {
          topic: '當主機端競爭掩蓋加速器效能',
          description: '追查 GPU 與 Neural Engine 併發服務時的 GIL 問題與延遲成本。',
          href: LAYA_APPLE_ARTICLE_URL,
          language: 'zh',
          area: 'Apple Silicon · 推論',
        },
        {
          topic: '在推論請求之間恢復可重用狀態',
          description: '不只改善單次請求，也量測快取與狀態重建對後續請求的影響。',
          href: INFERENCE_SYSTEMS_ARTICLE_URL,
          language: 'zh',
          area: 'LLM 推論 · 狀態',
        },
        {
          topic: '在單張消費級 GPU 上評測 27B 程式模型',
          description: '記錄 16 GB RTX 5070 Ti 的正確性、記憶體限制與實驗方法。',
          href: QWEN38_5070TI_ARTICLE_URL,
          language: 'zh',
          area: 'GPU 評測 · 方法',
        },
      ],
      latestHeading: 'Study 最新文章',
      languages: { en: '英文', zh: '中文' },
      cta: { label: '瀏覽所有技術文章' },
    },
  },
} satisfies HomeDictionary;
