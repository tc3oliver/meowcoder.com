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
  /** Additional destination on the professional-experience detail page. */
  aboutOliver: string;
  /** Accessible name for experience metadata shown in the detail-page header. */
  experienceOverviewLabel: string;
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
      'Selected work spanning product engineering, LLM inference systems research, open source, and 10+ years of professional experience in systems, architecture, and AI.',
    heading: 'Work',
    /*
     * doc-2 §21 supersedes PRD §10's "only work that can be publicly inspected"
     * for this index, so the intro no longer claims exclusivity it does not
     * have. It still promises evidence — conditionally, which is the honest
     * version once one entry has none and says so.
     */
    intro:
      'Selected work across product engineering, LLM inference systems research, open source, and professional experience. The research case studies name the data behind their numbers.',
    empty: 'No work is published yet.',
    aboutOliver: 'About Oliver',
    experienceOverviewLabel: 'Experience overview',
    typeLabel: 'Type',
    asideLabel: 'Project details and contents',
    sectionsLabel: 'Contents',
    backToIndex: 'Back to all work',
  },
  zh: {
    title: '精選作品 — Oliver Yu',
    description:
      '精選工程作品，涵蓋產品工程、LLM 推論系統研究、開源專案，以及 10 年以上系統、架構與 AI 的工程經歷。',
    heading: '作品',
    intro:
      '精選作品，涵蓋產品工程、LLM 推論系統研究、開源專案與專業工程經歷。研究案例中的數字，都會註明背後的資料。',
    empty: '目前還沒有公開的作品。',
    aboutOliver: '關於 Oliver',
    experienceOverviewLabel: '工程經歷摘要',
    typeLabel: '類型',
    asideLabel: '專案資訊與內容',
    sectionsLabel: '內容',
    backToIndex: '返回作品列表',
  },
} satisfies Record<Locale, WorkPageStrings>;
