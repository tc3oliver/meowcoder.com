// @ts-check
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
});
