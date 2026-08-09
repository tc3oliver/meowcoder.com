/**
 * The favicon has to survive an XML parser (MCD-28).
 *
 * An SVG referenced by `<link rel="icon">` is fetched and parsed as strict XML,
 * not as HTML. That distinction has teeth: the HTML parser recovers from almost
 * anything, while the XML parser rejects the whole document on the first
 * malformed token and the browser then draws no icon at all. The failure is
 * silent from every angle that is easy to check — the file still returns 200
 * with `image/svg+xml`, the `<link>` is still in the markup, and the asset still
 * opens fine from an editor, because editors are lenient too.
 *
 * This site shipped exactly that bug. A comment inside the icon referenced two
 * CSS custom properties by their real names, and a custom property name opens
 * with a double hyphen, which XML does not permit inside a comment. The icon
 * never rendered, in any browser, from the day it was added.
 *
 * So the assertion is the parse itself, run with the same parser the RSS
 * pipeline uses. Prose in the file explaining the rule is not enough; the rule
 * is violated by writing the thing the prose is about.
 */

import { readFileSync } from 'node:fs';

import { parseXml, XmlElement } from '@rgrove/parse-xml';
import { describe, expect, it } from 'vitest';

import FAVICON from '../../public/favicon.svg?raw';
import BASE_LAYOUT from '../layouts/BaseLayout.astro?raw';
import HEADER from '../components/Header.astro?raw';

const FAVICON_ICO = readFileSync('public/favicon.ico');
const APPLE_TOUCH_ICON = readFileSync('public/apple-touch-icon.png');

describe('favicon.svg', () => {
  it('is well-formed XML', () => {
    expect(() => parseXml(FAVICON)).not.toThrow();
  });

  it('has no double hyphen inside a comment', () => {
    /*
     * The parse above already covers this, but only as an opaque "invalid
     * token" at some line and column. Naming the specific trap means a future
     * edit that reintroduces it gets told what it did, not just where.
     */
    for (const comment of FAVICON.matchAll(/<!--([\s\S]*?)-->/g)) {
      expect(comment[1], `illegal "--" in comment: ${comment[0].slice(0, 80)}`).not.toContain('--');
    }
  });

  it('is an svg element with a viewBox', () => {
    const root = parseXml(FAVICON).root;

    expect(root).toBeInstanceOf(XmlElement);
    expect((root as XmlElement).name).toBe('svg');
    expect((root as XmlElement).attributes.viewBox).toBeTruthy();
  });

  it('is declared after the ICO fallback', () => {
    expect(BASE_LAYOUT).toContain('<link rel="icon" href="/favicon.ico" sizes="32x32" />');
    expect(BASE_LAYOUT).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />');
    expect(BASE_LAYOUT.indexOf('href="/favicon.ico"')).toBeLessThan(
      BASE_LAYOUT.indexOf('href="/favicon.svg"'),
    );
  });

  it('is reused as the decorative mark beside the header brand', () => {
    expect(HEADER).toContain('<img src="/favicon.svg" alt="" width="20" height="20" />');
  });
});

describe('raster favicon fallbacks', () => {
  it('provides a 32px PNG-backed ICO', () => {
    expect(FAVICON_ICO.readUInt16LE(0)).toBe(0);
    expect(FAVICON_ICO.readUInt16LE(2)).toBe(1);
    expect(FAVICON_ICO.readUInt16LE(4)).toBe(1);
    expect(FAVICON_ICO[6]).toBe(32);
    expect(FAVICON_ICO[7]).toBe(32);

    const imageOffset = FAVICON_ICO.readUInt32LE(18);
    expect(FAVICON_ICO.subarray(imageOffset, imageOffset + 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  });

  it('provides a 180x180 Apple touch icon', () => {
    expect(APPLE_TOUCH_ICON.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    expect(APPLE_TOUCH_ICON.readUInt32BE(16)).toBe(180);
    expect(APPLE_TOUCH_ICON.readUInt32BE(20)).toBe(180);
    expect(BASE_LAYOUT).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
  });
});
