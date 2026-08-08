// @ts-check
import { defineConfig } from 'astro/config';

// Static-first architecture (PRD §26). Ship minimal client-side JavaScript.
export default defineConfig({
  site: 'https://meowcoder.com',
  output: 'static',
  build: {
    format: 'directory',
  },
});
