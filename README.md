# meowcoder.com

Source code for my personal engineering site.

Built with Astro and TypeScript with a static-first architecture, focused on
performance, accessibility, maintainability, and bilingual content.

## Stack

- Astro
- TypeScript
- CSS
- Astro Content Collections / MDX
- Cloudflare Pages
- GitHub Actions

## Development

Requires Node.js 22.12 or newer (see `.nvmrc`).

```bash
npm install        # install dependencies
npm run dev        # start the dev server
npm run build      # build the static site to dist/
npm run preview    # preview the production build
```

Checks, in the order CI runs them:

```bash
npm run format:check   # Prettier
npm run lint           # ESLint
npm run typecheck      # astro check
npm run build          # Astro static build
npm test               # Vitest
```

`npm run format` rewrites files in place.

## License

Source code is licensed under the MIT License.
Personal content and brand assets are © Oliver Yu unless otherwise noted.

See [`LICENSE`](LICENSE) and [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).
