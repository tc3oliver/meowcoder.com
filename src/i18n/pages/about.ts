import type { Locale } from '../locales';
import type { PageStrings } from './types';

/**
 * About page content (MCD-8, PRD §13–§17).
 *
 * The About page is the one place where professional depth, research, and
 * credentials live (PRD §8 keeps them out of the primary navigation), so its
 * copy is structured rather than free prose: the sections below are fixed by
 * the PRD, and giving each one a typed shape is what makes a missing or
 * mismatched translation a compile error instead of a review comment.
 *
 * Two content rules constrain everything here and are worth stating once:
 *
 *   - PRD §11 — employer work appears only at a safe abstraction level. No
 *     internal project name, repository, infrastructure detail, private
 *     measurement, or customer ever appears in these strings.
 *   - PRD §34 — no locale mixes languages inside one prose block. Proper nouns
 *     (Oliver Yu, the journal name, the paper title, Microsoft AI-900, the
 *     scheme name LR-CBEET, the security notions IND-CCA and OW-CCA) and
 *     established technical terms (AI, DevOps, Agent, Azure) are the stated
 *     exceptions and are therefore left untranslated in the Chinese copy.
 */

/**
 * One rung of the doc-2 §14 career progression.
 *
 * `label` is the rung itself — the three read as
 * `Software Engineering → System Architecture → AI Systems`. `detail` is the
 * one line of substance under it, and it names domains only: PRD §11 keeps
 * employers, internal projects, and dates out, because this is a progression,
 * not an employment history.
 */
export interface CareerStage {
  label: string;
  detail: string;
}

/** A PRD §16 credential. `note` carries validity when the PRD states one. */
export interface Credential {
  name: string;
  /** Issuer and year, or the exam's subject when that is all the PRD gives. */
  meta: string;
  note?: string;
}

export interface AboutStrings extends PageStrings {
  /**
   * PRD §13's opening runs to three paragraphs. The first is the identity
   * statement, which is exactly what `PageStrings.intro` is for and stays
   * there; these are the second and third.
   */
  summary: readonly string[];
  /** PRD §13 Engineering Background: domains as plain text, never as logos. */
  background: {
    heading: string;
    items: readonly string[];
  };
  /**
   * doc-2 §14 career progression. It sits with the opening rather than under
   * its own `h2`, so `label` names the block without competing with the
   * section headings below it.
   */
  career: {
    label: string;
    stages: readonly CareerStage[];
  };
  /** PRD §15. Concise credibility signals, not a publication list. */
  research: {
    heading: string;
    venue: string;
    /** Publication title — a proper noun, so it is never translated. */
    paper: string;
    /**
     * What the paper actually contributes. doc-2 §9 moves this off the
     * homepage — IND-CCA / OW-CCA is more than homepage credibility needs —
     * and states that it belongs here instead.
     */
    detail: string;
    areasLabel: string;
    areas: readonly string[];
  };
  /** PRD §15. Its own cell in the doc-2 §14 composition, beside Credentials. */
  education: {
    heading: string;
    degree: string;
    institution: string;
  };
  /**
   * PRD §16. Only the two the PRD recommends; course completions are not here.
   * The AI Application Planner entry's `name` is corrected per doc-2 §15 — the
   * Chinese certificate name is the source of truth and appears (as a proper
   * noun) in both locale strings, worded differently only in punctuation.
   */
  credentials: {
    heading: string;
    items: readonly Credential[];
  };
  /** PRD §17. Kept on About rather than as a large homepage section. */
  principles: {
    heading: string;
    statement: string;
    items: readonly string[];
  };
}

/**
 * `AboutStrings extends PageStrings`, so this dictionary still satisfies the
 * shared `PageDictionary` contract that `SiteShell` and the SEO metadata read.
 */
export type AboutDictionary = Record<Locale, AboutStrings>;

export const about = {
  en: {
    title: 'About — Oliver Yu',
    description:
      'Engineering background, research, credentials, and the principles behind how I build software.',
    heading: 'About',
    intro:
      'I am an AI systems engineer and system architect based in Taiwan, with more than 10 years of software engineering experience.',
    summary: [
      'My background spans enterprise systems, cloud platforms, mobile and web applications, software security, machine learning, and AI systems.',
      'Today, my work focuses on building reliable AI infrastructure, agentic developer systems, knowledge platforms, and production AI applications.',
    ],
    background: {
      heading: 'Engineering Background',
      items: [
        'AI Systems',
        'System Architecture',
        'Security & Privacy',
        'Backend & Integration',
        'Cloud & DevOps',
        'Web / Mobile',
        'Software Quality',
        'Machine Learning',
      ],
    },
    career: {
      label: 'Career progression',
      stages: [
        {
          label: 'Software Engineering',
          detail: 'Mobile and web applications, then enterprise systems',
        },
        {
          label: 'System Architecture',
          detail: 'Cloud and platform engineering, technical leadership',
        },
        {
          label: 'AI Systems',
          detail: 'Architecture and delivery of AI systems that run in production',
        },
      ],
    },
    research: {
      heading: 'Research',
      venue: 'Journal of Information Security and Applications — 2026',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      detail:
        'The paper proposes LR-CBEET, combining equality testing with resistance to side-channel leakage through key-update mechanisms, with formal analysis under IND-CCA and OW-CCA security notions.',
      areasLabel: 'Research areas',
      areas: [
        'Leakage-resilient cryptography',
        'Certificate-based encryption',
        'Equality testing',
        'Side-channel leakage',
        'Formal security analysis',
      ],
    },
    education: {
      heading: 'Education',
      degree: 'M.S. in Computer Science and Engineering',
      institution: 'National Taiwan Ocean University',
    },
    credentials: {
      heading: 'Selected Credentials',
      items: [
        {
          // doc-2 §15: the source certificate reads AI應用規劃師（機器學習）－中級能力鑑定
          // ("Intermediate Level"), not "Specialist Level". The Chinese certificate name is
          // a proper noun and the preferred English-page representation per doc-2 §15.
          name: 'AI應用規劃師（機器學習）— 中級能力鑑定',
          meta: 'Ministry of Economic Affairs, Taiwan · 2025',
          note: 'Valid through 2030',
        },
        {
          name: 'Microsoft AI-900',
          meta: 'Azure AI Fundamentals',
        },
      ],
    },
    principles: {
      heading: 'Engineering Principles',
      statement: 'Reliable AI systems require more than capable models.',
      items: [
        'Traceable',
        'Testable',
        'Observable',
        'Permission-aware',
        'Replaceable',
        'Recoverable',
      ],
    },
  },
  zh: {
    title: '關於我 — Oliver Yu',
    description: '工程背景、研究、專業證照，以及我建構軟體時所依循的原則。',
    heading: '關於我',
    intro: '我是來自台灣的 AI 系統工程師與系統架構師，累積超過十年的軟體工程經驗。',
    summary: [
      '我的技術背景橫跨企業系統、雲端平台、行動與網頁應用、軟體安全、機器學習與 AI 系統。',
      '現在的工作重心，是打造可靠的 AI 基礎架構、以 Agent 為核心的開發者系統、知識平台，以及能實際上線的 AI 應用。',
    ],
    background: {
      heading: '工程背景',
      items: [
        'AI 系統',
        '系統架構',
        '資安與隱私',
        '後端與系統整合',
        '雲端與 DevOps',
        '網頁與行動應用',
        '軟體品質',
        '機器學習',
      ],
    },
    career: {
      label: '職涯歷程',
      stages: [
        { label: '軟體工程', detail: '從行動與網頁應用，一路做到企業系統' },
        { label: '系統架構', detail: '雲端與平台工程、技術領導' },
        { label: 'AI 系統', detail: 'AI 系統的架構設計與正式上線' },
      ],
    },
    research: {
      heading: '研究',
      venue: 'Journal of Information Security and Applications — 2026',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      detail:
        '論文提出 LR-CBEET，以金鑰更新機制把等值測試與側通道洩漏防護結合起來，並在 IND-CCA 與 OW-CCA 安全性定義下完成形式化分析。',
      areasLabel: '研究領域',
      areas: ['抗洩漏密碼學', '憑證式加密', '等值測試', '側通道洩漏', '形式化安全性分析'],
    },
    education: {
      heading: '學歷',
      degree: '資訊工程碩士',
      institution: '國立臺灣海洋大學',
    },
    credentials: {
      heading: '專業證照',
      items: [
        {
          // doc-2 §15: quoted verbatim from the source certificate.
          name: 'AI應用規劃師（機器學習）－中級能力鑑定',
          meta: '經濟部 · 2025',
          note: '效期至 2030 年',
        },
        {
          name: 'Microsoft AI-900',
          meta: 'Azure AI 基礎',
        },
      ],
    },
    principles: {
      heading: '工程原則',
      statement: '可靠的 AI 系統，靠的不只是夠強的模型。',
      items: ['可追溯', '可測試', '可觀測', '權限感知', '可替換', '可復原'],
    },
  },
} satisfies AboutDictionary;
