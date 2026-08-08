/**
 * Shape of a per-page dictionary (MCD-3, PRD §27).
 *
 * One module per page under `src/i18n/pages/`, each declaring every locale side
 * by side as `satisfies PageDictionary`. Two consequences follow:
 *
 * - key parity between locales is a compile error, not a review comment;
 * - adding a page is a new file, never an edit to a shared dictionary.
 *
 * Long-form Work content does not belong here. PRD §27 keeps it in localized
 * MDX under `src/content/` instead of a growing translation object (MCD-5).
 */

import type { Locale } from '../locales';

export interface PageStrings {
  /** `<title>` and `og:title`. */
  title: string;
  /** `<meta name="description">` and `og:description`. */
  description: string;
  /** Visible page heading. */
  heading: string;
  /** Short introductory line under the heading. */
  intro: string;
}

export type PageDictionary = Record<Locale, PageStrings>;
