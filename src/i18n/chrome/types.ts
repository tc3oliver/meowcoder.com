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
  /**
   * The footer link row PRD §9.8 specifies, plus its landmark name.
   *
   * It lives in chrome rather than in a page dictionary because it is the same
   * row on every route. PRD §9.8 lists five destinations — GitHub, Study,
   * ORCID, Shouri, Site Source — and ORCID is deliberately absent here: PRD §6,
   * §8, and §9.8 all name it without stating an address anywhere, and
   * `src/lib/external.ts` records the same gap. Guessing an ORCID iD would
   * attribute someone else's research record, so the entry is added once the
   * real one is confirmed.
   */
  footer: {
    ariaLabel: string;
    /** Product names, left untranslated per PRD §7. */
    github: string;
    study: string;
    shouri: string;
    /** The public meowcoder.com repository — secondary evidence (PRD §24). */
    siteSource: string;
  };
}
