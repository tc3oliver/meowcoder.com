---
title: 'Professional Systems & AI Engineering'
type: 'Professional Experience · 10+ Years'
summary: 'More than a decade of engineering experience spanning enterprise software, cloud platforms, mobile products, system architecture, and applied AI.'
kind: 'experience'
slug: 'professional-engineering'
locale: 'en'
translationKey: 'professional-engineering'
order: 2
draft: false
meta:
  - label: 'Experience'
    value: '10+ Years'
  - label: 'Progression'
    value: 'Software Engineering → Architecture → AI Systems'
---

## What this covers

More than a decade of this engineering work was done inside organisations, which
is why it appears here as one account rather than as a list of projects: none of
it can be linked to, and none of it is named. The organisations it was built
for, and the systems' internal names, do not appear anywhere on this site.

What remains after that is still the substance: the problem domains, the
engineering responsibilities, and the technical scope, described in general
terms and grouped into the three that recur. Nothing below claims a result,
because a result nobody can check is not evidence — it is an assertion, and this
entry is written to be worth reading without one.

## Applied AI Systems

<p class="theme-domains">Conversational systems · Meeting intelligence · Knowledge retrieval · Natural-language BI · Computer vision</p>

The most recent years have been applied AI systems, which in practice means
systems where a model is one component among many. The model does the part that
could not be written by hand; everything around it — retrieval, authentication,
logging, concurrency, the interface a person actually touches — is ordinary
engineering, and it is most of the work.

One line of it is meeting intelligence: speech recognition over recorded
discussion, summarization of the resulting transcript, speaker diarization,
action items tracked out of what was said, retrieval-augmented question
answering over the accumulated record, and translation between English and
Chinese. It is delivered as a web front end and an API together, so handling
concurrent use is as much of the design as the models are.

A second is conversational systems for customer support: natural-language
understanding over an incoming question, querying against an FAQ and a knowledge
base, multi-turn dialogue that holds context across a conversation, and
embedding-based approximate-nearest-neighbour retrieval so that a question
sharing no keywords with its answer still finds it. These systems hand back to a
person rather than pretending not to need one, which puts the handoff boundary,
the logging around it, and the monitoring of model behaviour over time inside
the design rather than after it.

A third is business-data interaction: turning a question asked in natural
language into SQL, generating the chart or report that answers it, and
consolidating several sources into a warehouse underneath so that there is
something coherent to query at all — with access control and caching, because a
question anyone can ask is also a query anyone can run.

Underneath all three sits the quieter half of applied AI: intent modelling,
corpus collection and labelling, and multi-turn dialogue-flow design. Computer
vision enters the same way, applied to privacy rather than to recognition for
its own sake — face detection with automatic blurring and masking, so recorded
material can be kept without keeping everyone's face in it.

## Enterprise & Cloud Systems

<p class="theme-domains">Backend services · Cloud infrastructure · Identity and access control · Real-time communication · Enterprise workflow · Production operations</p>

Before applied AI became the centre of the work — and still underneath it — is
enterprise engineering: systems with real users, an audit trail, and a
compliance boundary they have to stay inside.

Information-security governance is one shape it takes. Single sign-on with
permission control, vulnerability scanning and risk assessment, sign-off
workflows moved from paper into an application, and remediation tracked through
to closure, built to align with ISO 27001 practice. Tracking and approval
systems are another: requirements analysis and data modelling first, then a
microservice architecture behind them, with querying and reporting layered on
top for the people who have to answer for the process.

Real-time communication arrived through telemedicine — WebRTC video between
participants, native mobile clients alongside a management platform, and
recording, with the security controls that obliges. Other systems of the same
period were workflow rather than real time: request and reporting flows, mobile
platforms, and cloud storage applications.

The part that generalizes past any one system is engineering practice. Version
control and CI/CD standards, infrastructure defined as code, static analysis and
dependency checking, development templates and documentation — and teaching
those internally, along with API design, authentication and authorization,
release and operations, service decomposition, containerization and deployment.
More recently that has been an engineering-management responsibility as well as
an engineering one, which is mostly a matter of making the standard the easy
path rather than the enforced one.

## Mobile & Connected Products

<p class="theme-domains">iOS and Android · Retail and back-office systems · Connected devices and smart home · Indoor positioning · Web and API integration</p>

The foundation underneath both of the above is older and narrower in scope:
applications, on whatever platform the problem required.

It began as freelance and contract iOS work, widened into dual-platform
mobile development, and then extended into the systems behind those
applications — point-of-sale and ERP for retail and back-office operations, web
systems, cloud services, and the API integration joining them to each other.

Connected devices were the other half of it. A smart-home cloud platform meant
device registration and management, control from more than one kind of client,
person and face recognition applied to entry and doorbell scenarios, and a rule
engine for automation — away mode, energy saving, the ordinary conditional logic
a household turns out to need — deployed for availability and designed for
secure access. Bluetooth Low Energy indoor positioning and location tracking is
a different discipline again: a signal that is never quite reliable, turned into
a position that is useful anyway.

The languages of this period were whatever the platform asked for — C++, C#,
Objective-C, Swift, JavaScript, Dart, Python. What carried forward was not any
one of them.

## Progression

Eleven years in four steps: contract and freelance mobile work at the start,
then software engineering, then senior and lead engineering, and most recently
AI engineering alongside engineering management. The technical shape of that is
shorter to state.

<figure class="progression">
<ol class="progression__stages" role="list">
<li class="progression__stage">Mobile / Web</li>
<li class="progression__stage">Enterprise &amp; Cloud</li>
<li class="progression__stage">System Architecture</li>
<li class="progression__stage">Applied AI</li>
<li class="progression__stage">AI Systems</li>
</ol>
<figcaption class="progression__caption">These systems reflect a progression from application development to architecture and, more recently, production AI systems.</figcaption>
</figure>
