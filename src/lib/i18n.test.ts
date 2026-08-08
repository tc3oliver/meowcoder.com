import { describe, expect, it } from 'vitest';

import { LOCALES } from '../i18n/locales';
import { SITE_URL } from './site';
import { alternatesFor, localizePath, localizeUrl, ROUTES, switchTargets } from './i18n';

describe('localizePath', () => {
  it('serves the default locale from the bare routes', () => {
    expect(localizePath('en', '/')).toBe('/');
    expect(localizePath('en', '/work')).toBe('/work/');
    expect(localizePath('en', '/about')).toBe('/about/');
  });

  it('prefixes the secondary locale with /zh', () => {
    expect(localizePath('zh', '/')).toBe('/zh/');
    expect(localizePath('zh', '/work')).toBe('/zh/work/');
    expect(localizePath('zh', '/about')).toBe('/zh/about/');
  });

  it('emits one trailing-slash form for every route and locale', () => {
    for (const locale of LOCALES) {
      for (const route of ROUTES) {
        expect(localizePath(locale, route)).toMatch(/\/$/);
      }
    }
  });

  it('never produces a duplicate slash', () => {
    for (const locale of LOCALES) {
      for (const route of ROUTES) {
        expect(localizePath(locale, route)).not.toMatch(/\/\//);
      }
    }
  });
});

describe('localizeUrl', () => {
  it('builds absolute URLs on the canonical origin', () => {
    expect(localizeUrl('en', '/work')).toBe(`${SITE_URL}/work/`);
    expect(localizeUrl('zh', '/work')).toBe(`${SITE_URL}/zh/work/`);
  });
});

describe('alternatesFor', () => {
  it('emits one entry per locale plus x-default', () => {
    const alternates = alternatesFor('/about');

    expect(alternates.map((a) => a.hreflang)).toEqual(['en', 'zh-Hant', 'x-default']);
  });

  it('points x-default at the English URL (PRD §7)', () => {
    for (const route of ROUTES) {
      const alternates = alternatesFor(route);
      const xDefault = alternates.find((a) => a.hreflang === 'x-default');
      const english = alternates.find((a) => a.hreflang === 'en');

      expect(xDefault?.href).toBe(english?.href);
    }
  });

  it('uses zh-Hant rather than a bare zh tag', () => {
    const tags = alternatesFor('/').map((a) => a.hreflang);

    expect(tags).toContain('zh-Hant');
    expect(tags).not.toContain('zh');
  });

  it('gives every alternate an absolute URL', () => {
    for (const route of ROUTES) {
      for (const alternate of alternatesFor(route)) {
        expect(alternate.href.startsWith(`${SITE_URL}/`)).toBe(true);
      }
    }
  });
});

describe('switchTargets', () => {
  it('preserves the current route when switching language (PRD §7)', () => {
    expect(switchTargets('en', '/work')).toEqual([{ locale: 'zh', href: '/zh/work/' }]);
    expect(switchTargets('zh', '/work')).toEqual([{ locale: 'en', href: '/work/' }]);
  });

  it('excludes the current locale', () => {
    for (const locale of LOCALES) {
      for (const route of ROUTES) {
        expect(switchTargets(locale, route).map((t) => t.locale)).not.toContain(locale);
      }
    }
  });

  it('round-trips back to the originating path', () => {
    for (const route of ROUTES) {
      const [toZh] = switchTargets('en', route);
      const [backToEn] = switchTargets('zh', route);

      expect(toZh?.href).toBe(localizePath('zh', route));
      expect(backToEn?.href).toBe(localizePath('en', route));
    }
  });
});
