---
title: 'Shouri / 收理'
type: 'Independent Product · AI Systems'
summary: 'An AI-powered organizer that preserves webpages, files, and media before turning them into structured, searchable knowledge.'
outcome: 'An end-to-end product implementation spanning content capture, source preservation, AI structuring, retrieval, mobile integration, and production operations.'
indexMeta: 'Save First · Explicit AI · Recoverable by Design'
evidence: 'shouri.app · Product, plans, privacy, terms, and refund policy'
slug: 'shouri'
locale: 'en'
translationKey: 'shouri'
order: 0
draft: false
meta:
  - label: 'Status'
    value: 'Public Beta'
  - label: 'Interface'
    value: 'Traditional Chinese · Google sign-in'
  - label: 'Distribution'
    value: 'Web app, installable to the home screen'
---

Independently designed, built, and operated by Oliver Yu.

## Problem

Saving is the easy half. A twelve-minute cooking video, a PDF specification, a
link dropped into a group chat — each takes one tap to keep, and each is
effectively gone by the time it is needed. The collection grows; the ability to
act on it does not.

Two design choices common in AI-assisted tools make that worse:

- **Processing at capture time.** If extraction or the model call fails, the
  thing the user actually wanted — the original — can be lost with it.
- **Derived text written over the source.** Once a summary replaces the page,
  there is nothing left to re-derive from when the model gets it wrong.

Shouri treats capture and organization as separate stages, so a failure in one
never affects the other.

## Product Principles

Three principles, stated in product terms and enforced in the data model rather
than in the interface.

**Save first.** The original is persisted before any AI call. The item reaches a
saved state the user can walk away from before organization is offered at all.

**Explicit AI.** AI organization is off by default and runs only after the user
turns it on, and nothing is sent for processing before that. It can be switched
off again at any point, and content already saved is unaffected.

**Recoverable architecture.** A failed extraction or a poor organization run does
not delete or overwrite the saved item.

## Architecture

An item moves through three observable states, and the boundaries between them
are the architecture.

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">Saved</span>
<span class="state-flow__detail">The original is durable. Nothing has been sent anywhere yet.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Source</span>Text in the database, an uploaded file in private object storage</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Organizing</span>
<span class="state-flow__detail">Usable content is extracted from the original and sent for AI processing.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Source</span>Read, never replaced</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Organized</span>
<span class="state-flow__detail">The item becomes searchable, correctable, shareable, and eligible for Review.</span>
<span class="state-flow__part"><span class="state-flow__part-label">Source</span>The original, unchanged</span>
<span class="state-flow__part state-flow__part--derived"><span class="state-flow__part-label">AI-derived</span>Title, summary, key points, classification, tags, subject fields</span>
</li>
</ol>
<figcaption class="state-flow__caption">A solid outline represents saved source content; a dashed outline represents model-generated content. Derived fields are stored separately, so a failed extraction never affects the saved source and any item can be organized again.</figcaption>
</figure>

Properties that follow from that split:

- Stored files are never publicly readable. Display and download go through
  short-lived signed links generated on demand.
- Deletion is staged. A deleted item sits in trash for thirty days and can be
  restored; a daily scheduled job then removes it permanently, original files
  included. Deleting an entire account is immediate and permanent, with no trash
  and no recovery window.
- Items are private by default. The one exception is a share link the user
  creates: an unguessable URL that anyone holding it can read.

## Engineering Decisions

Each decision below is paired with the constraint it protects and what it costs.

<div class="decision">

### Persist before processing, not after

**Why** — It rules out the failure mode where a capture is lost because a
downstream extraction failed.

**Trade-off** — A saved item can sit unorganized indefinitely, which is part of
why the Review queue exists.

</div>

<div class="decision">

### Ask for AI consent at the moment of use

**Why** — Asking the first time organization is actually used ties the decision
to something the user is doing on purpose.

**Trade-off** — Collecting it during registration would have been simpler to
implement and would have removed a prompt from the moment of use.

</div>

<div class="decision">

### Store derived fields separately rather than mutating the record

**Why** — Reprocessing is then always safe, because there is nothing to lose by
running it again.

**Consequence** — An item is two things at once: an original that never changes,
and a derived layer that any later run may replace in full.

</div>

<div class="decision">

### User corrections win

**Why** — Without that rule, the system would silently undo the user's work every
time it reprocessed an item, and correcting anything would stop being worth the
effort.

**Trade-off** — Edits to classification, tags, and subject fields are final, so a
later run cannot improve a field the user has already touched.

</div>

<div class="decision">

### Show the cost before spending it

**Why** — Organization is metered in AI credits and priced by content length, so
the cost of one item is not obvious in advance.

**Trade-off** — Each item displays its estimated cost and waits for the user to
accept it, which puts a confirmation step in front of every run.

</div>

<div class="decision">

### Cap the analysis, not the content

**Why** — The original is retained in full, so a later run on a higher limit can
go further.

**Trade-off** — When an item exceeds the per-item analysis limit of the current
plan, that run stops at the limit and the item is organized only that far.

</div>

Session and device tokens are kept only as hashes, so that disclosure of the
database does not by itself grant access to accounts.

## AI Processing

Organization produces a title, summary, key points, a classification, tags, and
subject fields. It accepts URLs, plain text, images, PDFs, audio, and video,
including several files in one upload.

Output is structured by subject rather than reduced to one generic summary.
Seven subjects each have their own structured fields:

- **Recipe** — an ingredient list and steps that can be checked off while
  cooking.
- **Show or film** — year, genre, running time, and where it can be watched.
- **Training** — a video turned into a checkable list of movements.
- **Tutorial** — the steps, plus what has to be prepared first.
- **Place** — address and opening hours, grouped by city.
- **Event** — date and location read from something like a poster, with
  approaching events surfaced first.
- **Product** — specification, seller, and the price at the time it was saved.

Manual and automatic organization are separated by plan. Higher-cost inputs such
as PDFs, audio, and video still require confirmation by default. AI analysis,
storage, and file limits are published and enforced centrally by the product;
current plan details remain on the Shouri website.

AI-generated output is not guaranteed to be correct. The product states directly that generated titles,
summaries, key points, classifications, and tags can be wrong, that the original
is always kept in full, and that the original is the authority for any judgement
that matters. User content is not used to train models.

## Search & Retrieval

Retrieval is the point of the product, so organization is designed to produce
retrieval structure rather than readable prose.

- **Results explain the hit.** A search result shows the passage that matched,
  not only a title, so a result can be judged without opening it.
- **Structured entry points sit next to free text.** Classification, tags, and
  subject fields are all searchable dimensions, and user corrections to them
  persist across reprocessing.
- **Review is a prioritized queue, not a reverse-chronological list.** It
  surfaces items that failed processing, items about to expire, items never
  organized, and items not opened for a long time — the four states most likely
  to need attention.
- **Export is part of retrieval.** An account's items and organization results
  can be exported at any time, and every exported item points at the download
  location of its original file.

## Mobile / PWA Integration

Shouri is not distributed through an app store. It is a web application that
installs to the home screen, and each platform is given the integration path it
actually supports.

- **Android.** Installing the PWA registers Shouri in the system share menu. No
  shortcut and no pairing code.
- **iPhone and iPad.** An official Apple Shortcut, paired once, makes capture
  available from Safari, Photos, Files, and other apps through the share sheet.
- **Desktop web.** Paste a URL or text, or drag in images, PDFs, audio, and
  video — several files at once.

The product provides installation and setup guidance for each platform. Both
mobile paths land in the same capture flow, so an item saved from a share menu is
the same object as one saved on the desktop.

## Production Considerations

Production operation includes metering, quotas, storage, data lifecycle, and
recovery from billing failures.

**Metering.** Organization consumes AI credits proportional to content length.
Processing time, outcome, credit usage, and service cost are recorded per job,
for running and billing the service — explicitly not for advertising or
profiling.

**Plans and resource limits.** AI analysis, storage, and file limits are enforced
centrally. Running out of credits stops new organization only; existing
collections, search, and original files are untouched.

**Data lifecycle.** Thirty-day trash, a daily scheduled job for permanent
deletion including original files, and immediate irreversible account deletion.

**Third-party processors are enumerated by category** rather than left vague: the
AI service, a parsing service used to fetch public media from social posts, cloud
storage and hosting, the payment provider, and transactional email. Card data is
held by the payment provider; Shouri keeps only order number, amount, time, and
outcome.

**Abuse limits.** Content extraction and social-post parsing exist to organize a
user's own collection, not to act as a general downloader, and are rate-limited
on that basis.

**Availability is described honestly.** The service is offered as-is with no
uptime guarantee, backups are taken regularly, and users are told to keep their
own copy of anything important rather than treat Shouri as the only place a file
exists.

**Administrative access is bounded** to aggregate usage, storage, and cost
statistics.

**Billing failures have a defined repair path.** A successful payment that did
not activate Pro is repaired by granting the entitlement; duplicate charges are
refunded.

## Result

Shouri now provides a complete product flow from content capture and source
preservation through AI structuring, full-text retrieval, mobile sharing,
metering, storage, data lifecycle, and production operations.

- [shouri.app](https://shouri.app) is publicly available.
- The working interface covers capture, AI organization, search, Review, and export.
- Privacy, terms, plans, and data-processing policies are published.

## Product Information

<div class="evidence">

- **Product** — [shouri.app](https://shouri.app)
- **Plans and credits** — [shouri.app/pricing](https://shouri.app/pricing)
- **Privacy policy** — [shouri.app/privacy](https://shouri.app/privacy)
- **Terms of service** — [shouri.app/terms](https://shouri.app/terms)
- **Refund and cancellation policy** —
  [shouri.app/refund](https://shouri.app/refund)

</div>

These links provide the current product, plan, privacy, terms, and refund
information for Shouri.
