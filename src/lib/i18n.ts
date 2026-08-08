/**
 * Locale-aware routing (MCD-3, PRD §7, §27).
 *
 * Every path and alternate URL on the site is derived here, so the language
 * switch, the canonical link, and the `hreflang` set cannot drift apart.
 *
 * All of it runs at build time. Nothing in this module reaches the browser, and
 * nothing inspects `Accept-Language` — PRD §7 requires URLs to stay stable and
 * shareable rather than redirecting on browser locale.
 */

import { DEFAULT_LOCALE, LOCALE_PREFIX, LOCALE_TAG, LOCALES, type Locale } from '../i18n/locales';
import { absoluteUrl } from './site';

/**
 * A locale-independent page identity.
 *
 * Pages are addressed by route, not by URL, so `localizePath` is the only place
 * that knows a locale prefix exists.
 */
export const ROUTES = ['/', '/work', '/about'] as const;

export type Route = (typeof ROUTES)[number];

/** Site-relative path for a route in a given locale. */
export function localizePath(locale: Locale, route: Route): string {
  const prefix = LOCALE_PREFIX[locale];

  // The home route is just the prefix itself; `absoluteUrl` and Astro both
  // normalize to a trailing slash, so `/zh` and `/zh/` cannot diverge.
  if (route === '/') return `${prefix}/`;

  return `${prefix}${route}/`;
}

/** Absolute URL for a route in a given locale. */
export function localizeUrl(locale: Locale, route: Route): string {
  return absoluteUrl(localizePath(locale, route));
}

export interface Alternate {
  /** `hreflang` value, or `x-default` for the fallback entry. */
  hreflang: string;
  href: string;
}

/**
 * The full `hreflang` set for a route: one entry per locale plus `x-default`
 * pointing at the default locale (PRD §7).
 */
export function alternatesFor(route: Route): Alternate[] {
  const perLocale = LOCALES.map((locale) => ({
    hreflang: LOCALE_TAG[locale],
    href: localizeUrl(locale, route),
  }));

  return [...perLocale, { hreflang: 'x-default', href: localizeUrl(DEFAULT_LOCALE, route) }];
}

/**
 * The equivalent page in every other locale, used by the language switch.
 *
 * Every route exists in every locale, so the switch always preserves the
 * current page rather than falling back to the home page.
 */
export function switchTargets(
  current: Locale,
  route: Route,
): Array<{ locale: Locale; href: string }> {
  return LOCALES.map((locale) => ({ locale, href: localizePath(locale, route) })).filter(
    (target) => target.locale !== current,
  );
}
