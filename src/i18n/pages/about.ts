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
 *     (Oliver Yu, the journal name, the paper title, Microsoft AI-900) and
 *     established technical terms (AI, DevOps, Agent, Azure) are the stated
 *     exceptions and are therefore left untranslated in the Chinese copy.
 */

/** One rung of the PRD §14 career progression: a label and what sat under it. */
export interface CareerTier {
  label: string;
  items: readonly string[];
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
  /** PRD §14 Career Snapshot: Today / Earlier / Foundation, and nothing more. */
  career: {
    heading: string;
    tiers: readonly CareerTier[];
  };
  /** PRD §15. Concise credibility signals, not a publication list. */
  research: {
    heading: string;
    publicationHeading: string;
    venue: string;
    /** Publication title — a proper noun, so it is never translated. */
    paper: string;
    areasLabel: string;
    areas: readonly string[];
    educationHeading: string;
    degree: string;
    institution: string;
  };
  /** PRD §16. Only the two the PRD recommends; course completions are not here. */
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
      heading: 'Career Snapshot',
      tiers: [
        { label: 'Today', items: ['AI Systems & Architecture'] },
        {
          label: 'Earlier',
          items: ['Enterprise Systems', 'Technical Leadership', 'Cloud & Platform Engineering'],
        },
        { label: 'Foundation', items: ['Mobile / Web Software Engineering'] },
      ],
    },
    research: {
      heading: 'Research & Education',
      publicationHeading: 'Research',
      venue: 'Journal of Information Security and Applications — 2026',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      areasLabel: 'Research areas',
      areas: [
        'Leakage-resilient cryptography',
        'Certificate-based encryption',
        'Equality testing',
        'Side-channel leakage',
        'Formal security analysis',
      ],
      educationHeading: 'Education',
      degree: 'M.S. in Computer Science and Engineering',
      institution: 'National Taiwan Ocean University',
    },
    credentials: {
      heading: 'Selected Credentials',
      items: [
        {
          name: 'AI Application Planner (Machine Learning) — Specialist Level',
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
      heading: '職涯軌跡',
      tiers: [
        { label: '現在', items: ['AI 系統與架構'] },
        { label: '先前', items: ['企業系統', '技術領導', '雲端與平台工程'] },
        { label: '起點', items: ['行動與網頁軟體開發'] },
      ],
    },
    research: {
      heading: '研究與學歷',
      publicationHeading: '研究',
      venue: 'Journal of Information Security and Applications — 2026',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      areasLabel: '研究領域',
      areas: ['抗洩漏密碼學', '憑證式加密', '等值測試', '側通道洩漏', '形式化安全性分析'],
      educationHeading: '學歷',
      degree: '資訊工程碩士',
      institution: '國立臺灣海洋大學',
    },
    credentials: {
      heading: '專業證照',
      items: [
        {
          name: 'AI 應用規劃師（機器學習）— 專業級',
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
