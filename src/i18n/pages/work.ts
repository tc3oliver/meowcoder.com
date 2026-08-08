import type { PageDictionary } from './types';

/**
 * Work index strings.
 *
 * PRD §10 defines Work as publicly inspectable evidence only, which is what the
 * description states. The index itself — the content collection, the entries,
 * and their layout — arrives in MCD-5.
 */
export const work = {
  en: {
    title: 'Work — Oliver Yu',
    description:
      'Selected engineering work that can be publicly inspected: product execution, open source, and the decisions behind them.',
    heading: 'Work',
    intro: 'Case studies ship in a later release.',
  },
  zh: {
    title: '作品 — Oliver Yu',
    description: '可公開檢視的工程作品：產品執行、開源專案，以及背後的工程決策。',
    heading: '作品',
    intro: '案例研究將於後續版本推出。',
  },
} satisfies PageDictionary;
