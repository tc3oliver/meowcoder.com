/**
 * Off-site destinations in the site ecosystem (PRD §6).
 *
 * Each property in the ecosystem has one responsibility, and the main site
 * links to them rather than duplicating them. Only URLs the PRD states are
 * recorded here — ORCID and the JISA publication are named in PRD §6 and §15
 * but no address is given, so they are deliberately absent until confirmed
 * (they are first needed by MCD-4's footer and MCD-8's research section).
 */

/** Technical writing and technical depth (PRD §6). */
export const STUDY_URL = 'https://study.meowcoder.com';

/** Implementation and open source proof (PRD §6). */
export const GITHUB_URL = 'https://github.com/tc3oliver';

/** Product proof (PRD §6). */
export const SHOURI_URL = 'https://shouri.app';

/**
 * Research proof (PRD §6, §15) — the JISA publication.
 *
 * A DOI rather than a publisher link: DOIs are the stable identifier for a
 * paper and survive the publisher moving or re-platforming the article.
 */
export const PUBLICATION_URL = 'https://doi.org/10.1016/j.jisa.2026.104422';
