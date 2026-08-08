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
    title: 'Work — Oliver Yu',
    description:
      'Selected engineering work that can be publicly inspected: product execution, open source, and the decisions behind them.',
    heading: 'Work',
    // PRD §10: `/work` contains only work that can be publicly inspected.
    intro:
      'Only work that can be inspected in public — the problem, the architecture, the decisions, and the evidence behind them.',
    empty: 'No case studies are published yet.',
    caseStudyCta: 'View Case Study',
    visuals: {
      // The same asset the homepage shows, so it is the same description. It is
      // restated rather than imported because the Work index does not depend on
      // the homepage's dictionary, and an image's alt text belongs with the page
      // that renders it.
      shouri: {
        alt: 'Shouri on desktop and phone. The web app works through a five-unit learning path; behind it the product page shows a saved cooking video beside the structured recipe it became. Two phone screens show the saved library and that recipe broken into summary, ingredients, and steps.',
      },
      aiCodingSkills: {
        caption:
          'The workflow: a requirement is planned, executed and validated, and ends in evidence.',
        start: 'Requirement',
        steps: ['Plan', 'Execute', 'Validate'],
        end: 'Evidence',
      },
    },
    typeLabel: 'Type',
    asideLabel: 'About this case study',
    sectionsLabel: 'Sections',
    backToIndex: 'All work',
  },
  zh: {
    title: '作品 — Oliver Yu',
    description: '可公開檢視的工程作品：產品執行、開源專案，以及背後的工程決策。',
    heading: '作品',
    intro: '只收錄可公開檢視的作品：問題、架構、工程決策，以及對應的證據。',
    empty: '目前尚未發佈案例研究。',
    caseStudyCta: '閱讀案例研究',
    visuals: {
      shouri: {
        alt: '收理在桌機與手機上的畫面。網頁應用正進行五個單元的學習路線；後方的產品頁把一段收下的料理影片與整理後的結構化食譜並列。兩個手機畫面則是收藏庫，以及拆成摘要、材料與步驟的同一份食譜。',
      },
      aiCodingSkills: {
        caption: '工作流程：需求經過規劃、執行與驗證，最後以證據收尾。',
        start: '需求',
        steps: ['規劃', '執行', '驗證'],
        end: '證據',
      },
    },
    typeLabel: '類型',
    asideLabel: '關於這則案例研究',
    sectionsLabel: '章節',
    backToIndex: '所有作品',
  },
} satisfies Record<Locale, WorkPageStrings>;
