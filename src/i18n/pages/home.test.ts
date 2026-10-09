/**
 * Homepage content guarantees (MCD-4, MCD-16).
 *
 * The homepage is mostly judged by reading it. These rules are not judgement
 * calls, though — they are fixed counts, verbatim PRD wording, and the
 * absence of specific strings, and every one of them is the kind of thing a
 * later content edit can break silently:
 *
 *   - PRD §5, §9.2, §9.4 fix how many items each section may contain;
 *   - PRD §11 keeps employer detail off the homepage;
 *   - PRD §12 keeps LLM Infrastructure from implying a public case study;
 *   - PRD §34 forbids mixing languages inside one prose block.
 *
 * Encoding them means a regression fails the build instead of shipping.
 */

import { describe, expect, it } from 'vitest';

import SHOURI_EN from '../../content/work/en/shouri.md?raw';
import SHOURI_ZH from '../../content/work/zh/shouri.md?raw';
import INFERENCE_EN from '../../content/work/en/llm-inference-systems.md?raw';
import INFERENCE_ZH from '../../content/work/zh/llm-inference-systems.md?raw';
import LAYA_EN from '../../content/work/en/laya-apple.md?raw';
import LAYA_ZH from '../../content/work/zh/laya-apple.md?raw';
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
  it('states only facts about the work in the hero', () => {
    // Two verifiable facts: a shipped release and where the upstream work went.
    // `Taiwan` used to sit here, the one entry not about the work; the length
    // of the career went too, because the owner asked to stop leading with
    // years. Names rather than counts, because a count of pull requests is
    // stale the week the next one merges.
    expect(t.hero.facts).toHaveLength(2);
    expect(t.hero.facts[0]).toMatch(/laya-apple.*PyPI/);
    // No version: it would be stale the day the next release ships.
    expect(t.hero.facts[0]).not.toMatch(/\d/);
    expect(t.hero.facts[1]).toMatch(/coremltools/);
    expect(t.hero.facts.join(' ')).not.toMatch(/\d+ (merged|pull requests|PRs)/i);
  });

  it('carries only what the Products list shows', () => {
    // Shouri keeps its name, its sentence (also the structured-data
    // description) and one action; the principles, eyebrow, screenshot and the
    // case-study label left the homepage with the Shouri section.
    expect(Object.keys(t.shouri).sort()).toEqual(['cta', 'heading', 'summary']);
    expect(Object.keys(t.products).sort()).toEqual([
      'claudeTeamKit',
      'heading',
      'piship',
      'signalforge',
    ]);
    expect(Object.keys(t.products.piship).sort()).toEqual(['cta', 'heading', 'statement']);
    expect(Object.keys(t.products.signalforge).sort()).toEqual([
      'cta',
      'heading',
      'liveCta',
      'statement',
    ]);
  });

  it('lists Claude Team Kit as a row with no version, date or count', () => {
    const row = t.products.claudeTeamKit;
    expect(Object.keys(row).sort()).toEqual(['cta', 'heading', 'statement']);
    expect(row.heading).toBe('Claude Team Kit');
    expect(row.cta.label).toBe('GitHub');
    expect(`${row.heading} ${row.statement}`).not.toMatch(/\d/);
  });

  it('names PiShip with its statement and a GitHub link', () => {
    expect(t.products.piship.heading).toBe('PiShip');
    expect(t.products.piship.statement.length).toBeGreaterThan(0);
    expect(t.products.piship.cta.label).toBe('GitHub');
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
    // The case-study links are the project names themselves, so no string
    // on the homepage mentions a case study at all.
    const CASE_STUDY = [/case study/i, /案例/];
    for (const pattern of CASE_STUDY) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('keeps the paper row to a year, a venue and the title', () => {
    expect(Object.keys(t.research).sort()).toEqual(['paper', 'venue', 'year']);
  });

  it('leaves the cryptographic security notions to About (doc-2 §9)', () => {
    // "Unnecessary for homepage credibility and belongs on About." The sentence
    // is not lost: `about.test.ts` asserts About still states it in full, in
    // both locales, so these two tests are the halves of one guarantee.
    for (const notion of ['IND-CCA', 'OW-CCA', 'LR-CBEET']) {
      expect(strings(t).filter((value) => value.includes(notion))).toEqual([]);
    }
  });

  it('names a language for every locale a title could arrive in (doc-2 §9)', () => {
    // The badge on a foreign-language title. `resolveTitle` may report any
    // locale, so a missing name would render an empty badge on the one post
    // that needed it most.
    for (const language of LOCALES) {
      expect(t.writing.languages[language].length).toBeGreaterThan(0);
    }
  });
});

/* -------------------------------------------------------------------------
 * Verbatim requirement wording
 *
 * PRD §9 writes parts of the English homepage copy out in full, and doc-2 §5
 * rewrites the hero the same way. All of it is quoted rather than paraphrased
 * and asserted literally here.
 * ---------------------------------------------------------------------- */

describe('requirement wording', () => {
  it('quotes the doc-2 §5 hero verbatim in English', () => {
    expect(home.en.hero.role).toBe('AI Systems Engineer · System Architect');
    expect(home.en.intro).toBe(
      'I build AI products and the LLM inference systems under them, on Apple silicon and AMD GPUs, and trace performance problems to a measured cause.',
    );
    expect(home.en.hero.workCta).toBe('View Selected Work');
    expect(home.en.hero.writingCta).toBe('Technical Writing');
  });

  it('quotes the doc-2 §5 hero statement verbatim in Chinese', () => {
    expect(home.zh.intro).toBe(
      '我開發 AI 產品與 LLM 推論系統，跑在 Apple silicon 和 AMD GPU 上。遇到效能問題，就一路追到能用量測證明的原因。',
    );
    // doc-2 §5 keeps the role line in English in both locales.
    expect(home.zh.hero.role).toBe('AI Systems Engineer · System Architect');
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

  it('keeps the career arc and About link that close the Writing section', () => {
    expect(home.en.experience.progression).toBe(
      'Software engineering → system architecture → AI systems',
    );
    expect(home.en.experience.cta.label).toBe('About Oliver');
    expect(home.zh.experience.progression).toBe('軟體工程 → 系統架構 → AI 系統');
    expect(home.zh.experience.cta.label).toBe('關於 Oliver');
  });

  it('keeps the publication identical across locales (PRD §7)', () => {
    // A paper title and a journal name are proper nouns; translating either
    // would invent a citation that does not exist.
    for (const locale of LOCALES) {
      expect(home[locale].research.paper).toBe(
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      );
      expect(home[locale].research.venue).toBe('Journal of Information Security and Applications');
      expect(home[locale].research.year).toBe('2026');
    }
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
 * Content language rules (PRD §34)
 * ---------------------------------------------------------------------- */

describe('content language rules (PRD §34)', () => {
  /** The prose blocks — full sentences, where the rule actually bites. */
  const proseFor = (t: HomeStrings) => [
    t.intro,
    t.shouri.summary,
    ...t.systems.projects.flatMap((project) => (project.note ? [project.note] : [])),
    t.products.piship.statement,
    t.products.claudeTeamKit.statement,
    t.products.signalforge.statement,
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
      'Claude',
      'Code',
      'Agent',
      'Teams',
      'Mission',
      'Control',
      'Pi',
      'OIDC',
      'Apple',
      'silicon',
      'AMD',
      // Established technical terminology.
      'AI',
      'LLM',
      'GPU',
      'VRAM',
      'agent',
      'coding',
      'fork',
      'gateway',
      'plugin',
      'policy',
      'sandbox',
      'teammate',
      'worker',
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

describe.each(BY_LOCALE)('Featured Research (%s)', (_locale, t: HomeStrings) => {
  it('quotes each lead result from its own case study', () => {
    // A homepage number with no source behind it is exactly what this site's
    // rules forbid. Each value must appear verbatim in the case study for the
    // same project, in the same locale, which in turn names its data.
    const CASE_STUDIES: Record<string, Record<string, string>> = {
      'laya-apple': { en: LAYA_EN, zh: LAYA_ZH },
      'llm-inference-systems': { en: INFERENCE_EN, zh: INFERENCE_ZH },
    };
    // The MI300X baseline has no case study; its 1,474 tok/s is quoted from
    // bench-results/README.md's concurrent sub-agent table (32 streams). The
    // RTX 5070 Ti evaluation has none either; its 92.1 % is E01 in the
    // repository's EVIDENCE-INDEX.md.
    for (const project of t.systems.projects.filter((p) => p.id in CASE_STUDIES)) {
      const source = CASE_STUDIES[project.id][_locale];
      for (const number of project.stat.value.match(/\d+(?:\.\d+)?/g) ?? []) {
        expect(source).toContain(number);
      }
    }
  });

  it('carries only a number, its label and an optional note per project', () => {
    // The statements and fact lines are gone: the case study and the article
    // carry them. A negative result stays beside its number as `note`.
    for (const project of t.systems.projects) {
      expect(Object.keys(project).sort()).toEqual(
        ['articleCta', 'id', 'name', 'note', 'stat'].filter((key) => key in project),
      );
    }
    expect(t.systems.projects.filter((p) => p.note).map((p) => p.id)).toEqual([
      'qwen3.8-27b-5070ti-eval',
    ]);
    // The negative result stays stated as such, unhedged.
    const note = t.systems.projects.find((p) => p.id === 'qwen3.8-27b-5070ti-eval')!.note!;
    expect(note).toMatch(_locale === 'en' ? /invalid/i : /作廢|無效/);
  });

  it('lists the four upstream pull requests under Research, three of them merged', () => {
    expect(t.systems.upstream.items.map((item) => item.name)).toEqual([
      'apple/coremltools#2876',
      'jundot/omlx#3685',
      'jundot/omlx#3840 + #3842',
      'jundot/omlx#3664',
    ]);
    expect(t.systems.upstream.items.filter((item) => item.merged).map((item) => item.name)).toEqual(
      ['jundot/omlx#3685', 'jundot/omlx#3840 + #3842', 'jundot/omlx#3664'],
    );
  });

  it('leads with the project that shipped, and is not Apple-only', () => {
    expect(t.systems.projects.map((project) => project.id)).toEqual([
      'laya-apple',
      'llm-inference-systems',
      'deepseek-v4-flash-mi300x',
      'qwen3.8-27b-5070ti-eval',
    ]);
  });
});
