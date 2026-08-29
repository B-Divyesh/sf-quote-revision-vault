# Adversarial first-read review 3 — FAIL

Reviewed 2026-08-29 against `https://quote-revision-vault.sociobot.in` and source commit `8761f57069bd7b3ef1200d4ebc86bd47303203d0`.

## Verdict

**FAIL.** The one-click sample, its local-only review-link path, reset, real-vault separation, routes, and the runnable fallback claim suite work. The product still fails the cold desktop first-read gate, cannot be verified using its documented clean-install command, and regresses the previously closed footer-copy finding on the deployed 404 page. Two unlisted landing/README claims and one vague demo action remain.

## Cold first read

### 390 × 844

Before scrolling, I understood: **this saves earlier versions of quotes for solo service providers; click “Try it with sample data” first.** The first screen visibly included:

- “Revise quotes without losing earlier prices or scope”
- “For solo service providers who need to prove what changed before billing.”
- “Try it with sample data” and “See three saved revisions and their price changes.”

This viewport passes. It had no horizontal overflow (`390px` document width at a `390px` viewport), no console errors, and only same-origin requests.

### 1440 × 1000

**BLOCKING first-read failure.** Before scrolling, only the headline was visible. The audience sentence began at `1022.88px`; the primary action began at `1122.78px`. The headline itself occupied `144px–996.88px` because it is capped to `10ch` while rendered at `clamp(3rem, 8vw, 6.8rem)`. A first-time desktop visitor therefore cannot tell who it is for or what to click from the first screen.

Exact text that fails the layout requirement: “For solo service providers who need to prove what changed before billing.” and “Try it with sample data”.

## Findings

### F-3-1 — BLOCKING — Desktop first screen hides the audience and primary action

**Location/evidence:** Live `/` at 1440 × 1000. The h1 ends at `996.88px`; the audience sentence starts at `1022.88px`; the first action starts at `1122.78px`.

**Why:** The required first screen must answer what the product does, for whom, and what to do first. At desktop size it answers only the first question.

**Concrete fix:** Keep the hero copy within one viewport at common desktop sizes. For example, reduce the headline’s desktop size and/or remove its `max-width: 10ch` so it wraps less, then add a Playwright assertion that the h1, audience sentence, and “Try it with sample data” all have bounding boxes within a 1440 × 1000 viewport.

### F-3-2 — BLOCKING — The documented clean install cannot run, so no declared claim is reproducible from a clean clone

**Location/evidence:** `README.md:14` instructs `npm ci`. A fresh clone at `/tmp/qrv-review-3-Uo3xpT/repo` has no `package-lock.json` or shrinkwrap. `npm ci` fails immediately with: “The \`npm ci\` command can only install with an existing package-lock.json or npm-shrinkwrap.json”.

**Why:** The review instruction requires each claims command to run from a clean clone. This repository cannot reach any claim command via its documented installation path, leaving every claim unverified under the required clean condition.

**Concrete fix:** Commit the generated `package-lock.json` (or provide and document the intended deterministic package manager and immutable lockfile). In CI, start from an empty checkout, run the documented install command, then run every command in `.factory/claims.json`.

**Fallback evidence, not a cure:** After `npm install` generated a temporary lockfile only in the disposable clone, all 12 claim commands passed in both configured Playwright projects; `npm run typecheck` and `npm run build` also passed. That does not make the committed `npm ci` workflow reproducible.

### F-3-3 — BLOCKING — F-2-5 footer-slogan finding regressed on the real HTTP 404 page

**Location/evidence:** Live `GET /missing-stop` returns the designed standalone `404.html` with HTTP 404. Its footer says “Keep the quote you sent and the change you made.” `public/404.html` contains the same text, while app routes use the repaired “Save and compare quote revisions in this browser.”

**Why:** This is the prior F-2-5 generic-slogan finding on a deployed route, not a complete fix. It also makes the footer inconsistent between the fallback page and app routes. The 404’s external “Built by Param Factory” link additionally lacks the `(external)` disclosure used on app routes.

**Concrete fix:** Change the 404 footer text to “Save and compare quote revisions in this browser.” and label its external link “Built by Param Factory (external)”. Add the standalone 404 to the copy and footer-consistency test.

### F-3-4 — Medium — Two landing/README provenance and licence claims have no claims-contract entry

**Location/evidence:** Landing footer: “Original poster art generated for this product.” README line 39: “The code is MIT licensed.” Neither sentence appears in `.factory/claims.json`.

**Why:** Both are factual promises a visitor may rely on. The claim contract has no observable test for either.

**Concrete fix:** Either remove these claims, or add entries and tests: verify the product asset provenance reference is present and verify `LICENSE` contains the MIT grant. The latter test may simply assert the committed licence text; it need not use a browser demo.

### F-3-5 — Low — “Start for real” does not name the result of the demo action

**Location/evidence:** Persistent demo banner link: “Start for real”. It opens `/vault`, the empty real vault.

**Why:** The label is a generic transition phrase. It does not say what will happen to a first-time visitor choosing it.

**Concrete fix:** Change it to “Open my real vault” (or “Leave demo and open my vault”).

## Copy audit

Counts are whitespace-delimited. The audit includes all visitor-facing landing prose, headings, and actions; quote names, prices, dates, table column labels, and navigation labels are data/short labels rather than sentences. No audited sentence exceeds 22 words. `F-3-4` marks the two unlisted claims; `F-3-5` is the demo action label outside the landing table.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Revise quotes without losing earlier prices or scope | 8 | F-3-1 layout failure, wording clear |
| For solo service providers who need to prove what changed before billing. | 11 | F-3-1 layout failure, wording clear |
| Try it with sample data | 5 | F-3-1 layout failure, result-naming action |
| See three saved revisions and their price changes. | 8 | Clear |
| Quote data stays in this browser until you export it or copy a review link | 15 | Covered by `local-privacy` |
| Works offline after your first visit | 6 | Covered by `offline-reload` |
| The free vault creates one quote | 6 | Covered by `free-one-quote` |
| Sample revision comparison | 3 | Clear section name |
| How quote revisions work | 4 | Clear section name |
| Save each revision | 3 | Clear step name |
| Name the reason for every price or scope change. | 9 | Clear |
| Compare any two | 3 | Clear step name |
| Read line-item changes and totals in one view. | 8 | Clear |
| Send a review link | 4 | Clear step name |
| Export a PDF or copy a dated review link. | 9 | Clear |
| Quote data stays in this browser | 7 | Clear section name |
| Quotes and revisions stay in this browser. | 7 | Covered by `local-privacy` |
| Export a vault file for your own backup. | 8 | Covered by `vault-export` |
| What this tool does not do | 6 | Clear section name |
| No payments or invoices. | 4 | Covered by `scope-boundaries` |
| No legal e-signatures. | 3 | Covered by `scope-boundaries` |
| No customer tracking. | 3 | Covered by `no-tracking-sync` |
| No cloud account or automatic sync. | 6 | Covered by `no-tracking-sync` |
| Use a license you already have | 7 | Clear section name |
| Paste an existing Studio Pass license to create more than one quote. | 11 | Covered by `license-restore` |
| Paste a license | 3 | Clear action |
| Save and compare quote revisions in this browser. | 8 | Clear footer description |
| Original poster art generated for this product. | 7 | F-3-4 unlisted claim |

### README

| Location and sentence | Words | Result |
| --- | ---: | --- |
| L3: Quote Revision Vault is a quote editor for solo service providers. | 11 | Clear |
| L3: It works without an internet connection after the first visit. | 10 | `offline-reload` |
| L3: Save every quote version, compare line-item changes, export a PDF, and send a customer review link. | 16 | Covered by revision/PDF/review-link claims |
| L5: Quotes stay in this browser until you export a backup file or copy a review link. | 15 | `local-privacy` |
| L5: The free vault creates one quote with its revision history. | 10 | `free-one-quote` |
| L7: Try the isolated sample at `/demo` or `/?demo=1`. | 8 | `demo-isolation` |
| L7: It opens a separate sample workspace. | 6 | `demo-isolation` |
| L7: Demo links stay local and never use the live review-link service. | 11 | `demo-isolation` |
| L11: Requirements: Node.js 22 and npm. | 5 | F-3-2: documented command fails |
| L21: The production build command is `npm run build`. | 8 | Verified after fallback install |
| L21: It creates `dist/`, with `dist/index.html` at its root. | 10 | Verified after fallback install |
| L25: Open `/vault` and create a quote. | 6 | Clear |
| L26: Add the client, line items, scope, and revision reason. | 9 | Clear |
| L27: Save a revision, then compare any two revisions. | 9 | `revision-history` |
| L28: Export a saved revision as a PDF or create a dated review link. | 13 | PDF/review-link claims |
| L29: Export a JSON vault file for backup or device transfer. | 10 | `vault-export` |
| L31: A customer can return an acknowledgment code. | 7 | `review-link` |
| L31: It records review, not a legal signature. | 7 | `scope-boundaries` |
| L31: The owner can block a real review link on every device. | 11 | `review-link` |
| L31: Before showing a quote, the app checks whether that link is active. | 12 | `review-link` |
| L35: The app does not load analytics, ads, remote fonts, tracking scripts, or automatic cloud sync. | 12 | `no-tracking-sync` |
| L35: The review-link service receives no quote contents. | 7 | `local-privacy`/review registry tests |
| L35: The service stores a random link ID and expiry date. | 10 | `review-link` registry tests |
| L35: It stores no quote or customer details. | 7 | `local-privacy`/review registry tests |
| L37: License verification sends only a pasted Studio Pass token to Sociobot. | 11 | `license-data` |
| L37: People with a verified Studio Pass can create more than one quote. | 12 | `license-restore` |
| L37: The app offers no payment form. | 6 | `scope-boundaries` |
| L39: See `/privacy` and `/terms` in the app. | 7 | Clear |
| L39: The code is MIT licensed. | 5 | F-3-4 unlisted claim |
| L43: The static site deploys from `dist/`. | 6 | Technical instruction |
| L43: The `api/` function keeps review-link status and rate-limit counts. | 9 | Technical instruction |
| L43: To deploy it, set `QRV_STORAGE` to an Azure Storage connection string and create the `QuoteReviewLinks` and `QuoteReviewRate` tables. | 18 | Technical instruction |

## Demo and sandbox check

**Pass, apart from F-3-5 wording.** From a fresh 390px context, one click opened `/demo` with the realistic **Harbour Street identity refresh** quote already showing three revisions. The persistent banner was exactly “Demo — sample data, nothing is saved”, with **Reset demo** and **Start for real**. Saving a changed sample revision, creating and opening a sample review link, and resetting produced zero `/api/review-links/` requests and no off-origin requests. Reset restored the original title and removed Revision 4. The fresh context exposed only `qrv-demo-v1`; `/vault` stayed separate.

## Claims and clean-clone check

`npm ci` failed before any claim command, as recorded in F-3-2. Therefore every declared claim remains **untested under the required documented clean-clone condition**.

For diagnostic evidence only, after a non-reproducible `npm install` in that disposable clone, each claim command completed successfully in desktop and 390px Chromium:

| Claim ID | Fallback result |
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
| `license-restore` | PASS |
| `license-data` | PASS |
| `scope-boundaries` | PASS |

`npm run typecheck` and `npm run build` passed in the same fallback clone, producing `dist/`.

## History check

Every earlier review and polish report was read. Live/code confirmation follows:

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 route metadata | Fixed: `/`, `/demo`, `/vault`, `/privacy`, and `/terms` set distinct titles/canonicals/OG URLs. |
| F-1-2 real 404 | Fixed: `/missing-stop` returns HTTP 404 with a designed page and return-home link. |
| F-1-3 and F-2-3 claim gaps | Prior payment/legal/license gaps are covered; new unlisted claims are F-3-4. |
| F-1-4 comparison/offline test breadth | Fixed in tagged tests: Revision 1/3 selection and offline-created Revision 4 reload. |
| F-1-5 headings and F-1-6 browser wording | Fixed on landing. |
| F-2-1 demo registry writes | Fixed: live demo review-link create/open did not call `/api/review-links/`. |
| F-2-2 failed license verification unlock | Fixed in source and `license-restore`: only a positive response unlocks a second quote. |
| F-2-4 README overlong technical sentence | Fixed: current README has no sentence over 22 words. |
| F-2-5 generic footer slogan | **Regressed on standalone `404.html`; see F-3-3.** |
| Earlier verification fixes (revocation, value validation, CSP recovery, mobile targets, cache policy, import wording, checkout) | Present in source/tests and no regression observed in the exercised flows. |

## Structure, privacy, and leverage

The art-deco transit-paper identity is distinct and conforms to the documented thesis; it is not a generic SaaS template. Header/footer, skip link, Privacy/Terms, favicon, manifest, robots, sitemap, CSP response header, designed HTTP 404, deep links, back navigation, and focus-to-h1 route handling were checked. Landing links (`/demo`, `/vault`, `/privacy`, `/terms`, and Param Factory) all returned HTTP 200. The 404 footer inconsistency and external-link disclosure are F-3-3.

Cold landing and full demo-flow request logs contained only the product origin. The sample-review path made no registry request. JSON vault import/export, PDF export, expiring/revocable review links, and the narrow local-first brief cover the obvious leverage; no AI step is implied strongly enough to justify sending quote data or adding a key.

## What would make this perfect

Make the desktop hero fit the complete first-read message and primary action above the fold; commit a deterministic lockfile so the documented clean clone can run every claim; repair the standalone 404 footer; then either prove or remove its remaining provenance/licence claims and rename the demo exit action. Re-run the whole claim set after `npm ci` from a new clone, plus the live desktop first-screen and 404 checks.
