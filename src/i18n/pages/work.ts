import type { Locale } from '../locales';
import type { PageStrings } from './types';

/**
 * Work index and detail chrome (MCD-5, PRD §10, §27).
 *
 * Only the strings the pages own. Everything a case study says about itself —
 * title, type, summary, prose — lives in its own localized content file under
 * `src/content/work/`, which is what PRD §27 requires of long-form content.
 */
export interface WorkPageStrings extends PageStrings {
  /** Shown on the index while no case study is published. */
  empty: string;
  /**
   * The one link each index entry carries (doc-2 §11). The project it leads to
   * is appended from the entry's own title, so the label itself stays generic.
   */
  caseStudyCta: string;
  /** The professional-experience entry uses a destination-specific action. */
  experienceCta: string;
  /** Compact career progression shown on the Work index experience entry. */
  experienceProgression: {
    label: string;
    stages: readonly string[];
  };
  /** Additional destination on the professional-experience detail page. */
  aboutOliver: string;
  /** Accessible name for experience metadata shown in the detail-page header. */
  experienceOverviewLabel: string;
  /**
   * Labels for the two visuals doc-2 §11 gives the index, keyed by the case
   * study each belongs to. They describe presentation rather than the projects,
   * which is why they sit here and not in the content files.
   */
  visuals: {
    /** Alt text for the Shouri product screenshot. */
    shouri: { alt: string };
    /** Stage names for the workflow diagram; see `WorkflowDiagram.astro`. */
    aiCodingSkills: {
      /** Accessible name for the diagram — it carries no visible caption. */
      caption: string;
      start: string;
      steps: readonly string[];
      end: string;
    };
  };
  /** Label for the `type` metadata on a detail page. */
  typeLabel: string;
  /** Accessible name for the detail page's metadata and navigation sidebar. */
  asideLabel: string;
  /** Heading over the section navigation in that sidebar. */
  sectionsLabel: string;
  /** Link from a detail page back to the index. */
  backToIndex: string;
}

export const work = {
  en: {
    title: 'Selected Work — Oliver Yu',
    description:
      'Selected work spanning product engineering, open source, and 10+ years of professional experience in systems, architecture, and AI.',
    heading: 'Work',
    /*
     * doc-2 §21 supersedes PRD §10's "only work that can be publicly inspected"
     * for this index, so the intro no longer claims exclusivity it does not
     * have. It still promises evidence — conditionally, which is the honest
     * version once one entry has none and says so.
     */
    intro:
      'Selected work across product engineering, open source, and professional experience, with a focus on systems, architecture, and the evolution of engineering scope.',
    empty: 'No work is published yet.',
    caseStudyCta: 'View Full Case Study',
    experienceCta: 'Explore Experience',
    experienceProgression: {
      label: 'Career progression',
      stages: [
        'Application Engineering',
        'Enterprise Systems & Architecture',
        'Enterprise AI Systems',
      ],
    },
    aboutOliver: 'About Oliver',
    experienceOverviewLabel: 'Experience overview',
    visuals: {
      // The same asset the homepage shows, so it is the same description. It is
      // restated rather than imported because the Work index does not depend on
      // the homepage's dictionary, and an image's alt text belongs with the page
      // that renders it.
      shouri: {
        alt: 'Shouri shown across desktop and mobile. The desktop views show a learning path and a saved cooking video organized into a structured recipe; the mobile views show the saved library and recipe details.',
      },
      aiCodingSkills: {
        caption:
          'The workflow moves from a requirement through planning, execution, and validation to completion.',
        start: 'Requirement',
        steps: ['Plan', 'Execute', 'Validate'],
        end: 'Complete',
      },
    },
    typeLabel: 'Type',
    asideLabel: 'Project details and contents',
    sectionsLabel: 'Contents',
    backToIndex: 'Back to all work',
  },
  zh: {
    title: '精選作品 — Oliver Yu',
    description: '工程作品選集，包括產品工程、開源實作，以及 10+ 年系統、架構與 AI 工程經歷。',
    heading: '作品',
    intro: '產品工程、開源實作與專業工程經歷，呈現系統設計、架構決策與工程範疇的演進。',
    empty: '目前尚無作品內容。',
    caseStudyCta: '查看完整案例',
    experienceCta: '查看工程歷程',
    experienceProgression: {
      label: '職涯進程',
      stages: ['應用程式工程', '企業系統與系統架構', '企業 AI 系統'],
    },
    aboutOliver: '關於 Oliver',
    experienceOverviewLabel: '工程經歷摘要',
    visuals: {
      shouri: {
        alt: '收理的桌機與行動版畫面。桌機畫面呈現學習路線，以及由料理影片整理出的結構化食譜；行動版畫面呈現收藏庫與食譜內容。',
      },
      aiCodingSkills: {
        caption: '工作流程從需求開始，經過規劃、執行與驗證，最後完成交付。',
        start: '需求',
        steps: ['規劃', '執行', '驗證'],
        end: '完成',
      },
    },
    typeLabel: '類型',
    asideLabel: '專案資訊與內容',
    sectionsLabel: '內容',
    backToIndex: '返回作品列表',
  },
} satisfies Record<Locale, WorkPageStrings>;
