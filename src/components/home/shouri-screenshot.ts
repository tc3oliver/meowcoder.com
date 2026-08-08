/**
 * The Shouri product screenshot (MCD-4, PRD §9.2).
 *
 * PRD §9.2 asks the Featured Product section to show one polished product
 * screenshot. No image asset exists in this repository yet, and inventing one —
 * a generated mockup, a grey placeholder, or a hotlinked remote image — would
 * misrepresent the product, so the section renders without a figure until the
 * real screenshot is added.
 *
 * Adding it is two steps and no code change:
 *
 *   1. Put the image at `src/assets/shouri/product.<ext>`, where `<ext>` is one
 *      of `avif`, `webp`, `png`, `jpg`, or `jpeg`. Exactly one file — the
 *      basename is fixed so the slot cannot fill with something unintended.
 *   2. Add `shouri.screenshot = { alt: '…' }` to each locale in
 *      `src/i18n/pages/home.ts`, describing that specific image.
 *
 * Both halves are required: an image with no alt text fails PRD §29's
 * accessibility bar, and alt text written before the image exists would
 * describe something nobody has seen.
 *
 * The lookup is a build-time glob rather than a static `import` so that a clean
 * clone still builds. Vite resolves it at build time; nothing here reaches the
 * browser, and Astro's image pipeline gets real `ImageMetadata` the moment the
 * file lands.
 */

const assets = import.meta.glob<{ default: ImageMetadata }>(
  '../../assets/shouri/product.{avif,webp,png,jpg,jpeg}',
  { eager: true },
);

/** The screenshot, or `undefined` while the asset is missing. */
export const shouriScreenshot: ImageMetadata | undefined =
  Object.values(assets)[0]?.default ?? undefined;
