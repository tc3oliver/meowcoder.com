---
id: doc-1
title: MeowCoder Personal Site Redesign v4 (PRD)
type: specification
created_date: '2026-08-08 06:38'
updated_date: '2026-08-08 06:38'
---
<!-- 逐字匯入自 meowcoder-personal-site-redesign-plan-v4.md（來源：Windows 下載資料夾），匯入日期 2026-08-08。這是本專案的權威需求來源；請勿改寫其語意，若來源 PRD 更新請同步此文件。 -->

# MeowCoder Personal Site Redesign v4

**Project:** MeowCoder — Personal Site Redesign  
**Domain:** `meowcoder.com`  
**Repository:** `github.com/tc3oliver/meowcoder.com`  
**Primary language:** English  
**Secondary language:** Traditional Chinese  
**Site type:** Professional engineering profile / portfolio  
**Primary goal:** Present Oliver Yu as a senior AI Systems Engineer and System Architect through clear positioning and verifiable evidence: product, open source, technical writing, research, and 10+ years of software engineering experience.

---

# 1. Product Definition

`meowcoder.com` is Oliver Yu's professional engineering index.

It is not:
- a traditional résumé site;
- another blog;
- a personal diary;
- a technology-logo showcase;
- a collection of every project ever completed;
- a generic portfolio template.

The site should let a first-time visitor understand within roughly 10 seconds:

1. Who Oliver is.
2. What engineering problems he specializes in.
3. What he has actually built.
4. Which work is publicly verifiable.
5. Where to inspect his code, technical thinking, product work, and research.

The intended impression is:

> A senior software engineer and system architect who now specializes in AI systems, with real product execution, public engineering work, technical writing, research depth, and a long production-engineering background.

---

# 2. Professional Identity

## Primary identity

**Oliver Yu**  
**AI Systems Engineer · System Architect**

Supporting statement:

> I design and build production AI systems that connect models, knowledge, developer tools, and software infrastructure.

Secondary metadata:

> 10+ Years in Software Engineering · Taiwan

Do not overload the hero with additional titles.

`Product Builder` remains part of the professional story, but does not need to appear in the primary title because Shouri already proves that capability.

---

# 3. Professional Story

The site should communicate one coherent career progression:

```text
Software Engineering
        ↓
System Architecture
        ↓
AI Systems
        ↓
Agent Engineering
        ↓
Production AI Products
```

The message is not "I know many technologies."

The message is:

> I have progressed from building software to designing systems, and now focus that engineering experience on production AI.

---

# 4. Evidence Model

Major content must map to a clear evidence type.

| Evidence | Primary content | What it proves |
|---|---|---|
| Product Proof | Shouri / 收理 | End-to-end product execution |
| Open Source Proof | AI Coding Skills | Agent workflow and engineering methodology |
| Site Engineering Proof | meowcoder.com source | Architecture, frontend quality, accessibility, deployment discipline |
| Research Proof | JISA publication | Security / cryptography research depth |
| Technical Depth | study.meowcoder.com | Continuous technical analysis and learning |
| Professional Experience | Enterprise AI / Systems Engineering | Seniority and production engineering background |

The site should prefer evidence over claims.

---

# 5. Engineering Expertise

Use four high-level engineering pillars.

## AI & Agent Systems

Agentic workflows, tool execution, MCP, evaluation, validation, permissions, and recovery.

## Knowledge Systems

RAG, source grounding, graph retrieval, knowledge integration, and agent-accessible context.

## LLM Infrastructure

Model serving, vLLM, ROCm, inference optimization, benchmarking, reliability, and capacity analysis.

## Software Architecture

System design, integration, backend services, cloud infrastructure, security, CI/CD, and software quality.

Do not replace these with a generic technology grid.

Technologies may appear inside case studies when they explain an engineering decision.

---

# 6. Site Ecosystem

Each property has one responsibility.

```text
meowcoder.com
Professional Identity + Selected Evidence

shouri.app
Product Proof

github.com/tc3oliver
Implementation + Open Source Proof

study.meowcoder.com
Technical Writing + Technical Depth

JISA Publication
Research / Security Proof
```

The main site curates and connects these properties instead of duplicating them.

---

# 7. Bilingual Strategy

The site should support **English and Traditional Chinese**.

## Routing

Use:

```text
/               English
/work           English
/about          English

/zh/            Traditional Chinese
/zh/work        Traditional Chinese
/zh/about       Traditional Chinese
```

English is the default language because the site represents a professional engineering identity to both local and international visitors.

Traditional Chinese is a complete localized experience, not mixed-language content inside English pages.

## Language switch

Navigation:

```text
EN / 中文
```

The switch should preserve the current page whenever a localized equivalent exists.

Example:

```text
/work/shouri
↕
/zh/work/shouri
```

## Translation policy

Translate:
- navigation;
- hero copy;
- About;
- Work index;
- public case studies;
- engineering expertise;
- research summary;
- site UI;
- SEO metadata.

Do not translate proper names unnecessarily:
- Oliver Yu
- Shouri / 收理
- Astro
- vLLM
- ROCm
- MCP
- Backlog.md

Technical terms should use commonly accepted English terminology when forced Chinese translation would reduce clarity.

## Study integration

`study.meowcoder.com` may remain primarily Chinese.

On the English homepage:
- show original article title if no English title is available;
- optionally show a short English category label;
- do not machine-translate article titles at runtime.

On the Chinese homepage:
- show Study content naturally in Chinese.

## SEO for bilingual pages

Each localized page must include:
- canonical URL;
- `hreflang="en"`;
- `hreflang="zh-Hant"`;
- `x-default` pointing to English;
- localized title;
- localized description;
- localized Open Graph metadata.

Do not automatically redirect users based on browser language. The URL must remain stable and shareable.

---

# 8. Information Architecture

Keep the site intentionally small.

```text
/
├── /work
│   └── /work/[slug]
├── /about
├── /zh/
│   ├── /zh/work
│   │   └── /zh/work/[slug]
│   └── /zh/about
└── external
    ├── Shouri
    ├── Study
    ├── GitHub
    └── ORCID
```

Primary navigation:

```text
Oliver Yu     Work     Writing ↗     About     GitHub ↗     EN / 中文
```

Do not add top-level:
- Blog
- Notes
- Categories
- Tags
- Archive
- Skills
- Certifications
- Research
- Resume

Research, credentials, and career context belong inside curated pages.

---

# 9. Homepage

## 9.1 Hero

English:

```text
Oliver Yu

AI Systems Engineer · System Architect

I design and build production AI systems that connect
models, knowledge, developer tools, and software infrastructure.

10+ Years in Software Engineering
Taiwan

[View Selected Work]    [Technical Writing ↗]
```

Chinese:

```text
Oliver Yu

AI Systems Engineer · System Architect

專注於設計與打造可投入實際使用的 AI 系統，
整合模型、知識、開發工具與軟體基礎架構。

10+ 年軟體工程經驗
Taiwan

[精選作品]    [技術文章 ↗]
```

Avoid:
- large portrait;
- decorative AI artwork;
- animated code;
- typewriter effects;
- logo walls;
- skill percentages.

---

## 9.2 Featured Product — Shouri

### Shouri / 收理

> An AI-powered information organizer for capturing webpages, files and media, then turning them into structured, searchable knowledge.

Show one polished product screenshot.

Key product principles:

### Save First

Original content is persisted before AI processing.

### Explicit AI

AI organization is intentionally triggered by the user.

### Recoverable Architecture

Source content and AI-derived information are separated.

Engineering areas:

```text
Product Design
System Architecture
AI Processing
Search & Retrieval
Web / PWA
Production Operations
```

CTA:

```text
Visit Shouri ↗
```

Shouri is the primary proof that Oliver can design, implement, ship, and operate a complete product.

---

## 9.3 Engineering Expertise

Display four compact blocks:

```text
AI & Agent Systems
Knowledge Systems
LLM Infrastructure
Software Architecture
```

Each block receives one concise explanation.

Do not use large lists of framework names.

---

## 9.4 Open Source — AI Coding Skills

### AI Coding Skills

> Development workflows for making coding agents more structured, predictable, and evidence-driven.

Primary public work:

### backlog-workflow

```text
Requirement
    ↓
Task Decomposition
    ↓
Just-in-Time Planning
    ↓
Implementation
    ↓
Validation
    ↓
Evidence
    ↓
Delivery
```

Highlight:
- requirement-driven development;
- Backlog.md integration;
- manual and autonomous execution;
- explicit execution boundaries;
- validation gates;
- evidence-based completion;
- agent instruction management.

Secondary public work:

### audit-claude-md

Use it to demonstrate:
- context quality;
- instruction design;
- progressive disclosure;
- maintainability of coding-agent instructions.

Third-party skills must retain clear attribution and must not be presented as original work.

CTA:

```text
View on GitHub ↗
```

---

## 9.5 Research

### Leakage-Resilient Cryptography

**On the construction of a leakage-resilient certificate-based encryption with equality test scheme**  
*Journal of Information Security and Applications, 2026*

Homepage summary:

> Co-authored research on leakage-resilient certificate-based encryption designed to preserve security under continual key leakage.

The paper proposes LR-CBEET, combining equality testing with resistance to side-channel leakage through key-update mechanisms, with formal analysis under IND-CCA and OW-CCA security notions.

CTA:

```text
View Publication ↗
```

Do not create a standalone Research navigation section for a single publication.

---

## 9.6 Technical Writing

Pull the latest 3–5 posts from:

`study.meowcoder.com`

Preferred topics:
- AI Agents;
- Coding Agents;
- LLM Infrastructure;
- MCP / Knowledge Systems;
- AI Architecture;
- Security;
- Engineering analysis.

Display:

```text
Date
Category
Title
```

Do not duplicate full articles on `meowcoder.com`.

CTA:

```text
Explore Technical Writing ↗
```

Study remains the canonical publication platform.

---

## 9.7 Professional Experience

### Enterprise Engineering

> 10+ years of software engineering experience spanning enterprise systems, system architecture, cloud platforms, security, mobile/web applications, and applied AI.

Current direction:

> Current work focuses on enterprise AI systems, coding agents, knowledge infrastructure, and LLM serving.

This section communicates professional scope and seniority without exposing employer-confidential implementation details.

---

## 9.8 Footer

```text
GitHub · Study · ORCID · Shouri · Site Source
meowcoder.com
```

`Site Source` links to the public `meowcoder.com` GitHub repository.

---

# 10. Work

`/work` contains only work that can be publicly inspected.

Initial release:

## Shouri

**Type:** Product · AI Systems

Detail structure:

```text
Problem
Product Principles
Architecture
Engineering Decisions
AI Processing
Search & Retrieval
Mobile / PWA Integration
Production Considerations
Result
Evidence
```

## AI Coding Skills

**Type:** Open Source · Agent Engineering

Detail structure:

```text
Problem
Coding-Agent Failure Modes
Workflow Architecture
Requirement / Backlog Separation
JIT Planning
Execution Boundaries
Validation & Evidence
Manual vs Autonomous Mode
Trade-offs
GitHub Evidence
```

Do not add a third case study merely to make the portfolio look larger.

A future Work entry must be:
1. public;
2. understandable;
3. technically meaningful;
4. supported by evidence;
5. representative of current professional direction.

---

# 11. Company Experience Policy

Employer work may be described only at a safe abstraction level.

Allowed:
- engineering domains;
- responsibilities;
- general problem categories;
- public technologies;
- reusable architecture principles;
- general professional experience.

Not allowed:
- internal project names;
- repositories;
- internal infrastructure topology;
- private benchmark numbers;
- customer information;
- proprietary source code;
- internal architecture diagrams;
- confidential workflows;
- roadmaps;
- credentials or secrets.

Safe example:

> Worked on enterprise AI engineering systems involving coding agents, knowledge retrieval, model infrastructure, validation, and software delivery automation.

Company experience establishes professional credibility.

It is not public case-study evidence.

---

# 12. LLM Infrastructure Positioning

LLM infrastructure remains a core expertise area.

Do not automatically create a public case study if the strongest evidence comes from confidential employer systems.

Public proof should primarily come from technical writing around:
- vLLM;
- ROCm;
- AMD GPU inference;
- model compatibility;
- quantization;
- TTFT / TPOT;
- throughput;
- concurrency;
- capacity methodology;
- long-context behavior;
- benchmark methodology;
- inference reliability.

A dedicated Work case study may be added later only when the environment, measurements, and content are safe to publish.

---

# 13. About

Opening copy:

> I am an AI systems engineer and system architect based in Taiwan, with more than 10 years of software engineering experience.
>
> My background spans enterprise systems, cloud platforms, mobile and web applications, software security, machine learning, and AI systems.
>
> Today, my work focuses on building reliable AI infrastructure, agentic developer systems, knowledge platforms, and production AI applications.

## Engineering Background

```text
AI Systems
System Architecture
Security & Privacy
Backend & Integration
Cloud & DevOps
Web / Mobile
Software Quality
Machine Learning
```

The page should communicate depth without becoming a résumé wall.

---

# 14. Career Snapshot

Use a compact progression:

```text
Today
AI Systems & Architecture

Earlier
Enterprise Systems
Technical Leadership
Cloud & Platform Engineering

Foundation
Mobile / Web Software Engineering
```

A downloadable CV or LinkedIn profile may contain complete employment history if needed.

Do not embed the original résumé PDF in the public repository.

---

# 15. Research & Education

## Research

**Journal of Information Security and Applications — 2026**

*On the construction of a leakage-resilient certificate-based encryption with equality test scheme*

Research areas:
- leakage-resilient cryptography;
- certificate-based encryption;
- equality testing;
- side-channel leakage;
- formal security analysis.

## Education

**M.S. in Computer Science and Engineering**  
National Taiwan Ocean University

Research and education should appear as concise credibility signals rather than dominate the site.

---

# 16. Selected Credentials

Credentials are secondary and belong near the bottom of About.

Recommended:

## AI Application Planner (Machine Learning) — Specialist Level

Ministry of Economic Affairs, Taiwan · 2025  
Valid through 2030.

## Microsoft AI-900

Azure AI Fundamentals.

Do not present course-completion certificates as professional certifications.

Examples that should not be labeled as certifications:
- PMP001 PMP International Project Management Training Course;
- Getting Started with Google Kubernetes Engine.

They may remain in LinkedIn or a detailed CV but do not need to appear on the main site.

Do not create a certificate logo wall.

---

# 17. Engineering Principles

Keep on About rather than as a large homepage section.

Core statement:

> Reliable AI systems require more than capable models.

Principles:

```text
Traceable
Testable
Observable
Permission-aware
Replaceable
Recoverable
```

These principles should reinforce engineering judgment, not function as marketing slogans.

---

# 18. Open Source Strategy

The website source itself should be public.

Recommended repository:

```text
github.com/tc3oliver/meowcoder.com
```

Repository positioning:

> Source code for meowcoder.com — a static-first professional engineering site built with Astro and TypeScript.

The repository is **not** positioned as a generic portfolio template.

The priority is maintaining a clean implementation for the real site.

Do not add abstraction solely to make the project easier for strangers to fork.

---

# 19. Open Source Scope

Public repository should include:

```text
src/
public/
astro.config.*
package.json
tsconfig.json
lint / formatting configuration
GitHub Actions workflows
Cloudflare deployment configuration where safe
README.md
LICENSE
CONTRIBUTING.md if external contributions are accepted
```

Public content may include:
- About copy;
- Shouri public description;
- public case studies;
- research metadata;
- engineering principles;
- localized English / Chinese content.

The website is already public, so public-facing text does not need to be hidden from the repository.

---

# 20. Open Source Exclusions

Never commit:

```text
.env
.env.*
API tokens
Cloudflare API credentials
Analytics secrets
private keys
WordPress database backups
wp-content archives containing private material
original résumé PDFs with personal information
private contact information
internal company documents
internal project names
confidential benchmark data
private infrastructure details
unreleased product information
```

Repository must include a `.gitignore` designed to prevent common local secrets and generated files from entering version control.

CI should include a secret-scanning step or equivalent repository protection.

---

# 21. Licensing

Use split licensing.

## Source code

**MIT License**

Applies to:
- Astro components;
- TypeScript;
- CSS;
- build tooling;
- scripts;
- generic site implementation.

## Personal content and brand assets

Unless explicitly stated otherwise:

```text
© Oliver Yu. All rights reserved.
```

Applies to:
- personal biography;
- case-study prose;
- original screenshots;
- personal photography;
- logos and brand assets;
- original diagrams where reuse is not intended.

README should make the distinction explicit.

This avoids unintentionally licensing all personal content under MIT.

---

# 22. Open Source README

Recommended opening:

```md
# meowcoder.com

Source code for my personal engineering site.

Built with Astro and TypeScript with a static-first architecture,
focused on performance, accessibility, maintainability, and bilingual content.

## Stack

- Astro
- TypeScript
- CSS
- Astro Content Collections / MDX
- Cloudflare Pages
- GitHub Actions

## Development

...

## License

Source code is licensed under the MIT License.
Personal content and brand assets are © Oliver Yu unless otherwise noted.
```

README should remain engineering-focused.

Do not turn it into a long personal biography.

---

# 23. Open Source Quality Bar

Because the repository itself is public evidence, it should demonstrate professional engineering practices.

Minimum:
- clean project structure;
- deterministic build;
- formatting and linting;
- type checking;
- automated CI;
- broken-link validation;
- accessibility checks where practical;
- dependency update workflow;
- no committed secrets;
- clear README;
- clear licensing;
- reproducible local setup.

Recommended CI:

```text
Install
↓
Format / Lint
↓
Typecheck
↓
Build
↓
Link Validation
↓
Tests
↓
Optional Lighthouse / Accessibility Gate
```

A public repository with poor hygiene weakens the site rather than strengthening it.

---

# 24. Open Source Relationship to Portfolio

The website source does not replace AI Coding Skills as the main Open Source feature.

Priority remains:

```text
Primary Open Source Proof
→ AI Coding Skills

Secondary Engineering Proof
→ meowcoder.com source
```

The site source may be linked from:
- footer;
- About;
- GitHub profile;
- repository list.

It does not need a large homepage feature card.

---

# 25. Visual Direction

Target feeling:

```text
Senior / Staff Engineer Portfolio
+
Technical Publication
+
Independent Product Builder
```

Use:
- light-first design;
- optional dark mode;
- warm neutral background;
- near-black typography;
- one restrained accent color;
- thin borders;
- large whitespace;
- strong typographic hierarchy;
- content width around 1100–1200 px;
- reading width around 680–760 px.

Visual evidence:
- Shouri screenshots;
- architecture diagrams;
- benchmark charts;
- GitHub project visuals;
- publication metadata.

Avoid:
- AI robots;
- cyberpunk art;
- neon gradients;
- particles;
- code rain;
- parallax;
- typewriter effects;
- 3D decorations;
- technology icon walls;
- skill percentage charts.

---

# 26. Technical Architecture

Recommended stack:

```text
Astro
TypeScript
CSS
MDX / Astro Content Collections
Cloudflare Pages
GitHub Actions
```

Static-first architecture.

Ship minimal client-side JavaScript.

Suggested structure:

```text
src/
├── components/
│   ├── Header.astro
│   ├── LanguageSwitcher.astro
│   ├── Hero.astro
│   ├── FeaturedProduct.astro
│   ├── ExpertiseGrid.astro
│   ├── OpenSourceFeature.astro
│   ├── ResearchFeature.astro
│   ├── WritingList.astro
│   └── Footer.astro
├── content/
│   └── work/
│       ├── en/
│       │   ├── shouri.md
│       │   └── ai-coding-skills.md
│       └── zh/
│           ├── shouri.md
│           └── ai-coding-skills.md
├── i18n/
│   ├── en.ts
│   └── zh.ts
├── layouts/
│   ├── BaseLayout.astro
│   └── WorkLayout.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── work/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── zh/
│       ├── index.astro
│       ├── about.astro
│       └── work/
│           ├── index.astro
│           └── [slug].astro
├── styles/
│   ├── tokens.css
│   └── global.css
└── lib/
    ├── i18n.ts
    └── study-feed.ts
```

Avoid introducing a database or CMS.

---

# 27. Localization Architecture

UI strings should live in typed locale dictionaries.

Example:

```ts
export const en = {
  nav: {
    work: "Work",
    writing: "Writing",
    about: "About"
  }
}

export const zh = {
  nav: {
    work: "作品",
    writing: "技術文章",
    about: "關於我"
  }
}
```

Long-form Work content should remain in localized MDX/content files rather than large translation JSON files.

Every Work item should share a stable translation key or slug mapping so the language switch can resolve equivalents reliably.

Do not use client-side runtime translation.

Localization should happen at build time.

---

# 28. Study Integration

Preferred flow:

```text
study.meowcoder.com RSS / Atom
        ↓
Build-time fetch
        ↓
Latest Writing
```

Requirements:
- fetch at build time;
- cache where practical;
- show latest 3–5 posts;
- feed failure must not fail production build;
- no database or CMS solely for synchronization.

If Study later supports bilingual metadata, the homepage may consume localized titles directly.

---

# 29. Performance & Accessibility

Targets:

```text
Lighthouse Performance     ≥ 95
Accessibility              ≥ 95
Best Practices             ≥ 95
SEO                        ≥ 95
```

Minimum:
- semantic HTML;
- keyboard navigation;
- visible focus;
- WCAG AA contrast;
- meaningful alt text;
- correct heading hierarchy;
- responsive layout;
- `prefers-reduced-motion`;
- optimized AVIF/WebP assets;
- explicit image dimensions;
- minimal JavaScript;
- no unnecessary third-party scripts.

Both English and Chinese routes must meet the same quality bar.

---

# 30. SEO

English homepage title:

```text
Oliver Yu — AI Systems Engineer & System Architect
```

English description:

> AI Systems Engineer and System Architect with 10+ years of software engineering experience, building AI systems, developer tooling, model infrastructure, and production software.

Chinese homepage title:

```text
Oliver Yu — AI 系統工程師與系統架構師
```

Chinese description:

> 擁有 10+ 年軟體工程經驗的 AI 系統工程師與系統架構師，專注於 AI 系統、開發者工具、模型基礎架構與正式產品開發。
```

Primary search identity:
- Oliver Yu
- AI Systems Engineer
- System Architect
- Agent Engineering
- LLM Infrastructure
- Software Architecture

Structured data:
- `Person`
- `WebSite`
- `SoftwareApplication` or `Product` for Shouri

Language-aware structured metadata should use the matching localized page content.

---

# 31. WordPress Migration

## Inventory

Export:
- current URLs;
- titles;
- posts;
- valuable media;
- backlinks;
- indexed pages.

## Redirect policy

- old article with equivalent Study article → `301` to Study;
- old About/home route → `301` to appropriate new page;
- obsolete content with no replacement → `410 Gone`.

Do not redirect every old URL to `/`.

## Archive

Keep a private backup of:
- WordPress database;
- `wp-content/uploads`;
- recovery assets.

The backup must not enter the public Git repository.

The new production site exposes no WordPress admin or runtime surface.

---

# 32. Security

Requirements:
- no `/wp-admin`;
- no unused backend;
- HTTPS only;
- security headers;
- CSP aligned with real dependencies;
- HSTS after deployment verification;
- no frontend secrets;
- dependency update workflow;
- secret scanning;
- no unnecessary third-party scripts;
- safe handling of analytics configuration;
- no sensitive personal files in the public repository.

---

# 33. Analytics

Track only signals tied to useful evidence:

- homepage visits;
- Work page visits;
- Shouri outbound clicks;
- Study outbound clicks;
- GitHub outbound clicks;
- publication outbound clicks;
- Site Source clicks;
- case-study engagement;
- language usage.

Do not optimize for raw pageview volume.

The useful question is:

> Do visitors move from professional identity to verifiable evidence?

---

# 34. Content Language Rules

English is the primary professional language.

Traditional Chinese provides a complete localized version.

Do not mix both languages in the same prose block except:
- product names;
- proper nouns;
- established technical terminology;
- intentional bilingual identity such as `Shouri / 收理`.

Translations should preserve meaning rather than mirror sentence structure literally.

Chinese copy should read naturally for Taiwan audiences.

English copy should remain concise and technically credible.

---

# 35. Homepage Final Order

```text
1. Hero
2. Featured Product — Shouri
3. Engineering Expertise
4. Open Source — AI Coding Skills
5. Research — JISA Publication
6. Technical Writing
7. Professional Experience
8. Footer
```

Visitor journey:

```text
Who is Oliver?
↓
Can he build a real product?
↓
What engineering problems does he specialize in?
↓
Can I inspect his implementation?
↓
Does he have deeper technical / research credibility?
↓
Can I inspect his technical thinking?
↓
What professional experience supports this?
```

The Chinese version follows the same information architecture.

---

# 36. Initial Release Scope

Required:
- English Home;
- Chinese Home;
- English / Chinese Work index;
- Shouri detail in both languages;
- AI Coding Skills detail in both languages;
- English / Chinese About;
- Research summary;
- Study integration;
- GitHub integration;
- public site repository;
- README and split license;
- CI;
- SEO / hreflang;
- responsive design;
- accessibility;
- WordPress migration and redirects.

Not required:
- third case study;
- full résumé;
- CMS;
- contact database;
- comments;
- user accounts;
- AI chatbot;
- GitHub activity dashboard;
- automatic machine translation;
- generic portfolio-template features.

---

# 37. Content Quality Rule

Every major public item should satisfy at least one:

```text
Built it
Published it
Measured it
Open-sourced it
Researched it
```

If none applies, it should not be a homepage focus.

Prefer engineering evidence over marketing adjectives.

Bad:

> Passionate AI engineer with extensive experience in cutting-edge technologies.

Good:

> Designed and benchmarked production-oriented AI systems across model serving, agent workflows, knowledge retrieval, and software delivery.

---

# 38. Acceptance Criteria

The redesign is complete when:

1. A first-time visitor can identify Oliver's current professional role from the first viewport.
2. The site clearly communicates 10+ years of engineering experience without becoming a résumé wall.
3. Shouri is the primary Product Proof.
4. AI Coding Skills is the primary Open Source Proof.
5. The meowcoder.com repository is publicly inspectable and demonstrates professional engineering quality.
6. The JISA publication provides visible Research Proof.
7. Study remains the canonical technical-writing platform.
8. Company experience is clearly separated from public case studies.
9. No employer-confidential information is exposed.
10. Work contains only public, inspectable evidence.
11. GitHub is clearly linked as implementation evidence.
12. English and Traditional Chinese versions are complete and structurally consistent.
13. Language switching preserves equivalent page context.
14. Canonical and `hreflang` metadata are correct.
15. Desktop and mobile layouts are polished.
16. Lighthouse targets are met on both languages.
17. WordPress production surface is removed.
18. No secrets or sensitive personal files exist in the public repository.
19. Source code licensing and personal-content ownership are clearly separated.
20. The site does not add low-quality projects merely to increase project count.

---

# 39. Implementation Backlog

## MCD-1 — Repository Bootstrap

- create `tc3oliver/meowcoder.com`;
- Astro + TypeScript;
- lint / formatting / typecheck;
- build;
- GitHub Actions;
- Cloudflare Pages staging;
- `.gitignore`;
- MIT source-code license;
- content licensing notice.

**Done when:** clean local and CI builds pass and staging deployment works.

---

## MCD-2 — Design System

- typography;
- spacing;
- neutral color system;
- accent;
- borders;
- responsive shell;
- header;
- footer;
- focus states;
- optional dark mode.

**Done when:** desktop and mobile foundations are visually complete.

---

## MCD-3 — Bilingual Foundation

- English default route;
- `/zh/` routes;
- typed UI dictionaries;
- language switch;
- localized metadata;
- canonical;
- hreflang;
- equivalent-page mapping.

**Done when:** core empty page shells work correctly in both languages.

---

## MCD-4 — Homepage

Implement:
- Hero;
- Shouri;
- Engineering Expertise;
- AI Coding Skills;
- Research;
- Technical Writing;
- Professional Experience;
- Footer.

Implement both languages.

**Done when:** homepage communicates the professional identity without requiring deeper navigation.

---

## MCD-5 — Work Content Model

- Astro Content Collections / MDX;
- localization schema;
- metadata validation;
- Work index;
- Work detail layout;
- translation mapping.

**Done when:** new bilingual case studies can be added primarily as content rather than page code.

---

## MCD-6 — Shouri Case Study

Publish both languages.

Required sections:
- problem;
- product principles;
- architecture;
- decisions;
- AI processing;
- retrieval;
- PWA/mobile;
- production considerations;
- result;
- evidence.

---

## MCD-7 — AI Coding Skills Case Study

Publish both languages.

Required sections:
- problem;
- agent failure modes;
- workflow architecture;
- requirement/backlog separation;
- JIT planning;
- execution boundaries;
- validation/evidence;
- manual/auto mode;
- trade-offs;
- GitHub evidence;
- attribution.

---

## MCD-8 — Research & About

- professional summary;
- career snapshot;
- engineering background;
- research;
- education;
- selected credentials;
- engineering principles;
- both languages.

---

## MCD-9 — Study Integration

- RSS / Atom parser;
- latest 3–5 entries;
- build-time fetch;
- graceful failure;
- language-aware presentation.

---

## MCD-10 — Open Source Quality

- README;
- license separation;
- repository hygiene;
- reproducible setup;
- CI;
- secret scanning;
- dependency update policy;
- link checks;
- public contribution policy.

---

## MCD-11 — SEO / Accessibility / Performance

- metadata;
- structured data;
- sitemap;
- robots;
- canonical;
- hreflang;
- accessibility validation;
- responsive checks;
- Lighthouse optimization.

---

## MCD-12 — WordPress Migration

- private backup;
- URL inventory;
- redirect mapping;
- Study migration mapping;
- obsolete-content retirement;
- remove WordPress production runtime.

---

## MCD-13 — Production Cutover

- deploy;
- DNS/TLS verification;
- redirects;
- analytics;
- sitemap;
- link validation;
- desktop/mobile QA;
- English/Chinese QA;
- repository public release.

---

# 40. Explicit Non-Goals

Do not build:
- another blog engine;
- CMS;
- comments;
- accounts;
- contact database;
- AI chatbot;
- animated developer portfolio;
- skill percentage charts;
- technology logo wall;
- Study clone;
- GitHub clone;
- full CV archive;
- automatic runtime translation;
- generic theme marketplace;
- portfolio-template framework.

The site remains small, fast, technically credible, and personally specific.

---

# 41. Source Repository Definition

The source repository should itself communicate engineering quality:

```text
tc3oliver/meowcoder.com

Public
Static-first
Bilingual
Accessible
Tested
Deployable
Documented
Secure by default
```

The repository exists first to support `meowcoder.com`.

Its open-source value is a consequence of good engineering, not the primary product requirement.

---

# 42. Final Brand Model

```text
                    Oliver Yu
        AI Systems Engineer · System Architect
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Product         Open Source       Research
     Shouri          AI Skills         JISA Paper
        │                │                │
        └────────────────┼────────────────┘
                         │
                 Technical Writing
                       Study
                         │
                 10+ Years of
              Engineering Experience
                         │
                 Site Engineering
                  meowcoder.com
```

`meowcoder.com` should demonstrate a professional identity through evidence:

**Product execution · Open source · Research · Technical depth · Senior engineering experience**

Every design, content, localization, and implementation decision should strengthen that structure.
