/**
 * Homepage content guarantees (MCD-4).
 *
 * The homepage is mostly judged by reading it. These rules are not judgement
 * calls, though — they are fixed counts, verbatim PRD wording, a required
 * attribution, and the absence of specific strings, and every one of them is
 * the kind of thing a later content edit can break silently:
 *
 *   - PRD §5, §9.2, §9.4 fix how many items each section may contain;
 *   - PRD §9.4 requires third-party skills to keep attribution and licensing;
 *   - PRD §11 keeps employer detail out of Professional Experience;
 *   - PRD §12 keeps LLM Infrastructure from implying a public case study;
 *   - PRD §34 forbids mixing languages inside one prose block.
 *
 * Encoding them means a regression fails the build instead of shipping.
 */

import { describe, expect, it } from 'vitest';

import { LOCALES } from '../locales';
import { home, type HomeStrings } from './home';

/** Every leaf string in one locale's home content. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value as Record<string, unknown>).flatMap(strings);
}

const BY_LOCALE = LOCALES.map((locale) => [locale, home[locale]] as const);

describe.each(BY_LOCALE)('Home content (%s)', (_locale, t: HomeStrings) => {
  it('states the two hero facts PRD §9.1 lists', () => {
    expect(t.hero.facts).toHaveLength(2);
  });

  it('names the three Shouri product principles PRD §9.2 lists', () => {
    expect(t.shouri.principles.map((principle) => principle.name)).toEqual([
      'Save First',
      'Explicit AI',
      'Recoverable Architecture',
    ]);
    expect(t.shouri.principles.every((principle) => principle.description.length > 0)).toBe(true);
  });

  it('lists the six Shouri engineering areas PRD §9.2 names', () => {
    expect(t.shouri.areas).toHaveLength(6);
  });

  it('presents exactly the four PRD §5 pillars, each with one explanation', () => {
    expect(t.expertise.pillars).toHaveLength(4);
    expect(t.expertise.pillars.every((pillar) => pillar.description.length > 0)).toBe(true);
  });

  it('keeps the seven-stage workflow PRD §9.4 draws', () => {
    expect(t.openSource.pipeline).toHaveLength(7);
  });

  it('highlights the seven backlog-workflow capabilities PRD §9.4 lists', () => {
    expect(t.openSource.highlights).toHaveLength(7);
  });

  it('demonstrates the four audit-claude-md qualities PRD §9.4 lists', () => {
    expect(t.openSource.secondaryPoints).toHaveLength(4);
  });

  it('leads with backlog-workflow and follows with audit-claude-md (PRD §9.4)', () => {
    expect(t.openSource.primaryName).toBe('backlog-workflow');
    expect(t.openSource.secondaryName).toBe('audit-claude-md');
  });

  it('attributes the bundled third-party skill and its licence (PRD §9.4)', () => {
    // `.claude/skills/grilling/SKILL.md` and the MIT `LICENSE` beside it are
    // the source for all three of these.
    expect(t.openSource.attribution).toContain('grilling');
    expect(t.openSource.attribution).toContain('Matt Pocock');
    expect(t.openSource.attribution).toContain('MIT License');
  });

  it('discloses no employer or internal system (PRD §11)', () => {
    // PRD §11 allows domains, responsibilities, and public technologies only.
    // A concrete company or customer would arrive as one of these.
    const DISCLOSURE = [/\bInc\.?\b/, /\bLtd\.?\b/, /\bCorp(oration)?\b/, /股份有限公司/];

    for (const pattern of DISCLOSURE) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('claims no public case study for LLM Infrastructure (PRD §12)', () => {
    // PRD §12: the strongest evidence is confidential, so public proof points
    // at technical writing and nothing on the homepage suggests otherwise.
    const CASE_STUDY = [/case study/i, /案例研究/];

    for (const pattern of CASE_STUDY) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('points LLM Infrastructure — and only it — at Study (PRD §12)', () => {
    // Both locales, which is the point: the Chinese pillar has a different
    // name, so this cannot be enforced by matching the English one.
    const withEvidence = t.expertise.pillars.filter((pillar) => pillar.evidence);

    expect(withEvidence).toHaveLength(1);
    // PRD §5 fixes the order, so LLM Infrastructure is the third pillar.
    expect(withEvidence[0]).toBe(t.expertise.pillars[2]);
    expect(withEvidence[0]?.evidence?.label).toContain('Study');
  });

  it('promises no screenshot it cannot show (PRD §9.2)', () => {
    // The alt text ships with the image, never before it — see
    // `src/components/home/shouri-screenshot.ts`.
    if (t.shouri.screenshot) {
      expect(t.shouri.screenshot.alt.length).toBeGreaterThan(0);
    }
  });
});

/* -------------------------------------------------------------------------
 * Verbatim PRD wording
 *
 * PRD §9 writes the English homepage copy out in full, so it is quoted rather
 * than paraphrased and asserted literally here.
 * ---------------------------------------------------------------------- */

describe('PRD wording', () => {
  it('quotes the PRD §9.1 hero verbatim in English', () => {
    expect(home.en.hero.role).toBe('AI Systems Engineer · System Architect');
    expect(home.en.intro).toBe(
      'I design and build production AI systems that connect models, knowledge, developer tools, and software infrastructure.',
    );
    expect(home.en.hero.facts).toEqual(['10+ Years in Software Engineering', 'Taiwan']);
    expect(home.en.hero.workCta).toBe('View Selected Work');
    expect(home.en.hero.writingCta).toBe('Technical Writing');
  });

  it('quotes the PRD §9.2 Shouri summary and areas verbatim in English', () => {
    expect(home.en.shouri.summary).toBe(
      'An AI-powered information organizer for capturing webpages, files and media, then turning them into structured, searchable knowledge.',
    );
    expect(home.en.shouri.areas).toEqual([
      'Product Design',
      'System Architecture',
      'AI Processing',
      'Search & Retrieval',
      'Web / PWA',
      'Production Operations',
    ]);
  });

  it('quotes the PRD §5 pillar names verbatim in English', () => {
    expect(home.en.expertise.pillars.map((pillar) => pillar.name)).toEqual([
      'AI & Agent Systems',
      'Knowledge Systems',
      'LLM Infrastructure',
      'Software Architecture',
    ]);
  });

  it('quotes the PRD §9.7 experience copy verbatim in English', () => {
    expect(home.en.experience.summary).toBe(
      '10+ years of software engineering experience spanning enterprise systems, system architecture, cloud platforms, security, mobile/web applications, and applied AI.',
    );
    expect(home.en.experience.current).toBe(
      'Current work focuses on enterprise AI systems, coding agents, knowledge infrastructure, and LLM serving.',
    );
  });

  it('keeps the publication identical across locales (PRD §7)', () => {
    // A paper title and a journal name are proper nouns; translating either
    // would invent a citation that does not exist.
    for (const locale of LOCALES) {
      expect(home[locale].research.paper).toBe(
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      );
      expect(home[locale].research.venue).toBe(
        'Journal of Information Security and Applications, 2026',
      );
    }
  });

  it('keeps the bilingual product identity in both locales (PRD §34)', () => {
    // `Shouri / 收理` is the example PRD §34 gives of intentional bilingual
    // identity, so it is the one heading that reads the same in both locales.
    for (const locale of LOCALES) {
      expect(home[locale].shouri.heading).toBe('Shouri / 收理');
    }
  });
});

/* -------------------------------------------------------------------------
 * Content language rules (PRD §34)
 * ---------------------------------------------------------------------- */

describe('content language rules (PRD §34)', () => {
  /** The prose blocks — full sentences, where the rule actually bites. */
  const proseFor = (t: HomeStrings) => [
    t.intro,
    t.shouri.summary,
    ...t.shouri.principles.map((principle) => principle.description),
    t.expertise.intro,
    ...t.expertise.pillars.map((pillar) => pillar.description),
    t.openSource.summary,
    t.openSource.attribution,
    t.research.summary,
    t.research.detail,
    t.writing.intro,
    t.experience.summary,
    t.experience.current,
  ];

  it('keeps English prose free of Chinese', () => {
    for (const block of proseFor(home.en)) {
      expect(block).not.toMatch(/[一-鿿]/);
    }
  });

  it('admits only established technical terms into Chinese prose', () => {
    // PRD §34's exceptions are product names, proper nouns, and established
    // technical terminology. Every entry below is one of those three, and each
    // is the form a Taiwan engineering reader expects to see untranslated.
    const ALLOWED = new Set([
      // Product and proper names.
      'Study',
      'backlog-workflow',
      'grilling',
      'skill',
      'Matt',
      'Pocock',
      'MIT',
      'License',
      // Established technical terminology.
      'AI',
      'Agent',
      'agent',
      'coding',
      'LLM',
      'MCP',
      'RAG',
      'vLLM',
      'ROCm',
      'CI',
      'CD',
      // Scheme and security-notion names from the publication (PRD §7).
      'LR-CBEET',
      'IND-CCA',
      'OW-CCA',
    ]);

    for (const block of proseFor(home.zh)) {
      const latin = block.match(/[A-Za-z][A-Za-z0-9-]*/g) ?? [];
      expect(latin.filter((word) => !ALLOWED.has(word))).toEqual([]);
    }
  });
});
