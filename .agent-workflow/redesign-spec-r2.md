# Round 2 spec — Visual Redesign (composition + typographic identity)

Branch `redesign` continues from round 1 (`cc3ab8d`). Round 1 kept: fonts (Inter
Variable / JetBrains Mono Variable), the neutral palette + single ink-blue
accent, `--color-text-subtle` 3-level text hierarchy, zero client JS, WCAG AA,
720px reading column, all URLs and content. Do not undo any of it.

Round 1 was refinement. Round 2 must be **visibly different at a glance** —
layout, typographic scale, composition, and content density — while staying
mature, minimal, professional. The acceptance bar: side-by-side before/after
home screenshots are unmistakably different designs without reading any text.

## What is locked (unchanged from round 1 — violating fails CI)

1. Zero executable client JS (`metadata.test.ts` forbids executable scripts).
2. All strings in `src/i18n/pages/home.ts` are verbatim-locked by
   `home.test.ts` (hero role/intro/CTAs, product headings+statements+cta
   labels, research paper/venue/year, experience progression, section
   presence). Round 2 changes where and how big they render, never the words.
3. `metadata.test.ts`: canonical/hreflang/OG on every page, footer link order
   (`.site-footer__link` anchors), JSON-LD, zero scripts.
4. Forbidden-visuals scan over all of src (comments included): gradient, neon,
   particles, parallax, typewriter, 3D, logo wall, skill bar, steps(),
   translate3d, perspective, preserve-3d. No box-shadows, no glassmorphism, no
   rounded cards (round-1 policy stays).
5. Contrast: every fg/bg token pair ≥ AA (test recomputes). Never weaken a
   contrast, focus-ring, or reduced-motion assertion.
6. All existing URLs, slugs, content files, redirects.

## Test-policy updates this round (design policy changed — update, never weaken)

In `src/styles/design-system.test.ts`, these bounds encode round-1 design
policy and move with round-2 decisions:

- Display size window `:195-199` (max 64–72px) → new window **max 88–104px**
  (masthead name clamp tops at 96px).
- h2 window `:201-206` (36–44px) stays; section headings keep 40px.
- Section-rhythm windows `:241-248` (72–88 / 112–144px) → new windows
  **96–128px** (`--space-section`) and keep the page-width relation assertion
  `:255-259` passing by raising `--space-page` inside its asserted relation
  (space-page < space-section).
- HomeSection `padding-block-start: var(--space-section)` assertion `:261-266`
  stays as-is (token value changes, declaration string doesn't).
- `aria-labelledby` + h2-id assertions `:272-282` stay as-is — the numbered
  eyebrow is a sibling of h2, `aria-hidden="true"`, never inside the h2.
- Reading width 720px (680–760 window) stays. Body 17–19px stays. Type-scale
  strictly-increasing and clamp min<max assertions stay — the new display
  clamp keeps the scale strictly increasing.

Everything else in the test file (contrast rows incl. round-1 additions,
focus ring, reduced-motion, state-flow/progression/trajectory structure,
forbidden scan) is untouched.

## Design language: "Engineering Ledger"

One identity idea, applied everywhere: the site reads like a well-kept
engineering ledger — numbered sections under full-bleed hairlines, mono
metadata in the margins, oversized names against quiet statements. Distinctive
without decoration.

Identity elements (all pure CSS, token-driven):

1. **Numbered section eyebrows.** Every major section on home/work/about gets a
   mono index label above its heading: `01`, `02`, … rendered as
   `<p class="section-index" aria-hidden="true">01</p>` (or a span) paired with
   the h2 in a section header row; the h2 keeps its id and aria-labelledby
   wiring. Mono, `--text-sm`, `--tracking-wide`, color `--color-text-subtle`.
2. **Full-width hairline above each section header row** — the section header
   becomes: hairline rule, then a row with the mono number on the left and the
   h2 baseline-aligned; optional right-side mono context (e.g. count of
   entries) in `--color-text-subtle`, `aria-hidden` if purely decorative.
3. **Masthead hero (replaces the current intro block).** Desktop: asymmetric
   two-column grid — left (wider): the name at display size
   `clamp(56px, 8vw, 96px)`, weight 600, `--leading-display` (1.05 → tighten
   to 0.98 for the masthead via a local line-height), tracking −0.03em; below
   it the role line in **mono** `--text-md`, color muted; below that the intro
   paragraph at `--text-lg`, constrained to ~34em. Right rail (narrower,
   desktop only, ≥64rem): a hairline-topped meta stack — the two hero facts as
   mono `--text-sm` rows separated by hairlines, then the two CTAs stacked as
   quiet links (Work CTA solid accent button style, Writing CTA text link with
   arrow). Mobile (<64rem): single column, name → role → intro → facts as
   hairline-separated mono rows → CTAs. The hero owns ~85–100vh of presence on
   desktop via generous `padding-block` (use existing space tokens, e.g.
   `calc(var(--space-section) * 1.5)` inline or a new `--space-hero` token —
   new tokens are fine, add them to tokens.css with the rest).
4. **Selected Work as ledger rows.** ProductsSection: each product becomes a
   full-width row: hairline above; row grid = title block left, mono cta right.
   Title at `--text-2xl`/28–32px weight 600, tracking −0.01em; statement below
   at `--text-md` muted, constrained to ~46em; cta (label is locked, e.g.
   "GitHub") in mono `--text-sm` with the existing ↗ treatment, aligned to the
   row top on desktop. Hover: title color transitions to
   `--color-accent-strong` (global a-rule if the title is a link; if the title
   is not a link today, keep it non-linked — the cta is the link; do NOT invent
   new links to locked content). Row spacing: `--space-6` inside rows,
   hairline separators between. No cards, no backgrounds, no numbering on
   these rows (the section eyebrow carries the numbering).
5. **Writing/research sections.** SystemsResearch: the research summary
   (mono block) becomes a **ruled ledger block**: hairline box is forbidden as
   a card — instead use hairline rules top and bottom (full width of the
   reading column) with the mono summary inside. The paper row (year · venue ·
   title — locked strings) does NOT move here: it stays the last entry of
   Technical Writing per PRD §9.5 and `home.test.ts` section assertions, and
   is restyled there as a ledger row (mono subtle year/venue, title in text
   color). ResearchWritingSection entries: two-column grid on desktop — left
   column mono `--text-sm` subtle `when` (dates), right column title + meta;
   hairline between entries. This is the "dates in the margin" ledger look.
   No content moves across sections — visual identity comes from the ledger
   styling, not relocation.
6. **Closing colophon row.** The experience progression + About CTA (locked
   strings) render as a full-width hairline-topped footer-adjacent row:
   progression text left in mono `--text-sm` muted, About CTA right as accent
   link. On mobile they stack.

### Work index page

Same ledger language: page heading with mono eyebrow (`Work`), entries as
ledger rows — keep number/title/type/outcome/evidence content exactly, but
rescale: number in mono subtle (exists), **title at `--text-xl`–2xl weight
600**, outcome muted, evidence subtle right-aligned on desktop. Increase row
height rhythm (`--space-5` → `--space-6` between rows). Keep title-as-only-link.

### Case study pages (WorkLayout)

- Header block: keep eyebrow mono line (Project · Evidence · Completed) but
  give the case title more presence: bump to the h1 display treatment
  (`--text-display` is too big for article pages; use `clamp(36px, 5vw, 52px)`,
  weight 600, tracking −0.02em) and add a full-width hairline under the header
  block before the body starts.
- Body: unchanged prose system (state-flow/progression/trajectory markup and
  their asserted CSS stay verbatim).
- Sidebar (≥72rem): restyle the section nav as a ledger index — mono
  `--text-xs` subtle numbers or short labels, current section in text color
  with a 2px accent left border (border, not background). Keep sticky.

### About page

- Masthead-lite header: name-sized h1 (48–56px clamp), role line mono muted,
  then hairline; the rest of the page keeps its content but adopts numbered
  section eyebrows (About sections are component-local; number them 01…n in
  render order, aria-hidden).
- focus-grid stays borderless columns (round-1 policy) but gains a hairline
  above the section header like everything else.
- Career progression: stages stay; the period/label tokens stay subtle.

### Header/Footer (chrome)

- Header: unchanged structure (test-locked favicon/header source assertions +
  zero-JS mobile two-row layout). One allowed refinement: brand wordmark stays,
  nav stays.
- Footer: unchanged (order assertion). The `site-footer__top` link stays.

## Tokens to add/change (tokens.css)

- `--text-display` clamp max → 96px per new window (keep the token name; test
  reads the clamp bounds — check how `readPixelToken`/clamp parsing works in
  the test before editing so the new values satisfy the updated windows).
- `--space-section`: raise into 96–128px window (e.g. 112px) and keep
  `--space-page` < `--space-section`.
- New: `--space-hero` (desktop masthead vertical padding, e.g. 128–160px via
  clamp), `--leading-masthead: 0.98`, `--tracking-masthead: -0.03em` (or reuse
  existing tracking tokens if values match; prefer fewer new tokens).
- New (only if needed by components): `--width-shell` for the hero grid max
  width — reuse `--width-content` (1160px) instead if it fits; do not add
  parallel width systems.

## Composition rules

- Desktop home is a **single wide composition**: hero grid spans
  `--width-content` (1160px), while prose/reading blocks inside sections stay
  ≤720px. This width contrast (wide masthead/rows vs narrow prose) is a core
  part of the new identity — round 1 was one narrow column top to bottom.
  Ledger rows (work rows, writing entries) also span the content width.
- Mobile 390px: everything collapses to the single column; no horizontal
  scroll (the round-1 sweep must stay green); hero name clamps to ≤56px min
  side, facts stack, row grids stack with mono cta under the statement.
- zh: masthead name is Latin ("Oliver Yu") in both locales — safe. All zh prose
  keeps `--leading-relaxed`; no uppercase/letter-spacing on zh-visible labels
  (eyebrow numbers are digits — fine). The nowrap hero suffix logic in
  HomeHero.astro must keep working in the new composition (check the zh tail
  renders inside the intro paragraph, not the name).

## File map

- Task 8 (lead, done): this spec + baseline screenshots.
- Task 9 (implementer "impl-r2-home"): `src/styles/tokens.css`,
  `src/styles/global.css` (additive section-header/ledger utilities only; do
  not restyle asserted prose rules), `src/styles/design-system.test.ts`
  (policy windows listed above), `src/components/home/*` (HomeContent,
  HomeHero, HomeSection, ProductsSection, ResearchWritingSection,
  SystemsResearchSection, CtaLink), `src/pages/index.astro`,
  `src/pages/zh/index.astro`. Verify: `npm run build && npm test && npx astro
  check`.
- Task 10 (implementer "impl-r2-pages", blocked by 9):
  `src/layouts/WorkIndexLayout.astro`, `src/layouts/WorkLayout.astro`,
  `src/components/work/*`, `src/components/about/*`, `src/pages/about.astro`,
  `src/pages/zh/about.astro`, work page files. No edits to tokens.css /
  global.css / any test — request missing tokens from lead via report; use
  component-local `<style>` with existing tokens. Verify: `npm run build &&
  npx vitest run src/lib/metadata.test.ts src/lib/work.test.ts
  src/i18n/pages/about.test.ts src/styles/design-system.test.ts && npx astro
  check`.
- Task 11 (lead): full CI (format/lint/typecheck/build/linkcheck/test), ego
  browser sweep (390px overflow all routes, desktop/dark checks, focus ring),
  before/after side-by-side captures, commit, merge, push, live verify.

## Definition of done (round 2)

1. CI green + 390px sweep green (zero overflow, all 20 routes).
2. Before/after home screenshots (1440 + 390, light) are obviously different
   compositions: wide asymmetric masthead vs narrow intro; ledger rows vs
   plain rows; numbered eyebrows; width contrast.
3. No locked string changed; no contrast/a11y assertion weakened; no forbidden
   visual; zero client JS preserved.
