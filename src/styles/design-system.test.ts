/**
 * Design system guarantees (MCD-2).
 *
 * The visual result of a stylesheet is judged by eye, but several of its
 * properties are not judgement calls — they are arithmetic or a text search,
 * and a reviewer cannot check them reliably by reading hex codes or the two
 * ends of a `clamp()`:
 *
 *   1. every semantic color pair clears WCAG AA (PRD §29);
 *   2. the shell widths stay inside the ranges PRD §25 fixes;
 *   3. the type scale and section rhythm hit doc-2 §4's target sizes;
 *   4. the section eyebrow is a separate element from its heading (doc-2 §16);
 *   5. none of the visual elements PRD §25 forbids appear in the source.
 *
 * Computing them here means editing a token re-derives the answer instead of
 * re-asserting the comment next to it.
 */

import { describe, expect, it } from 'vitest';

import HOME_SECTION from '../components/home/HomeSection.astro?raw';
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
 * Type scale and section rhythm (doc-2 §4)
 *
 * Every fluid token is a `clamp(min, preferred, max)` whose bounds are what a
 * ~390px phone and a desktop actually render — the preferred term only chooses
 * the path between them. So asserting the two bounds is asserting the two
 * sizes doc-2 §4 gives a number for, which reading the token by eye cannot do.
 * ---------------------------------------------------------------------- */

const ROOT_FONT_SIZE = 16;

/**
 * The rendered range of a length token, in pixels: `[min, max]` for a
 * `clamp()`, and the same value twice for a fixed `rem` step.
 */
function readRemRange(css: string, name: string): { min: number; max: number } {
  const declaration = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  expect(declaration, `missing token --${name}`).not.toBeNull();
  const value = declaration![1].trim();

  // The preferred term is matched as "no comma" rather than skipped, so a
  // token written with a comma-bearing function inside fails loudly here
  // instead of being read as a different token's bounds.
  const fluid = value.match(/^clamp\(\s*([\d.]+)rem\s*,[^,]+,\s*([\d.]+)rem\s*\)$/);
  if (fluid) {
    return { min: Number(fluid[1]) * ROOT_FONT_SIZE, max: Number(fluid[2]) * ROOT_FONT_SIZE };
  }

  const fixed = value.match(/^([\d.]+)rem$/);
  expect(
    fixed,
    `token --${name} is neither a rem length nor a clamp() of rem lengths`,
  ).not.toBeNull();
  const px = Number(fixed![1]) * ROOT_FONT_SIZE;
  return { min: px, max: px };
}

describe('type scale (doc-2 §4)', () => {
  it('gives the hero name a 64–72px display step', () => {
    const display = readRemRange(TOKENS_CSS, 'text-display');
    expect(display.max).toBeGreaterThanOrEqual(64);
    expect(display.max).toBeLessThanOrEqual(72);
  });

  it('sizes h2 at 36–44px', () => {
    const h2 = readRemRange(TOKENS_CSS, 'text-2xl');
    expect(h2.max).toBeGreaterThanOrEqual(36);
    expect(h2.max).toBeLessThanOrEqual(44);
    expect(GLOBAL_CSS).toMatch(/:where\(h2\)\s*\{[^}]*font-size:\s*var\(--text-2xl\)/);
  });

  it('sets body type at 17–19px', () => {
    const body = readRemRange(TOKENS_CSS, 'text-base');
    expect(body.min).toBeGreaterThanOrEqual(17);
    expect(body.max).toBeLessThanOrEqual(19);
  });

  /*
   * The display step is the reason this matters: 68px of heading on a 390px
   * screen would set the page's minimum width from a single unbreakable word.
   * Each fluid step has to shrink, and the largest of them has to shrink to
   * something a phone can hold.
   */
  it('scales every fluid step down for a 390px screen', () => {
    const fluid = [...TOKENS_CSS.matchAll(/--(text-[\w-]+):\s*clamp\(/g)].map(([, name]) => name);
    expect(fluid.length).toBeGreaterThan(0);

    for (const name of fluid) {
      const step = readRemRange(TOKENS_CSS, name);
      expect(step.min, `--${name} does not scale down`).toBeLessThan(step.max);
    }

    expect(readRemRange(TOKENS_CSS, 'text-display').min).toBeLessThanOrEqual(48);
  });

  it('keeps the scale ordered so a heading never outsizes the one above it', () => {
    const ordered = ['text-base', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const maxima = ordered.map((name) => readRemRange(TOKENS_CSS, name).max);
    expect(maxima).toEqual([...maxima].sort((a, b) => a - b));
    expect(new Set(maxima).size).toBe(maxima.length);
    expect(readRemRange(TOKENS_CSS, 'text-display').max).toBeGreaterThan(maxima.at(-1)!);
  });
});

describe('section rhythm (doc-2 §4)', () => {
  it('spaces sections 72–88px apart on mobile and 112–144px on desktop', () => {
    const rhythm = readRemRange(TOKENS_CSS, 'space-section');
    expect(rhythm.min).toBeGreaterThanOrEqual(72);
    expect(rhythm.min).toBeLessThanOrEqual(88);
    expect(rhythm.max).toBeGreaterThanOrEqual(112);
    expect(rhythm.max).toBeLessThanOrEqual(144);
  });

  /*
   * `--space-section` used to double as the shell's own padding, so raising it
   * to the rhythm above would have inflated the band under the header too.
   * The two are separate tokens now, and this holds them apart.
   */
  it('keeps the shell band on its own token', () => {
    const page = readRemRange(TOKENS_CSS, 'space-page');
    expect(page.max).toBeLessThan(readRemRange(TOKENS_CSS, 'space-section').max);
    expect(GLOBAL_CSS).toMatch(/\.site-main\s*\{[^}]*padding-block:\s*var\(--space-page\)/);
  });

  it('gives a homepage section that rhythm', () => {
    expect(HOME_SECTION).toMatch(
      /\.home-section\s*\{[^}]*padding-block-start:\s*var\(--space-section\)/,
    );
  });
});

/* -------------------------------------------------------------------------
 * Eyebrow and heading are separate typographic elements (doc-2 §16)
 *
 * The eyebrow used to be a `display: block` span inside the `<h2>`. Both
 * halves of that are the defect: nested, it joins the heading's accessible
 * name, and 精選產品 / Shouri reads as one phrase rather than a label above a
 * title. A rendered-size check cannot catch a regression here, but the
 * structure can.
 * ---------------------------------------------------------------------- */

describe('homepage section eyebrow', () => {
  const markup = HOME_SECTION.slice(
    HOME_SECTION.indexOf('<section'),
    HOME_SECTION.indexOf('<style>'),
  );

  it('renders the eyebrow before the heading, not inside it', () => {
    expect(markup).toMatch(/<p class="home-section__eyebrow">[\s\S]*<h2/);
    const heading = markup.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    expect(heading, 'no <h2> in the section markup').not.toBeNull();
    expect(heading![1]).not.toMatch(/[<>]/);
  });

  it('leaves the section named by its heading alone', () => {
    expect(markup).toMatch(/<section[^>]*aria-labelledby=\{id\}/);
    expect(markup).toMatch(/<h2[^>]*id=\{id\}/);
  });

  it('separates the two by more than a heading line box would', () => {
    expect(HOME_SECTION).toMatch(
      /\.home-section__eyebrow\s*\{[^}]*margin-block-end:\s*var\(--space-([4-9]|1\d)\)/,
    );
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
