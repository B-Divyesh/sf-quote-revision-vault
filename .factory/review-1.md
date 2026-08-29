# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-29 against `https://quote-revision-vault.sociobot.in` and commit `393ebd0eb2c54cd3840f5430862c8b415f5597d1`.

## Verdict

**FAIL.** The core job, sample workspace, local-first behaviour, visual identity, and declared claim commands all checked out. The findings below remain: route metadata is wrong away from the landing page, the site has no HTTP 404 response, some visitor-facing claims have no claim-contract entry, two declared tests prove less than their wording promises, and the landing/README retain vague or jargon-heavy copy.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×1000 loaded with HTTP 200, no console errors, and no off-origin requests. Before scrolling, I understood this as: **a tool for solo service providers to save versions of a client quote and see what changed before billing; click “Try it with sample data” first.** The relevant first-screen text was:

- “Revise quotes without losing the past”
- “For solo service providers who need to prove what changed before billing.”
- “Try it with sample data” followed by “See three saved revisions and their price changes.”

This passes the cold-read gate. The mobile viewport was 390px wide with no horizontal overflow. The first action opened `/demo` in one click.

## Findings

### F-1-1 — Medium — Route canonical and social metadata describe the landing page

**Location/evidence:** On live `/demo`, `/vault`, `/privacy`, `/terms`, `/missing-stop`, and `/404.html`, the canonical remained `https://quote-revision-vault.sociobot.in/` and `og:title` remained `Quote Revision Vault — Track every quote change`. Titles and meta descriptions did change by route.

**Why this fails:** A shared Privacy, Terms, demo, or missing-page URL tells crawlers and social previews that it is the home page. This is incorrect route identity and does not meet the required per-route canonical/OG metadata.

**Fix:** Extend `setMeta` to update canonical, Open Graph, and Twitter title/description/image for the active route. For example, `/privacy` must canonicalize to `https://quote-revision-vault.sociobot.in/privacy` and use `Privacy — Quote Revision Vault` as its social title. Add a route-metadata test covering `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and the 404.

### F-1-2 — Medium — A missing URL returns HTTP 200 instead of a real 404

**Location/evidence:** Fresh live `curl` requests returned HTTP 200 for both `/missing-stop` and `/404.html`; the SPA renders the styled “This stop is not on the route” screen only after receiving a successful document response.

**Why this fails:** The visual fallback is good, but search engines, link checkers, and integrations cannot distinguish a missing resource from a real page. This does not supply the required designed 404 route.

**Fix:** Ship a designed `404.html` in the product visual style and configure `staticwebapp.config.json` `responseOverrides` so a missing document returns status 404 while rendering it. Add a deployment-level test that asserts an unknown URL has status 404, one h1, and a working home link.

### F-1-3 — Medium — Visitor-facing availability and free-feature claims are absent from `claims.json`

**Location/evidence:** Landing page Studio Pass panel: “Studio Pass sales are unavailable while the billing catalog is updated.” and “One quote, revision history, PDF export, and backups stay free.” Neither statement has a matching entry in `.factory/claims.json`. `free-one-quote` proves only the one-quote limit; it does not prove that export/backup actions are available without a pass. README line 38 repeats the unavailable-sales statement.

**Why this fails:** A visitor can rely on whether a product can be bought and whether its export/backup features cost money. The current contract neither lists nor tests those promises.

**Fix:** If these facts remain on the page, add separate claim entries and clean-state tests: one must assert an unlicensed real vault can export a PDF and JSON backup, and one must assert the UI has no checkout/buy path while sales are unavailable. Otherwise remove the availability and “stay free” wording until it can be tested.

### F-1-4 — Medium — Two declared claim tests are narrower than the claim text

**Location/evidence:** `.factory/claims.json` says “Keeps every saved quote revision and compares any two” and “Works offline after the first visit.” `@claim:revision-history` saves Revision 4 then checks the default comparison; it never selects an arbitrary non-default pair such as Revision 1 and Revision 3. `@claim:offline-reload` reloads the seeded sample while offline but never edits, saves, or reloads an offline-created revision. The vault itself advertises “Offline — changes still save.”

**Why this fails:** Passing tests do not yet prove the observable behaviour a visitor is promised. The required claim contract is a test of the claim, not merely a test that a page opens.

**Fix:** In the revision test, select Revision 1 as “Compare from” and Revision 3 as “Compare to” and assert their specific before/after values. In the offline test, go offline after the first load, change a rate, save Revision 4, reload offline, and assert Revision 4 and its changed value remain. Tag these exact tests with the existing claim IDs.

### F-1-5 — Low — Landing wording uses route metaphors and vague headings instead of section names

**Location/evidence:** Landing headings/labels include “A clear route through every revision,” “Live revision preview,” “See the exact change,” “Save. Compare. Send.,” “Local by default,” “Your records stay close,” and “Clear boundaries.” The preview is a static illustration rather than a live interactive preview.

**Why this fails:** On a cold scan these labels do not independently name their sections. “Live” also overstates what the preview is. This conflicts with the plain-words requirement that headings carry usable information without surrounding copy.

**Fix:** Use “Quote revision history,” “Sample revision comparison,” “Line-item changes,” “How quote revisions work,” “Where quote data is stored,” “Quote data stays in this browser,” and “What this tool does not do.” Remove the redundant mood labels where the new heading already names the section.

### F-1-6 — Low — The privacy fact and README use avoidable jargon or ambiguity

**Location/evidence:** Landing first-screen fact: “Quote data stays here until you share it.” README lines 3, 5, 7, 22, 24, 34, and 38 use terms such as “offline-first,” “IndexedDB,” “managed function,” “same-origin status registry,” “secret hash,” and “runtime CDNs” without a plain-language equivalent.

**Why this fails:** “Here” does not say *this browser*, and “share it” does not say that an export or copied review link is the exception. The README’s product explanation is intended for people who may not know browser-storage or deployment vocabulary.

**Fix:** Change the landing fact to “Quote data stays in this browser until you export it or copy a review link.” Rewrite the opening README sentence as “Quote Revision Vault is a quote editor for solo service providers that works without an internet connection after the first visit.” Keep implementation terms in a clearly labelled deployment section, with a plain explanation first (for example, “The app checks whether a review link is active before showing the quote”).

## Demo and sandbox check

**Pass.** From a fresh 390px browser context, `/vault` was empty. Clicking the first-screen demo action opened `/demo`, whose first product screen immediately showed the realistic **Harbour Street identity refresh** quote with three revisions, changed quantities, a removed sign line, totals, and scope notes. The persistent banner read exactly “Demo — sample data, nothing is saved” and contained **Reset demo** and **Start for real**.

The browser held separate `qrv-demo-v1` and `qrv-real-v1` IndexedDB databases. After changing the demo title and saving, Reset demo reseeded “Harbour Street identity refresh” with three revisions. Start for real returned to the empty real vault; the demo edit did not appear there. The demo edit/save request log contained only the product origin.

## Claims check

A fresh clone in `/tmp/qrv-review-qPGxEh/repo` completed `npm ci` with 0 vulnerabilities. I ran every command declared in `.factory/claims.json`; each passed in the configured desktop and 390px projects (two Playwright tests per claim):

| Claim ID | Result |
| --- | --- |
| `revision-history` | PASS |
| `pdf-export` | PASS |
| `vault-export` | PASS |
| `review-link` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS |
| `no-tracking-sync` | PASS |
| `offline-reload` | PASS |
| `free-one-quote` | PASS |

The full fresh `npm test` passed all 4 Node tests and 40 Playwright tests; `npm run typecheck` and `npm run build` also passed and produced `dist/`. No declared command failed. F-1-3 and F-1-4 remain because coverage is incomplete, not because a listed command failed.

## Copy audit

Word counts use whitespace-delimited words and include reader-visible headings and action text so that fragments cannot hide from the audit. “Flag” points to the copy findings above; `—` means no copy issue identified in that unit. Raw sample names, dates, prices, navigation labels, and repeated legal/footer links are excluded because they are data or labels rather than sentences.

### Landing page

| Copy unit | Words | Audit |
| --- | ---: | --- |
| A clear route through every revision | 6 | F-1-5 |
| Revise quotes without losing the past | 6 | — |
| For solo service providers who need to prove what changed before billing. | 12 | — |
| Try it with sample data | 5 | — |
| See three saved revisions and their price changes. | 8 | — |
| Quote data stays here until you share it | 8 | F-1-6 |
| Works offline after your first visit | 6 | — |
| The free vault creates one quote | 6 | — |
| Live revision preview | 3 | F-1-5 |
| See the exact change | 4 | F-1-5 |
| How it works | 3 | — |
| Save. Compare. Send. | 3 | F-1-5 |
| Save each revision | 3 | — |
| Name the reason for every price or scope change. | 9 | — |
| Compare any two | 3 | — |
| Read line-item changes and totals in one view. | 8 | — |
| Send the receipt | 3 | Terminology: use “review link” or “acknowledgment,” not “receipt” (F-1-5) |
| Export a PDF or copy a dated review link. | 9 | — |
| Local by default | 3 | F-1-5 |
| Your records stay close | 4 | F-1-5 |
| Quotes and revisions stay in this browser. | 7 | — |
| Export a vault file for your own backup. | 8 | — |
| Clear boundaries | 2 | F-1-5 |
| This is not bookkeeping | 4 | — |
| No payments or invoices. | 4 | — |
| No legal e-signatures. | 3 | — |
| No customer tracking. | 3 | — |
| No cloud account or automatic sync. | 6 | — |
| Studio Pass access | 3 | Explain “Studio Pass” as a license before using it (F-1-6) |
| Use an existing Studio Pass | 5 | Same term issue (F-1-6) |
| Studio Pass sales are unavailable while the billing catalog is updated. | 11 | F-1-3 |
| One quote, revision history, PDF export, and backups stay free. | 10 | F-1-3 |
| Paste a license | 3 | Result-naming action; acceptable |
| Keep the quote you sent and the change you made. | 10 | — |
| Original poster art generated for this product. | 7 | — |

No audited landing sentence exceeds 22 words. The primary action is a result-naming verb and correctly names its outcome.

### README

| Location and sentence | Words | Audit |
| --- | ---: | --- |
| L3: Quote Revision Vault is an offline-first quote editor for solo service providers. | 12 | F-1-6: replace “offline-first” with plain behaviour. |
| L3: It keeps each saved revision and compares line-item changes before billing. | 11 | — |
| L5: Quotes stay in IndexedDB until you export a vault file or copy a review link. | 15 | F-1-6: “this browser” is clearer than IndexedDB. |
| L5: The app works offline after the first visit. | 8 | — |
| L5: The free vault creates one quote with revision history. | 10 | — |
| L7: Try the isolated sample at `/demo`. | 6 | — |
| L7: It uses a separate IndexedDB database and never copies changes into the real vault. | 13 | F-1-6: explain separate demo storage in plain language first. |
| L11: Requirements: Node.js 22 and npm. | 5 | — |
| L20: The exact production build command is `npm run build`. | 8 | — |
| L20: Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | — |
| L22: Production deployment includes the managed function in `api/`. | 8 | F-1-6: deployment jargon belongs under a clearly technical subheading. |
| L22: Set the Static Web App setting `QRV_STORAGE` to an Azure Storage connection string and create the `QuoteReviewLinks` and `QuoteReviewRate` tables. | 20 | F-1-6: split and explain the purpose before the identifiers. |
| L22: The function stores only review-link status metadata and rate-limit counters. | 10 | F-1-6: say “whether a link is active” before “metadata.” |
| L24: Playwright runs the product and claim tests in desktop Chromium and a 390px mobile viewport. | 14 | — |
| L24: Each claim and its verification command is listed in `.factory/claims.json`. | 10 | — |
| L28: Open `/vault` and create a quote. | 6 | — |
| L29: Add the client, line items, scope, and revision reason. | 9 | — |
| L30: Save a revision, then compare any two revisions. | 9 | — |
| L31: Export the saved revision as PDF or create a dated review link. | 11 | — |
| L32: Export a JSON vault file for backup or device transfer. | 10 | — |
| L34: The customer can return an acknowledgment code. | 7 | — |
| L34: This records review only and is not a legal signature. | 10 | — |
| L34: The owner can block a link on every device. | 9 | — |
| L34: Every link checks a same-origin status registry before showing the quote. | 10 | F-1-6: “checks whether the link is active” is clearer. |
| L38: There are no analytics, ads, remote fonts, or runtime CDNs. | 10 | F-1-6: expand “runtime CDNs” or move it to technical details. |
| L38: The review-link registry stores only a random ID, expiry, secret hash, and revocation time. | 14 | F-1-6: start with the plain privacy result. |
| L38: It never receives quote contents. | 5 | — |
| L38: License verification sends only a pasted Studio Pass token to Sociobot. | 11 | — |
| L38: Studio Pass sales remain hidden until the factory billing catalog has a live product entry; no payment provider is embedded here. | 20 | F-1-3: availability assertion lacks a claim entry. |
| L40: See `/privacy` and `/terms` in the app. | 7 | — |
| L40: The code is MIT licensed. | 5 | — |

No README sentence exceeds 22 words. The audit found no banned marketing adjective in the product copy; the remaining issue is clarity and terminology, not length.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the existing handoff and all three verification reports as additional history. Their former defects were checked rather than treated as fixed merely because a document says so:

| Earlier finding | Live/code confirmation |
| --- | --- |
| Cross-device review-link revocation | Confirmed by the current `@claim:review-link` two-context test and the live code’s status registry calls; recipient content is hidden for a revoked link. |
| Negative rates saved as revisions | Confirmed fixed in `validateLineItems`; the current suite includes negative, blank, non-finite, and excessive-value cases. |
| CSP-blocked storage reload | Confirmed fixed in code: `#reload-vault` is bound from script, not an inline handler. |
| Mobile footer/control target size | Current mobile regression includes those controls; first-screen controls measured at least 44px high. |
| Hashed-asset caching | `public/staticwebapp.config.json` specifies immutable one-year cache headers for `/assets/*`. |
| Dead Studio Pass checkout | No checkout/buy link is exposed. The remaining wording still needs claim coverage (F-1-3), but the prior dead link is not present. |
| Parser-jargon import error | Current catch message says “This file is not a Quote Revision Vault backup. Choose an exported vault JSON file.” |

## Structure, privacy, and missed leverage

The art-deco document-route visual identity is distinct and matches `.factory/design.md`; it is not a generic SaaS template. Header/footer, skip link, Privacy/Terms links, titles, one h1, main landmark, favicon, manifest, robots, sitemap, no console errors, focus after route changes, back navigation, and reduced-motion/mobile checks passed. All rendered landing links were live (internal routes HTTP 200; Param Factory external link HTTP 200). F-1-1 and F-1-2 are the remaining structure failures.

The captured cold-load and full demo-edit/save logs contained only `quote-revision-vault.sociobot.in` document, JavaScript, CSS, and image requests. No analytics, advertising, remote-font, tracking, or automatic-sync request was observed. No obvious brief-implied import/export, sync, or useful AI step is missing: JSON vault import/export, PDF export, customer review links, expiry, and revocation are present; AI would not improve this narrowly local quote-revision job enough to justify collecting a key or sending quote data.

## What would make this perfect

Make each route describe itself to crawlers and previews, return a real designed 404, close the claim-contract gaps with tests that prove the full promise, and replace the remaining route metaphor/jargon with direct section names and browser-storage language. Then rerun all claim commands from a fresh clone and the live mobile/desktop route audit.
