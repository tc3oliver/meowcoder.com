/**
 * Site-wide constants and URL helpers.
 *
 * `absoluteUrl` is the single place that builds absolute URLs, so canonical,
 * hreflang, sitemap, and Open Graph metadata (MCD-3, MCD-11) all agree on one
 * origin and one trailing-slash convention.
 *
 * The convention is trailing-slash-always for directory routes, matching
 * `trailingSlash: 'always'` and `build.format: 'directory'` in
 * `astro.config.mjs`. File-like paths (`/sitemap.xml`) keep their exact form.
 */

export const SITE_URL = 'https://meowcoder.com';

/**
 * Absolute (`https://…`) or protocol-relative (`//…`) input.
 *
 * A leading `//` is rejected rather than collapsed. `//about` and
 * `//other.example/x` are the same syntax — both mean "authority `about`" /
 * "authority `other.example`" per RFC 3986 — so they cannot be told apart.
 * Throwing catches the `/${locale}/${slug}` empty-locale bug loudly at build
 * time; collapsing would instead turn an external URL into a silently wrong
 * internal one.
 */
const ABSOLUTE_OR_PROTOCOL_RELATIVE = /^([a-z][a-z0-9+.-]*:)?\/\//i;

function normalizePathname(pathname: string): string {
  // Interior duplicate slashes are unambiguous, so collapse them. A *leading*
  // `//` never reaches here — `absoluteUrl` throws on it first.
  const collapsed = `/${pathname}`.replace(/\/{2,}/g, '/');
  if (collapsed === '/') return '/';

  const lastSegment = collapsed.slice(collapsed.lastIndexOf('/') + 1);
  const withoutTrailing = collapsed.replace(/\/+$/, '');

  // A dot in the final segment means a file (`/sitemap.xml`), not a directory.
  return lastSegment.includes('.') ? withoutTrailing : `${withoutTrailing}/`;
}

/**
 * Build an absolute site URL from a site-relative path.
 *
 * @throws {TypeError} if given an absolute or protocol-relative URL, which
 * would otherwise be silently appended to the origin.
 */
export function absoluteUrl(path: string): string {
  const trimmed = path.trim();

  if (ABSOLUTE_OR_PROTOCOL_RELATIVE.test(trimmed)) {
    throw new TypeError(`absoluteUrl expects a site-relative path, received: ${path}`);
  }

  const boundary = trimmed.search(/[?#]/);
  const pathname = boundary === -1 ? trimmed : trimmed.slice(0, boundary);
  const suffix = boundary === -1 ? '' : trimmed.slice(boundary);

  return `${SITE_URL}${normalizePathname(pathname)}${suffix}`;
}
