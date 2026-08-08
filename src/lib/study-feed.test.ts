/**
 * Study feed guarantees (MCD-9).
 *
 * Two properties carry the task and neither is visible by reading the module:
 *
 *   1. the parse path turns a real Study feed into exactly the four fields the
 *      homepage may show — and no article body (PRD §9.6);
 *   2. the failure path degrades instead of throwing, because PRD §28 makes a
 *      broken feed a normal build condition rather than an error.
 *
 * The failure cases are the reason this file exists. A parser is easy to check
 * by eye; "the build still succeeds with no network" is not, and it regresses
 * silently the moment someone adds a `throw`.
 *
 * Fixtures are pulled in as raw text through Vite for the reason
 * `src/styles/design-system.test.ts` gives: the project carries no
 * `@types/node`, so a filesystem read would not compile.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import ATOM_FEED from './__fixtures__/study-atom.xml?raw';
import RSS_FEED from './__fixtures__/study-rss.xml?raw';
import { STUDY_URL } from './external';
import {
  clearStudyFeedCache,
  CURATED_TITLES,
  DEFAULT_POST_LIMIT,
  getStudyPosts,
  localizedTitle,
  parseStudyFeed,
  resolveTitle,
  STUDY_FEED_URL,
  type CuratedTitles,
} from './study-feed';

/** A fetch that answers every request with one canned response. */
function fetchReturning(body: string, init: ResponseInit = {}) {
  return vi.fn<typeof fetch>(async () => new Response(body, { status: 200, ...init }));
}

const EMPTY_RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>Empty</title></channel></rss>`;

afterEach(() => {
  // The module memoizes one read per feed URL; without this, the first case to
  // touch a URL would decide the answer for every later case.
  clearStudyFeedCache();
  vi.restoreAllMocks();
});

describe('parseStudyFeed, RSS 2.0', () => {
  it('reads every item in a real Study feed excerpt', () => {
    expect(parseStudyFeed(RSS_FEED)).toHaveLength(6);
  });

  it('orders posts newest first rather than trusting feed order', () => {
    // The fixture's items are deliberately scrambled. Sorting by date is what
    // makes "the latest 3-5 posts" (PRD §9.6) true even if Study ever pins an
    // older post to the top of its feed.
    const dates = parseStudyFeed(RSS_FEED).map((post) => post.date);

    expect(dates).toEqual([...dates].sort().reverse());
    expect(dates[0]).toBe('2026-08-07T16:50:00.000Z');
    expect(dates.at(-1)).toBe('2026-06-01T00:00:00.000Z');
  });

  it('re-anchors links off the upstream localhost origin', () => {
    // Study publishes every <link> as http://localhost:9996/... . Left alone,
    // the homepage would ship links to localhost.
    for (const post of parseStudyFeed(RSS_FEED)) {
      expect(post.url.startsWith(`${STUDY_URL}/posts/`)).toBe(true);
      expect(post.url).not.toContain('localhost');
    }
  });

  it('preserves the path while replacing the origin', () => {
    expect(parseStudyFeed(RSS_FEED)[0]?.url).toBe(
      `${STUDY_URL}/posts/260808-deepseek-v4-flash-post-training-moat/`,
    );
  });

  it('carries no article body', () => {
    // PRD §9.6 keeps Study the canonical publication platform: this site shows
    // date, category, and title, and never reproduces the article. Asserting
    // the exact key set means a future "excerpt" field cannot slip in quietly.
    expect(Object.keys(parseStudyFeed(RSS_FEED)[0] ?? {}).sort()).toEqual([
      'date',
      'title',
      'titleByLocale',
      'titleLocale',
      'url',
    ]);
  });

  it('leaves category unset when the feed declares none', () => {
    // Today's Hugo feed emits no <category>. MCD-4 must therefore treat the
    // category line as optional rather than assume PRD §9.6's three-line shape.
    for (const post of parseStudyFeed(RSS_FEED)) {
      expect(post.category).toBeUndefined();
    }
  });

  it('files titles under zh from the channel language', () => {
    const [first] = parseStudyFeed(RSS_FEED);

    expect(first?.title).toBe('下一代 AI Lab 的護城河，可能不是模型架構');
    expect(first?.titleByLocale).toEqual({ zh: '下一代 AI Lab 的護城河，可能不是模型架構' });
  });

  it('records the language the original title is written in', () => {
    // The v5 brief §9 asks the English homepage to mark Chinese titles as
    // Chinese. That mark is only defensible if the feed said so, and here it
    // did — via the channel <language>.
    for (const post of parseStudyFeed(RSS_FEED)) {
      expect(post.titleLocale).toBe('zh');
    }
  });

  it('leaves the title language unset when the feed declares none', () => {
    // Silence is not English. An undeclared language stays unknown so that
    // nothing downstream badges a guess.
    const unlabelled = `<?xml version="1.0"?><rss version="2.0"><channel>
      <item><title>Kept</title><link>/posts/kept/</link>
        <pubDate>Sat, 08 Aug 2026 00:00:00 +0000</pubDate></item>
    </channel></rss>`;

    const [post] = parseStudyFeed(unlabelled);

    expect(post?.titleLocale).toBeUndefined();
    expect(post?.titleByLocale).toEqual({});
  });
});

describe('parseStudyFeed, Atom', () => {
  it('parses the second feed dialect', () => {
    // Study emits RSS today. Atom support is what keeps a change of static
    // site generator from silently emptying the homepage section.
    expect(parseStudyFeed(ATOM_FEED)).toHaveLength(2);
  });

  it('prefers the publication date over the later update', () => {
    expect(parseStudyFeed(ATOM_FEED)[1]?.date).toBe('2026-06-17T00:00:00.000Z');
  });

  it('falls back to updated when an entry has no published date', () => {
    expect(parseStudyFeed(ATOM_FEED)[0]?.date).toBe('2026-07-02T10:00:00.000Z');
  });

  it('drops an entry with no date at all', () => {
    // Undated entries cannot be ordered as "latest" or rendered on the date
    // line, so they are omitted rather than shown with a blank.
    const titles = parseStudyFeed(ATOM_FEED).map((post) => post.title);

    expect(titles).not.toContain('Undated draft that must not be published');
  });

  it('reads categories from attributes, preferring the human label', () => {
    expect(parseStudyFeed(ATOM_FEED)[1]?.category).toBe('AI Agents');
    expect(parseStudyFeed(ATOM_FEED)[0]?.category).toBe('mcp');
  });

  it('follows the alternate link and resolves it against the Study origin', () => {
    expect(parseStudyFeed(ATOM_FEED)[1]?.url).toBe(`${STUDY_URL}/posts/strategy-guided-agent/`);
  });

  it('indexes a per-title xml:lang as bilingual metadata', () => {
    // PRD §28: "If Study later supports bilingual metadata, the homepage may
    // consume localized titles directly." This is that path, already wired.
    expect(parseStudyFeed(ATOM_FEED)[1]?.titleByLocale).toEqual({
      zh: '從 Reactive Agent 到 Strategy-Guided Agent',
      en: 'From Reactive Agent to Strategy-Guided Agent',
    });
  });
});

describe('localizedTitle', () => {
  it('shows the original title in English when Study has no English one', () => {
    // PRD §7: show the original article title, and never machine-translate at
    // runtime. The fallback below is the entire mechanism — there is no
    // translation step anywhere in the module.
    const [chineseOnly] = parseStudyFeed(RSS_FEED);

    expect(chineseOnly && localizedTitle(chineseOnly, 'en')).toBe(
      '下一代 AI Lab 的護城河，可能不是模型架構',
    );
  });

  it('shows Study content naturally in Chinese', () => {
    const [chineseOnly] = parseStudyFeed(RSS_FEED);

    expect(chineseOnly && localizedTitle(chineseOnly, 'zh')).toBe(chineseOnly?.title);
  });

  it('uses a published English title when one exists', () => {
    const bilingual = parseStudyFeed(ATOM_FEED)[1];

    expect(bilingual && localizedTitle(bilingual, 'en')).toBe(
      'From Reactive Agent to Strategy-Guided Agent',
    );
    expect(bilingual && localizedTitle(bilingual, 'zh')).toBe(
      '從 Reactive Agent 到 Strategy-Guided Agent',
    );
  });
});

/** The Chinese-only post the English homepage has to cope with. */
function chineseOnlyPost() {
  const [post] = parseStudyFeed(RSS_FEED);
  if (!post) throw new Error('fixture regression: the RSS fixture has no posts');
  return post;
}

/** The one fixture entry that publishes both languages itself. */
function bilingualPost() {
  const post = parseStudyFeed(ATOM_FEED)[1];
  if (!post) throw new Error('fixture regression: the Atom fixture lost its bilingual entry');
  return post;
}

describe('CURATED_TITLES', () => {
  it('ships empty, so no post is silently retitled', () => {
    // The override is a curation surface, not a translation table (PRD §7).
    // Shipping it empty is what keeps the default behaviour "show what Study
    // published" rather than "show whatever someone once typed here".
    expect(CURATED_TITLES).toEqual({});
  });

  it('changes nothing while it is empty', () => {
    // The regression guard for the whole feature: with no entries curated, every
    // title resolves exactly as it did before the override existed.
    for (const post of [...parseStudyFeed(RSS_FEED), ...parseStudyFeed(ATOM_FEED)]) {
      for (const locale of ['en', 'zh'] as const) {
        expect(localizedTitle(post, locale)).toBe(post.titleByLocale[locale] ?? post.title);
        expect(localizedTitle(post, locale, {})).toBe(localizedTitle(post, locale));
      }
    }
  });
});

describe('resolveTitle, curated overrides', () => {
  it('prefers a curated title over the original', () => {
    // The v5 brief §9 case: a person read the article and wrote an English
    // title for it, so the English page stops showing Chinese.
    const post = chineseOnlyPost();
    const curated: CuratedTitles = {
      [post.url]: { en: "The next AI lab's moat may not be model architecture" },
    };

    expect(resolveTitle(post, 'en', curated)).toEqual({
      text: "The next AI lab's moat may not be model architecture",
      locale: 'en',
      isForeignLanguage: false,
    });
  });

  it('prefers a curated title over one the feed declared', () => {
    // Curation is the top of the precedence order, not a fallback below the
    // feed: a hand-written title is the more deliberate of the two.
    const post = bilingualPost();
    const curated: CuratedTitles = { [post.url]: { en: 'Strategy-Guided Agents, curated' } };

    expect(localizedTitle(post, 'en', curated)).toBe('Strategy-Guided Agents, curated');
    expect(localizedTitle(post, 'zh', curated)).toBe('從 Reactive Agent 到 Strategy-Guided Agent');
  });

  it('curates one locale without disturbing the other', () => {
    const post = chineseOnlyPost();
    const curated: CuratedTitles = { [post.url]: { en: 'An English display title' } };

    expect(localizedTitle(post, 'zh', curated)).toBe(post.title);
  });

  it('falls back to the original when this post is not curated', () => {
    // A map covering some posts must leave the rest exactly as they were.
    const curated: CuratedTitles = {
      'https://study.meowcoder.com/posts/some-other-post/': { en: 'Unrelated' },
    };
    const post = chineseOnlyPost();

    expect(localizedTitle(post, 'en', curated)).toBe(post.title);
  });

  it('falls back when the post is curated in the other locale only', () => {
    const post = chineseOnlyPost();
    const curated: CuratedTitles = { [post.url]: { zh: '中文覆寫' } };

    expect(localizedTitle(post, 'en', curated)).toBe(post.title);
  });

  it('ignores an entry whose URL matches no post', () => {
    // Curated entries outlive the posts they name; a stale one must be inert
    // rather than an error, so nobody has to prune the map to keep builds green.
    const curated: CuratedTitles = { 'https://study.meowcoder.com/posts/gone/': { en: 'Gone' } };

    expect(parseStudyFeed(RSS_FEED).map((post) => localizedTitle(post, 'en', curated))).toEqual(
      parseStudyFeed(RSS_FEED).map((post) => post.title),
    );
  });
});

describe('resolveTitle, language of the rendered title', () => {
  it('reports a Chinese title shown on an English page as foreign', () => {
    // This is what earns the language badge in MCD-20: the text really is
    // Chinese, and the feed said so.
    expect(resolveTitle(chineseOnlyPost(), 'en')).toEqual({
      text: '下一代 AI Lab 的護城河，可能不是模型架構',
      locale: 'zh',
      isForeignLanguage: true,
    });
  });

  it('reports the same title on the Chinese page as native', () => {
    expect(resolveTitle(chineseOnlyPost(), 'zh')).toMatchObject({
      locale: 'zh',
      isForeignLanguage: false,
    });
  });

  it('reports a feed-declared English title as native English', () => {
    expect(resolveTitle(bilingualPost(), 'en')).toEqual({
      text: 'From Reactive Agent to Strategy-Guided Agent',
      locale: 'en',
      isForeignLanguage: false,
    });
  });

  it('claims no language when the feed declared none', () => {
    // Unknown is not foreign. Badging on a guess would be worse than not
    // badging, so the flag stays false and the locale stays absent.
    const unlabelled = `<?xml version="1.0"?><rss version="2.0"><channel>
      <item><title>Untagged title</title><link>/posts/untagged/</link>
        <pubDate>Sat, 08 Aug 2026 00:00:00 +0000</pubDate></item>
    </channel></rss>`;
    const [post] = parseStudyFeed(unlabelled);

    expect(post && resolveTitle(post, 'en')).toEqual({
      text: 'Untagged title',
      isForeignLanguage: false,
    });
  });

  it('gives localizedTitle the same text it resolves', () => {
    // `localizedTitle` is the text half of `resolveTitle`; WritingSection.astro
    // still calls it with two arguments and must keep seeing the same string.
    for (const post of [...parseStudyFeed(RSS_FEED), ...parseStudyFeed(ATOM_FEED)]) {
      for (const locale of ['en', 'zh'] as const) {
        expect(localizedTitle(post, locale)).toBe(resolveTitle(post, locale).text);
      }
    }
  });
});

describe('parseStudyFeed, unusable input', () => {
  it('rejects malformed XML', () => {
    expect(() => parseStudyFeed('<rss><channel><item></rss>')).toThrow();
  });

  it('rejects a document that is not a feed', () => {
    // A captive-portal or error page answering with 200 is the realistic case.
    expect(() => parseStudyFeed('<html><body>Not a feed</body></html>')).toThrow(/root element/);
  });

  it('rejects an empty body', () => {
    expect(() => parseStudyFeed('')).toThrow();
  });

  it('skips an item that has no usable title or link', () => {
    const partial = `<?xml version="1.0"?><rss version="2.0"><channel>
      <item><pubDate>Sat, 08 Aug 2026 00:00:00 +0000</pubDate></item>
      <item><title>Kept</title><link>/posts/kept/</link>
        <pubDate>Sat, 08 Aug 2026 00:00:00 +0000</pubDate></item>
    </channel></rss>`;

    expect(parseStudyFeed(partial).map((post) => post.title)).toEqual(['Kept']);
  });
});

describe('getStudyPosts, feed reachable', () => {
  it('returns the latest three posts by default', () => {
    // The v5 brief §9 narrows PRD §9.6's 3-5 to exactly 3; the fixture holds 6,
    // so the cut is observable.
    expect(DEFAULT_POST_LIMIT).toBe(3);
  });

  it('limits a six-item feed to the default three', async () => {
    const feed = await getStudyPosts({ fetchImpl: fetchReturning(RSS_FEED), feedUrl: 'a' });

    expect(feed.ok).toBe(true);
    expect(feed.posts).toHaveLength(3);
    expect(feed.reason).toBeUndefined();
  });

  it('honours an explicit limit above the default', async () => {
    const feed = await getStudyPosts({
      limit: 5,
      fetchImpl: fetchReturning(RSS_FEED),
      feedUrl: 'b',
    });

    expect(feed.posts).toHaveLength(5);
  });

  it('requests the Study feed derived from the ecosystem constant', async () => {
    const fetchImpl = fetchReturning(RSS_FEED);
    await getStudyPosts({ fetchImpl });

    expect(STUDY_FEED_URL).toBe(`${STUDY_URL}/index.xml`);
    expect(fetchImpl).toHaveBeenCalledWith(STUDY_FEED_URL, expect.anything());
  });

  it('fetches once however many pages ask (PRD §28 caching)', async () => {
    // The English and Chinese homepages both render this section. Without the
    // memo that is two requests to Study per build.
    const fetchImpl = fetchReturning(RSS_FEED);

    const [english, chinese] = await Promise.all([
      getStudyPosts({ fetchImpl, feedUrl: 'c' }),
      getStudyPosts({ fetchImpl, feedUrl: 'c' }),
    ]);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(english.posts).toEqual(chinese.posts);
  });

  it('lets two consumers share one read at different lengths', async () => {
    const fetchImpl = fetchReturning(RSS_FEED);

    const six = await getStudyPosts({ limit: 6, fetchImpl, feedUrl: 'd' });
    const three = await getStudyPosts({ fetchImpl, feedUrl: 'd' });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(six.posts).toHaveLength(6);
    expect(three.posts).toEqual(six.posts.slice(0, 3));
  });

  it('reports an empty feed as healthy, not as a failure', async () => {
    const feed = await getStudyPosts({ fetchImpl: fetchReturning(EMPTY_RSS), feedUrl: 'e' });

    expect(feed).toEqual({ ok: true, posts: [] });
  });
});

describe('getStudyPosts, feed unreachable', () => {
  /**
   * PRD §28: feed failure must not fail the production build. Every case below
   * asserts the same contract from a different cause — resolve, never reject,
   * and hand the homepage an empty list it can render without error handling.
   */
  const failures: Array<[string, () => Promise<Response>]> = [
    [
      'the host does not resolve',
      () => Promise.reject(new TypeError('fetch failed: getaddrinfo ENOTFOUND')),
    ],
    ['the request times out', () => Promise.reject(new DOMException('aborted', 'TimeoutError'))],
    [
      'the connection is refused',
      () => Promise.reject(new TypeError('fetch failed: ECONNREFUSED')),
    ],
  ];

  it.each(failures)('degrades when %s', async (_cause, impl) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchImpl = vi.fn(impl);

    const feed = await getStudyPosts({ fetchImpl, feedUrl: `fail-${_cause}` });

    expect(feed.ok).toBe(false);
    expect(feed.posts).toEqual([]);
    expect(feed.reason).toBeTruthy();
  });

  it.each([404, 500, 503])('degrades on HTTP %i', async (status) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const feed = await getStudyPosts({
      fetchImpl: fetchReturning('', { status }),
      feedUrl: `status-${status}`,
    });

    expect(feed).toMatchObject({ ok: false, posts: [] });
    expect(feed.reason).toContain(`HTTP ${status}`);
  });

  it('degrades when the response is not a feed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const feed = await getStudyPosts({
      fetchImpl: fetchReturning('<html><body>portal</body></html>'),
      feedUrl: 'portal',
    });

    expect(feed.ok).toBe(false);
    expect(feed.posts).toEqual([]);
  });

  it('degrades when the XML is malformed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const feed = await getStudyPosts({
      fetchImpl: fetchReturning('<rss><channel><item></rss>'),
      feedUrl: 'malformed',
    });

    expect(feed.ok).toBe(false);
    expect(feed.posts).toEqual([]);
  });

  it('never rejects, whatever the cause', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchImpl = vi.fn(() => Promise.reject(new Error('boom')));

    // `.resolves` is the assertion: a rejection here is a failed build.
    await expect(getStudyPosts({ fetchImpl, feedUrl: 'boom' })).resolves.toMatchObject({
      ok: false,
      posts: [],
    });
  });

  it('warns once per read rather than once per page', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchImpl = vi.fn(() => Promise.reject(new Error('offline')));

    await getStudyPosts({ fetchImpl, feedUrl: 'quiet' });
    await getStudyPosts({ fetchImpl, feedUrl: 'quiet' });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('degraded');
  });

  it('warns rather than errors, so CI logs stay honest about severity', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await getStudyPosts({
      fetchImpl: vi.fn(() => Promise.reject(new Error('offline'))),
      feedUrl: 'severity',
    });

    expect(warn).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
