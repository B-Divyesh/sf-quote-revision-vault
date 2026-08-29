# Adversarial first-read review 4 — FAIL

Reviewed 2026-08-29 against `https://quote-revision-vault.sociobot.in` and source commit `7161fb9a8eb635142be9065611fd4f96320d4fed`.

## Verdict

**FAIL.** No blocking defect was reproduced: the cold first screen, one-click demo, reset, storage isolation, offline reload, routes, and all 14 declared claim commands work. Six findings remain. The live Privacy page and README make service-side privacy promises that have no matching claim entry, the landing title uses an unbounded “safely” claim, product terminology diverges after entering the demo, and three structure details do not meet the stated site skeleton.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×1000 loaded `/` at scroll position 0 with HTTP 200, no console errors, no off-origin requests, and no horizontal overflow.

Before scrolling, I understood: **this saves earlier versions of client quotes for solo service providers and compares what changed before billing; click “Try it with sample data” first.** The exact text was:

- “Revise quotes without losing earlier prices or scope”
- “For solo service providers who need to prove what changed before billing.”
- “Try it with sample data” and “See three saved revisions and their price changes.”

All required copy was inside both viewports. On mobile, the headline ended at 462 px, the audience sentence at 545 px, the action at 669 px, and the facts at 827 px. On desktop, they ended at 656 px, 754 px, 827 px, and 962 px. This passes the first-read gate.

## Findings

### F-4-1 — Medium — Service-side privacy promises have no matching claim entry

**Exact quote/location:** README, “The review-link service receives no quote contents. The service stores a random link ID and expiry date. It stores no quote or customer details.” Live `/privacy`, “Its quote contents stay in the link and are never sent to our server.”

**Why this fails:** `local-privacy` promises that quote data stays in the browser until export or link copying. `review-link` promises creation, acknowledgment, expiry, and blocking. Neither claim entry states what the browser sends to the review-link service or what that service stores. The tagged browser privacy test edits and saves `/demo`; demo mode deliberately makes no registry request. The untagged API logic test checks stored fields, but it does not place these public promises in the claim contract or capture the real create-link request. A visitor may rely on this distinction when deciding whether to put customer data in a quote.

**Concrete fix:** Add a `review-registry-privacy` entry for “Creating a review link sends and stores no quote or customer contents.” Its tagged test must capture the real create-link POST, assert that its body contains only `action`, `expiresAt`, and `ownerKey`, then assert that the registry entity contains only status fields. Alternatively, remove or narrow all quoted sentences.

### F-4-2 — Medium — The landing title makes an unlisted, vague safety claim

**Exact quote/location:** `<title>`, Open Graph/Twitter title, and route announcement on `/`: “Quote Revision Vault — Revise quotes safely”.

**Why this fails:** “Safely” does not name an observable result or a bounded kind of safety. It is not a claim in `.factory/claims.json`, and it asks a visitor to infer data, billing, or legal safety. The title pattern requires plain words describing what the product does.

**Concrete fix:** Use “Quote Revision Vault — Save and compare quote revisions” for the title and social metadata. This states the tested job without adding a new promise.

### F-4-3 — Low — The product uses “receipt” for two different review-link concepts

**Exact quote/location:** First demo screen, heading “Customer review receipt”; `/ack` meta description, “copy an acknowledgment receipt”; `public/manifest.webmanifest`, “send a clear revision receipt.” The landing page and README instead use “review link” for the URL and “acknowledgment” for the returned record.

**Why this fails:** The demo heading sits above **Create review link** and **Import acknowledgment code**, so “receipt” does not tell the visitor which artifact the section contains. It also contradicts the repository terminology table and leaves the installed-app description using a third name.

**Concrete fix:** Rename the demo heading to “Customer review link,” change the `/ack` description to “Review one saved quote revision and create an acknowledgment code,” and change the manifest description to “Track quote changes and send a customer review link.”

### F-4-4 — Low — Privacy disappears from the 390 px header

**Exact quote/location:** Live 390 px header shows only “Demo” and “Vault”. `src/style.css` hides `.nav a:nth-child(3)` below 600 px; that third link is “Privacy”.

**Why this fails:** The standard header calls for the Privacy destination on every route and viewport. The footer link still works, but a phone visitor must scroll through the full landing page to find it, and the header is not consistent with desktop.

**Concrete fix:** Keep Privacy visible at 390 px by allowing the header/nav to wrap, reducing the mobile wordmark, or using a labelled menu. Add a 390 px assertion that the header Privacy link is visible and has a 44 px target.

### F-4-5 — Low — The designed 404 footer omits the required build identifier

**Exact quote/location:** Live `/missing-review-4` footer contains “Save and compare quote revisions in this browser,” Privacy, Terms, and “Built by Param Factory (external)”. App-route footers also contain “Version 1.0.0 · Build 2026-08-29”.

**Why this fails:** The 404 is a real site route, but its footer is not consistent with the application footer and omits the version/build identifier required by the site skeleton.

**Concrete fix:** Add the same version/build identifier to `public/404.html`, preferably through one tested shared build value. Extend the 404 test to compare the required footer fields with an app route.

### F-4-6 — Low — The sitemap omits the customer review route

**Exact quote/location:** `public/sitemap.xml` lists `/`, `/demo`, `/vault`, `/privacy`, and `/terms`; the real `/ack` route is absent. Live `/ack` returns HTTP 200 and renders “This review link is incomplete” without a packet.

**Why this fails:** The route is part of the product and has its own title, canonical URL, h1, and recovery action. The site-structure contract requires the sitemap to list every route.

**Concrete fix:** Add `https://quote-revision-vault.sociobot.in/ack` to the sitemap, or document and test an explicit `noindex` exception for this token-bearing recipient route if it should not be discoverable.

## Copy audit

Counts are whitespace-delimited. Raw sample values, dates, prices, and table column labels are data rather than sentences. Headings, actions, metadata, and footer copy are included. No audited unit exceeds 22 words and no banned marketing adjective appears. `F-4-1` and `F-4-2` are claim-contract/plainness failures; all other landing and README units pass.

### Landing page

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Quote Revision Vault | 3 | Wordmark; clear |
| Demo | 1 | Navigation; clear |
| Vault | 1 | Navigation; clear |
| Privacy | 1 | Clear, but hidden at 390 px: F-4-4 |
| Quote Revision Vault — Revise quotes safely | 7 | F-4-2: vague, unlisted safety claim |
| Keep earlier quote prices and scope while you prepare the next revision. | 12 | Meta description; clear |
| Revise quotes without losing earlier prices or scope | 8 | Clear headline |
| For solo service providers who need to prove what changed before billing. | 12 | Clear audience and result |
| Try it with sample data | 5 | Result-naming primary action |
| See three saved revisions and their price changes. | 8 | Clear action result |
| Quote data stays in this browser until you export it or copy a review link | 15 | `local-privacy` |
| Works offline after your first visit | 6 | `offline-reload` |
| The free vault creates one quote | 6 | `free-one-quote` |
| An art-deco route carries quote pages through a brass archive gate. | 11 | Informative image alt text |
| Sample revision comparison | 3 | Clear section heading |
| How quote revisions work | 4 | Clear section heading |
| Save each revision | 3 | Clear step heading |
| Name the reason for every price or scope change. | 9 | Clear instruction |
| Compare any two | 3 | Clear step heading |
| Read line-item changes and totals in one view. | 8 | Clear result |
| Send a review link | 4 | Clear step heading |
| Export a PDF or copy a dated review link. | 9 | Clear actions |
| Quote data stays in this browser | 6 | Clear section heading |
| Quotes and revisions stay in this browser. | 7 | `local-privacy` |
| Export a vault file for your own backup. | 8 | `vault-export` |
| What this tool does not do | 6 | Clear section heading |
| No payments or invoices. | 4 | `scope-boundaries` |
| No legal e-signatures. | 3 | `scope-boundaries` |
| No customer tracking. | 3 | `no-tracking-sync` |
| No cloud account or automatic sync. | 6 | `no-tracking-sync` |
| Use a license you already have | 6 | Clear section heading |
| Paste an existing Studio Pass license to create more than one quote. | 12 | `license-restore` |
| Paste a license | 3 | Result-naming action |
| Save and compare quote revisions in this browser. | 8 | Informative footer line |
| Original poster art generated for this product. | 7 | `art-provenance` |
| Version 1.0.0 · Build 2026-08-29 | 5 | Required build identifier |
| Built by Param Factory (external) | 5 | Clear external-link label |

### README

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Quote Revision Vault | 3 | Clear heading |
| Quote Revision Vault is a quote editor for solo service providers. | 11 | Clear |
| It works without an internet connection after the first visit. | 10 | `offline-reload` |
| Save every quote version, compare line-item changes, export a PDF, and send a customer review link. | 16 | Listed revision/PDF/review-link claims |
| Quotes stay in this browser until you export a backup file or copy a review link. | 16 | `local-privacy` |
| The free vault creates one quote with its revision history. | 10 | `free-one-quote` |
| Try the isolated sample at `/demo` or `/?demo=1`. | 8 | `demo-isolation` |
| It opens a separate sample workspace. | 6 | `demo-isolation` |
| Demo links stay local and never use the live review-link service. | 11 | `demo-isolation` |
| Run and verify | 3 | Clear heading |
| Requirements: Node.js 22 and npm. | 5 | Clear technical requirement |
| The production build command is `npm run build`. | 8 | Verified technical instruction |
| It creates `dist/`, with `dist/index.html` at its root. | 8 | Verified technical result |
| Main workflow | 2 | Clear heading |
| Open `/vault` and create a quote. | 6 | Clear action |
| Add the client, line items, scope, and revision reason. | 9 | Clear action |
| Save a revision, then compare any two revisions. | 8 | `revision-history` |
| Export a saved revision as a PDF or create a dated review link. | 13 | Listed PDF/review-link claims |
| Export a JSON vault file for backup or device transfer. | 10 | `vault-export` |
| A customer can return an acknowledgment code. | 7 | `review-link` |
| It records review, not a legal signature. | 7 | `scope-boundaries` |
| The owner can block a real review link on every device. | 11 | `review-link` |
| Before showing a quote, the app checks whether that link is active. | 12 | `review-link` |
| Privacy and licenses | 3 | Clear heading |
| The app does not load analytics, ads, remote fonts, tracking scripts, or automatic cloud sync. | 15 | `no-tracking-sync` |
| The review-link service receives no quote contents. | 7 | F-4-1: unlisted service-side privacy claim |
| The service stores a random link ID and expiry date. | 10 | F-4-1: not named in a claim entry |
| It stores no quote or customer details. | 7 | F-4-1: not named in a claim entry |
| License verification sends only a pasted Studio Pass token to Sociobot. | 11 | `license-data` |
| People with a verified Studio Pass can create more than one quote. | 12 | `license-restore` |
| The app offers no payment form. | 6 | `scope-boundaries` |
| See `/privacy` and `/terms` in the app. | 7 | Clear links |
| The code is MIT licensed. | 5 | `mit-license` |
| Deployment details | 2 | Clear technical heading |
| The static site deploys from `dist/`. | 6 | Clear technical instruction |
| The `api/` function keeps review-link status and rate-limit counts. | 9 | Clear technical description |
| To deploy it, set `QRV_STORAGE` to an Azure Storage connection string and create the `QuoteReviewLinks` and `QuoteReviewRate` tables. | 18 | Technical instruction under the correct heading |

Terminology on the landing page and README is consistent: **quote**, **revision**, **draft**, **vault**, **review link**, **acknowledgment**, and **Studio Pass**. F-4-3 records the divergence in the demo, acknowledgment metadata, and PWA manifest.

## Demo and sandbox

**Pass.** One click from the landing page opened `/?demo=1` and immediately showed the realistic “Harbour Street identity refresh” quote for Mara Chen with three revisions, before/after line items, scope notes, and totals. The persistent banner read exactly “Demo — sample data, nothing is saved” and included **Reset demo** and **Open my real vault**.

In a fresh context I changed the title, saved Revision 4, created a sample review link, and reset. Reset restored the original title and three revisions. IndexedDB exposed only `qrv-demo-v1`; no `qrv-real-v1` database was created. Opening the real vault showed its empty state and no demo title. The whole flow made zero `/api/review-links/` requests, zero off-origin requests, and produced zero console errors.

Live offline verification also passed: after one online `/demo` load, I disabled networking, saved Revision 4 with a $903 rate, reloaded offline, and confirmed the revision and value remained.

## Claims

A clean clone of commit `7161fb9a8eb635142be9065611fd4f96320d4fed` completed `npm ci` with zero vulnerabilities. I ran every command exactly as listed in `.factory/claims.json`; every command passed in desktop Chromium and 390×844 Chromium.

| Claim ID | Result |
| --- | --- |
| `revision-history` | PASS |
| `pdf-export` | PASS |
| `vault-export` | PASS |
| `review-link` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS, but does not list the distinct service-side promise in F-4-1 |
| `no-tracking-sync` | PASS |
| `offline-reload` | PASS |
| `free-one-quote` | PASS |
| `license-restore` | PASS |
| `license-data` | PASS |
| `scope-boundaries` | PASS |
| `art-provenance` | PASS |
| `mit-license` | PASS |

No listed claim test failed. The full clean-clone suite passed 4 API tests and 52 browser tests. `npm run typecheck` and `npm run build` passed and produced `dist/`. Initial application JavaScript is 13.58 KB gzip; PDF code is lazy-loaded. The live JavaScript, CSS, and service worker SHA-256 hashes match the clean build.

## History check

Every earlier review, polish report, and the prior handoff was read. Each earlier finding was checked in live behavior and source.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 route canonical/social metadata | Fixed: `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and `/ack` set route titles and canonicals; sampled Open Graph values matched. |
| F-1-2 real designed 404 | Fixed: an unknown live URL returned HTTP 404 with one h1 and a home action. |
| F-1-3 unlisted sales/free wording | Fixed: the old unavailable-sales and unproved free-export wording remains absent. |
| F-1-4 comparison/offline claim depth | Fixed: the tagged tests select Revision 1/3 and persist an offline-created Revision 4. |
| F-1-5 vague landing headings/“Send the receipt” | Fixed at the cited landing locations. F-4-3 records separate residual terminology inside the product and manifest. |
| F-1-6 browser-storage wording | Fixed on landing and README. |
| F-2-1 demo registry writes | Fixed: the complete live demo review-link flow made no registry request. |
| F-2-2 failed verification unlocking quotes | Fixed: valid, invalid, and unavailable verifier cases pass; only a positive result unlocks a second quote. |
| F-2-3 legal/payment/license claim gaps | Fixed by `scope-boundaries` and `license-data`. F-4-1 is a different service-storage promise. |
| F-2-4 overlong README sentence | Fixed: no current README sentence exceeds 22 words. |
| F-2-5 generic footer slogan | Fixed on app and 404 routes. |
| F-3-1 desktop first-screen overflow | Fixed live; audience, action, and facts all end above 1000 px. |
| F-3-2 missing clean-install lockfile | Fixed: `npm ci` succeeded in the fresh clone. |
| F-3-3 stale 404 slogan/external disclosure | Fixed at the cited text. F-4-5 records the still-missing required build identifier. |
| F-3-4 provenance/MIT claim gaps | Fixed by `art-provenance` and `mit-license`. |
| F-3-5 “Start for real” action | Fixed: the banner says “Open my real vault”. |

The polish reports also cite revocation, invalid amount validation, CSP-safe recovery, touch targets, immutable asset caching, malformed-import wording, and hidden checkout repairs. Their current tests passed in the full clean-clone suite.

## Structure, accessibility, privacy, and visual identity

Route titles are under 60 characters, descriptions are under 155, and inspected routes have `lang=en`, one h1, one main landmark, canonicals, Open Graph/Twitter metadata, favicon, apple-touch icon, and the 1200×630 product social card. Forward and back navigation focused the destination h1. The unknown route returned a designed HTTP 404. All crawled internal routes/assets and the labelled external Param Factory link returned their expected status; no dead link was found.

The live verifier reported zero console errors and no missing alt text or unnamed buttons. Playwright axe checks on `/`, `/demo`, `/privacy`, and `/terms` found zero WCAG A/AA violations. The 390 px page had no horizontal overflow, controls passed the suite’s touch-target checks, and reduced-motion CSS is present. F-4-4 through F-4-6 are the remaining structure exceptions.

Live response headers include CSP with `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. Cold landing, full demo, and offline request logs contained only the product origin. License verification is the declared, explicit Sociobot exception and its token-only request test passed.

The art-deco transit-ticket identity is visibly specific to quote revision history and matches `.factory/design.md`: parchment, dark teal, oxblood, brass rails, stepped ticket shapes, and original station-gate art. It is not a generic centered SaaS hero or feature-card template.

## Missed leverage

No additional AI feature is justified by the brief. Automatic drafting or summarization would send sensitive quote content away from the local workflow without being necessary to preserve and compare revisions. The obvious non-AI leverage is already present: JSON import/export, PDF export, offline storage, expiring review links, acknowledgment import, and cross-device blocking. No provider key is embedded.

## What would make this perfect

Add and test the service-side privacy claim, replace the vague “safely” title, use only “review link” and “acknowledgment” throughout the demo/metadata/manifest, keep Privacy visible in the mobile header, make the 404 footer include the build identifier, and resolve the `/ack` sitemap policy. Then rerun all 14 claim commands and the live mobile/desktop audit from clean contexts. That would leave no known finding.
