# Redesign spec — Editorial Minimalism × Engineering Aesthetic

Branch `redesign` (base `293a8ff`). This file is the source of truth for every
redesign task. Values are paste-ready. Do not re-derive them.

## Hard constraints (audit findings — violating any of these fails CI)

1. **Zero executable client JS.** `src/lib/metadata.test.ts:165` forbids any
   executable `<script>` in dist; only `<script type="application/ld+json"
   is:inline>` is allowed. No theme toggle, no Astro ClientRouter, no islands.
2. **Home copy is locked.** `src/i18n/pages/home.test.ts` asserts PRD wording
   verbatim from `src/i18n/pages/home.ts` and the 10 work `.md` files. Home
   redesign = layout/typography only; never reword strings.
3. **Footer link order is asserted** by `metadata.test.ts`; canonical/hreflang/OG
   are asserted on every page. Don't reorder or remove footer links; any
   addition must keep that test passing (update the test only if intentional).
4. **`src/styles/design-system.test.ts` locks many CSS declarations** — see
   "Test updates" below. It also scans ALL of `src/**/*.{astro,css,ts}` for
   forbidden visuals, **comments included**: never write the words `gradient`,
   `neon`, `particles`, `parallax`, `typewriter`, `3D`, `logo wall`, `skill
   bar`, `steps()`, `translate3d`, `perspective`, `preserve-3d` in src.
5. **Keep every existing URL and content file.** `public/_redirects`,
   `public/_headers` structure, sitemap, OG images stay working.
6. **Build before test.** `metadata.test.ts` and `home.test.ts` read `dist/`;
   `npm run build` must run first or they fail with ENOENT.

## Lead decisions (settled — do not revisit)

- Fonts: self-host `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono`.
- Page transitions: skipped (constraint 1).
- Theme: OS-driven `light-dark()` + `color-scheme` meta, no toggle (constraint 1).
- Back-to-top: pure anchor link, added in Footer subject to constraint 3.
- `src/components/about/AboutContent.astro` `ai-rd.gif`: keep (no deletion of
  existing content without user confirmation).
- Site-wide RSS: out of scope (writing lives on study.meowcoder.com).

## Typography

Install: `npm i @fontsource-variable/inter @fontsource-variable/jetbrains-mono`

Top of `src/styles/global.css`, BEFORE `@import './tokens.css';`:

```css
@import '@fontsource-variable/inter';
@import '@fontsource-variable/inter/italic';
@import '@fontsource-variable/jetbrains-mono';
@import './tokens.css';
```

Verify the italic entry name with `ls node_modules/@fontsource-variable/inter/`
before trusting it; if absent, drop that line (synthesized oblique is
acceptable). Mono italic: do not import.

Replace font stacks in `src/styles/tokens.css` (family names are
`Inter Variable` / `JetBrains Mono Variable`):

```css
--font-sans:
  'Inter Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
  'Helvetica Neue', 'Noto Sans TC', 'PingFang TC', 'Hiragino Sans CNS',
  'Microsoft JhengHei', sans-serif;
--font-mono:
  'JetBrains Mono Variable', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
  'Liberation Mono', 'Noto Sans Mono', monospace;
```

CJK rides the stack fallback; fontsource unicode-range keeps zh pages from
downloading extra Latin subsets. Variable files cover weights 100–900; the site
uses 400/500/600 only — no extra weight files.

Update stale comments or docs lie: `tokens.css:26-29` ("System font stacks
only: no web font…") and `public/_headers:8` ("no web fonts").

Type scale values: **unchanged** (all test-locked). Add/adjust leading only:

```css
--leading-display: 1.05;   /* NEW: hero name */
--leading-tight: 1.15;     /* h1, existing */
--leading-heading: 1.2;    /* NEW: h2 */
--leading-snug: 1.3;
--leading-normal: 1.5;
--leading-relaxed: 1.75;   /* prose + CJK, existing */
```

`global.css:96-123` heading rules: give `:where(h2)`
`line-height: var(--leading-heading)` (40px h2 at 1.15 is too tight). Hero name
(`HomeHero.astro:92-95`): add `line-height: var(--leading-display);
letter-spacing: -0.025em`.

zh comfort rules (existing, keep): no `--tracking-tight` below 20px; no
uppercase/letter-spacing on zh-visible labels (`global.css:490-496` precedent).

## Colors — replace `tokens.css:125-146`

Every `--color-*` must be a literal `light-dark(#hex, #hex)` — the test regex
counts hex pairs per token; `var()` or color names fail. All pairs below pass
WCAG AA (worst case 4.67:1); the test recomputes.

```css
/* Surfaces — light: soft off-white paper; dark: natural dark gray, never #000 */
--color-bg: light-dark(#fafaf8, #161616);
--color-surface: light-dark(#ffffff, #1e1e1e);
--color-surface-subtle: light-dark(#f2f2ee, #262626);

/* Text — 3 levels, all ≥4.5:1 on all three surfaces */
--color-text: light-dark(#1c1b19, #ededec);
--color-text-muted: light-dark(#57564f, #a5a5a0);
--color-text-subtle: light-dark(#6d6c64, #908f8a); /* NEW — timestamps, evidence labels, captions */

/* Borders — hairline structural vs ≥3:1 interactive (WCAG 1.4.11) */
--color-border: light-dark(#e5e4de, #303030);
--color-border-strong: light-dark(#87867c, #7f7f79);

/* The ONE accent: low-saturation ink blue. Links, focus, solid CTA,
   trajectory "after" bar. Never decoration. */
--color-accent: light-dark(#2f5e8f, #93b4e0);
--color-accent-strong: light-dark(#24486f, #b3cbe9);
--color-on-accent: light-dark(#ffffff, #14181e);
--color-focus: light-dark(#2f5e8f, #93b4e0);
```

Semantics: `subtle` is the floor for readable text; anything fainter must be
`aria-hidden`.

## Spacing / widths / dividers

- Spacing scale, `--space-page`, `--space-section`: **unchanged**
  (`tokens.css:84-108`, rhythm windows test-locked).
- Only change: `--width-reading: 760px` → `720px` (`tokens.css:114`); test
  window is 680–760. `--width-content: 1160px` unchanged.
- Dividers: only `var(--border-width) solid var(--color-border)` hairlines.
  Radii 2/4/8px unchanged. **No box-shadow anywhere; add no shadow token.**
- Side-effect check: zh hero `noBreakSuffix` nowrap tail
  (`HomeHero.astro:103-105`) must not overflow at 720px.

## Link states — replace `global.css:156-165`

```css
:where(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  transition: color var(--duration-fast) var(--ease-standard);
}
:where(a:hover) {
  color: var(--color-accent-strong);
  text-decoration-thickness: 2px;
}
```

Thickness is an instant step on purpose: animating it needs a background-image
underline trick, and the forbidden scan bans that pattern in any src file.

Focus ring `global.css:174-178`: **keep verbatim** (2px ring / 2px offset,
asserted at `design-system.test.ts:290`). Never write `outline: none`.
Header/Footer chrome links stay underline-less muted→text hover; current page
keeps `aria-current` underline at 0.35em offset (`Header.astro:155-160`).

## Motion — values unchanged (`tokens.css:166-168`)

`--duration-fast: 120ms` (nav hover, link color), `--duration-base: 200ms`,
`--ease-standard: cubic-bezier(0.2, 0, 0.2, 1)`. Reduced-motion block
(`global.css:767-781`) **verbatim** (asserted at `:293-295`).

## Component refinements (manual changes beyond token repaint)

- Header: structure unchanged; hover comes free from the global `a` rule.
- Footer (`Footer.astro:97-100`): `.site-footer__meta` → `--color-text-subtle`.
  Add back-to-top anchor (`<a href="#top">` style, no JS) without breaking the
  footer-link-order assertion — check `metadata.test.ts` first.
- HomeHero (`:92-95`): hero name leading/tracking per Typography section.
- ResearchWritingSection (`:152-156`): `.entry__when`, `.entry__meta` →
  `--color-text-subtle`.
- ProductsSection: statement stays muted (content, not metadata).
- WorkIndexLayout (`:125-157`): `.work-row__num`, `.work-row__evidence` →
  `--color-text-subtle`; `__type`/`__outcome` stay muted.
- WorkLayout: zero structural change (≥72rem sidebar trade-off is correct).
- global.css prose: `.shot__caption`, `.state-flow__caption`,
  `.trajectory__caption`, `.mode-flow__caption`, `.progression__caption`,
  `.stage-metadata`/`.stage-domains` muted → subtle is safe (colors not
  asserted; structural declarations in those rules ARE — keep them verbatim).
- AboutContent: keep gif; `focus-grid` items stay borderless text columns, no
  cards, no shadows.
- CtaLink: zero change; solid/outline repaint from accent tokens.

## Test updates (with the tokens task)

In `src/styles/design-system.test.ts`:
- CONTRAST_REQUIREMENTS (`:88-106`): add rows
  `['color-text-subtle','color-bg',4.5]`,
  `['color-text-subtle','color-surface',4.5]`,
  `['color-text-subtle','color-surface-subtle',4.5]`,
  `['color-accent-strong','color-surface',4.5]`.
- Never weaken an existing assertion. `--width-reading: 720px` needs no test
  change (inside 680–760 window; keep the literal `720px` format).
- Rules asserted verbatim that must not be restyled: state-flow (`:330-355`),
  progression (`:367-386`), trajectory (`:398-418`), focus-visible (`:288-299`),
  reduced-motion, HomeSection rhythm/aria (`:241-282`), `:not(pre) > code`
  overflow-wrap (`:310-312`).

## File map (who touches what)

- Task 2 (design system): `src/styles/tokens.css`, `src/styles/global.css`,
  `src/styles/design-system.test.ts`, `package.json` + lockfile,
  `public/_headers` comment only.
- Task 3 (chrome): `src/components/{Header,Footer,LanguageSwitcher,BrandWordmark}.astro`,
  `src/layouts/{SiteShell,BaseLayout}.astro`. No edits to tokens/global.css —
  report missing tokens to lead instead.
- Task 4 (home): `src/components/home/*`, `src/pages/index.astro`,
  `src/pages/zh/index.astro`. No global.css edits.
- Task 5 (work): `src/layouts/{WorkIndexLayout,WorkLayout}.astro`,
  `src/components/work/*`, `src/pages/work/*`, `src/pages/zh/work/*`. No
  global.css edits.
- Task 6 (about): `src/components/about/*`, `src/pages/about.astro`,
  `src/pages/zh/about.astro`. No global.css edits.

Tasks 3–6 run only after task 2 commits; they must not edit each other's files.

## Verification

`npm run build && npm test` (build first). Then: 390px, both locales, every
route — no horizontal scroll; OS dark mode first frame — no flash; tab through
— 2px focus ring everywhere; reduced-motion on — zero animation.
