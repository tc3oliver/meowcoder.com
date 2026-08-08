import { describe, expect, it } from 'vitest';

import {
  assertWorkContentIsConsistent,
  workEntriesForLocale,
  workEntrySchema,
  type WorkEntry,
  type WorkEntryData,
} from './work';

const VALID_FRONTMATTER = {
  title: 'Example Case Study',
  type: 'Product · AI Systems',
  summary: 'One line on the problem and the result.',
  // Required of a case study, so it belongs in the baseline every other test
  // varies from — see the `kind` block below.
  evidence: 'example.com · published',
  slug: 'example-case-study',
  locale: 'en',
  translationKey: 'example-case-study',
  order: 0,
} as const;

/** The doc-2 §21 entry: an experience entry declares no evidence, ever. */
const VALID_EXPERIENCE_FRONTMATTER = {
  title: 'Professional Systems & AI Engineering',
  type: 'Professional Experience · 10+ Years',
  summary: 'More than a decade of engineering experience.',
  kind: 'experience',
  slug: 'professional-engineering',
  locale: 'en',
  translationKey: 'professional-engineering',
  order: 2,
} as const;

/** A schema-valid entry, as the collection loader would hand it over. */
function entry(overrides: Partial<WorkEntryData> = {}): WorkEntry {
  const data = workEntrySchema.parse({ ...VALID_FRONTMATTER, ...overrides });

  return { id: `${data.locale}/${data.slug}`, data };
}

/** The same, for an entry that carries no evidence by construction. */
function experienceEntry(overrides: Partial<WorkEntryData> = {}): WorkEntry {
  const data = workEntrySchema.parse({ ...VALID_EXPERIENCE_FRONTMATTER, ...overrides });

  return { id: `${data.locale}/${data.slug}`, data };
}

/** Both locales of one case study, which is the smallest valid collection. */
function pair(overrides: Partial<WorkEntryData> = {}): WorkEntry[] {
  return [entry({ locale: 'en', ...overrides }), entry({ locale: 'zh', ...overrides })];
}

/** Both locales of the experience entry. */
function experiencePair(overrides: Partial<WorkEntryData> = {}): WorkEntry[] {
  return [
    experienceEntry({ locale: 'en', ...overrides }),
    experienceEntry({ locale: 'zh', ...overrides }),
  ];
}

describe('workEntrySchema', () => {
  it('accepts a complete entry', () => {
    expect(workEntrySchema.safeParse(VALID_FRONTMATTER).success).toBe(true);
  });

  it('treats an entry as published unless it opts out', () => {
    expect(workEntrySchema.parse(VALID_FRONTMATTER).draft).toBe(false);
    expect(workEntrySchema.parse({ ...VALID_FRONTMATTER, draft: true }).draft).toBe(true);
  });

  // AC #5: a content file missing required metadata must fail with the field
  // identified, not with a generic parse error.
  it.each(['title', 'type', 'summary', 'slug', 'locale', 'translationKey', 'order'] as const)(
    'rejects an entry with no %s and names the field',
    (field) => {
      const incomplete: Record<string, unknown> = { ...VALID_FRONTMATTER };
      delete incomplete[field];

      const result = workEntrySchema.safeParse(incomplete);

      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain(field);
    },
  );

  it('rejects an unknown key, which is usually a misspelled required one', () => {
    const result = workEntrySchema.safeParse({
      ...VALID_FRONTMATTER,
      translationkey: 'example-case-study',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty required string', () => {
    expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, title: '' }).success).toBe(false);
  });

  it.each(['Example', 'example_case', 'example case', '-example', 'example-'])(
    'rejects %o as a slug',
    (slug) => {
      expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, slug }).success).toBe(false);
    },
  );

  it('rejects a locale the site does not serve', () => {
    expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, locale: 'ja' }).success).toBe(false);
  });

  it('rejects a non-integer order', () => {
    expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, order: 1.5 }).success).toBe(false);
  });

  // The sidebar is optional per case study (doc-2 §12), so an entry that
  // declares no metadata rows must stay valid rather than force empty ones.
  it('accepts an entry with no sidebar metadata', () => {
    expect(workEntrySchema.parse(VALID_FRONTMATTER).meta).toBeUndefined();
  });

  it('accepts sidebar metadata rows in declaration order', () => {
    const meta = [
      { label: 'Status', value: 'Live' },
      { label: 'Plans', value: 'Free open' },
    ];

    expect(workEntrySchema.parse({ ...VALID_FRONTMATTER, meta }).meta).toEqual(meta);
  });

  it.each([
    ['a missing value', [{ label: 'Status' }]],
    ['an empty label', [{ label: '', value: 'Live' }]],
    ['an unknown key', [{ label: 'Status', value: 'Live', href: 'https://example.com' }]],
  ])('rejects a metadata row with %s', (_case, meta) => {
    expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, meta }).success).toBe(false);
  });

  // The Work index leads each entry with an outcome sentence (doc-2 §11), and
  // falls back to `summary` for an entry that declares none — so it stays
  // optional. `evidence` does not; see the `kind` block below.
  it('accepts an entry with no outcome', () => {
    expect(workEntrySchema.parse(VALID_FRONTMATTER).outcome).toBeUndefined();
  });

  it.each(['outcome', 'evidence'] as const)('keeps %s as written', (field) => {
    const value = 'Live, with the evidence published alongside it.';

    expect(workEntrySchema.parse({ ...VALID_FRONTMATTER, [field]: value })[field]).toBe(value);
  });

  it.each(['outcome', 'evidence'] as const)(
    'rejects an empty %s rather than render one',
    (field) => {
      expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, [field]: '' }).success).toBe(false);
    },
  );
});

/*
 * doc-2 §21 and decision-11: the Work index carries one entry that has no
 * public evidence link, and the absence is the point rather than an omission.
 * These are the tests that keep it that way in both directions — an experience
 * entry cannot acquire evidence, and the loosening cannot spread to the case
 * studies, which doc-1 §10 still requires to be publicly inspectable.
 */
describe('workEntrySchema kind', () => {
  it('treats an entry as a case study unless it says otherwise', () => {
    expect(workEntrySchema.parse(VALID_FRONTMATTER).kind).toBe('case-study');
  });

  it('rejects a kind the model does not define', () => {
    expect(workEntrySchema.safeParse({ ...VALID_FRONTMATTER, kind: 'article' }).success).toBe(
      false,
    );
  });

  it('requires a case study to name what can be checked in public', () => {
    const withoutEvidence: Record<string, unknown> = { ...VALID_FRONTMATTER };
    delete withoutEvidence.evidence;

    const result = workEntrySchema.safeParse(withoutEvidence);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('evidence');
  });

  it('accepts an experience entry with no evidence', () => {
    const parsed = workEntrySchema.parse(VALID_EXPERIENCE_FRONTMATTER);

    expect(parsed.kind).toBe('experience');
    expect(parsed.evidence).toBeUndefined();
  });

  it('refuses an experience entry that claims evidence anyway', () => {
    const result = workEntrySchema.safeParse({
      ...VALID_EXPERIENCE_FRONTMATTER,
      evidence: 'example.com · published',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('evidence');
  });

  // The rest of the model is indifferent to kind: an experience entry still
  // gets an outcome sentence and a sidebar if it declares them.
  it('accepts an experience entry with an outcome and metadata rows', () => {
    const parsed = workEntrySchema.parse({
      ...VALID_EXPERIENCE_FRONTMATTER,
      outcome: 'A decade of engineering, from application development to AI systems.',
      meta: [{ label: 'Experience', value: '10+ Years' }],
    });

    expect(parsed.outcome).toBeDefined();
    expect(parsed.meta).toHaveLength(1);
  });
});

describe('assertWorkContentIsConsistent', () => {
  it('accepts an empty collection', () => {
    expect(() => assertWorkContentIsConsistent([])).not.toThrow();
  });

  it('accepts a complete bilingual pair', () => {
    expect(() => assertWorkContentIsConsistent(pair())).not.toThrow();
  });

  it('accepts several pairs', () => {
    const entries = [
      ...pair(),
      ...pair({ slug: 'other-study', translationKey: 'other-study', order: 1 }),
    ];

    expect(() => assertWorkContentIsConsistent(entries)).not.toThrow();
  });

  it('rejects a file whose path contradicts its own metadata', () => {
    const misfiled: WorkEntry = { ...entry({ locale: 'zh' }), id: 'en/example-case-study' };

    expect(() => assertWorkContentIsConsistent([misfiled])).toThrow(
      /src\/content\/work\/zh\/example-case-study\.md/,
    );
  });

  // The language switch rewrites only the locale prefix, so a translation that
  // renamed its slug would send visitors to a page that does not exist.
  it('rejects translations of one case study that disagree on the slug', () => {
    const entries = [entry({ locale: 'en' }), entry({ locale: 'zh', slug: 'different-slug' })];

    expect(() => assertWorkContentIsConsistent(entries)).toThrow(/translationKey/);
  });

  it('rejects one slug claimed by two case studies', () => {
    const entries = [entry({ locale: 'en' }), entry({ locale: 'zh', translationKey: 'other' })];

    expect(() => assertWorkContentIsConsistent(entries)).toThrow(/slug "example-case-study"/);
  });

  it('rejects a case study that exists in only one locale (PRD §7)', () => {
    expect(() => assertWorkContentIsConsistent([entry({ locale: 'en' })])).toThrow(
      /no zh entry.*src\/content\/work\/zh\/example-case-study\.md/s,
    );
  });

  it.each([
    ['order', { order: 3 }],
    ['draft', { draft: true }],
  ])('rejects translations that disagree on %s', (field, override) => {
    const entries = [entry({ locale: 'en' }), entry({ locale: 'zh', ...override })];

    expect(() => assertWorkContentIsConsistent(entries)).toThrow(new RegExp(`"${field}"`));
  });

  // `kind` decides both the index's call to action and whether `evidence` is
  // required, so two translations that disagree on it would offer readers of
  // one language something inspectable and readers of the other something else.
  it('rejects translations that disagree on kind', () => {
    const entries = [
      experienceEntry({ locale: 'en' }),
      entry({
        locale: 'zh',
        slug: 'professional-engineering',
        translationKey: 'professional-engineering',
        order: 2,
      }),
    ];

    expect(() => assertWorkContentIsConsistent(entries)).toThrow(/"kind"/);
  });

  it('accepts a complete bilingual experience entry', () => {
    expect(() => assertWorkContentIsConsistent(experiencePair())).not.toThrow();
  });

  // Values are localized and cannot be compared, but a row count that differs
  // means one locale's sidebar states a fact the other's does not.
  it('rejects translations that disagree on how many metadata rows exist', () => {
    const entries = [
      entry({ locale: 'en', meta: [{ label: 'Status', value: 'Live' }] }),
      entry({ locale: 'zh' }),
    ];

    expect(() => assertWorkContentIsConsistent(entries)).toThrow(/"meta"/);
  });

  // Same defect as the row count above, one field up: one locale's index would
  // lead with an outcome sentence while the other fell back to its summary.
  //
  // `evidence` has no test of its own here because it can no longer reach this
  // state: `kind` must agree across locales, and the schema derives evidence's
  // presence from `kind`, so the schema rejects the mismatch before this does.
  it('rejects translations where only one declares an outcome', () => {
    const entries = [
      entry({ locale: 'en', outcome: 'Live, and checkable.' }),
      entry({ locale: 'zh' }),
    ];

    expect(() => assertWorkContentIsConsistent(entries)).toThrow(/"outcome"/);
  });

  it('accepts translations whose index fields differ only in language', () => {
    const entries = [
      entry({ locale: 'en', outcome: 'Live, and checkable.', evidence: 'example.com' }),
      entry({ locale: 'zh', outcome: '已上線，且可查證。', evidence: 'example.com' }),
    ];

    expect(() => assertWorkContentIsConsistent(entries)).not.toThrow();
  });

  it('accepts translations whose metadata rows differ only in language', () => {
    const entries = [
      entry({ locale: 'en', meta: [{ label: 'Status', value: 'Live' }] }),
      entry({ locale: 'zh', meta: [{ label: '狀態', value: '已上線' }] }),
    ];

    expect(() => assertWorkContentIsConsistent(entries)).not.toThrow();
  });

  it('reports the same failure whatever order the loader returns entries in', () => {
    const entries = [entry({ locale: 'en' }), entry({ locale: 'zh', order: 3 })];
    const message = (input: WorkEntry[]) => {
      try {
        assertWorkContentIsConsistent(input);
      } catch (error) {
        return (error as Error).message;
      }
      return '';
    };

    expect(message(entries)).toBe(message([...entries].reverse()));
    expect(message(entries)).not.toBe('');
  });
});

describe('workEntriesForLocale', () => {
  it('returns only the requested locale', () => {
    expect(workEntriesForLocale(pair(), 'zh').map((e) => e.id)).toEqual(['zh/example-case-study']);
  });

  it('withholds drafts from the index and from routing', () => {
    expect(workEntriesForLocale(pair({ draft: true }), 'en')).toEqual([]);
  });

  it('orders by the order field, not by slug (PRD §10)', () => {
    const entries = [
      ...pair({ slug: 'a-later-study', translationKey: 'a-later-study', order: 1 }),
      ...pair(),
    ];

    expect(workEntriesForLocale(entries, 'en').map((e) => e.data.slug)).toEqual([
      'example-case-study',
      'a-later-study',
    ]);
  });

  // doc-2 §21's list, in the shape the live collection has it: two case studies
  // and then the experience entry, which is last because it is the one a reader
  // cannot go and check.
  it('places the experience entry after the case studies in both locales', () => {
    const entries = [
      ...experiencePair(),
      ...pair({ slug: 'second-study', translationKey: 'second-study', order: 1 }),
      ...pair(),
    ];

    for (const locale of ['en', 'zh'] as const) {
      const ordered = workEntriesForLocale(entries, locale);

      expect(ordered.map((e) => e.data.slug)).toEqual([
        'example-case-study',
        'second-study',
        'professional-engineering',
      ]);
      expect(ordered.map((e) => e.data.kind)).toEqual(['case-study', 'case-study', 'experience']);
      expect(ordered.map((e) => e.data.evidence !== undefined)).toEqual([true, true, false]);
    }
  });

  it('breaks an order tie deterministically', () => {
    const entries = [
      ...pair({ slug: 'zebra', translationKey: 'zebra' }),
      ...pair({ slug: 'alpha', translationKey: 'alpha' }),
    ];

    expect(workEntriesForLocale(entries, 'en').map((e) => e.data.slug)).toEqual(['alpha', 'zebra']);
  });

  it('refuses to render an index built on inconsistent content', () => {
    expect(() => workEntriesForLocale([entry({ locale: 'en' })], 'en')).toThrow(/Work content:/);
  });
});
