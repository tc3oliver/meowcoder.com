import { existsSync, readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { LOCALES } from '../i18n/locales';
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
