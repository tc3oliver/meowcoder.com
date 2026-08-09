/**
 * Homepage content guarantees (MCD-4, MCD-16).
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

import AI_CODING_SKILLS_EN from '../../content/work/en/ai-coding-skills.md?raw';
import AI_CODING_SKILLS_ZH from '../../content/work/zh/ai-coding-skills.md?raw';
import SHOURI_EN from '../../content/work/en/shouri.md?raw';
import SHOURI_ZH from '../../content/work/zh/shouri.md?raw';
import { LOCALES, type Locale } from '../locales';
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

  it('names the three Shouri product principles doc-2 §6 lists', () => {
    // Names only, and identical in both locales: they are the product's own
    // vocabulary, which is why the row reads the same in English and Chinese.
    // The third is `Recoverable by Design` — doc-2 §6 renames what PRD §9.2
    // called `Recoverable Architecture`.
    expect(t.shouri.principles).toEqual(['Save First', 'Explicit AI', 'Recoverable by Design']);
  });

  it('carries only what doc-2 §6 leaves on the homepage', () => {
    // doc-2 §6 fixes the whole section: eyebrow, bilingual name, one product
    // statement, three principle names, and two actions. The six-item
    // "Engineering areas" list, its heading, and the sentence under each
    // principle are gone from here — the Shouri case study carries that
    // engineering detail — so the key set is the assertion.
    //
    // `screenshot` is excluded because it is legitimately optional; the guard
    // below covers it.
    const keys = Object.keys(t.shouri).filter((key) => key !== 'screenshot');

    expect(keys.sort()).toEqual([
      'caseStudyCta',
      'cta',
      'eyebrow',
      'heading',
      'principles',
      'summary',
    ]);
  });

  it('presents exactly the four PRD §5 pillars, each with one explanation', () => {
    expect(t.expertise.pillars).toHaveLength(4);
    expect(t.expertise.pillars.every((pillar) => pillar.description.length > 0)).toBe(true);
  });

  it('keeps Engineering Focus to one short line per area (doc-2 §8)', () => {
    // doc-2 §8 demotes this section below Shouri and Open Source, and short
    // copy is half of how that reads. The old descriptions were technology
    // inventories two to three times this long.
    for (const pillar of t.expertise.pillars) {
      expect(pillar.description.length).toBeLessThanOrEqual(64);
    }
  });

  it('carries only what doc-2 §7 leaves on the homepage', () => {
    // doc-2 §7 fixes the whole section: eyebrow, heading, one statement, the
    // two skill names, the workflow visual, and two actions. Anything else
    // belongs on the case study, so the key set is the assertion.
    expect(Object.keys(t.openSource).sort()).toEqual([
      'caseStudyCta',
      'cta',
      'eyebrow',
      'heading',
      'skills',
      'statement',
      'workflow',
    ]);
  });

  it('no longer unpacks the implementation detail doc-2 §7 moves off the homepage', () => {
    // The seven-stage pipeline, "What it defines", "What it demonstrates" and
    // the attribution paragraph. The key-set test above would already fail if
    // one came back, but naming them is what makes the failure legible.
    const MOVED = [
      'pipeline',
      'highlights',
      'highlightsHeading',
      'secondaryLabel',
      'secondaryName',
      'secondaryHeading',
      'secondaryPoints',
      'attribution',
    ];

    expect(MOVED.filter((key) => key in t.openSource)).toEqual([]);
  });

  it('draws the doc-2 §7 workflow as one opening stage, three steps and one close', () => {
    expect(t.openSource.workflow.start.length).toBeGreaterThan(0);
    expect(t.openSource.workflow.steps).toHaveLength(3);
    expect(t.openSource.workflow.end.length).toBeGreaterThan(0);
    // The diagram carries no visible caption, so this string is its only
    // accessible name — see `WorkflowDiagram.astro`.
    expect(t.openSource.workflow.caption.length).toBeGreaterThan(0);
  });

  it('leads with backlog-workflow and follows with audit-claude-md (PRD §9.4)', () => {
    expect(t.openSource.skills).toEqual(['backlog-workflow', 'audit-claude-md']);
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
    //
    // The one permitted mention is doc-2 §7's link to the AI Coding Skills
    // case study — published open-source work, which is the opposite of the
    // confidential employer systems this rule protects. It is exempted by
    // identity rather than by pattern, so any *other* case-study claim
    // appearing anywhere in the homepage strings still fails here.
    const CASE_STUDY = [/case study/i, /案例研究/];
    const permitted = t.openSource.caseStudyCta.label;

    for (const pattern of CASE_STUDY) {
      const claims = strings(t).filter((value) => pattern.test(value));
      expect(claims.filter((value) => value !== permitted)).toEqual([]);
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

  it('carries only what doc-2 §9 leaves in the Research column', () => {
    // doc-2 §9 fixes the column: the research area as the heading, the venue
    // and year, one summary, the exact title as secondary metadata, and one
    // action. `detail` — the IND-CCA / OW-CCA analysis — is the one that had to
    // go, so the key set is the assertion.
    expect(Object.keys(t.research).sort()).toEqual([
      'cta',
      'eyebrow',
      'heading',
      'paper',
      'summary',
      'venue',
    ]);
  });

  it('leaves the cryptographic security notions to About (doc-2 §9)', () => {
    // "Unnecessary for homepage credibility and belongs on About." The sentence
    // is not lost: `about.test.ts` asserts About still states it in full, in
    // both locales, so these two tests are the halves of one guarantee.
    for (const notion of ['IND-CCA', 'OW-CCA', 'LR-CBEET']) {
      expect(strings(t).filter((value) => value.includes(notion))).toEqual([]);
    }
  });

  it('keeps the research area above the paper title in the hierarchy', () => {
    // doc-2 §9 makes the exact title secondary metadata rather than the
    // column's largest line. The rendered sizes are `ResearchWritingSection`'s
    // to get right; what belongs here is that the two are different strings, so
    // a later edit cannot collapse them into one headline.
    expect(t.research.heading).not.toBe(t.research.paper);
    expect(t.research.paper.length).toBeGreaterThan(t.research.heading.length);
  });

  it('names a language for every locale a title could arrive in (doc-2 §9)', () => {
    // The badge on a foreign-language title. `resolveTitle` may report any
    // locale, so a missing name would render an empty badge on the one post
    // that needed it most.
    for (const language of LOCALES) {
      expect(t.writing.languages[language].length).toBeGreaterThan(0);
    }
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
 * Verbatim requirement wording
 *
 * PRD §9 writes parts of the English homepage copy out in full, and doc-2 §5,
 * §8 and §10 rewrite the hero, Engineering Focus and the credibility strip the
 * same way — in both languages for the strip. All of it is quoted rather than
 * paraphrased and asserted literally here.
 * ---------------------------------------------------------------------- */

describe('requirement wording', () => {
  it('quotes the doc-2 §5 hero verbatim in English', () => {
    expect(home.en.hero.role).toBe('AI Systems Engineer · System Architect');
    expect(home.en.intro).toBe(
      'I build reliable AI systems for developer workflows, knowledge retrieval, and model infrastructure.',
    );
    expect(home.en.hero.facts).toEqual(['10+ Years in Software Engineering', 'Taiwan']);
    expect(home.en.hero.workCta).toBe('View Selected Work');
    expect(home.en.hero.writingCta).toBe('Technical Writing');
  });

  it('quotes the doc-2 §5 hero statement verbatim in Chinese', () => {
    expect(home.zh.intro).toBe(
      '設計與打造可投入實際使用的 AI 系統，聚焦開發者工作流程、知識檢索與模型基礎架構。',
    );
    // doc-2 §5 keeps the role line and `Taiwan` in English in both locales.
    expect(home.zh.hero.role).toBe('AI Systems Engineer · System Architect');
    expect(home.zh.hero.facts[1]).toBe('Taiwan');
  });

  it('quotes the doc-2 §6 Shouri product statement verbatim in English', () => {
    expect(home.en.shouri.summary).toBe(
      'Save first. Organize with AI when needed. Keep the original as the source of truth.',
    );
  });

  it('quotes the doc-2 §6 Shouri product statement verbatim in Chinese', () => {
    // doc-2 §6 writes both languages out in full, so neither is a translation
    // decision left to this file.
    expect(home.zh.shouri.summary).toBe(
      '先完整保存，再依需要交給 AI 整理；原始內容始終保留，不會被 AI 整理結果覆蓋。',
    );
  });

  it('quotes the PRD §5 pillar names and doc-2 §8 descriptions verbatim in English', () => {
    expect(home.en.expertise.pillars.map((pillar) => pillar.name)).toEqual([
      'AI & Agent Systems',
      'Knowledge Systems',
      'LLM Infrastructure',
      'Software Architecture',
    ]);
    expect(home.en.expertise.pillars.map((pillar) => pillar.description)).toEqual([
      'Agent workflows, tool execution, evaluation and recovery.',
      'Retrieval, grounding and agent-accessible knowledge.',
      'Serving, optimization, benchmarking and reliability.',
      'Systems, integration, cloud, security and delivery.',
    ]);
  });

  it('quotes the doc-2 §10 credibility strip verbatim in English', () => {
    expect(home.en.experience.heading).toBe('10+ Years of Engineering');
    expect(home.en.experience.progression).toBe(
      'Software engineering → system architecture → AI systems',
    );
    expect(home.en.experience.summary).toBe(
      'Experience across enterprise software, cloud, security, mobile/web and applied AI.',
    );
    expect(home.en.experience.cta.label).toBe('About Oliver');
  });

  it('quotes the doc-2 §10 credibility strip verbatim in Chinese', () => {
    expect(home.zh.experience.heading).toBe('10+ 年工程經驗');
    expect(home.zh.experience.progression).toBe('軟體工程 → 系統架構 → AI 系統');
    expect(home.zh.experience.summary).toBe(
      '經歷涵蓋企業軟體、雲端、資安、行動／網頁應用與 AI 系統。',
    );
    expect(home.zh.experience.cta.label).toBe('關於 Oliver');
  });

  it('keeps the publication identical across locales (PRD §7)', () => {
    // A paper title and a journal name are proper nouns; translating either
    // would invent a citation that does not exist.
    for (const locale of LOCALES) {
      expect(home[locale].research.paper).toBe(
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      );
      expect(home[locale].research.venue).toBe(
        'Journal of Information Security and Applications · 2026',
      );
    }
  });

  it('quotes the doc-2 §9 research summary verbatim in English', () => {
    expect(home.en.research.summary).toBe(
      'Co-authored research on certificate-based encryption designed to remain secure under continual key leakage.',
    );
  });

  it('keeps the bilingual product identity in both locales (PRD §34)', () => {
    // `Shouri / 收理` is the example PRD §34 gives of intentional bilingual
    // identity, so it is the one heading that reads the same in both locales.
    for (const locale of LOCALES) {
      expect(home[locale].shouri.heading).toBe('Shouri / 收理');
    }
  });

  it('names the product the same way on the Work index (doc-2 §11)', () => {
    // The identity is one string, not a per-page decision. doc-2 §11 writes the
    // index entry as `Project 01 — Shouri / 收理`, PRD §7 lists `Shouri / 收理`
    // among the names not to be re-ordered, and the case-study page's own
    // `SoftwareApplication` schema emits `home[locale].shouri.heading` — so a
    // frontmatter title that disagreed would contradict the page it titles.
    // MCD-26 found `收理 Shouri` on the zh index; this is what keeps it away.
    const CASE_STUDY: Record<Locale, string> = { en: SHOURI_EN, zh: SHOURI_ZH };

    for (const locale of LOCALES) {
      expect(CASE_STUDY[locale]).toMatch(/^title: 'Shouri \/ 收理'$/m);
    }
  });
});

/* -------------------------------------------------------------------------
 * Third-party attribution (PRD §9.4, doc-2 §7)
 *
 * doc-2 §7 removes the attribution paragraph from the homepage, and PRD §9.4
 * still requires the bundled `grilling` skill to keep clear attribution and
 * never to be presented as original work. Both can be true only because the
 * requirement now rests on the case study — so the guard follows it there
 * rather than being deleted with the paragraph.
 *
 * The markdown is pulled in as raw text through Vite, the same way
 * `design-system.test.ts` reads stylesheets: the project typechecks with
 * `astro check` and carries no `@types/node`, so a filesystem read would not
 * compile, and a moved or renamed case study breaks this import instead of
 * silently passing.
 * ---------------------------------------------------------------------- */

describe('third-party attribution (PRD §9.4)', () => {
  const CASE_STUDY: Record<Locale, string> = {
    en: AI_CODING_SKILLS_EN,
    zh: AI_CODING_SKILLS_ZH,
  };

  it.each(LOCALES)('attributes the bundled skill and its licence (%s)', (locale) => {
    const source = CASE_STUDY[locale];

    // `.claude/skills/grilling/SKILL.md` and the MIT `LICENSE` beside it are
    // the source for all three of these. The notice is quoted verbatim on both
    // localized pages, so all three read the same in either language.
    expect(source).toContain('grilling');
    expect(source).toContain('Matt Pocock');
    expect(source).toContain('MIT License');
  });

  it.each(LOCALES)('gives the attribution a section of its own (%s)', (locale) => {
    // A heading, not a sentence buried in a paragraph — a reader following
    // `View Case Study` has to be able to find it.
    expect(CASE_STUDY[locale]).toMatch(/^## (Attribution|出處與授權)$/m);
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
    // The Shouri principles are no longer prose: doc-2 §6 reduces them to three
    // names, which PRD §34 exempts as product vocabulary.
    ...t.expertise.pillars.map((pillar) => pillar.description),
    t.openSource.statement,
    // doc-2 §9 leaves the Research column one prose block: `detail` moved to
    // About, and the Technical Writing intro went with the merge — the column
    // now shows Study as its label instead of stating it in a sentence.
    t.research.summary,
    t.experience.progression,
    t.experience.summary,
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
    ]);
    // The publication's scheme and security-notion names — `LR-CBEET`,
    // `IND-CCA`, `OW-CCA` — are deliberately absent: doc-2 §9 moved the only
    // sentence that used them to About, where `about.test.ts` admits them.

    for (const block of proseFor(home.zh)) {
      const latin = block.match(/[A-Za-z][A-Za-z0-9-]*/g) ?? [];
      expect(latin.filter((word) => !ALLOWED.has(word))).toEqual([]);
    }
  });
});
