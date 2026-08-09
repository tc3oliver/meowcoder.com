/**
 * Work content model (MCD-5, PRD §10, §26, §27, doc-2 §21).
 *
 * A Work entry is content, not code: two Markdown files — one per locale —
 * under `src/content/work/`. Most are case studies; one, per decision-11, is
 * the synthesized professional-experience entry, and `kind` is what tells them
 * apart. This module owns the two rules that make that work:
 *
 * - `workEntrySchema`, the required metadata every entry must carry. The
 *   content collection validates against it, so a malformed entry fails the
 *   build with the file and field named.
 * - `assertWorkContentIsConsistent`, the invariants a *pair* of entries must
 *   satisfy. A schema can only see one file at a time; these are what keep
 *   `/work/<slug>/` and `/zh/work/<slug>/` resolvable from each other.
 *
 * Deliberately free of `astro:content` imports. Everything here is plain data
 * plus zod, so the rules are unit-testable without the content layer.
 */

import { z } from 'astro/zod';

import { LOCALES, type Locale } from '../i18n/locales';

/** Lowercase words joined by single hyphens — the URL segment form. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SLUG_MESSAGE = 'must be lowercase words joined by single hyphens, e.g. "ai-coding-skills"';

/**
 * One row of project metadata, rendered beside the case study (doc-2 §12).
 *
 * Label and value are both localized, because a metadata row is a statement
 * about the project in the reader's language, not a translation key. Values are
 * plain text: the sidebar summarizes, and the evidence links stay in the
 * article where doc-2 §12 requires them to remain visible.
 */
const workMetaRowSchema = z.strictObject({
  /** Localized row label, e.g. `Status`. */
  label: z.string().min(1),
  /** Localized row value, e.g. `Live · in test period`. */
  value: z.string().min(1),
});

/**
 * What kind of entry this is (doc-2 §21, decision-11).
 *
 * `case-study` is a project a reader can go and inspect in public.
 * `experience` is the synthesized professional-history entry, which carries no
 * public evidence link because none exists — see `workEntryShape` for how that
 * is enforced rather than merely permitted.
 */
export const WORK_ENTRY_KINDS = ['case-study', 'experience'] as const;

export type WorkEntryKind = (typeof WORK_ENTRY_KINDS)[number];

/**
 * Required metadata for one localized Work entry.
 *
 * Strict on purpose: an unknown key is almost always a misspelled required one
 * (`translationkey`), and reporting both the stray key and the missing field
 * points at the mistake instead of the symptom.
 */
const workEntryShape = z.strictObject({
  /** Localized case-study title. Also the `<title>` and `og:title` stem. */
  title: z.string().min(1),
  /** Localized category line, e.g. `Product · AI Systems` (PRD §10). */
  type: z.string().min(1),
  /** Localized one-line summary. Describes the case study; drives the description. */
  summary: z.string().min(1),
  /**
   * Localized outcome sentence for the Work index (doc-2 §11).
   *
   * Where `summary` says what the project *is*, this says what it *achieved* —
   * the one sentence a large index entry leads with. Optional, and an entry
   * without it falls back to `summary`, which is what the index rendered before
   * the field existed. `assertWorkContentIsConsistent` checks that both
   * translations agree on whether it is declared.
   */
  outcome: z.string().min(1).optional(),
  /** Quiet supporting metadata shown on the Work index. */
  indexMeta: z.string().min(1).optional(),
  /**
   * Localized evidence label for the Work index (doc-2 §11).
   *
   * A short line naming what can be checked in public — not the links
   * themselves, which doc-2 §12 keeps inside the case study. Required on a
   * case study and rejected on an `experience` entry; the refinement below
   * owns that rule, and the cross-locale check for `outcome` therefore covers
   * `evidence` implicitly, through `kind`.
   */
  evidence: z.string().min(1).optional(),
  /**
   * Which of the two kinds of entry this is (doc-2 §21).
   *
   * Defaults to `case-study`, so the field is one an experience entry opts
   * into rather than one every case study has to restate. It is what the index
   * keys its call to action on, and what decides whether `evidence` is
   * required or refused.
   */
  kind: z.enum(WORK_ENTRY_KINDS).default('case-study'),
  /** URL segment: `/work/<slug>/` and `/zh/work/<slug>/`. */
  slug: z.string().regex(SLUG_PATTERN, `slug ${SLUG_MESSAGE}`),
  /** Which localized file this is. Must match the directory it lives in. */
  locale: z.enum(LOCALES),
  /**
   * Locale-independent identity shared by every translation of one case study
   * (PRD §27). The pairing is by this key, not by filename.
   */
  translationKey: z.string().regex(SLUG_PATTERN, `translationKey ${SLUG_MESSAGE}`),
  /** Index position, ascending. PRD §10 lists Shouri before AI Coding Skills. */
  order: z.number().int().nonnegative(),
  /**
   * Project metadata for the detail-page sidebar, in display order (doc-2 §12).
   *
   * Optional: a case study without it renders a sidebar carrying the `type` row
   * and the section navigation, which is a complete sidebar rather than a
   * degraded one. `assertWorkContentIsConsistent` checks that both translations
   * declare the same number of rows.
   */
  meta: z.array(workMetaRowSchema).optional(),
  /** Withheld from the index and from route generation while `true`. */
  draft: z.boolean().default(false),
});

/**
 * The entry schema, with the one rule that spans two of its fields.
 *
 * doc-2 §21 admits an entry that has no public evidence link, and decision-11
 * is explicit that the absence is the mechanism keeping it distinct from the
 * two projects a reader can go and inspect. Leaving `evidence` merely optional
 * would express that as a case study with a hole in it, and would quietly let
 * the next case study ship without evidence too — which doc-1 §10 does not
 * allow. So the pairing is enforced both ways:
 *
 * - a `case-study` **must** carry `evidence`; there is no such thing as an
 *   inspectable project with nothing to inspect;
 * - an `experience` entry **must not**, because a label there would be a claim
 *   the entry cannot support.
 *
 * Both failures name `evidence`, so the content file reports the field the
 * author has to fix rather than a union that did not match.
 */
export const workEntrySchema = workEntryShape.superRefine((data, ctx) => {
  if (data.kind === 'case-study' && data.evidence === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['evidence'],
      message:
        'a case study must name what a reader can check in public (doc-1 §10); ' +
        "an entry with nothing to link to is kind: 'experience'",
    });
  }

  if (data.kind === 'experience' && data.evidence !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['evidence'],
      message:
        'an experience entry carries no evidence label (doc-2 §21): it has no public link, ' +
        'and that absence is what distinguishes it from a case study',
    });
  }
});

export type WorkEntryData = z.infer<typeof workEntrySchema>;

/**
 * The shape this module needs from a content-collection entry.
 *
 * `CollectionEntry<'work'>` satisfies it structurally, so pages can pass
 * `getCollection('work')` straight through.
 */
export interface WorkEntry {
  /** `<locale>/<slug>`, as generated by the collection loader. */
  id: string;
  data: WorkEntryData;
}

function fail(message: string): never {
  throw new Error(`Work content: ${message}`);
}

/** File path an entry's own metadata says it should live at. */
function expectedPath(data: WorkEntryData): string {
  return `src/content/work/${data.locale}/${data.slug}.md`;
}

/**
 * Verify every cross-file invariant the Work model depends on.
 *
 * Throws at build time — during `getStaticPaths` and index rendering — with the
 * offending entry id and field in the message.
 *
 * The invariants, and why each one exists:
 *
 * 1. An entry's id matches its own `locale` and `slug`. Catches a file dropped
 *    into the wrong locale directory or renamed without updating frontmatter.
 * 2. `slug` and `translationKey` map one-to-one. The language switch rewrites
 *    only the locale prefix (`src/lib/i18n.ts`), so translations of one case
 *    study must share a slug or the switch would land on a 404.
 * 3. Every translation key exists in every locale. PRD §7 requires Traditional
 *    Chinese to be a complete localized experience, not a partial one.
 * 4. `order`, `draft` and `kind` agree across locales. Otherwise the two
 *    indexes would disagree on what exists, in what sequence, or on whether a
 *    reader is being offered something inspectable — and because `kind` is what
 *    decides whether `evidence` is required, agreeing on it is also what keeps
 *    one locale from printing an evidence label the other cannot.
 * 5. Every translation declares the same number of `meta` rows. The values are
 *    localized and cannot be compared, but a row present in one locale and
 *    missing in the other is a half-translated sidebar — the same defect rule 3
 *    rejects for the case study as a whole.
 * 6. Every translation agrees on whether `outcome` and `indexMeta` are
 *    declared, for the same
 *    reason: the text is localized and incomparable, but one index leading with
 *    an outcome sentence while the other falls back to the summary is the two
 *    locales showing different things. `evidence` needs no rule of its own —
 *    rule 4 pins `kind`, and the schema pins `evidence` to `kind`, so two
 *    translations that agree on the kind cannot disagree on the field.
 */
export function assertWorkContentIsConsistent(entries: readonly WorkEntry[]): void {
  // Sort first so the *same* broken content always reports the same error,
  // whatever order the loader happened to hand entries over in.
  const ordered = [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const keyBySlug = new Map<string, string>();
  const slugByKey = new Map<string, string>();
  const byTranslationKey = new Map<string, WorkEntry[]>();

  for (const entry of ordered) {
    const { locale, slug, translationKey } = entry.data;

    if (entry.id !== `${locale}/${slug}`) {
      fail(
        `entry "${entry.id}" declares locale "${locale}" and slug "${slug}", ` +
          `so it must be the file ${expectedPath(entry.data)}`,
      );
    }

    const knownKey = keyBySlug.get(slug);
    if (knownKey !== undefined && knownKey !== translationKey) {
      fail(
        `slug "${slug}" is used by translationKey "${knownKey}" and "${translationKey}"; ` +
          `one slug belongs to exactly one case study (see ${expectedPath(entry.data)})`,
      );
    }
    keyBySlug.set(slug, translationKey);

    const knownSlug = slugByKey.get(translationKey);
    if (knownSlug !== undefined && knownSlug !== slug) {
      fail(
        `translationKey "${translationKey}" maps to slug "${knownSlug}" and "${slug}"; ` +
          `every translation of a case study must share one slug so the language ` +
          `switch resolves (see ${expectedPath(entry.data)})`,
      );
    }
    slugByKey.set(translationKey, slug);

    const group = byTranslationKey.get(translationKey);
    if (group) group.push(entry);
    else byTranslationKey.set(translationKey, [entry]);
  }

  for (const [translationKey, group] of byTranslationKey) {
    const missing = LOCALES.filter((locale) => !group.some((e) => e.data.locale === locale));
    if (missing.length > 0) {
      const slug = slugByKey.get(translationKey);
      fail(
        `translationKey "${translationKey}" has no ${missing.join(', ')} entry; ` +
          `add ${missing.map((locale) => `src/content/work/${locale}/${slug}.md`).join(' and ')}`,
      );
    }

    // Safe: `missing.length === 0` means every locale is present, so is the first.
    const reference = group[0]!;
    for (const entry of group) {
      for (const field of ['order', 'draft', 'kind'] as const) {
        if (entry.data[field] !== reference.data[field]) {
          fail(
            `translationKey "${translationKey}" disagrees on "${field}": ` +
              `"${reference.id}" has ${String(reference.data[field])} but ` +
              `"${entry.id}" has ${String(entry.data[field])}`,
          );
        }
      }

      const expectedRows = reference.data.meta?.length ?? 0;
      const rows = entry.data.meta?.length ?? 0;
      if (rows !== expectedRows) {
        fail(
          `translationKey "${translationKey}" disagrees on "meta": ` +
            `"${reference.id}" declares ${expectedRows} row(s) but "${entry.id}" ` +
            `declares ${rows}; both translations must describe the same metadata`,
        );
      }

      // Presence must stay in sync even though values are localized.
      for (const field of ['outcome', 'indexMeta'] as const) {
        const expected = reference.data[field] !== undefined;
        const declared = entry.data[field] !== undefined;
        if (declared !== expected) {
          const [has, lacks] = expected ? [reference.id, entry.id] : [entry.id, reference.id];
          fail(
            `translationKey "${translationKey}" disagrees on "${field}": ` +
              `"${has}" declares it but "${lacks}" does not; both translations ` +
              `must give the Work index the same fields`,
          );
        }
      }
    }
  }
}

/**
 * Published entries for one locale, in index order.
 *
 * Validates the whole collection first — a broken pair on any entry is a
 * problem for both indexes, not only the locale being rendered.
 *
 * Generic over the entry type so a `CollectionEntry<'work'>` survives the
 * filter and can still be handed to `render()`.
 */
export function workEntriesForLocale<T extends WorkEntry>(
  entries: readonly T[],
  locale: Locale,
): T[] {
  assertWorkContentIsConsistent(entries);

  return entries
    .filter((entry) => entry.data.locale === locale && !entry.data.draft)
    .sort(
      (a, b) =>
        a.data.order - b.data.order ||
        // Byte-order tie-break rather than `localeCompare`, so the build is
        // reproducible regardless of the host's ICU data.
        (a.data.slug < b.data.slug ? -1 : a.data.slug > b.data.slug ? 1 : 0),
    );
}
