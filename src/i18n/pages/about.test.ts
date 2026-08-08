/**
 * About content guarantees (MCD-8).
 *
 * Most of the About page is judged by reading it. A handful of its rules are
 * not judgement calls, though — they are exact counts, verbatim quotes, or the
 * absence of a specific string, and those are the ones a reviewer is most
 * likely to miss on the second pass:
 *
 *   - PRD §13, §16, §17 fix how many items each section may contain, and
 *     doc-2 §14 fixes the career progression at three rungs;
 *   - PRD §16 names two course-completion certificates that must never be
 *     presented as professional credentials;
 *   - PRD §14 and §20 keep the original résumé out of the repository;
 *   - doc-2 §9 hands the IND-CCA / OW-CCA research detail to About, so About
 *     is now the only page that carries it;
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

  it('shows the career as the three-rung progression doc-2 §14 specifies', () => {
    expect(t.career.stages).toHaveLength(3);
    // Every rung carries a name and one line of substance; an empty detail
    // would render as a bare label and lose the progression's meaning.
    for (const stage of t.career.stages) {
      expect(stage.label.length).toBeGreaterThan(0);
      expect(stage.detail.length).toBeGreaterThan(0);
    }
  });

  it('names no dates or job titles in the progression (PRD §11, doc-2 §14)', () => {
    // A progression, not an employment history: a year or a seniority title
    // is how the latter would creep back in.
    const HISTORY = [/\b(19|20)\d{2}\b/, /\b(senior|lead|manager|director|head of)\b/i, /年至/];

    const rungs = t.career.stages.flatMap((stage) => [stage.label, stage.detail]);
    for (const pattern of HISTORY) {
      expect(rungs.filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('keeps the research detail the homepage handed over (doc-2 §9)', () => {
    // doc-2 §9 removes IND-CCA / OW-CCA from the homepage and states the
    // detail belongs on About, so About is now the only place it survives.
    expect(t.research.detail).toMatch(/IND-CCA/);
    expect(t.research.detail).toMatch(/OW-CCA/);
    expect(t.research.detail).toMatch(/LR-CBEET/);
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

    expect(about.en.education.institution).toBe('National Taiwan Ocean University');
    expect(about.zh.education.institution).toBe('國立臺灣海洋大學');
  });
});

/* -------------------------------------------------------------------------
 * Credential correction (doc-2 §15)
 *
 * The AI Application Planner certificate is "Intermediate Level", not
 * "Specialist Level" — the site previously overstated it. These assertions
 * lock the corrected wording per locale and guard against the wrong wording
 * ever coming back.
 * ---------------------------------------------------------------------- */

describe('credential correction (doc-2 §15)', () => {
  it('names the AI Application Planner credential correctly in English', () => {
    expect(about.en.credentials.items[0]?.name).toBe('AI應用規劃師（機器學習）— 中級能力鑑定');
    expect(about.en.credentials.items[0]?.meta).toBe('Ministry of Economic Affairs, Taiwan · 2025');
  });

  it('names the AI Application Planner credential correctly in Chinese', () => {
    expect(about.zh.credentials.items[0]?.name).toBe('AI應用規劃師（機器學習）－中級能力鑑定');
  });

  it('never overstates the credential as "Specialist Level" / "專業級" in either locale', () => {
    for (const locale of LOCALES) {
      const values = strings(about[locale]);
      expect(values.filter((value) => /Specialist Level/i.test(value))).toEqual([]);
      expect(values.filter((value) => value.includes('專業級'))).toEqual([]);
    }
  });
});

/* -------------------------------------------------------------------------
 * Content language rules (PRD §34)
 * ---------------------------------------------------------------------- */

describe('content language rules (PRD §34)', () => {
  /** The prose blocks — full sentences, where the rule actually bites. */
  const proseFor = (t: AboutStrings) => [
    t.intro,
    ...t.summary,
    t.research.detail,
    t.principles.statement,
  ];

  it('keeps English prose free of Chinese', () => {
    for (const block of proseFor(about.en)) {
      expect(block).not.toMatch(/[一-鿿]/);
    }
  });

  it('admits only established technical terms into Chinese prose', () => {
    // PRD §34's exceptions are product names, proper nouns, and established
    // technical terminology, each in the form a Taiwan engineering reader
    // expects. `LR-CBEET` is the scheme the paper names; `IND-CCA` and
    // `OW-CCA` are security notions that have no Chinese rendering in use.
    const ALLOWED = new Set(['AI', 'Agent', 'LR-CBEET', 'IND-CCA', 'OW-CCA']);

    for (const block of proseFor(about.zh)) {
      const latin = block.match(/[A-Za-z][A-Za-z0-9-]*/g) ?? [];
      expect(latin.filter((word) => !ALLOWED.has(word))).toEqual([]);
    }
  });
});
