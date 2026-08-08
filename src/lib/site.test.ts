import { describe, expect, it } from 'vitest';

import { absoluteUrl, SITE_URL } from './site';

describe('absoluteUrl', () => {
  it('prefixes a root-relative path with the site origin', () => {
    expect(absoluteUrl('/work')).toBe(`${SITE_URL}/work`);
  });

  it('normalizes a path that is missing its leading slash', () => {
    expect(absoluteUrl('zh/about')).toBe(`${SITE_URL}/zh/about`);
  });

  it('returns the origin itself for the site root', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
  });
});
