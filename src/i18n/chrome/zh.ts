import type { ChromeDictionary } from './types';

export const chromeZh = {
  // Proper name, left untranslated per PRD §7.
  brand: 'Oliver Yu',
  nav: {
    ariaLabel: '主要導覽',
    work: '作品',
    writing: '技術文章',
    about: '關於我',
    // Product name, left untranslated per PRD §7.
    github: 'GitHub',
    externalIndicator: '↗',
  },
  languageSwitch: {
    ariaLabel: '語言',
    // Each locale is labelled in its own language, so these read the same in
    // both dictionaries (PRD §8).
    en: 'EN',
    zh: '中文',
  },
  skipLink: '跳至主要內容',
  footer: {
    ariaLabel: '頁尾',
    // Property names, left untranslated per PRD §7.
    github: 'GitHub',
    study: 'Study',
    orcid: 'ORCID',
    shouri: 'Shouri',
    siteSource: '網站原始碼',
  },
} satisfies ChromeDictionary;
