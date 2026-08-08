/**
 * JSON-LD builders (MCD-11, PRD §30).
 *
 * PRD §30 asks for `Person`, `WebSite`, and a `SoftwareApplication`/`Product`
 * for Shouri, and requires the structured metadata to use the matching
 * localized page content — so every builder takes a locale and reads the same
 * dictionaries the visible page renders from. Nothing here restates copy.
 *
 * These return plain objects rather than serialized strings so they can be
 * asserted on directly in tests.
 */

import { home } from '../i18n/pages/home';
import { LOCALE_TAG, type Locale } from '../i18n/locales';
import { GITHUB_URL, ORCID_URL, SHOURI_URL, STUDY_URL } from './external';
import { localizeUrl } from './i18n';
import { SITE_URL } from './site';

/** A JSON-LD node. Values are whatever `JSON.stringify` accepts. */
export type JsonLd = Record<string, unknown>;

/**
 * Profiles that identify the same person elsewhere.
 *
 * ORCID is the one entry consumers treat as an authoritative identifier rather
 * than just another profile, which is why it leads. The publication DOI is not
 * here: `sameAs` is for identities of this person, and a DOI identifies a work.
 */
function sameAs(): string[] {
  return [ORCID_URL, GITHUB_URL, STUDY_URL, SHOURI_URL];
}

export function personSchema(locale: Locale): JsonLd {
  const t = home[locale];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Oliver Yu',
    // PRD §9.1 writes the role in English in both locales, so it is read from
    // the dictionary rather than translated here.
    jobTitle: t.hero.role,
    description: t.description,
    url: localizeUrl(locale, '/'),
    sameAs: sameAs(),
  };
}

export function webSiteSchema(locale: Locale): JsonLd {
  const t = home[locale];

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'meowcoder.com',
    url: localizeUrl(locale, '/'),
    inLanguage: LOCALE_TAG[locale],
    description: t.description,
    author: { '@id': `${SITE_URL}/#person` },
  };
}

/**
 * Shouri as a `SoftwareApplication` (PRD §30 allows `Product` as well).
 *
 * `applicationCategory` and the summary come from the homepage dictionary, so
 * the schema cannot drift from what the page says about the product.
 */
export function shouriSchema(locale: Locale): JsonLd {
  const t = home[locale];

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t.shouri.heading,
    description: t.shouri.summary,
    url: SHOURI_URL,
    applicationCategory: 'ProductivityApplication',
    inLanguage: LOCALE_TAG[locale],
    author: { '@id': `${SITE_URL}/#person` },
  };
}
