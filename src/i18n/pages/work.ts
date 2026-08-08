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
  /** Label for the `type` metadata on a detail page. */
  typeLabel: string;
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
    typeLabel: 'Type',
    backToIndex: 'All work',
  },
  zh: {
    title: '作品 — Oliver Yu',
    description: '可公開檢視的工程作品：產品執行、開源專案，以及背後的工程決策。',
    heading: '作品',
    intro: '只收錄可公開檢視的作品：問題、架構、工程決策，以及對應的證據。',
    empty: '目前尚未發佈案例研究。',
    typeLabel: '類型',
    backToIndex: '所有作品',
  },
} satisfies Record<Locale, WorkPageStrings>;
