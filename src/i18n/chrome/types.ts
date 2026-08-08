/**
 * Shape of the shared site chrome dictionary (MCD-3, PRD §27).
 *
 * Chrome is what every page carries regardless of its content: the primary
 * navigation, the language switch, the skip link, and the footer wordmark row.
 * Page-specific strings do not belong here — they live in `src/i18n/pages/`,
 * one module per page, so adding a page never edits this file (PRD §27).
 *
 * Both locale dictionaries are declared `satisfies ChromeDictionary`, which is
 * what makes their key structures identical at compile time.
 */

export interface ChromeDictionary {
  /** Wordmark. Not translated — it is the domain (PRD §7). */
  brand: string;
  nav: {
    /** Accessible name for the primary navigation landmark. */
    ariaLabel: string;
    work: string;
    /** Off-site: study.meowcoder.com (PRD §6). */
    writing: string;
    about: string;
    /** Off-site: github.com/tc3oliver (PRD §6). */
    github: string;
    /** Suffix marking a link as leaving the site. */
    externalIndicator: string;
  };
  languageSwitch: {
    /** Accessible name for the language switch landmark. */
    ariaLabel: string;
    /** Label for each locale, written in that locale (PRD §8: `EN / 中文`). */
    en: string;
    zh: string;
  };
  skipLink: string;
  footer: {
    ariaLabel: string;
  };
}
