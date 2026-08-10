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
import {
  GITHUB_URL,
  LINKEDIN_URL,
  ORCID_URL,
  PUBLICATION_URL,
  SHOURI_URL,
  SKILLS_URL,
  STUDY_URL,
} from './external';
import { localizeUrl, workDetailRoute } from './i18n';
import { SITE_URL } from './site';

/** A JSON-LD node. Values are whatever `JSON.stringify` accepts. */
export type JsonLd = Record<string, unknown>;

/**
 * Profiles that identify the same person elsewhere.
 *
 * Product URLs and publication DOIs do not belong here: `sameAs` identifies
 * this person across profile and publishing identities, not work they created.
 */
function sameAs(): string[] {
  return [GITHUB_URL, LINKEDIN_URL, STUDY_URL, ORCID_URL];
}

export function personSchema(locale: Locale): JsonLd {
  const t = home[locale];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Oliver Yu',
    alternateName: ['游宗翰', 'Tsung-Han Yu'],
    // PRD §9.1 writes the role in English in both locales, so it is read from
    // the dictionary rather than translated here.
    jobTitle: t.hero.role,
    description: t.description,
    url: localizeUrl(locale, '/'),
    sameAs: sameAs(),
  };
}

/** The peer-reviewed publication featured on both localized About pages. */
export function publicationSchema(locale: Locale): JsonLd {
  const description =
    locale === 'en'
      ? 'Co-authored research on leakage-resilient certificate-based encryption designed to remain secure under continual key leakage.'
      : '共同研究抗洩漏憑證式加密，透過金鑰更新機制提升系統在持續金鑰洩漏情境下的安全性。';

  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${PUBLICATION_URL}#article`,
    headline:
      'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
    description,
    url: PUBLICATION_URL,
    identifier: PUBLICATION_URL,
    datePublished: '2026',
    pagination: '104422',
    inLanguage: 'en',
    author: { '@id': `${SITE_URL}/#person` },
    isPartOf: {
      '@type': 'PublicationVolume',
      volumeNumber: '99',
      isPartOf: {
        '@type': 'Periodical',
        name: 'Journal of Information Security and Applications',
      },
    },
  };
}

/** The open-source project featured by the AI Coding Skills case study. */
export function aiCodingSkillsSchema(locale: Locale, description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': `${SITE_URL}/#ai-coding-skills`,
    name: 'AI Coding Skills',
    description,
    url: localizeUrl(locale, workDetailRoute('ai-coding-skills')),
    codeRepository: SKILLS_URL,
    version: '1.2.0',
    license: 'https://opensource.org/license/mit',
    inLanguage: LOCALE_TAG[locale],
    author: { '@id': `${SITE_URL}/#person` },
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
