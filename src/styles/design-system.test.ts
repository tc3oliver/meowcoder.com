/**
 * Design system guarantees (MCD-2).
 *
 * The visual result of a stylesheet is judged by eye, but three of its
 * properties are not judgement calls — they are arithmetic or a text search,
 * and a reviewer cannot check them reliably by reading hex codes:
 *
 *   1. every semantic color pair clears WCAG AA (PRD §29);
 *   2. the shell widths stay inside the ranges PRD §25 fixes;
 *   3. none of the visual elements PRD §25 forbids appear in the source.
 *
 * Computing them here means editing a token re-derives the answer instead of
 * re-asserting the comment next to it.
 */

import { describe, expect, it } from 'vitest';

import GLOBAL_CSS from './global.css?raw';
import TOKENS_CSS from './tokens.css?raw';

/**
 * Sources are pulled in as raw text through Vite rather than `node:fs`. The
 * project typechecks with `astro check` and carries no `@types/node`, so a
 * filesystem read would not compile; `?raw` also means a moved file breaks the
 * import instead of silently emptying the scan below.
 */
const SOURCES = import.meta.glob<string>('../**/*.{astro,css,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/* -------------------------------------------------------------------------
 * Color math — WCAG 2.2 relative luminance and contrast ratio
 * ---------------------------------------------------------------------- */

function channels(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const expand = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  return [0, 2, 4].map((i) => parseInt(expand.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* -------------------------------------------------------------------------
 * Token extraction
 *
 * Each themed color is declared once as `light-dark(<light>, <dark>)`, so one
 * pass yields both palettes and neither can drift out of test coverage.
 * ---------------------------------------------------------------------- */

type Theme = Record<string, string>;

function readThemes(css: string): { light: Theme; dark: Theme } {
  const pattern = /--([\w-]+):\s*light-dark\(\s*(#[0-9a-f]{3,8})\s*,\s*(#[0-9a-f]{3,8})\s*\)/gi;
  const light: Theme = {};
  const dark: Theme = {};

  for (const [, name, lightValue, darkValue] of css.matchAll(pattern)) {
    light[name] = lightValue;
    dark[name] = darkValue;
  }

  return { light, dark };
}

const themes = readThemes(TOKENS_CSS);

/** Text needs 4.5:1; focus rings and control boundaries need 3:1 (WCAG 1.4.11). */
const CONTRAST_REQUIREMENTS: ReadonlyArray<[foreground: string, background: string, min: number]> =
  [
    ['color-text', 'color-bg', 4.5],
    ['color-text', 'color-surface', 4.5],
    ['color-text', 'color-surface-subtle', 4.5],
    ['color-text-muted', 'color-bg', 4.5],
    ['color-text-muted', 'color-surface', 4.5],
    ['color-text-muted', 'color-surface-subtle', 4.5],
    ['color-accent', 'color-bg', 4.5],
    ['color-accent', 'color-surface', 4.5],
    ['color-accent', 'color-surface-subtle', 4.5],
    ['color-accent-strong', 'color-bg', 4.5],
    ['color-on-accent', 'color-accent', 4.5],
    ['color-focus', 'color-bg', 3],
    ['color-focus', 'color-surface', 3],
    ['color-focus', 'color-surface-subtle', 3],
    ['color-border-strong', 'color-bg', 3],
    ['color-border-strong', 'color-surface', 3],
  ];

describe('color tokens', () => {
  it('declares both palettes for every semantic color', () => {
    const themed = TOKENS_CSS.match(/--color-[\w-]+:/g) ?? [];
    expect(themed.length).toBeGreaterThan(0);
    expect(Object.keys(themes.light)).toHaveLength(themed.length);
    expect(themes.light).toEqual(
      expect.objectContaining({ 'color-bg': expect.any(String), 'color-text': expect.any(String) }),
    );
  });

  for (const [themeName, theme] of Object.entries(themes)) {
    describe(`${themeName} theme meets WCAG AA`, () => {
      for (const [foreground, background, min] of CONTRAST_REQUIREMENTS) {
        it(`${foreground} on ${background} reaches ${min}:1`, () => {
          const fg = theme[foreground];
          const bg = theme[background];
          expect(fg, `missing token --${foreground}`).toBeDefined();
          expect(bg, `missing token --${background}`).toBeDefined();
          expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
        });
      }
    });
  }
});

/* -------------------------------------------------------------------------
 * Layout widths (PRD §25)
 * ---------------------------------------------------------------------- */

function readPixelToken(css: string, name: string): number {
  const match = css.match(new RegExp(`--${name}:\\s*(\\d+)px`));
  expect(match, `missing token --${name}`).not.toBeNull();
  return Number(match![1]);
}

describe('shell widths', () => {
  it('keeps content width inside 1100–1200px', () => {
    const width = readPixelToken(TOKENS_CSS, 'width-content');
    expect(width).toBeGreaterThanOrEqual(1100);
    expect(width).toBeLessThanOrEqual(1200);
  });

  it('keeps reading width inside 680–760px', () => {
    const width = readPixelToken(TOKENS_CSS, 'width-reading');
    expect(width).toBeGreaterThanOrEqual(680);
    expect(width).toBeLessThanOrEqual(760);
  });
});

/* -------------------------------------------------------------------------
 * Accessibility baseline (PRD §29)
 * ---------------------------------------------------------------------- */

describe('accessibility baseline', () => {
  it('gives every focusable element a visible focus ring', () => {
    expect(GLOBAL_CSS).toMatch(/:focus-visible\s*\{[^}]*outline:[^}]*var\(--color-focus\)/);
  });

  it('honours prefers-reduced-motion', () => {
    expect(GLOBAL_CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it('never removes an outline without replacing it', () => {
    expect(GLOBAL_CSS).not.toMatch(/outline:\s*(none|0)\s*;/);
  });

  /*
   * A regression guard, not a preference. An inline `code` holding a long file
   * path has no break opportunity, so it sets the page's minimum width and
   * every element on the page inherits a horizontal scroll — which is how the
   * AI Coding Skills case study broke at 390px before MCD-13's QA pass.
   *
   * `anywhere` specifically: `break-word` wraps the visible text but leaves the
   * intrinsic minimum width intact, so the page still overflows.
   */
  it('lets inline code wrap so a long path cannot widen the page', () => {
    expect(GLOBAL_CSS).toMatch(/:not\(pre\)\s*>\s*code\)?\s*\{[^}]*overflow-wrap:\s*anywhere/);
  });
});

/* -------------------------------------------------------------------------
 * Forbidden visual elements (PRD §25)
 *
 * A source scan, not a rendering check: these effects all leave a
 * recognizable declaration or asset name behind, and catching them at the
 * source is what keeps a later task from reintroducing one.
 * ---------------------------------------------------------------------- */

/** This file names every banned effect in order to search for it. */
const SELF = 'design-system.test.ts';

const FORBIDDEN: ReadonlyArray<[label: string, pattern: RegExp]> = [
  ['neon gradients', /\b(linear|radial|conic)-gradient\s*\(/i],
  ['cyberpunk / neon styling', /\b(cyberpunk|neon)\b/i],
  ['particles', /\bparticles?\b/i],
  ['code rain', /\bcode[-_ ]?rain\b/i],
  ['parallax', /\bparallax\b|background-attachment:\s*fixed/i],
  ['typewriter effects', /\btype(writer|writing)\b|animation[^;]*\bsteps\s*\(/i],
  ['3D decorations', /\b(perspective|rotate3d|translate3d|translateZ|preserve-3d)\b/i],
  ['AI robot imagery', /\brobots?\b(?!\.txt)/i],
  ['technology icon walls', /\b(icon|logo|tech)[-_ ]?(wall|cloud|grid|marquee)\b/i],
  ['skill percentage charts', /\bskill[-_ ]?(bar|percent|percentage|level|meter)\b/i],
];

const scanned = Object.entries(SOURCES).filter(([path]) => !path.endsWith(SELF));

describe('PRD §25 forbidden visual elements', () => {
  it('scans the whole source tree', () => {
    expect(scanned.map(([path]) => path)).toEqual(
      expect.arrayContaining(['./tokens.css', './global.css', '../pages/index.astro']),
    );
    // A stubbed loader would hand back empty strings and every check below
    // would pass without reading anything.
    expect(scanned.filter(([, source]) => source.length === 0)).toEqual([]);
  });

  for (const [label, pattern] of FORBIDDEN) {
    it(`contains no ${label}`, () => {
      const offenders = scanned.filter(([, source]) => pattern.test(source)).map(([path]) => path);
      expect(offenders).toEqual([]);
    });
  }
});
