# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-29 against `https://quote-revision-vault.sociobot.in` and source commit `ca67b819d7bd61887f4b5b46860d2926a7001f8f`.

## Verdict

**FAIL.** The first-read experience, sample data, declared claim commands, metadata, 404, accessibility smoke checks, and prior Review 1 repairs mostly verify. Two blocking integrity failures remain: demo review-link actions write to the production registry, and an arbitrary license unlocks extra quotes when the verifier cannot be reached. There are also unlisted visitor claims and one overlong, technical README sentence.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×1000 loaded the landing route with HTTP 200, no console errors, no off-origin requests, and no horizontal overflow. Before scrolling, I understood it as: **a quote editor for solo service providers that saves prior versions and shows what changed before billing; click “Try it with sample data” first.**

The exact first-screen text that supported this was:

- “Revise quotes without losing earlier prices or scope”
- “For solo service providers who need to prove what changed before billing.”
- “Try it with sample data” followed by “See three saved revisions and their price changes.”

This passes the cold-read gate on both viewports.

## Findings

### F-2-1 — BLOCKING — Demo review links write to the production review-link registry

**Location/evidence:** On the live `/demo` screen, **Create review link** is available in the sample workspace. `src/main.ts` calls `createShare()` for demo and real quotes alike, and `createShare()` always calls `registerReviewLink()`, which POSTs to `/api/review-links/...`. That endpoint is the real same-origin Azure status registry, not a demo namespace. It persists a link ID, expiry, owner key hash, and rate-limit entry. The existing `@claim:demo-isolation` test edits only the quote title and checks IndexedDB; it never creates, imports, or blocks a demo review link.

**Why this fails:** The banner says exactly “Demo — sample data, nothing is saved.” That is not true for the complete demo flow. A sample visitor can create server-side production records and consume production rate-limit capacity. The demo-sandbox rule requires demo mode to be isolated from real storage.

**Concrete fix:** In demo mode, make review links wholly local/canned and do not call `/api/review-links`, or add an explicitly isolated short-TTL demo tenant that production recipients and owner data cannot reach. Extend `@claim:demo-isolation` to create, import, and block a review link in `/demo`, record requests, and prove that no production registry request or record is made and no real-vault data changes.

### F-2-2 — BLOCKING — A failed license check accepts any pasted text and unlocks paid capacity

**Location/evidence:** Landing license dialog: “Paste an existing Studio Pass license to create more than one quote.” In `src/license.ts`, `storeLicense()` immediately writes `{ valid: true, ... }`. If `verifyLicense()` receives a failed request, it returns `hasLicense()`, which reads that optimistic `valid: true` verdict. In a fresh live browser context, I intercepted the Sociobot verification request with HTTP 503, entered `not-a-license`, clicked **Verify license**, then opened `/vault`: creating two quotes succeeded and no Studio Pass dialog appeared. The stored verdict was `{"valid":true,"checkedAt":0,"reason":"pending"}`.

**Why this fails:** The product presents the extra-quote capability as requiring a current license, but a network failure turns any string into an accepted license. This is an incorrect and misleading access boundary. The declared `@claim:license-restore` test only injects a prevalidated localStorage verdict; it does not test pasting, invalid tokens, or verifier failure.

**Concrete fix:** Keep a newly pasted license in an `unverified` state. Only a successful positive response, or a previously verified cached verdict whose offline grace rule is explicit, may unlock more quotes. On failed verification, keep the one-quote limit and show a plain retry message. Replace the current claim test with flows for a valid verification response, an invalid response, and an unavailable verifier; assert only the valid response unlocks a second quote.

### F-2-3 — Medium — Visitor-facing legal/payment and license-data claims are outside the claim contract

**Location/evidence:** These claim-like sentences have no matching `.factory/claims.json` entry and no tagged observable test:

- Landing, “No payments or invoices.”
- Landing, “No legal e-signatures.”
- README, “This records review only.”
- README, “It is not a legal signature.”
- README, “License verification sends only a pasted Studio Pass token to Sociobot.”
- README, “No payment form is embedded in this app.”

`no-tracking-sync` covers analytics/tracking/sync, and `license-restore` covers only a preseeded valid verdict. Neither proves the listed scope or what the license request sends.

**Why this fails:** These are statements a visitor may rely on for billing, legal process, and privacy. The claims policy requires either a listed sandbox test or removal of the promise.

**Concrete fix:** Add separate claim entries and clean-state tests. The license-data test must capture the verification request and assert its origin, method, and absence of quote/customer content. For scope boundaries, assert no payment/invoice/e-signature form, route, or export behaviour exists (or replace the sentences with narrower, testable wording). If that test cannot be meaningful, remove the sentence.

### F-2-4 — Low — README privacy copy exceeds the 22-word cap and uses unexplained technical wording

**Location/evidence:** README, Privacy and licenses: “It keeps only what it needs to tell whether a link is active: a random ID, expiry date, protected owner key, and block time.” This is 24 words, exceeds the mandatory 22-word cap, and “protected owner key” is not explained in plain language.

**Why this fails:** The sentence asks a first-time reader to parse a storage implementation instead of first stating the useful privacy result.

**Concrete fix:** Replace it with: “The service stores a random link ID and its expiry date. It stores no quote or customer details.” Put owner-key implementation detail under a clearly labelled technical section only if it is needed.

### F-2-5 — Low — Footer slogan carries no usable product information

**Location/evidence:** Landing footer: “Keep the quote you sent and the change you made.”

**Why this fails:** It is a slogan rather than a statement of what the product does, what to do, or a boundary. It could describe many document tools and conflicts with the plain-words requirement to remove generic brand-lore/mood copy.

**Concrete fix:** Replace it with “Save and compare quote revisions in this browser.”

## Demo and sandbox check

The primary one-click entry passes visually and locally. From a new 390px context, the first screen after clicking **Try it with sample data** was `/demo`, already showing the realistic **Harbour Street identity refresh** quote with Revision 3. The persistent banner was exactly “Demo — sample data, nothing is saved” with **Reset demo** and **Start for real**. Changing the sample title and saving Revision 4 worked; Reset restored the original title and removed Revision 4; Start for real opened an empty `/vault`. IndexedDB showed the separate `qrv-demo-v1` and `qrv-real-v1` databases. The demo edit/save request log contained only the product origin and no console errors.

That local isolation does **not** cure F-2-1: the review-link path persists remote status records and therefore makes the banner materially false.

## Claims check

A clean clone at `/tmp/qrv-review-2-03FGRt/repo` was installed with `npm ci` (0 vulnerabilities). Every command named by `.factory/claims.json` completed successfully; the command sequence was run under `set -e`, followed by the complete suite, typecheck, and build. `npm run build` produced `dist/`.

| Claim ID | Result |
| --- | --- |
| `revision-history` | PASS |
| `pdf-export` | PASS |
| `vault-export` | PASS |
| `review-link` | PASS |
| `demo-isolation` | PASS, but insufficient for the full demo flow (F-2-1) |
| `local-privacy` | PASS |
| `no-tracking-sync` | PASS |
| `offline-reload` | PASS |
| `free-one-quote` | PASS |
| `license-restore` | PASS, but insufficient for the stated pasted-license promise (F-2-2) |

The live landing and complete demo edit/save request logs showed only `https://quote-revision-vault.sociobot.in`; no analytics, ads, remote fonts, tracking scripts, or automatic-sync origin was observed. Offline persistence, PDF/JSON downloads, history comparison, and review-link revocation are covered by their clean-clone tagged tests. F-2-1, F-2-2, and F-2-3 remain because the tests do not prove the full public promise.

## Copy audit

Counts are whitespace-delimited. The landing table includes every visitor-facing prose unit, heading, and action; sample names, prices, table column labels, navigation labels, and version data are data/labels rather than sentences. `—` means no copy flag.

### Landing page

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Revise quotes without losing earlier prices or scope | 8 | — |
| For solo service providers who need to prove what changed before billing. | 11 | — |
| Try it with sample data | 5 | — |
| See three saved revisions and their price changes. | 8 | — |
| Quote data stays in this browser until you export it or copy a review link | 15 | — |
| Works offline after your first visit | 6 | — |
| The free vault creates one quote | 6 | — |
| Sample revision comparison | 3 | — |
| How quote revisions work | 4 | — |
| Save each revision | 3 | — |
| Name the reason for every price or scope change. | 9 | — |
| Compare any two | 3 | — |
| Read line-item changes and totals in one view. | 8 | — |
| Send a review link | 4 | — |
| Export a PDF or copy a dated review link. | 9 | — |
| Quote data stays in this browser | 7 | — |
| Quotes and revisions stay in this browser. | 7 | — |
| Export a vault file for your own backup. | 8 | — |
| What this tool does not do | 6 | — |
| No payments or invoices. | 4 | F-2-3: unlisted claim |
| No legal e-signatures. | 3 | F-2-3: unlisted claim |
| No customer tracking. | 3 | Covered by `no-tracking-sync` |
| No cloud account or automatic sync. | 6 | Covered by `no-tracking-sync` |
| Use a license you already have | 7 | — |
| Paste an existing Studio Pass license to create more than one quote. | 11 | F-2-2: false when verification fails |
| Paste a license | 3 | Result-naming verb; acceptable |
| Keep the quote you sent and the change you made. | 10 | F-2-5 |
| Original poster art generated for this product. | 7 | Provenance; supported by `.factory/design.md` |

### README

| Location and sentence | Words | Audit |
| --- | ---: | --- |
| L3: Quote Revision Vault is a quote editor for solo service providers. | 11 | — |
| L3: It works without an internet connection after the first visit. | 10 | — |
| L3: Save every quote version, compare line-item changes, export a PDF, and send a customer review link. | 16 | — |
| L5: Quotes stay in this browser until you export a backup file or copy a review link. | 15 | — |
| L5: The free vault creates one quote with its revision history. | 10 | — |
| L7: Try the isolated sample at `/demo` or `/?demo=1`. | 8 | F-2-1: “isolated” is false for review links |
| L7: It opens a separate sample workspace. | 6 | F-2-1: qualified only for local storage |
| L7: Demo changes never enter your real vault. | 7 | F-2-1: incomplete privacy boundary |
| L11: Requirements: Node.js 22 and npm. | 5 | — |
| L20: The production build command is `npm run build`. | 8 | — |
| L20: It creates `dist/`, with `dist/index.html` at its root. | 10 | — |
| L24: Open `/vault` and create a quote. | 6 | — |
| L25: Add the client, line items, scope, and revision reason. | 9 | — |
| L26: Save a revision, then compare any two revisions. | 9 | — |
| L27: Export a saved revision as a PDF or create a dated review link. | 13 | — |
| L28: Export a JSON vault file for backup or device transfer. | 10 | — |
| L30: A customer can return an acknowledgment code. | 7 | Covered by `review-link` |
| L30: This records review only. | 4 | F-2-3: unlisted legal claim |
| L30: It is not a legal signature. | 7 | F-2-3: unlisted legal claim |
| L30: The owner can block a review link on every device. | 10 | Covered by `review-link` |
| L30: Before showing a quote, the app checks whether that link is active. | 11 | Covered by `review-link` |
| L34: The app does not load analytics, ads, remote fonts, tracking scripts, or automatic cloud sync. | 12 | Covered by `no-tracking-sync` |
| L34: The review-link service receives no quote contents. | 7 | Covered by `local-privacy` |
| L34: It keeps only what it needs to tell whether a link is active: a random ID, expiry date, protected owner key, and block time. | 24 | F-2-4 |
| L36: License verification sends only a pasted Studio Pass token to Sociobot. | 11 | F-2-3: unlisted privacy claim |
| L36: People with a current Studio Pass can paste it to create more than one quote. | 15 | F-2-2 |
| L36: No payment form is embedded in this app. | 7 | F-2-3: unlisted scope claim |
| L38: See `/privacy` and `/terms` in the app. | 7 | — |
| L38: The code is MIT licensed. | 5 | — |
| L42: The static site deploys from `dist/`. | 6 | — |
| L42: The `api/` function keeps review-link status and rate-limit counts. | 9 | Technical detail, appropriately under its heading |
| L42: To deploy it, set `QRV_STORAGE` to an Azure Storage connection string and create the `QuoteReviewLinks` and `QuoteReviewRate` tables. | 17 | Technical instruction, appropriately under its heading |

No landing prose unit exceeds 22 words. The README has the F-2-4 exception. No banned marketing adjective was found.

## History check

Every earlier review/polish item was checked on the live site and in source rather than accepted from its closure note.

| Earlier finding | Confirmation |
| --- | --- |
| F-1-1 route metadata | Fixed: live `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and `/ack` each set a route title, description, canonical, and Open Graph title/URL. |
| F-1-2 designed HTTP 404 | Fixed: live `/missing-stop` returns HTTP 404 with a designed page, one h1, header/footer, skip link, and home link. |
| F-1-3 untested sales/free wording | Fixed: unavailable-sales and untested free-export/backups wording are absent. New unrelated unlisted claims are F-2-3. |
| F-1-4 revision/offline claim coverage | Fixed: current tagged revision test selects Revision 1 and 3; offline test saves Revision 4 offline and reloads it. The separate license test weakness is F-2-2. |
| F-1-5 metaphor/vague landing headings | Fixed: section headings now identify comparison, workflow, storage, and boundaries. Footer F-2-5 remains a generic slogan. |
| F-1-6 browser-storage/jargon wording | Fixed on the first screen: it says “this browser” and names export/review-link exceptions. README F-2-4 remains. |
| Earlier verification: invalid values, CSP reload, mobile target sizes, cache policy, malformed import, and hidden checkout | Confirmed fixed by current source and passing clean-clone tests. |
| Earlier verification: recipient-visible review-link revocation | Confirmed by `@claim:review-link`; a fresh recipient sees a revoked link as revoked and receives no quote content. |

## Structure, routing, and leverage check

The live site has one h1 and one main on each inspected route, route-specific titles using the required pattern, descriptions, canonical/OG/Twitter metadata, favicon, language, 404, robots, sitemap, CSP/security headers, deep routes, return-home path, back navigation, and focus moved to the h1 after SPA navigation. The landing crawl found no dead links: home, Demo, Vault, Privacy, Terms, and the Param Factory link all returned 200. Header/footer and Privacy/Terms links were consistent. The art-deco transit-paper identity is distinct and aligns with `.factory/design.md`; it is not a generic SaaS template.

No additional brief-implied AI feature is missing. The existing JSON import/export, PDF export, isolated local quote vault, customer acknowledgment link, expiry, and revocation cover the useful workflow. Adding AI would send sensitive quote content without materially improving the core revision-trail job.

## What would make this perfect

Make the entire sample workflow genuinely sandboxed, fail closed for new/unverified licenses, list and test every legal/payment/license privacy promise, and tighten the one README sentence and footer copy. Then rerun all claim commands from a clean clone plus a live demo review-link request-log test.
