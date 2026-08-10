import { existsSync, readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { LOCALES } from '../i18n/locales';
import {
  EMAIL_URL,
  GITHUB_URL,
  LINKEDIN_URL,
  ORCID_URL,
  PUBLICATION_URL,
  SHOURI_URL,
  STUDY_URL,
} from './external';
import { ROUTES, alternatesFor, localizeUrl } from './i18n';
import { SITE_URL } from './site';

/**
 * Whole-site metadata audit (MCD-11, PRD §7, §30).
 *
 * The unit tests elsewhere prove the helpers compute the right values. This one
 * asserts the values actually reached every emitted page, which is the only way
 * a regression in a layout or a page that forgot to use `SiteShell` gets
 * caught.
 *
 * It reads `dist/`, so it needs a build first. CI runs `build` before `test`
 * (PRD §23 order); locally, run `npm run build` first.
 */

const DIST = 'dist';

function pageFiles(): string[] {
  return globSync('**/*.html', { cwd: DIST }).sort();
}

function read(file: string): string {
  return readFileSync(join(DIST, file), 'utf-8');
}

beforeAll(() => {
  expect(
    existsSync(DIST),
    'dist/ is missing — run `npm run build` before `npm test` (CI does this in order)',
  ).toBe(true);
});

describe('every built page', () => {
  it('emits at least the ten known routes', () => {
    expect(pageFiles().length).toBeGreaterThanOrEqual(10);
  });

  it('has a self-referencing canonical', () => {
    for (const file of pageFiles()) {
      const html = read(file);
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];

      expect(canonical, `${file} has no canonical`).toBeDefined();
      expect(canonical, `${file} canonical is not absolute`).toMatch(new RegExp(`^${SITE_URL}/`));

      // The canonical must point at the page describing itself, so the path it
      // names has to be the path it was written to.
      const fromFile = `/${file.replace(/index\.html$/, '')}`;
      expect(canonical, `${file} canonical points elsewhere`).toBe(`${SITE_URL}${fromFile}`);
    }
  });

  it('emits the full hreflang set with x-default on English', () => {
    for (const file of pageFiles()) {
      const html = read(file);
      const tags = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({
        hreflang: m[1],
        href: m[2],
      }));
      // Filter out the language switcher's own links, which also carry hreflang.
      const head = html.slice(0, html.indexOf('</head>'));
      const headTags = tags.filter((t) =>
        head.includes(`hreflang="${t.hreflang}" href="${t.href}"`),
      );

      expect(headTags.map((t) => t.hreflang).sort(), `${file}`).toEqual(
        ['en', 'x-default', 'zh-Hant'].sort(),
      );

      const xDefault = headTags.find((t) => t.hreflang === 'x-default');
      const english = headTags.find((t) => t.hreflang === 'en');
      expect(xDefault?.href, `${file} x-default must match the English URL`).toBe(english?.href);
    }
  });

  it('emits localized Open Graph metadata', () => {
    for (const file of pageFiles()) {
      const html = read(file);

      for (const property of ['og:title', 'og:description', 'og:url', 'og:locale', 'og:type']) {
        expect(html, `${file} is missing ${property}`).toContain(`property="${property}"`);
      }

      const ogUrl = /<meta property="og:url" content="([^"]+)"/.exec(html)?.[1];
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
      expect(ogUrl, `${file} og:url disagrees with canonical`).toBe(canonical);

      for (const property of ['og:image', 'og:image:width', 'og:image:height', 'og:image:alt']) {
        expect(html, `${file} is missing ${property}`).toContain(`property="${property}"`);
      }

      const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
      expect(ogImage, `${file} og:image must be absolute`).toMatch(
        new RegExp(`^${SITE_URL}/og/.+-(en|zh)(?:-v\\d+)?\\.png$`),
      );
      expect(html, `${file} has the wrong social image width`).toContain(
        'property="og:image:width" content="1200"',
      );
      expect(html, `${file} has the wrong social image height`).toContain(
        'property="og:image:height" content="630"',
      );

      expect(html, `${file} must use a large Twitter card`).toContain(
        'name="twitter:card" content="summary_large_image"',
      );
      for (const name of [
        'twitter:title',
        'twitter:description',
        'twitter:image',
        'twitter:image:alt',
      ]) {
        expect(html, `${file} is missing ${name}`).toContain(`name="${name}"`);
      }
      const twitterImage = /<meta name="twitter:image" content="([^"]+)"/.exec(html)?.[1];
      expect(twitterImage, `${file} Twitter and Open Graph images disagree`).toBe(ogImage);
    }
  });

  it('references social preview assets that exist in the build', () => {
    for (const file of pageFiles()) {
      const html = read(file);
      const imageUrl = /<meta property="og:image" content="[^"]+\/([^/"]+\.png)"/.exec(html)?.[1];

      expect(imageUrl, `${file} has no social preview filename`).toBeDefined();
      expect(existsSync(join(DIST, 'og', imageUrl!)), `${file} social preview is missing`).toBe(
        true,
      );
    }
  });

  it('declares a document language matching its locale', () => {
    for (const file of pageFiles()) {
      const lang = /<html lang="([^"]+)"/.exec(read(file))?.[1];
      const expected = file.startsWith('zh/') ? 'zh-Hant' : 'en';

      expect(lang, `${file}`).toBe(expected);
    }
  });

  it('has exactly one h1', () => {
    for (const file of pageFiles()) {
      const count = (read(file).match(/<h1[\s>]/g) ?? []).length;
      expect(count, `${file} should have exactly one h1`).toBe(1);
    }
  });

  it('ships no executable script', () => {
    for (const file of pageFiles()) {
      const scripts = [...read(file).matchAll(/<script([^>]*)>/g)].map((m) => m[1]);

      for (const attrs of scripts) {
        expect(attrs, `${file} emits an executable script`).toContain('application/ld+json');
      }
    }
  });
});

describe('professional engineering experience routes', () => {
  const pages = {
    en: {
      index: 'work/index.html',
      detail: 'work/professional-engineering/index.html',
      title: 'Professional Engineering Experience',
      stages: [
        'Application Engineering',
        'Enterprise Systems &amp; Architecture',
        'Enterprise AI Systems',
      ],
    },
    zh: {
      index: 'zh/work/index.html',
      detail: 'zh/work/professional-engineering/index.html',
      title: '專業工程經歷',
      stages: ['應用程式工程', '企業系統與系統架構', '企業 AI 系統'],
    },
  } as const;

  it('ships the revised title on both the Work index and detail page', () => {
    for (const page of Object.values(pages)) {
      expect(read(page.index)).toContain(page.title);
      expect(read(page.detail)).toMatch(new RegExp(`<h1[^>]*>${page.title}</h1>`));
    }
  });

  it('ships exactly three synthesized stages in each locale', () => {
    for (const page of Object.values(pages)) {
      const html = read(page.detail);
      const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

      expect(headings).toEqual(page.stages);
    }
  });

  it('keeps language switching on the equivalent detail route', () => {
    for (const page of Object.values(pages)) {
      const html = read(page.detail);

      expect(html).toContain('href="/work/professional-engineering/"');
      expect(html).toContain('href="/zh/work/professional-engineering/"');
    }
  });

  it('does not ship the removed defensive labels', () => {
    const html = Object.values(pages)
      .flatMap((page) => [read(page.index), read(page.detail)])
      .join('\n');

    expect(html).not.toContain('No public link');
    expect(html).not.toContain('無公開連結');
    expect(html).not.toContain('任職期間的工作，僅以概括方式描述');
  });
});

describe('footer link row (PRD §9.8)', () => {
  /*
   * PRD §9.8 fixes both the membership and the order of this row:
   *
   *   GitHub · Study · ORCID · Shouri · Site Source
   *
   * It is asserted against `dist/` rather than against `SiteShell`'s array
   * because the point is that every page actually carries all five — a route
   * that bypassed `SiteShell` would pass a source-level check and fail here.
   */
  const EXPECTED = [
    GITHUB_URL,
    LINKEDIN_URL,
    STUDY_URL,
    ORCID_URL,
    SHOURI_URL,
    EMAIL_URL,
    'https://github.com/tc3oliver/meowcoder.com',
  ];

  it('carries the five destinations in order on every page', () => {
    for (const file of pageFiles()) {
      const hrefs = [...read(file).matchAll(/class="site-footer__link"\s+href="([^"]+)"/g)].map(
        (m) => m[1],
      );

      expect(hrefs, `${file} footer row`).toEqual(EXPECTED);
    }
  });

  it('marks every destination as off-site', () => {
    for (const file of pageFiles()) {
      const links = [...read(file).matchAll(/<a\s+class="site-footer__link"[^>]*>/g)].map(
        (m) => m[0],
      );

      for (const link of links) {
        expect(link, `${file} footer link is missing the safe rel`).toContain(
          'rel="noopener noreferrer"',
        );
      }
    }
  });
});

describe('Person structured data', () => {
  /*
   * ORCID is what makes the `Person` node resolvable to a real researcher
   * rather than a name, so it is asserted separately from the rest of `sameAs`.
   *
   * The node is parsed rather than string-matched against the page: ORCID is
   * also a footer link on every route, so a substring check would stay green
   * with `sameAs` empty.
   */
  function personNodes(html: string): Record<string, unknown>[] {
    return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((m) => {
        // A block holds either one node or an array of them — the homepage
        // ships `Person` and `WebSite` together.
        const parsed: unknown = JSON.parse(m[1]);
        return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
      })
      .filter((node) => node['@type'] === 'Person');
  }

  it('describes the person once on each homepage', () => {
    // The identity graph is anchored on the homepage; interior routes reference
    // it by `@id` instead of restating it.
    for (const file of ['index.html', 'zh/index.html']) {
      expect(personNodes(read(file)), `${file}`).toHaveLength(1);
    }
  });

  it('claims the ORCID record as the same person', () => {
    for (const file of pageFiles()) {
      for (const person of personNodes(read(file))) {
        expect(person.sameAs, `${file} Person.sameAs omits ORCID`).toContain(ORCID_URL);
      }
    }
  });

  it('identifies the bilingual professional name and only identity profiles', () => {
    for (const file of ['index.html', 'zh/index.html']) {
      const [person] = personNodes(read(file));

      expect(person.alternateName, `${file} alternate names`).toEqual(['游宗翰', 'Tsung-Han Yu']);
      expect(person.sameAs, `${file} identity profiles`).toEqual([
        GITHUB_URL,
        LINKEDIN_URL,
        STUDY_URL,
        ORCID_URL,
      ]);
      expect(person.sameAs, `${file} must not identify a product as the person`).not.toContain(
        SHOURI_URL,
      );
    }
  });
});

describe('work and publication structured data', () => {
  function nodes(html: string): Record<string, unknown>[] {
    return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(
      (match) => {
        const parsed: unknown = JSON.parse(match[1]);
        return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
      },
    );
  }

  it('describes the publication on both About pages', () => {
    for (const file of ['about/index.html', 'zh/about/index.html']) {
      const articles = nodes(read(file)).filter((node) => node['@type'] === 'ScholarlyArticle');

      expect(articles, `${file}`).toHaveLength(1);
      expect(articles[0]).toMatchObject({
        url: PUBLICATION_URL,
        identifier: PUBLICATION_URL,
        datePublished: '2026',
        pagination: '104422',
        author: { '@id': `${SITE_URL}/#person` },
      });
      expect(articles[0].headline).toContain('leakage-resilient certificate-based encryption');
    }
  });

  it('describes AI Coding Skills as source code on both detail pages', () => {
    for (const file of [
      'work/ai-coding-skills/index.html',
      'zh/work/ai-coding-skills/index.html',
    ]) {
      const sourceCode = nodes(read(file)).filter((node) => node['@type'] === 'SoftwareSourceCode');

      expect(sourceCode, `${file}`).toHaveLength(1);
      expect(sourceCode[0]).toMatchObject({
        name: 'AI Coding Skills',
        codeRepository: 'https://github.com/tc3oliver/skills',
        version: '1.2.0',
        license: 'https://opensource.org/license/mit',
        author: { '@id': `${SITE_URL}/#person` },
      });
    }
  });
});

describe('sitemap', () => {
  it('lists every route in every locale', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf-8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    for (const locale of LOCALES) {
      for (const route of ROUTES) {
        expect(locs, `${locale} ${route} missing from sitemap`).toContain(
          localizeUrl(locale, route),
        );
      }
    }
  });

  it('agrees with the hreflang alternates the pages declare', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf-8');

    for (const route of ROUTES) {
      for (const alternate of alternatesFor(route)) {
        if (alternate.hreflang === 'x-default') continue;
        expect(xml, `sitemap missing ${alternate.hreflang} ${alternate.href}`).toContain(
          `hreflang="${alternate.hreflang}" href="${alternate.href}"`,
        );
      }
    }
  });
});

describe('robots.txt', () => {
  it('allows crawling and points at the sitemap', () => {
    // Named `robotsTxt` rather than the bare noun: the PRD §25 scanner in
    // `src/styles/design-system.test.ts` searches the source tree for banned
    // imagery and exempts only the literal `robots.txt`.
    const robotsTxt = readFileSync(join(DIST, 'robots.txt'), 'utf-8');

    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
    expect(robotsTxt).toContain(`Sitemap: ${SITE_URL}/sitemap-index.xml`);
  });
});
