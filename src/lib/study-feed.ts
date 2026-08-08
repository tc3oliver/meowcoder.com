/**
 * Build-time Study feed (MCD-9, PRD §9.6, §28).
 *
 * `study.meowcoder.com` is the canonical publication platform for technical
 * writing. This module pulls just enough metadata — date, category, title, and
 * the link back — to render the homepage's Technical Writing section (MCD-4).
 * It deliberately never carries article bodies: PRD §9.6 forbids duplicating
 * full articles here, so `<description>` and `<content>` are parsed past and
 * discarded.
 *
 * Everything runs at build time. Nothing here reaches the browser, there is no
 * database or CMS backing the synchronization (PRD §28), and no title is ever
 * machine-translated (PRD §7).
 *
 * ## Which title a page shows
 *
 * {@link resolveTitle} picks one of three, in order:
 *
 *   1. a curated display title for that locale, from {@link CURATED_TITLES} —
 *      hand-written, never generated;
 *   2. the title the feed itself declared for that locale, via `xml:lang`;
 *   3. the title as Study published it.
 *
 * {@link CURATED_TITLES} is empty at rest, so today every English page falls
 * through to step 3 and shows the original Chinese title — which is PRD §7
 * exactly: "show original article title if no English title is available; do
 * not machine-translate article titles at runtime." What is new is that the
 * result says which language it landed in, so the homepage can mark a Chinese
 * title as Chinese (v5 brief §9) rather than presenting it as English.
 *
 * ## Failure is a normal case, not an exception
 *
 * PRD §28 requires that feed failure must not fail the production build, and a
 * clean clone or a CI runner may have no network access at all. So
 * `getStudyPosts` never rejects and never throws: an unreachable host, a
 * timeout, a non-2xx response, or malformed XML all resolve to
 * `{ ok: false, posts: [] }` with a `reason` for the build log. Consumers
 * render from `posts` and need no error handling of their own — an empty array
 * is the documented degraded state, in which MCD-4 should render the
 * "Explore Technical Writing ↗" call to action alone and omit the list.
 *
 * ## Feed discovery
 *
 * The feed lives at `/index.xml` (Hugo's default RSS output). Autodiscovery is
 * not usable: the published site's `<link rel="alternate">` — and every item
 * `<link>` in the feed — carries a misconfigured `http://localhost:9996`
 * origin. `toStudyUrl` therefore re-anchors every entry link onto
 * {@link STUDY_URL}, which is what keeps the homepage from linking to
 * localhost. If Study later fixes its `baseURL`, re-anchoring becomes a no-op.
 */

import { parseXml, XmlElement, type XmlNode } from '@rgrove/parse-xml';

import { LOCALES, type Locale } from '../i18n/locales';
import { STUDY_URL } from './external';

/**
 * The feed address, derived from the ecosystem constant rather than restated,
 * so the Study origin is defined in exactly one place (`./external`).
 *
 * `PUBLIC_STUDY_FEED_URL` in the environment overrides it, so a build can be
 * pointed at a mirror, or at an unreachable address to exercise the degraded
 * path, without editing source. The `PUBLIC_` prefix is Astro's default
 * `envPrefix` and is accurate here — a feed address is public information, and
 * nothing in this module reaches the browser regardless.
 */
export const STUDY_FEED_URL = import.meta.env.PUBLIC_STUDY_FEED_URL ?? `${STUDY_URL}/index.xml`;

/**
 * The v5 brief §9 narrows PRD §9.6's "latest 3–5 posts" to exactly 3: the
 * section now shares a two-column row with Research, and three entries is what
 * balances it.
 */
export const DEFAULT_POST_LIMIT = 3;

/** A hung upstream must not hold the build open indefinitely. */
export const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * One published article, reduced to what the homepage is allowed to show.
 *
 * This is the contract MCD-4 consumes. It has no body field by design
 * (PRD §9.6).
 */
export interface StudyPost {
  /**
   * The title as Study published it, in whatever language Study published it.
   *
   * Always present, so there is always something to render. Prefer
   * {@link localizedTitle} over reading this directly.
   */
  title: string;
  /**
   * The language {@link StudyPost.title} is written in, when the feed says so —
   * from `xml:lang` on the title or the feed's own `<language>`.
   *
   * Absent when the feed declares no language, which is the honest answer: the
   * language is then unknown rather than English. Consumers should not guess
   * from the characters; {@link resolveTitle} reports this onward as
   * `isForeignLanguage: false` so an unlabelled title is never mislabelled.
   */
  titleLocale?: Locale;
  /**
   * Titles indexed by the locale the feed declared them in, via `xml:lang` on
   * the title or the feed's own `<language>`.
   *
   * Today Study publishes Chinese only, so this holds a single `zh` entry. It
   * is the hook PRD §28 anticipates: "If Study later supports bilingual
   * metadata, the homepage may consume localized titles directly."
   */
  titleByLocale: Partial<Record<Locale, string>>;
  /** Absolute canonical URL on {@link STUDY_URL}. */
  url: string;
  /** Publication date as an ISO 8601 instant, ready for `<time datetime>`. */
  date: string;
  /** Present only when the feed declares one; today's feed declares none. */
  category?: string;
}

/**
 * The result of one build-time feed read.
 *
 * `posts` is the only field a consumer needs. `ok` and `reason` exist for
 * build-log diagnostics and for tests that assert on the degraded path — a
 * consumer must not branch on `ok` to decide whether to render, because an
 * empty `posts` is equally possible from a healthy but empty feed.
 */
export interface StudyFeed {
  /** Whether the fetch and parse both succeeded. */
  ok: boolean;
  /** Newest first, at most `limit` entries. Empty when the feed is unusable. */
  posts: StudyPost[];
  /** Why the feed was unusable. Absent when `ok` is true. */
  reason?: string;
}

export interface StudyFeedOptions {
  /** How many posts to return. Defaults to {@link DEFAULT_POST_LIMIT}. */
  limit?: number;
  /** Feed address. Defaults to {@link STUDY_FEED_URL}. */
  feedUrl?: string;
  /** Abort the request after this many ms. Defaults to 10s. */
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global `fetch`. */
  fetchImpl?: typeof fetch;
}

/**
 * Hand-written display titles, keyed by canonical post URL then by locale.
 *
 * Study publishes Chinese-only titles, so the English homepage shows Chinese
 * ones. The v5 brief §9 allows an optional `displayTitleEn` to improve that
 * post by post — a person reads the article and writes an English title for
 * it. Nothing here is generated: PRD §7 forbids machine translation at build
 * time as firmly as at runtime, and an empty map is a perfectly good state.
 *
 * To curate one post, add its {@link StudyPost.url} — the address the homepage
 * already links to, copied verbatim including the trailing slash — and the
 * locales you wrote a title for:
 *
 * ```ts
 * export const CURATED_TITLES: CuratedTitles = {
 *   [`${STUDY_URL}/posts/260808-deepseek-v4-flash-post-training-moat/`]: {
 *     en: "The next AI lab's moat may not be model architecture",
 *   },
 * };
 * ```
 *
 * The URL is the key because it is the one identifier that survives an edited
 * title, and because it is verifiable by hand: paste it into a browser and you
 * see the post you are titling. A key that matches no post is inert — it is
 * never rendered and never an error — so a curated entry outliving its post
 * costs nothing.
 */
export type CuratedTitles = Readonly<Record<string, Partial<Record<Locale, string>>>>;

export const CURATED_TITLES: CuratedTitles = {};

/**
 * A title chosen for one locale, together with what it actually is.
 *
 * The language matters to the presentation layer: the v5 brief §9 asks the
 * English homepage to preserve original Chinese titles and mark them as
 * Chinese. That mark is a decision about the resolved text, not about the
 * post, so it is answered here rather than left for a component to infer.
 */
export interface ResolvedTitle {
  /** The text to render. */
  text: string;
  /** The language `text` is in. Absent when nothing declared one. */
  locale?: Locale;
  /**
   * Whether `text` is in a known language other than the one asked for — the
   * signal for a language badge.
   *
   * False when the language is unknown, so a badge is only ever shown on
   * evidence.
   */
  isForeignLanguage: boolean;
}

/**
 * Resolve the title to show in a given locale, and say what it turned out to
 * be.
 *
 * Precedence is curated override → the title the feed declared for that locale
 * → the original published title. The last step is exactly PRD §7: "show
 * original article title if no English title is available; do not
 * machine-translate article titles at runtime." There is no translation step
 * anywhere in this module — a curated title is written by a person and the
 * fallback is the whole of the rest.
 *
 * `curated` is injectable for the same reason `fetchImpl` is: a test names its
 * own overrides instead of reaching into the shipped constant.
 */
export function resolveTitle(
  post: StudyPost,
  locale: Locale,
  curated: CuratedTitles = CURATED_TITLES,
): ResolvedTitle {
  const override = curated[post.url]?.[locale];
  if (override) return { text: override, locale, isForeignLanguage: false };

  const declared = post.titleByLocale[locale];
  if (declared) return { text: declared, locale, isForeignLanguage: false };

  return {
    text: post.title,
    ...(post.titleLocale ? { locale: post.titleLocale } : {}),
    isForeignLanguage: post.titleLocale !== undefined && post.titleLocale !== locale,
  };
}

/**
 * The title to show in a given locale.
 *
 * The text half of {@link resolveTitle}, for callers with nothing to decide.
 */
export function localizedTitle(
  post: StudyPost,
  locale: Locale,
  curated: CuratedTitles = CURATED_TITLES,
): string {
  return resolveTitle(post, locale, curated).text;
}

/** Element name without its namespace prefix, so `a:entry` matches `entry`. */
function localName(node: XmlNode): string {
  if (!(node instanceof XmlElement)) return '';
  const { name } = node;
  const colon = name.indexOf(':');
  return colon === -1 ? name : name.slice(colon + 1);
}

function childElements(parent: XmlElement, name: string): XmlElement[] {
  return parent.children.filter(
    (node): node is XmlElement => node instanceof XmlElement && localName(node) === name,
  );
}

function firstChild(parent: XmlElement, name: string): XmlElement | undefined {
  return childElements(parent, name)[0];
}

function textOf(parent: XmlElement, name: string): string | undefined {
  const text = firstChild(parent, name)?.text.trim();
  return text ? text : undefined;
}

/**
 * Map a BCP 47 tag onto a site locale.
 *
 * Matches on the primary subtag so `zh-tw`, `zh-Hant`, and `zh` all resolve
 * together, and unknown languages resolve to nothing rather than to a guess.
 */
function toLocale(tag: string | undefined): Locale | undefined {
  const primary = tag?.trim().toLowerCase().split('-')[0];
  return LOCALES.find((locale) => locale === primary);
}

/**
 * Nearest `xml:lang` on the element or an ancestor, per XML's own scoping.
 *
 * The walk stops at the root element rather than at a null parent: the root's
 * parent is the document, which carries no attributes.
 */
function inheritedLang(element: XmlElement): string | undefined {
  for (let node: XmlNode | null = element; node instanceof XmlElement; node = node.parent) {
    const lang = node.attributes['xml:lang'];
    if (lang) return lang;
  }
  return undefined;
}

/**
 * Collect every title the entry publishes, indexed by declared locale.
 *
 * An entry normally has one title. Repeated titles distinguished by
 * `xml:lang` are how a bilingual feed would express itself, and are indexed
 * here so that support arrives with the feed rather than after it.
 *
 * The first title is also the primary one, and its declared language is
 * carried out separately: it is what tells a page rendering the fallback which
 * language it is actually showing.
 */
function collectTitles(
  entry: XmlElement,
  feedLang: string | undefined,
): Pick<StudyPost, 'title' | 'titleLocale' | 'titleByLocale'> | undefined {
  const titleByLocale: Partial<Record<Locale, string>> = {};
  let primary: string | undefined;
  let primaryLocale: Locale | undefined;

  for (const element of childElements(entry, 'title')) {
    const text = element.text.trim();
    if (!text) continue;

    const locale = toLocale(inheritedLang(element) ?? feedLang);

    if (primary === undefined) {
      primary = text;
      primaryLocale = locale;
    }

    if (locale) titleByLocale[locale] ??= text;
  }

  return primary
    ? { title: primary, ...(primaryLocale ? { titleLocale: primaryLocale } : {}), titleByLocale }
    : undefined;
}

/**
 * Re-anchor a feed link onto the canonical Study origin.
 *
 * Every entry in Study's own feed is a Study post, so the path is the only
 * trustworthy part of the published link — see the module note on the
 * misconfigured upstream `baseURL`. Relative links resolve the same way.
 */
function toStudyUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  try {
    const { pathname, search, hash } = new URL(raw, `${STUDY_URL}/`);
    return `${STUDY_URL}${pathname}${search}${hash}`;
  } catch {
    return undefined;
  }
}

/** Entry link: RSS puts it in the text, Atom in a `rel="alternate"` href. */
function entryUrl(entry: XmlElement): string | undefined {
  const links = childElements(entry, 'link');

  const alternate =
    links.find((link) => link.attributes.rel === 'alternate' && link.attributes.href) ??
    links.find((link) => !link.attributes.rel && link.attributes.href);

  return toStudyUrl(alternate?.attributes.href ?? links[0]?.text.trim());
}

/**
 * Normalize a publication date to an ISO instant.
 *
 * `Date.parse` covers both feed dialects natively — RFC 822 for RSS
 * `<pubDate>`, ISO 8601 for Atom `<published>`.
 */
function entryDate(entry: XmlElement): string | undefined {
  const raw = textOf(entry, 'pubDate') ?? textOf(entry, 'published') ?? textOf(entry, 'updated');
  if (!raw) return undefined;

  const time = Date.parse(raw);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

/** Category: RSS uses element text, Atom a `term` attribute. */
function entryCategory(entry: XmlElement): string | undefined {
  const category = firstChild(entry, 'category');
  if (!category) return undefined;

  const value = (category.attributes.label ?? category.attributes.term ?? category.text).trim();
  return value ? value : undefined;
}

function toPost(entry: XmlElement, feedLang: string | undefined): StudyPost | undefined {
  const titles = collectTitles(entry, feedLang);
  const url = entryUrl(entry);
  const date = entryDate(entry);

  // An entry missing any of these cannot be rendered as "Date / Category /
  // Title" or ordered as "latest", so it is dropped rather than shown blank.
  if (!titles || !url || !date) return undefined;

  const category = entryCategory(entry);

  return { ...titles, url, date, ...(category ? { category } : {}) };
}

/**
 * Parse an RSS 2.0 or Atom document into posts, newest first.
 *
 * Exported so the parse path can be tested against fixtures without a network.
 * Unlike {@link getStudyPosts} this throws on input that is not a usable feed;
 * `getStudyPosts` is the layer that turns that into graceful degradation.
 *
 * @throws {Error} if the XML is malformed or is not an RSS/Atom document.
 */
export function parseStudyFeed(xml: string): StudyPost[] {
  const document = parseXml(xml, {
    // A single unrecognized entity should cost one character, not the whole
    // Technical Writing section. Leaving the reference as written keeps the
    // document parseable without inventing a substitution for it.
    resolveUndefinedEntity: (reference) => reference,
  });

  const root = document.root;
  if (!root) throw new Error('feed document is empty');

  const rootName = localName(root);
  if (rootName !== 'rss' && rootName !== 'feed') {
    throw new Error(`unexpected feed root element: <${root.name}>`);
  }

  const container = (rootName === 'rss' ? firstChild(root, 'channel') : undefined) ?? root;
  const entries = [...childElements(container, 'item'), ...childElements(container, 'entry')];

  const feedLang = textOf(container, 'language') ?? inheritedLang(container);

  return (
    entries
      .map((entry) => toPost(entry, feedLang))
      .filter((post): post is StudyPost => post !== undefined)
      // Compare instants, not strings: every date here is already normalized to
      // ISO, so this is exact and free of collation surprises.
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  );
}

/**
 * One in-flight read per feed URL, so the English and Chinese homepages share
 * a single request per build. This is the "cache where practical" of PRD §28:
 * a build is short-lived, so an in-process memo is the whole of it — no store
 * on disk, and nothing that could serve stale posts on a later build.
 */
const reads = new Map<string, Promise<StudyFeed>>();

/** Drop the memoized reads. Tests use this to isolate cases. */
export function clearStudyFeedCache(): void {
  reads.clear();
}

async function readFeed(
  feedUrl: string,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<StudyFeed> {
  try {
    const response = await fetchImpl(feedUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9' },
    });

    if (!response.ok) {
      return degraded(`HTTP ${response.status} from ${feedUrl}`);
    }

    return { ok: true, posts: parseStudyFeed(await response.text()) };
  } catch (error) {
    return degraded(error instanceof Error ? error.message : String(error));
  }
}

/**
 * The degraded result, announced once per read rather than per consumer.
 *
 * A silent empty section would look like Study had simply stopped publishing,
 * so the reason goes to the build log — as a warning, never an error, because
 * the build is meant to carry on (PRD §28).
 */
function degraded(reason: string): StudyFeed {
  console.warn(`[study-feed] Technical Writing section degraded: ${reason}`);
  return { ok: false, posts: [], reason };
}

/**
 * Read the latest Study posts at build time.
 *
 * Never throws and never rejects. See the module note: an unreachable feed
 * resolves to `{ ok: false, posts: [] }` so that `npm run build` succeeds with
 * no network at all (PRD §28).
 */
export async function getStudyPosts(options: StudyFeedOptions = {}): Promise<StudyFeed> {
  const {
    limit = DEFAULT_POST_LIMIT,
    feedUrl = STUDY_FEED_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchImpl = globalThis.fetch,
  } = options;

  let read = reads.get(feedUrl);
  if (!read) {
    read = readFeed(feedUrl, timeoutMs, fetchImpl);
    reads.set(feedUrl, read);
  }

  const feed = await read;

  // Slice per call rather than per read, so two consumers may ask for
  // different counts while still sharing the one request.
  return { ...feed, posts: feed.posts.slice(0, Math.max(0, limit)) };
}
