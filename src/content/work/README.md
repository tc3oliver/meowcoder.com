# Authoring a Work entry

A case study is content, not page code. Adding one means adding two files —
one per locale — and nothing else:

```text
src/content/work/en/<slug>.md
src/content/work/zh/<slug>.md
```

The index (`/work/`, `/zh/work/`), the detail pages (`/work/<slug>/`,
`/zh/work/<slug>/`), the canonical URL, the `hreflang` set, and the language
switch all follow from those two files.

## Required frontmatter

Every field is required except `draft`. The schema lives in
[`src/lib/work.ts`](../../lib/work.ts) and is strict — an unknown key is an
error, because an unknown key is usually a misspelled required one.

| Field            | Type       | Notes                                                                  |
| ---------------- | ---------- | ---------------------------------------------------------------------- |
| `title`          | string     | Localized case-study title.                                            |
| `type`           | string     | Localized category line, e.g. `Product · AI Systems` (PRD §10).        |
| `summary`        | string     | Localized one-line summary. Index card text and `<meta description>`.  |
| `slug`           | string     | URL segment. Lowercase words joined by single hyphens.                 |
| `locale`         | `en`\|`zh` | Must match the directory the file is in.                               |
| `translationKey` | string     | Locale-independent identity shared by both translations.               |
| `order`          | integer    | Index position, ascending.                                             |
| `draft`          | boolean    | Optional, defaults to `false`. A draft is not listed and gets no page. |

Example:

```yaml
---
title: 'Example Case Study'
type: 'Product · AI Systems'
summary: 'One line on the problem and the result.'
slug: 'example-case-study'
locale: 'en'
translationKey: 'example-case-study'
order: 0
draft: false
---
```

The body is the case study itself. PRD §10 fixes the section structure per
case study; write it as Markdown headings starting at `##`, since the layout
supplies the `<h1>`.

## Rules the build enforces

These are checked in `assertWorkContentIsConsistent` and fail the build with
the offending entry and field named:

1. **The file path matches the metadata.** An entry declaring
   `locale: 'zh'` and `slug: 'shouri'` must be `src/content/work/zh/shouri.md`.
2. **`slug` and `translationKey` map one-to-one.** The language switch rewrites
   only the locale prefix, so both translations of a case study must use the
   same slug — otherwise switching language would land on a 404.
3. **Every `translationKey` exists in every locale.** PRD §7 requires
   Traditional Chinese to be a complete localized experience; a half-translated
   case study is a build failure, not a silent gap.
4. **`order` and `draft` agree across locales.** Otherwise the two indexes
   would disagree on what exists, or in what sequence.

## What does not belong here

- Long-form prose in a translation dictionary. PRD §27 keeps it in these
  content files; `src/i18n/pages/work.ts` holds only the page chrome.
- A case study added to make the portfolio look larger. PRD §10 requires an
  entry to be public, understandable, technically meaningful, supported by
  evidence, and representative of current professional direction.
