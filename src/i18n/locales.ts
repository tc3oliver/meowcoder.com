/**
 * Locale definitions (MCD-3, PRD §7).
 *
 * English is the default and owns the bare routes; Traditional Chinese lives
 * under `/zh/`. This module is deliberately free of any page content so it can
 * be imported by routing helpers, layouts, and tests without pulling in
 * dictionaries.
 */

export const LOCALES = ['en', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** BCP 47 tags for `<html lang>` and `hreflang` (PRD §7). */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hant',
};

/** Open Graph `og:locale` values. */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_TW',
};

/** Path segment each locale is served under. The default locale has none. */
export const LOCALE_PREFIX: Record<Locale, string> = {
  en: '',
  zh: '/zh',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
