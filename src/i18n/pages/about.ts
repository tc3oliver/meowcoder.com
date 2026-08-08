import type { PageDictionary } from './types';

/**
 * About page strings.
 *
 * Kept to a factual summary of what the page will contain. The professional
 * summary, career snapshot, research, credentials, and engineering principles
 * themselves are MCD-8 content (PRD §13–§17).
 */
export const about = {
  en: {
    title: 'About — Oliver Yu',
    description:
      'Engineering background, research, credentials, and the principles behind how I build software.',
    heading: 'About',
    intro: 'Professional background ships in a later release.',
  },
  zh: {
    title: '關於我 — Oliver Yu',
    description: '工程背景、研究、專業證照，以及我建構軟體時所依循的原則。',
    heading: '關於我',
    intro: '專業背景將於後續版本推出。',
  },
} satisfies PageDictionary;
