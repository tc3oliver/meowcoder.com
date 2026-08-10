/**
 * Off-site destinations in the site ecosystem (PRD §6).
 *
 * Each property in the ecosystem has one responsibility, and the main site
 * links to them rather than duplicating them. Every destination here is an
 * address confirmed by its owner or resolvable to a record that proves it;
 * nothing in this module is inferred from a name.
 */

/** Technical writing and technical depth (PRD §6). */
export const STUDY_URL = 'https://study.meowcoder.com';

/** Implementation and open source proof (PRD §6). */
export const GITHUB_URL = 'https://github.com/tc3oliver';

/** AI Coding Skills source repository. */
export const SKILLS_URL = 'https://github.com/tc3oliver/skills';

/** Professional profile, confirmed against the public résumé. */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/oliver-yu-a554a9286';

/** Direct contact address. */
export const EMAIL_URL = 'mailto:tc3oliver@gmail.com';

/** Product proof (PRD §6). */
export const SHOURI_URL = 'https://shouri.app';

/**
 * Research proof (PRD §6, §15) — the JISA publication.
 *
 * A DOI rather than a publisher link: DOIs are the stable identifier for a
 * paper and survive the publisher moving or re-platforming the article.
 */
export const PUBLICATION_URL = 'https://doi.org/10.1016/j.jisa.2026.104422';

/**
 * Research identity (PRD §6, §9.8) — the ORCID record.
 *
 * An ORCID iD is only meaningful if it is the right one: a mistyped digit
 * resolves to a real record belonging to another researcher. This iD is
 * confirmed against its own public record, whose sole work carries exactly the
 * DOI in `PUBLICATION_URL` above.
 */
export const ORCID_URL = 'https://orcid.org/0009-0001-8072-0977';
