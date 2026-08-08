/**
 * Content collections (MCD-5, PRD §26).
 *
 * One collection, `work`, holding both locales of every case study. Keeping
 * them together is what lets `assertWorkContentIsConsistent` see a translation
 * pair as a pair; a per-locale collection could never check across them.
 *
 * No database and no CMS (PRD §26) — the files on disk are the source.
 */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { workEntrySchema } from './lib/work';

const work = defineCollection({
  loader: glob({
    base: './src/content/work',
    // Only the locale directories. Authoring docs sitting alongside the content
    // (`README.md`) are not entries.
    pattern: '{en,zh}/*.md',
    /*
     * Derive the id from the file path, as `<locale>/<slug>`.
     *
     * The default generator prefers a frontmatter `slug` when one exists — and
     * both translations of a case study deliberately share one, so the two
     * would collide on a single id and one locale would silently vanish.
     */
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: workEntrySchema,
});

export const collections = { work };
