/**
 * About content guarantees (MCD-8).
 *
 * Most of the About page is judged by reading it. A handful of its rules are
 * not judgement calls, though — they are exact counts, verbatim quotes, or the
 * absence of a specific string, and those are the ones a reviewer is most
 * likely to miss on the second pass:
 *
 *   - PRD §13, §14, §16, §17 fix how many items each section may contain;
 *   - PRD §16 names two course-completion certificates that must never be
 *     presented as professional credentials;
 *   - PRD §14 and §20 keep the original résumé out of the repository;
 *   - PRD §34 forbids mixing languages inside one prose block.
 *
 * Encoding them here means a later content edit that breaks one fails the
 * build instead of shipping.
 */

import { describe, expect, it } from 'vitest';

import { LOCALES } from '../locales';
import { about, type AboutStrings } from './about';

/** Every leaf string in one locale's About content. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value as Record<string, unknown>).flatMap(strings);
}

const BY_LOCALE = LOCALES.map((locale) => [locale, about[locale]] as const);

describe.each(BY_LOCALE)('About content (%s)', (_locale, t: AboutStrings) => {
  it('opens with the three paragraphs PRD §13 specifies', () => {
    // `intro` is the first paragraph; `summary` carries the other two.
    expect(t.summary).toHaveLength(2);
    expect([t.intro, ...t.summary].every((paragraph) => paragraph.length > 0)).toBe(true);
  });

  it('lists the eight engineering domains PRD §13 names', () => {
    expect(t.background.items).toHaveLength(8);
  });

  it('compresses the career snapshot into the three tiers PRD §14 allows', () => {
    expect(t.career.tiers).toHaveLength(3);
    expect(t.career.tiers.map((tier) => tier.items.length)).toEqual([1, 3, 1]);
  });

  it('names the five research areas PRD §15 lists', () => {
    expect(t.research.areas).toHaveLength(5);
  });

  it('lists exactly the two credentials PRD §16 recommends', () => {
    expect(t.credentials.items).toHaveLength(2);
  });

  it('states the six principles PRD §17 lists', () => {
    expect(t.principles.items).toHaveLength(6);
  });

  it('never presents a course completion as a professional credential (PRD §16)', () => {
    // The two examples PRD §16 calls out by name, plus the shorthand.
    const COURSES = [/\bPMP\b/i, /\bGKE\b/i, /Kubernetes Engine/i];

    for (const pattern of COURSES) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('references no résumé document (PRD §14, §20)', () => {
    const RESUME = [/\.pdf\b/i, /\br[ée]sum[ée]\b/i, /\bcurriculum vitae\b/i, /履歷/];

    for (const pattern of RESUME) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('discloses no employer or internal system (PRD §11)', () => {
    // PRD §11 allows domains, responsibilities, and public technologies only.
    // A concrete company or customer name would arrive as one of these.
    const DISCLOSURE = [/\bInc\.?\b/, /\bLtd\.?\b/, /\bCorp(oration)?\b/, /股份有限公司/];

    for (const pattern of DISCLOSURE) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });
});

/* -------------------------------------------------------------------------
 * Verbatim PRD wording
 *
 * The English opening, the publication, and the principles are quoted from the
 * PRD rather than paraphrased, so they are asserted literally.
 * ---------------------------------------------------------------------- */

describe('PRD wording', () => {
  it('quotes the PRD §13 opening verbatim in English', () => {
    expect(about.en.intro).toBe(
      'I am an AI systems engineer and system architect based in Taiwan, with more than 10 years of software engineering experience.',
    );
    expect(about.en.summary).toEqual([
      'My background spans enterprise systems, cloud platforms, mobile and web applications, software security, machine learning, and AI systems.',
      'Today, my work focuses on building reliable AI infrastructure, agentic developer systems, knowledge platforms, and production AI applications.',
    ]);
  });

  it('quotes the PRD §17 principles verbatim in English', () => {
    expect(about.en.principles.items).toEqual([
      'Traceable',
      'Testable',
      'Observable',
      'Permission-aware',
      'Replaceable',
      'Recoverable',
    ]);
    expect(about.en.principles.statement).toBe(
      'Reliable AI systems require more than capable models.',
    );
  });

  it('keeps the publication and institution identical across locales (PRD §7)', () => {
    // A journal name and a paper title are proper nouns; translating either
    // would invent a citation that does not exist.
    for (const locale of LOCALES) {
      expect(about[locale].research.venue).toBe(
        'Journal of Information Security and Applications — 2026',
      );
      expect(about[locale].research.paper).toBe(
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      );
    }

    expect(about.en.research.institution).toBe('National Taiwan Ocean University');
    expect(about.zh.research.institution).toBe('國立臺灣海洋大學');
  });
});

/* -------------------------------------------------------------------------
 * Content language rules (PRD §34)
 * ---------------------------------------------------------------------- */

describe('content language rules (PRD §34)', () => {
  /** The prose blocks — full sentences, where the rule actually bites. */
  const proseFor = (t: AboutStrings) => [t.intro, ...t.summary, t.principles.statement];

  it('keeps English prose free of Chinese', () => {
    for (const block of proseFor(about.en)) {
      expect(block).not.toMatch(/[一-鿿]/);
    }
  });

  it('admits only established technical terms into Chinese prose', () => {
    // PRD §34's exceptions are product names, proper nouns, and established
    // technical terminology. These two are the only ones the copy relies on,
    // and both are the form a Taiwan engineering reader expects.
    const ALLOWED = new Set(['AI', 'Agent']);

    for (const block of proseFor(about.zh)) {
      const latin = block.match(/[A-Za-z][A-Za-z0-9-]*/g) ?? [];
      expect(latin.filter((word) => !ALLOWED.has(word))).toEqual([]);
    }
  });
});
