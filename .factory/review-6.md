# Adversarial first-read review 6 — PASS

Reviewed 2026-08-29 against `https://quote-revision-vault.sociobot.in` and source commit `4cc51343dcfc972a97dd75a4325d0a3c5b49c692`.

## Verdict

**PASS.** There are zero findings. The live product is clear on a cold phone visit, immediately tryable in an isolated sample workspace, and its visitor-facing claims have matching clean-state tests.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 1000 loaded the landing page with HTTP 200, no page/console errors, only same-origin resources, and no mobile horizontal overflow.

Before scrolling, I understood it as: **a quote editor for solo service providers that preserves earlier prices and scope so they can prove what changed before billing; click “Try it with sample data” first.**

The exact first-screen support was:

- “Revise quotes without losing earlier prices or scope”
- “For solo service providers who need to prove what changed before billing.”
- “Try it with sample data” followed by “See three saved revisions and their price changes.”

At 390px the headline ended at y=462 and the action at y=669. At desktop the headline ended at y=656 and the action at y=827. The job, audience, and first action are visible before scrolling on both sizes.

## Copy audit

Counts are whitespace-delimited. Sample quote data, repeated navigation labels, prices, dates, and table cells are excluded; all landing prose, headings, facts, and actions are included. No unit exceeds 22 words, uses a banned marketing adjective, relies on a mood/metaphor heading, or uses a non-result-naming action. Claim references identify the matching `.factory/claims.json` entry; `—` means descriptive rather than claim-like copy.

### Landing page

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Revise quotes without losing earlier prices or scope | 8 | `revision-history` |
| For solo service providers who need to prove what changed before billing. | 11 | `revision-history` |
| Try it with sample data | 5 | Result-naming action |
| See three saved revisions and their price changes. | 8 | `revision-history` |
| Quote data stays in this browser until you export it or copy a review link | 15 | `local-privacy` |
| Works offline after your first visit | 6 | `offline-reload` |
| The free vault creates one quote | 6 | `free-one-quote` |
| Sample revision comparison | 3 | Clear heading |
| How quote revisions work | 4 | Clear heading |
| Save each revision | 3 | Clear step heading |
| Name the reason for every price or scope change. | 9 | `revision-history` |
| Compare any two | 3 | Clear step heading |
| Read line-item changes and totals in one view. | 8 | `revision-history` |
| Send a review link | 4 | Clear step heading |
| Export a PDF or copy a dated review link. | 9 | `pdf-export`, `review-link` |
| Quote data stays in this browser | 7 | Clear heading |
| Quotes and revisions stay in this browser. | 7 | `local-privacy` |
| Export a vault file for your own backup. | 8 | `vault-export` |
| What this tool does not do | 6 | Clear heading |
| No payments or invoices. | 4 | `scope-boundaries` |
| No legal e-signatures. | 3 | `scope-boundaries` |
| No customer tracking. | 3 | `no-customer-tracking` |
| No cloud account or automatic sync. | 6 | `no-tracking-sync` |
| Use a license you already have | 7 | Clear heading |
| Paste an existing Studio Pass license to create more than one quote. | 11 | `license-restore` |
| Paste a license | 3 | Result-naming action |
| Save and compare quote revisions in this browser. | 8 | — |
| Original poster art generated for this product. | 7 | `art-provenance` |
| Version 1.0.0 · Build 2026-08-29 | 5 | Build identifier |

### README

| Sentence or heading | Words | Audit |
| --- | ---: | --- |
| Quote Revision Vault | 3 | Product name |
| Quote Revision Vault is a quote editor for solo service providers. | 11 | — |
| It works without an internet connection after the first visit. | 10 | `offline-reload` |
| Save every quote version, compare line-item changes, export a PDF, and send a customer review link. | 16 | `revision-history`, `pdf-export`, `review-link` |
| Quotes stay in this browser until you export a backup file or copy a review link. | 16 | `local-privacy` |
| The free vault creates one quote with its revision history. | 10 | `free-one-quote` |
| Try the isolated sample at `/demo` or `/?demo=1`. | 8 | `demo-isolation` |
| It opens a separate sample workspace. | 6 | `demo-isolation` |
| Demo links stay local and never use the live review-link service. | 11 | `demo-isolation` |
| Run and verify | 3 | Clear heading |
| Requirements: Node.js 22 and npm. | 5 | Technical requirement |
| The production build command is `npm run build`. | 8 | Verified instruction |
| It creates `dist/`, with `dist/index.html` at its root. | 8 | Verified result |
| Main workflow | 2 | Clear heading |
| Open `/vault` and create a quote. | 6 | — |
| Add the client, line items, scope, and revision reason. | 9 | — |
| Save a revision, then compare any two revisions. | 8 | `revision-history` |
| Export a saved revision as a PDF or create a dated review link. | 13 | `pdf-export`, `review-link` |
| Export a JSON vault file for backup or device transfer. | 10 | `vault-export` |
| A customer can return an acknowledgment code. | 7 | `review-link` |
| It records review, not a legal signature. | 7 | `scope-boundaries` |
| The owner can block a real review link on every device. | 11 | `review-link` |
| Before showing a quote, the app checks whether that link is active. | 12 | `review-link` |
| Privacy and licenses | 3 | Clear heading |
| The app does not load analytics, ads, remote fonts, tracking scripts, or automatic cloud sync. | 15 | `no-tracking-sync` |
| The review-link service receives no quote contents. | 7 | `review-registry-privacy` |
| The service stores a random link ID and expiry date. | 10 | `review-registry-privacy` |
| It stores no quote or customer details. | 7 | `review-registry-privacy` |
| License verification sends only a pasted Studio Pass token to Sociobot. | 11 | `license-data` |
| People with a verified Studio Pass can create more than one quote. | 12 | `license-restore` |
| The app offers no payment form. | 6 | `scope-boundaries` |
| See `/privacy` and `/terms` in the app. | 7 | Route instructions |
| The code is MIT licensed. | 5 | `mit-license` |
| Deployment details | 2 | Clear technical heading |
| The static site deploys from `dist/`. | 6 | Technical instruction |
| The `api/` function keeps review-link status and rate-limit counts. | 9 | Technical description |
| To deploy it, set `QRV_STORAGE` to an Azure Storage connection string and create the `QuoteReviewLinks` and `QuoteReviewRate` tables. | 18 | Technical instruction |

Terminology is consistent: quote, revision, draft, vault, review link, acknowledgment, and Studio Pass. Every claim-like landing and README statement maps to a declared claim test. No unlisted claim was found.

## Demo and sandbox behaviour

PASS. One click entered `/?demo=1`; its first product screen already showed the realistic Harbour Street identity refresh quote, three revisions, changed quantities, a removed sign line, totals, and scope notes. The persistent banner read “Demo — sample data, nothing is saved” and included **Reset demo** and **Open my real vault**.

In a fresh 390px context, changing the sample title and saving created demo-only state. Reset restored “Harbour Street identity refresh.” Opening the real vault showed its empty state and not the changed title. The demo database was `qrv-demo-v1`; real data used `qrv-real-v1`; both expose only the `quotes` object store. The full demo flow made zero registry requests and no off-origin request.

After the first `/demo` visit, offline mode saved a revision at $906 and reloaded it successfully. Request logging during that flow recorded only `quote-revision-vault.sociobot.in` URLs.

## Claims and quality gates

A fresh local clone at `/tmp/qrv-review6-clean.RJxEpQ/repo` checked out `4cc51343dcfc972a97dd75a4325d0a3c5b49c692`. `npm ci` succeeded with 0 vulnerabilities. Running `npm test -- --grep '@claim:'` ran every declared claim in desktop and 390px projects: all 32 browser executions passed, plus all 4 API tests.

| Claim IDs verified | Result |
| --- | --- |
| `revision-history`, `pdf-export`, `vault-export`, `review-link` | PASS |
| `review-registry-privacy`, `demo-isolation`, `local-privacy`, `no-tracking-sync` | PASS |
| `no-customer-tracking`, `offline-reload`, `free-one-quote`, `license-restore` | PASS |
| `license-data`, `scope-boundaries`, `art-provenance`, `mit-license` | PASS |

The current source also passed the complete `npm test` suite (4 API and 64 browser tests), `npm run typecheck`, and `npm run build`; `dist/` was produced. The initial app JS is 13,490 bytes gzip and CSS is 4,400 bytes gzip. The local build's `index.html`, entry JS, CSS, and service-worker SHA-256 values exactly matched the live assets.

## History confirmation

Every earlier review, polish report, and handoff was read. Each earlier finding was independently checked live and in the current source rather than accepted from a closure note.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and `/ack` each have their own title, description, canonical, and social title. |
| F-1-2 | `/missing-review-6` returned HTTP 404 with the designed page and home link. |
| F-1-3 | The unavailable-sales/free-export promises and checkout path are absent; `scope-boundaries` passes. |
| F-1-4 | `revision-history` selects Revisions 1/3; `offline-reload` saves and reloads Revision 4 offline. |
| F-1-5 | Landing headings name their sections and use review-link terminology. |
| F-1-6 | Browser-local privacy wording and plain README product copy remain in place. |
| F-2-1 | Demo review-link creation/import/block uses no live registry request. |
| F-2-2 | Only a verified Studio Pass permits another quote; invalid and unavailable verification fail closed. |
| F-2-3 | Payment, legal-signature, and license-data boundaries have declared tests. |
| F-2-4 | README sentences are within the 22-word limit; technical deployment terms are isolated. |
| F-2-5 | App and 404 footer say what the product does. |
| F-3-1 | Desktop and phone first screens retain the audience and action above the fold. |
| F-3-2 | The committed lockfile installs successfully in the fresh clone. |
| F-3-3 | The 404 has product-specific footer text and labelled external link. |
| F-3-4 | Provenance and MIT claims have matching tests and source evidence. |
| F-3-5 | The demo exit says “Open my real vault.” |
| F-4-1 | Registry creation is tested to send/store status fields only, without quote/customer content. |
| F-4-2 | Landing metadata plainly says “Save and compare quote revisions.” |
| F-4-3 | Demo, acknowledgment route, and manifest consistently say review link/acknowledgment. |
| F-4-4 | Privacy remains visible as a 44px mobile navigation target. |
| F-4-5 | App and 404 both show the same build identifier. |
| F-4-6 | The live sitemap lists `/ack`. |
| F-5-1 | “No customer tracking” is now `no-customer-tracking`, with an observable network/storage test. |

The related historic repairs also remain verified by the full suite: invalid line values are rejected, storage recovery is CSP-safe, touch controls are sized, immutable asset caching is configured, malformed backups have plain errors, and a revoked real review link fails closed.

## Structure, privacy, and missed leverage

The live route audit passed: `lang=en`; one h1 and main landmark per route; route-specific title/description/canonical/Open Graph; favicon, apple-touch icon, social card, robots, sitemap, and consistent header/footer with Privacy and Terms. Navigation and Back moved focus to the destination h1. All crawled product links returned 200, except the deliberately crawled missing route, which correctly returned 404; the external Param Factory link returned 200.

Response headers include `X-Content-Type-Options`, `Referrer-Policy`, and a CSP with `frame-ancestors 'none'` delivered as a header. The app's art-deco transit-poster visual system is distinctive, matches `.factory/design.md`, and is not a generic SaaS template. Axe coverage in the full route suite has no serious or critical WCAG A/AA violations.

No additional AI feature is implied by this local-first revision-preservation job. The obvious useful non-AI work is present: JSON import/export, PDF export, offline operation, expiring review links, acknowledgment import, and cross-device blocking. No provider key is embedded.

## What would make this perfect

Keep the present guarantees under regression test as the product evolves: the cold mobile first screen, demo/real storage separation, and every copy claim should continue to be checked before release. No current product change is required.
