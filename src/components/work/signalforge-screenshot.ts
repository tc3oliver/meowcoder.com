/**
 * The SignalForge key visual, shown beside its entry on the Work index.
 *
 * Same contract as `shouri-screenshot.ts`: the asset lives at
 * `src/assets/signalforge/product.<ext>` with a fixed basename, so the slot
 * cannot fill with something unintended, and the alt text lives in
 * `src/i18n/pages/work.ts` beside the other visuals' descriptions.
 *
 * The lookup is a build-time glob rather than a static `import` so a clone
 * missing the asset still builds — the entry simply renders without a figure
 * rather than failing the build.
 */

const assets = import.meta.glob<{ default: ImageMetadata }>(
  '../../assets/signalforge/product.{avif,webp,png,jpg,jpeg}',
  { eager: true },
);

/** The key visual, or `undefined` while the asset is missing. */
export const signalForgeScreenshot: ImageMetadata | undefined =
  Object.values(assets)[0]?.default ?? undefined;
