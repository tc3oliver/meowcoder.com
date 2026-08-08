import type { PageDictionary } from './types';

/**
 * Home page strings.
 *
 * `title` and `description` are the exact wording PRD §30 specifies for the
 * homepage in each language — MCD-11 asserts on them, so they are quoted
 * verbatim rather than paraphrased.
 *
 * `heading` and `intro` are shell copy. The real homepage sections arrive in
 * MCD-4.
 */
export const home = {
  en: {
    title: 'Oliver Yu — AI Systems Engineer & System Architect',
    description:
      'AI Systems Engineer and System Architect with 10+ years of software engineering experience, building AI systems, developer tooling, model infrastructure, and production software.',
    heading: 'Oliver Yu',
    intro: 'Bilingual routing is in place. Homepage sections ship in a later release.',
  },
  zh: {
    title: 'Oliver Yu — AI 系統工程師與系統架構師',
    description:
      '擁有 10+ 年軟體工程經驗的 AI 系統工程師與系統架構師，專注於 AI 系統、開發者工具、模型基礎架構與正式產品開發。',
    heading: 'Oliver Yu',
    intro: '雙語路由已就緒，首頁區塊將於後續版本推出。',
  },
} satisfies PageDictionary;
