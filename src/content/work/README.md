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

Every field is required except `draft`, `outcome`, `evidence`, and `meta`. The
schema lives in
[`src/lib/work.ts`](../../lib/work.ts) and is strict — an unknown key is an
error, because an unknown key is usually a misspelled required one.

| Field            | Type       | Notes                                                                  |
| ---------------- | ---------- | ---------------------------------------------------------------------- |
| `title`          | string     | Localized case-study title.                                            |
| `type`           | string     | Localized category line, e.g. `Product · AI Systems` (PRD §10).        |
| `summary`        | string     | Localized one-line summary. Drives `<meta description>`.               |
| `outcome`        | string     | Optional. One outcome sentence, for the index. See below.              |
| `evidence`       | string     | Optional. Concise evidence label, for the index. See below.            |
| `slug`           | string     | URL segment. Lowercase words joined by single hyphens.                 |
| `locale`         | `en`\|`zh` | Must match the directory the file is in.                               |
| `translationKey` | string     | Locale-independent identity shared by both translations.               |
| `order`          | integer    | Index position, ascending.                                             |
| `draft`          | boolean    | Optional, defaults to `false`. A draft is not listed and gets no page. |
| `meta`           | row list   | Optional. Sidebar metadata rows, in display order. See below.          |

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

## Index entry

`/work/` renders each case study as a large entry (doc-2 §11), and the two
fields it leads with are the two `summary` cannot supply. `summary` says what
the project _is_ and is also the page's `<meta description>`; `outcome` says
what it _achieved_, and `evidence` names what a reader can go and check.

```yaml
outcome: 'Live with the Free plan open, on an architecture that persists the original before any AI call.'
evidence: 'shouri.app · pricing, privacy, terms, and refund policy all published'
```

Both are optional. An entry that declares no `outcome` falls back to its
`summary`, which is what the index showed before the fields existed, and an
entry with no `evidence` simply prints no label. What is _not_ allowed is one
locale declaring a field the other does not: the text is localized and cannot be
compared, but the two indexes would then be showing different things, so the
build fails the same way a mismatched `meta` row count does.

Neither field may state anything the case study does not. `evidence` is a label,
not a link list — the links stay in the article, where doc-2 §12 requires them
to remain visible.

## Sidebar metadata

`meta` fills the sidebar `WorkLayout` renders beside the article. Both fields of
a row are localized, so the two translations carry different text — but they must
carry the **same number of rows**, or the build fails: a row present in one
locale and missing in the other is a half-translated sidebar.

```yaml
meta:
  - label: 'Status'
    value: 'Live · test period'
  - label: 'Plans'
    value: 'Free open · Pro published at NT$199/month'
```

Values are plain text. Evidence links belong in the article, where doc-2 §12
requires them to stay visible — not tucked into a sidebar row.

Omitting `meta` is fine. The sidebar still carries the `type` row and the section
navigation, which is generated from the article's own `##` headings and needs no
frontmatter at all.

## The body

The body is the case study itself. PRD §10 fixes the section structure per
case study; write it as Markdown headings starting at `##`, since the layout
supplies the `<h1>`. Every `##` becomes an entry in the sidebar's section
navigation automatically.

### Structured blocks

Three presentation patterns are available to any case study. They are plain HTML
wrappers around ordinary Markdown, styled by `.prose` rules in
[`src/styles/global.css`](../../styles/global.css). Astro components cannot be
used in a `.md` file, and this is the substitute: **leave a blank line after the
opening tag and before the closing one**, and everything between them is still
parsed as Markdown, links and emphasis included.

A **decision block** presents one engineering decision as Decision / Why /
Trade-off. The `###` is the decision; the two lead-ins are localized words, not
keywords, so a Chinese entry writes `**原因**` and `**取捨**`:

```markdown
<div class="decision">

### Persist before processing, not after

**Why** — It rules out the failure mode where a capture is lost because a
downstream extraction failed.

**Trade-off** — A saved item can sit unorganized indefinitely.

</div>
```

Use `**Consequence**` in place of `**Trade-off**` when a decision has a stated
result rather than a cost. Do not invent a trade-off to fill the shape; a
decision with neither belongs in a plain paragraph.

An **evidence block** wraps the list of public links so they read as the checkable
part of the article rather than as one more bulleted list:

```markdown
<div class="evidence">

- **Product** — [shouri.app](https://shouri.app)

</div>
```

A **state-flow figure** draws a state or process diagram in boxes and rules — no image
asset, no client JavaScript. Each step carries a name, a one-line detail, and any
number of parts; `state-flow__part--derived` marks a part as model output, which is
what distinguishes source content from AI-derived content on sight. Keep the tags
free of blank lines so the block passes through verbatim:

```markdown
<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Saved</span>
<span class="state-flow__detail">The original is durable.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Source</span>Text in the database</span>
</li>
</ol>
<figcaption class="state-flow__caption">Solid is source; dashed is AI-derived.</figcaption>
</figure>
```

The steps stack on a phone and sit in a row from 40rem up, with the connector
drawn by CSS, so the content file holds states rather than arrows.

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
5. **Both translations declare the same optional fields.** The same number of
   `meta` rows, and `outcome` and `evidence` either present in both or absent
   from both. Their text is localized and incomparable; their presence is not.

## What does not belong here

- Long-form prose in a translation dictionary. PRD §27 keeps it in these
  content files; `src/i18n/pages/work.ts` holds only the page chrome.
- A case study added to make the portfolio look larger. PRD §10 requires an
  entry to be public, understandable, technically meaningful, supported by
  evidence, and representative of current professional direction.
