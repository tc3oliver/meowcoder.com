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
  DEFAULT_POST_LIMIT,
  getStudyPosts,
  localizedTitle,
  parseStudyFeed,
  STUDY_FEED_URL,
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
  it('returns the latest five posts by default', () => {
    // PRD §9.6 asks for 3-5; the fixture holds 6, so the cut is observable.
    expect(DEFAULT_POST_LIMIT).toBe(5);
  });

  it('limits a six-item feed to the default five', async () => {
    const feed = await getStudyPosts({ fetchImpl: fetchReturning(RSS_FEED), feedUrl: 'a' });

    expect(feed.ok).toBe(true);
    expect(feed.posts).toHaveLength(5);
    expect(feed.reason).toBeUndefined();
  });

  it('honours an explicit limit', async () => {
    const feed = await getStudyPosts({
      limit: 3,
      fetchImpl: fetchReturning(RSS_FEED),
      feedUrl: 'b',
    });

    expect(feed.posts).toHaveLength(3);
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

    const five = await getStudyPosts({ fetchImpl, feedUrl: 'd' });
    const three = await getStudyPosts({ limit: 3, fetchImpl, feedUrl: 'd' });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(three.posts).toEqual(five.posts.slice(0, 3));
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
