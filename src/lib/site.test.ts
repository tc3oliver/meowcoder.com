import { describe, expect, it } from 'vitest';

import { absoluteUrl, SITE_URL } from './site';

describe('absoluteUrl', () => {
  it('prefixes a root-relative path with the site origin', () => {
    expect(absoluteUrl('/work')).toBe(`${SITE_URL}/work/`);
  });

  it('normalizes a path that is missing its leading slash', () => {
    expect(absoluteUrl('zh/about')).toBe(`${SITE_URL}/zh/about/`);
  });

  it('returns the origin itself for the site root', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
    expect(absoluteUrl('')).toBe(`${SITE_URL}/`);
  });

  it('produces one trailing-slash form regardless of input', () => {
    expect(absoluteUrl('/work')).toBe(absoluteUrl('/work/'));
  });

  it('collapses interior duplicate slashes', () => {
    expect(absoluteUrl('/work//shouri')).toBe(`${SITE_URL}/work/shouri/`);
    expect(absoluteUrl('/zh///about')).toBe(`${SITE_URL}/zh/about/`);
  });

  it('throws on a leading double slash instead of guessing', () => {
    // `/${locale}/${slug}` with an empty locale yields `//about`, which is
    // syntactically a protocol-relative URL. Fail the build rather than emit a
    // wrong canonical URL on every page.
    const locale = '';
    expect(() => absoluteUrl(`/${locale}/about`)).toThrow(TypeError);
    expect(() => absoluteUrl('//')).toThrow(TypeError);
  });

  it('leaves file-like paths without a trailing slash', () => {
    expect(absoluteUrl('/sitemap.xml')).toBe(`${SITE_URL}/sitemap.xml`);
    expect(absoluteUrl('/robots.txt')).toBe(`${SITE_URL}/robots.txt`);
  });

  it('preserves query strings and fragments after the normalized path', () => {
    expect(absoluteUrl('/work?lang=en')).toBe(`${SITE_URL}/work/?lang=en`);
    expect(absoluteUrl('/about#principles')).toBe(`${SITE_URL}/about/#principles`);
  });

  it('trims surrounding whitespace', () => {
    expect(absoluteUrl('  /work  ')).toBe(`${SITE_URL}/work/`);
  });

  it('rejects absolute and protocol-relative URLs instead of nesting them', () => {
    expect(() => absoluteUrl('https://other.example/x')).toThrow(TypeError);
    expect(() => absoluteUrl('//other.example/x')).toThrow(TypeError);
  });
});
