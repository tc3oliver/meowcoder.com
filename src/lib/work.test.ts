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
  slug: 'example-case-study',
  locale: 'en',
  translationKey: 'example-case-study',
  order: 0,
} as const;

/** A schema-valid entry, as the collection loader would hand it over. */
function entry(overrides: Partial<WorkEntryData> = {}): WorkEntry {
  const data = workEntrySchema.parse({ ...VALID_FRONTMATTER, ...overrides });

  return { id: `${data.locale}/${data.slug}`, data };
}

/** Both locales of one case study, which is the smallest valid collection. */
function pair(overrides: Partial<WorkEntryData> = {}): WorkEntry[] {
  return [entry({ locale: 'en', ...overrides }), entry({ locale: 'zh', ...overrides })];
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
