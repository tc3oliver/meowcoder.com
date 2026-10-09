---
title: 'PiShip'
type: 'Open Source · Agent Infrastructure'
summary: 'A toolchain that lets a company ship Pi as its own coding agent without forking it, adding OIDC login, short-lived gateway credentials, policy, and a sandbox.'
outcome: 'In the v0.13.0 qualification run, each of nine attested archives was built twice and all nine payloads were identical. The run passed on its first attempt.'
indexMeta: 'Pre-release · Linux, macOS, Windows'
evidence: 'github.com/tc3oliver/piship · docs/status.md, the v0.13.0 release, and its qualification run'
slug: 'piship'
locale: 'en'
translationKey: 'piship'
order: 4
draft: false
meta:
  - label: 'Status'
    value: 'Pre-release'
  - label: 'Built on'
    value: 'Upstream Pi, unmodified'
  - label: 'Release'
    value: 'Attested archives · linux-x64, darwin-arm64, win32-x64'
---

Independently designed and built by Oliver Yu.

## The problem

A company that puts its developers on a coding agent like <a href="https://github.com/earendil-works/pi" target="_blank" rel="noopener noreferrer">Pi</a> soon wants four things the agent does not ship with: single sign-on, no provider API keys on laptops, a sandbox around every command, and a record of what the agent did. The usual route is a fork, which means merging every upstream release for as long as the company uses it.

With <a href="https://github.com/tc3oliver/piship" target="_blank" rel="noopener noreferrer">PiShip</a>, the company writes one `piship.yaml` and PiShip builds a branded command from it; the repository's examples are `acmecode`, `mypi`, and `devcode`. Pi stays upstream, pinned at 1.1.0 in v0.13.0. A new Pi release means bumping the pin and running the compatibility tests.

## What it does

- **Sign-in.** OIDC with PKCE. PiShip trades the identity token at the company's credential broker for a short-lived gateway credential, keeps it in the OS keychain by default, renews it, and revokes it on logout. The gateway sees only that credential.
- **Models.** Requests go to the company's OpenAI-compatible gateway, and only to the models the manifest allows.
- **Policy.** Tool calls, file access, shell commands, and MCP tools are checked before they run, and `policy explain` names the rule that decided. A `deny` or `ask` rule the runtime cannot enforce fails the launch with `POLICY_UNENFORCEABLE`.
- **Sandbox.** bubblewrap, Seatbelt, or a remote backend. If the manifest requires a sandbox and it cannot start, the command does not run on the host.
- **Audit.** Metadata-only audit events go to an HTTP collector the company runs.

<figure class="state-flow">
<ol class="state-flow__steps" role="list">
<li class="state-flow__step">
<span class="state-flow__name">OIDC login</span>
<span class="state-flow__detail">The developer signs in through the company’s identity provider.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Company identity</span>
<span class="state-flow__detail">Issues an identity token.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Credential broker</span>
<span class="state-flow__detail">Exchanges the token for a gateway credential.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Gateway credential</span>
<span class="state-flow__detail">Short-lived, kept in the OS keychain by default.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Pi runtime</span>
<span class="state-flow__detail">Sends model requests with that credential.</span>
</li>
<li class="state-flow__step">
<span class="state-flow__name">Company LLM gateway</span>
<span class="state-flow__detail">Sees only that credential; no provider API key is on the laptop.</span>
</li>
</ol>
<figcaption class="state-flow__caption">The path from login to the company gateway.</figcaption>
</figure>

PiShip does not replace the identity provider, broker, or gateway. The endpoints a company has to provide are specified in <a href="https://github.com/tc3oliver/piship/blob/main/docs/enterprise-integration.md" target="_blank" rel="noopener noreferrer"><code>docs/enterprise-integration.md</code></a>.

## How a release is checked

A v0.13.0 release is nine archives: three example distributions on three platforms. Each is built twice and the two builds are compared. In v0.13.0's qualification run, 9 of 9 were payload-equal. The two `devcode` builds differ in bytes only because `vulnerabilities.json` records the scan time. The same run verified the attestations, checked registry signatures and ran the vulnerability gate (both passed 9 of 9), and exercised tamper rejection and offline install.

Run 37887824632 passed on the tagged commit on its first attempt: 54 jobs passed, and 2 were skipped because the issue-report jobs run only on schedule.

## Evidence and limits

`docs/status.md` is the single source of truth for what current `main` supports, and it lists the limits. The main ones:

- No validation yet against a real company identity provider or company gateway in production.
- Native Windows has no sandbox adapter. A distribution that requires the sandbox fails closed there with `SANDBOX_UNAVAILABLE`.
- The project operates no signed update channel. The published archives are update-disabled, so a consumer pins and installs the exact qualified archive.
- The `acmecode` win32 archive ships with `sandbox.required: false`.
- The macOS sandbox heartbeat test has flaked with no root cause found.
- Vendored Pi packages are not checked for registry signatures.
- For v0.13.0, a real pi-code isolated or background agent run is not verified.

<div class="evidence">

- <a href="https://github.com/tc3oliver/piship" target="_blank" rel="noopener noreferrer"><code>github.com/tc3oliver/piship</code></a>
  — the source, the examples, and the changelog.
- <a href="https://github.com/tc3oliver/piship/blob/main/docs/status.md" target="_blank" rel="noopener noreferrer"><code>docs/status.md</code></a>
  — what is supported, the evidence behind each claim, and the known limits.
- <a href="https://github.com/tc3oliver/piship/releases/tag/v0.13.0" target="_blank" rel="noopener noreferrer">v0.13.0 pre-release</a>
  — the nine archives with their SHA-256 files and attestations.

</div>
