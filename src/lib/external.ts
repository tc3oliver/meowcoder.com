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

/** The profile's full upstream pull-request record, regenerated weekly from GitHub. */
export const UPSTREAM_PRS_URL = 'https://github.com/tc3oliver#more-oss-contributions';

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

/** SignalForge source repository — the knowledge- and agent-systems proof. */
export const SIGNALFORGE_URL = 'https://github.com/tc3oliver/signalforge';

/** SignalForge's own running instance — the reader, as the pipeline publishes it. */
export const SIGNALFORGE_LIVE_URL = 'https://signal.meowcoder.com';

/** laya-apple source repository — the systems-research proof, with its raw data. */
export const LAYA_APPLE_URL = 'https://github.com/tc3oliver/laya-apple';

/**
 * The long-form write-up of the laya-apple 1.4 → 1.5 research, in Chinese on
 * Study. The English version is an X article, below.
 */
export const LAYA_APPLE_ARTICLE_URL =
  'https://study.meowcoder.com/posts/260927-laya-apple-gpu-ane-concurrency/';

/** The DeepSeek V4 Flash serving baseline on 2× AMD MI300X — the ROCm proof. */
export const MI300X_URL = 'https://github.com/tc3oliver/deepseek-v4-flash-mi300x';

/** The LLM inference research repository — experiments, raw data and figures. */
export const INFERENCE_SYSTEMS_URL = 'https://github.com/tc3oliver/llm-inference-systems';

/**
 * The long-form write-up of the background-recovery experiment, the one whose
 * result the homepage quotes. Published in Chinese only.
 */
export const INFERENCE_SYSTEMS_ARTICLE_URL =
  'https://study.meowcoder.com/posts/260921-canonical-state-debt-recovery/';

/**
 * The English write-up of the laya-apple research, published as an X article.
 * This is the post that carries it: the article's own `x.com/i/article/` URL
 * answers 404 to anything not logged in, which would fail the link check.
 */
export const LAYA_APPLE_ARTICLE_EN_URL = 'https://x.com/oliver_yu9/status/2103930467183706274';
