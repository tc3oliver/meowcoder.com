/**
 * Site-wide constants and URL helpers.
 *
 * `absoluteUrl` is the single place that builds absolute URLs, so canonical,
 * hreflang, sitemap, and Open Graph metadata (MCD-3, MCD-11) all agree on one
 * origin and one trailing-slash convention.
 */

export const SITE_URL = 'https://meowcoder.com';

/** Build an absolute site URL from a root-relative path. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
