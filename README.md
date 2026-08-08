# meowcoder.com

Source code for my personal engineering site.

Built with Astro and TypeScript with a static-first architecture, focused on
performance, accessibility, maintainability, and bilingual content.

This is the implementation of one real site, not a portfolio template.

## Stack

- Astro
- TypeScript
- CSS
- Astro Content Collections / MDX
- Cloudflare Pages
- GitHub Actions

## Development

Requires Node.js 22.12 or newer, the version pinned in [`.nvmrc`](.nvmrc). With
[nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install   # installs and selects the version from .nvmrc
```

Then, from a clean clone:

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
npm run linkcheck      # linkinator, over dist/ and the Markdown in this repo
npm test               # Vitest
```

`npm run format` rewrites files in place. `npm run linkcheck` reads `dist/`, so
run `npm run build` first.

## Repository layout

```text
src/pages/   route-level Astro pages
src/lib/     framework-independent helpers, unit-tested with Vitest
.github/     CI and dependency update configuration
dist/        build output, not committed
```

## Continuous integration

Every push and pull request against `main` runs the checks above, plus a
[gitleaks](https://github.com/gitleaks/gitleaks) scan over the working tree and
the full git history. Dependency and GitHub Actions updates arrive as weekly
Dependabot pull requests; Actions are pinned to commit SHAs.

A separate scheduled workflow rebuilds and redeploys the site once a day. The
homepage reads the writing feed at build time, so without it new articles would
not appear between pushes. It can also be run on demand from the Actions tab.

It needs two repository secrets:

| Secret                  | Purpose                              |
| ----------------------- | ------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | Deploy permission, scoped to Workers |
| `CLOUDFLARE_ACCOUNT_ID` | The account the Worker belongs to    |

## Contributing

External contributions are **not** solicited. This repository exists to run and
document one specific site, so pull requests that generalise it, add
configuration layers, or change its content are out of scope and will be
declined. There is deliberately no `CONTRIBUTING.md`.

Bug reports are welcome as issues — broken links, build failures, accessibility
problems, and factual errors in particular.

## Security

No credentials belong in this repository; `.gitignore` and the CI secret scan
exist to keep it that way. Report a suspected exposure or vulnerability
privately through this repository's GitHub security advisories rather than in a
public issue.

## License

This repository uses split licensing.

Source code is licensed under the MIT License — see [`LICENSE`](LICENSE).

Personal content and brand assets (`src/content/**`, `src/assets/brand/**`,
`public/images/**`) are © Oliver Yu unless otherwise noted and are **not**
covered by the MIT License — see [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md) for
the path-by-path breakdown.
