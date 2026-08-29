# Adversarial first-read review 5 — FAIL

Reviewed 2026-08-29 against `https://quote-revision-vault.sociobot.in` and source commit `b395fa4eaeca0eb93c3d315c8f542279651718b5`.

## Verdict

**FAIL.** The cold read, sample workspace, real/demo separation, all declared claim commands, routes, metadata, accessibility regressions, and earlier repairs verify. One landing promise remains outside the claims contract: “No customer tracking.” A visitor may rely on that promise as a product boundary, but no claim entry and no observable sandbox test prove it. The requested standard is zero findings.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 1000 loaded with HTTP 200, no console errors, only same-origin requests, and no mobile horizontal overflow. Before scrolling, I understood this as: **a quote editor for solo service providers that preserves earlier prices and scope so they can prove changes before billing; click “Try it with sample data” first.**

The exact first-screen text was:

- “Revise quotes without losing earlier prices or scope”
- “For solo service providers who need to prove what changed before billing.”
- “Try it with sample data” and “See three saved revisions and their price changes.”

This passes the cold-read gate. At 390 px, the headline, audience sentence, action, and three facts ended at y=462, 545, 618, and 827 respectively. At 1440 px, they ended at y=656, 754, 827, and 962 respectively. The intended audience and first action are visible before the fold in both checks.

## Findings

### F-5-1 — Medium — “No customer tracking” is an unlisted, untested product-boundary claim

**Location/evidence:** Landing section “What this tool does not do”: “No customer tracking.” `.factory/claims.json` has no claim for the absence of customer tracking. `no-tracking-sync` proves that the browser loads no tracking scripts or cloud-sync requests; `scope-boundaries` proves the absence of payment, invoice, and legal-signature actions. Neither entry names or tests the distinct product promise that the vault does not track customers.

**Why this fails:** In this context, beside “No payments or invoices” and “No legal e-signatures,” a first-time visitor reasonably reads the sentence as a capability/privacy boundary, not merely an assertion that no analytics script is loaded. The review contract requires each such visitor-facing promise to have a matching claim entry and observable clean-state test, or to be removed.

**Concrete fix:** Either remove “No customer tracking.” Or add a precise claim such as “Does not create customer profiles or track customer activity,” then add an `@claim:no-customer-tracking` clean-demo test that exercises creating a real review link and verifies the observable records and network traffic contain only the explicit review-link state—not a customer profile, activity log, or customer data sent to another origin. State the same narrower boundary in README/Privacy if it remains important.

## Copy audit

Counts are whitespace-delimited. The landing audit includes all visitor-facing headings, facts, prose, and actions; quote names, revision labels, line-item values, table headings, and dates are sample data rather than sentences. No audited unit exceeds 22 words, contains a banned marketing adjective, uses a mood/metaphor heading, or uses a non-result-naming button. The sole claim-contract flag is F-5-1.

### Landing page

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Revise quotes without losing earlier prices or scope | 8 | — |
| For solo service providers who need to prove what changed before billing. | 11 | — |
| Try it with sample data | 5 | — |
| See three saved revisions and their price changes. | 8 | — |
| Quote data stays in this browser until you export it or copy a review link | 15 | `local-privacy` |
| Works offline after your first visit | 6 | `offline-reload` |
| The free vault creates one quote | 6 | `free-one-quote` |
| Sample revision comparison | 3 | — |
| How quote revisions work | 4 | — |
| Save each revision | 3 | — |
| Name the reason for every price or scope change. | 9 | `revision-history` |
| Compare any two | 3 | — |
| Read line-item changes and totals in one view. | 8 | `revision-history` |
| Send a review link | 4 | — |
| Export a PDF or copy a dated review link. | 9 | `pdf-export`, `review-link` |
| Quote data stays in this browser | 7 | — |
| Quotes and revisions stay in this browser. | 7 | `local-privacy` |
| Export a vault file for your own backup. | 8 | `vault-export` |
| What this tool does not do | 6 | — |
| No payments or invoices. | 4 | `scope-boundaries` |
| No legal e-signatures. | 3 | `scope-boundaries` |
| No customer tracking. | 3 | **F-5-1** |
| No cloud account or automatic sync. | 6 | `no-tracking-sync` |
| Use a license you already have | 7 | — |
| Paste an existing Studio Pass license to create more than one quote. | 11 | `license-restore` |
| Paste a license | 3 | Result-naming action |
| Save and compare quote revisions in this browser. | 8 | — |
| Original poster art generated for this product. | 7 | `art-provenance` |
| Version 1.0.0 · Build 2026-08-29 | 5 | Build identifier |
| Privacy / Terms / Built by Param Factory (external) | 1 / 1 / 5 | Link labels |

### README

| Sentence or heading | Words | Audit |
| --- | ---: | --- |
| Quote Revision Vault | 3 | Product name |
| Quote Revision Vault is a quote editor for solo service providers. | 11 | — |
| It works without an internet connection after the first visit. | 10 | `offline-reload` |
| Save every quote version, compare line-item changes, export a PDF, and send a customer review link. | 16 | Listed revision/PDF/review-link claims |
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

Terminology remains consistent: quote, revision, draft, vault, review link, acknowledgment, and Studio Pass. No rewrite is needed beyond F-5-1.

## Demo and sandbox behaviour

**Pass.** One tap from the landing screen opened `/?demo=1`; the first product screen already showed the realistic Harbour Street identity refresh quote, its three saved revisions, changed quantities, removed sign item, totals, and scope notes. The persistent banner read “Demo — sample data, nothing is saved” and exposed **Reset demo** and **Open my real vault**.

In a fresh mobile context, I changed the sample title, saved a revision, created a sample review link, reset, and opened the real vault. Reset restored “Harbour Street identity refresh” and removed Revision 4. The real vault showed its empty state and never displayed the changed demo title. The full flow made zero `/api/review-links/` requests, zero off-origin requests, and zero console errors. A separate fresh context loaded `/demo`, went offline, saved Revision 4 at $904, reloaded offline, and retained both the revision and $904 value.

## Claims and clean clone

**All 15 declared claim commands passed** from a clean clone at `/tmp/qrv-review5.SkHlvd/repo` after `npm ci` (0 vulnerabilities):

| Claim ID | Result |
| --- | --- |
| revision-history | PASS |
| pdf-export | PASS |
| vault-export | PASS |
| review-link | PASS |
| review-registry-privacy | PASS |
| demo-isolation | PASS |
| local-privacy | PASS |
| no-tracking-sync | PASS |
| offline-reload | PASS |
| free-one-quote | PASS |
| license-restore | PASS |
| license-data | PASS |
| scope-boundaries | PASS |
| art-provenance | PASS |
| mit-license | PASS |

The complete clean-clone `npm test` completed its 4 API tests and 62 Playwright tests before the chained typecheck/build. `npm run typecheck` passed and `npm run build` produced `dist/`; initial entry JS was 13.58 KB gzip and CSS 4.39 KB gzip. F-5-1 is not a failing listed command; it is the missing matching contract required by the live landing sentence.

## History check

Every prior review and polish report, plus the existing handoff, was read. The following checks were run against the deployed site and current source rather than accepted merely because a closure document said “fixed.”

| Earlier finding | Live and source confirmation |
| --- | --- |
| F-1-1 | Route navigation updates title, description, canonical, Open Graph, and Twitter data; live `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and `/ack` each had one h1/main and the expected canonical. |
| F-1-2 | Live `/definitely-missing-review-5` returned HTTP 404 and served the designed page with a home link; `responseOverrides.404` rewrites to `/404.html`. |
| F-1-3 | Unavailable-sales/free-export wording and checkout links remain absent; scope claim test passed. |
| F-1-4 | `@claim:revision-history` selects Revisions 1/3, and `@claim:offline-reload` saves/reloads Revision 4 offline; both passed. |
| F-1-5 | Landing section headings name comparison, workflow, storage, and boundaries; it uses “review link,” not the former route metaphor/receipt wording. |
| F-1-6 | First-screen privacy copy names this browser plus export/review-link exceptions; README keeps deployment implementation under its own heading. |
| F-2-1 | Demo create/open/import/block operations made zero registry calls in the live request log; source branches demo links away from registry calls. |
| F-2-2 | `src/license.ts` begins pasted tokens unverified and permits offline grace only after a positive check; valid/invalid/503 paths passed in `@claim:license-restore`. |
| F-2-3 | Legal/payment/license request claims are now covered by `scope-boundaries` and `license-data`; both passed. |
| F-2-4 | README sentences are ≤22 words and technical terms are contained in Deployment details. |
| F-2-5 | App and 404 footer state “Save and compare quote revisions in this browser.” |
| F-3-1 | Live mobile and desktop first-screen geometry keeps audience and action visible before the fold. |
| F-3-2 | Fresh `npm ci` used the committed lockfile successfully, then all claim commands, test, typecheck, and build passed. |
| F-3-3 | Live HTTP 404 uses the product-specific footer wording and external-link disclosure. |
| F-3-4 | `art-provenance` and `mit-license` are listed and passed; source asset sidecar/design record and MIT grant exist. |
| F-3-5 | The banner action reads “Open my real vault,” names its result, and links to `/vault`. |
| F-4-1 | `review-registry-privacy` is listed and passed; source test verifies only status fields are posted/stored, with no quote/client contents. |
| F-4-2 | Landing title is “Quote Revision Vault — Save and compare quote revisions,” not the prior vague safety claim. |
| F-4-3 | Demo, `/ack`, and manifest use review-link/acknowledgment terminology; no reviewed customer artifact is called a receipt. |
| F-4-4 | At 390 px, Privacy remained visible in the header; the current mobile first-read check had no overflow. |
| F-4-5 | App and standalone 404 each display the same version/build identifier. |
| F-4-6 | `public/sitemap.xml` includes `/ack`, confirmed by the sitemap regression and live response. |

The related historical verification fixes also remain present: invalid rates are rejected, storage recovery is CSP-safe, mobile controls meet touch size, cached assets have immutable policy, malformed backup errors are plain, and revoked real review links fail closed for a fresh recipient.

## Structure, privacy, and leverage

The live route audit passed for title, language, meta description, canonical, Open Graph/Twitter metadata, favicon, one h1, one main, header/footer, skip link, Privacy/Terms, and the designed 404. Forward navigation and Back moved focus to the new h1. Every landing link returned 200 (or was the skip anchor): home, demo, vault, privacy, terms, `?demo=1`, and Param Factory. The response CSP includes `frame-ancestors` as a header, and the live cold/demo logs had no off-origin request except none at all in these flows. No console errors were observed.

The art-deco transit-poster interface remains distinct from a generic SaaS template and follows the documented warm-paper/ink/oxblood/brass visual system. JSON vault import/export, PDF export, expiry-controlled review links, acknowledgment, and revocation cover the obvious brief-implied workflow. An AI feature would add sensitive-data transfer without a useful missing step, so no AI leverage finding applies.

## What would make this perfect

Remove the untestable “No customer tracking” promise, or give that exact boundary its own precise claim and observable sandbox test. Then rerun the complete clean-clone claim matrix and the live mobile/desktop audit. With zero remaining findings, the product can pass this review.
