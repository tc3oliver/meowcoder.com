// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Static-first architecture (PRD §26). Ship minimal client-side JavaScript.
export default defineConfig({
  site: 'https://meowcoder.com',
  output: 'static',

  // Pin the URL convention. Astro's default is 'ignore', which would let
  // canonical, sitemap, and hreflang emit different forms of the same page.
  // `src/lib/site.ts` normalizes to the same convention.
  trailingSlash: 'always',

  build: {
    format: 'directory',
  },

  integrations: [
    sitemap({
      // Teaching the sitemap about the locales makes it emit `xhtml:link`
      // alternates per URL, so the sitemap agrees with the `hreflang` tags
      // `BaseLayout` already writes rather than describing a different site.
      //
      // The keys are the URL path segments; `zh` pages live under `/zh/`. The
      // values are the BCP 47 tags, and must match `LOCALE_TAG` in
      // `src/i18n/locales.ts`.
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-Hant',
        },
      },
    }),
  ],
});
