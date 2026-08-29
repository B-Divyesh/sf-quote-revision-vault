# Independent verification 8 — Quote Revision Vault

**Result: PASS**

**Verified:** 2026-08-29 UTC
**Candidate:** `3b7baed382dbc6ca6b861a7d2f42329c6294bc5d`
**Live URL:** https://quote-revision-vault.sociobot.in

## Release decision

Confirm this candidate meets the researched brief and the factory acceptance contract. No release-blocking product defect was identified. Fresh production-build comparisons show that the live `index.html`, entry JavaScript, entry CSS, and service worker match this candidate byte for byte.

## Required opening checks

### Cold first read

**PASS.** Check a fresh desktop browser load of the live root. The first screen says that the product revises quotes without losing earlier prices or scope, says it is for solo service providers who need to prove what changed before billing, and presents **Try it with sample data** with the result, “See three saved revisions and their price changes.” The visible action is one click and enters the isolated sample workspace.

### Claim contract

`.factory/claims.json` is present and contains 15 records. From a clean install, run every exact test command listed there. Every command passed through the configured Playwright demo entry point; the complete suite then also recorded `test-results/.last-run.json` as `passed`.

| Claim ID | Result |
| --- | --- |
| `revision-history` | PASS |
| `pdf-export` | PASS |
| `vault-export` | PASS |
| `review-link` | PASS |
| `review-registry-privacy` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS |
| `no-tracking-sync` | PASS |
| `offline-reload` | PASS |
| `free-one-quote` | PASS |
| `license-restore` | PASS |
| `license-data` | PASS |
| `scope-boundaries` | PASS |
| `art-provenance` | PASS |
| `mit-license` | PASS |

## Local checks

- Confirm a clean `npm ci`: 78 packages installed and the audit reported 0 vulnerabilities.
- Confirm `npm test`: 4 API logic tests and 62 Playwright tests passed.
- Confirm `npm run typecheck`: passed. No lint command is declared in `package.json`.
- Confirm `npm run build`: passed and produced `dist/`.
- Check the production entry budget: entry JavaScript is 13.58 KB gzip and CSS is 4.39 KB gzip. PDF dependencies are lazy-loaded.

## Product workflow checks

- Confirm normal revision work: the live demo saved a changed rate as Revision 4 and displayed the before/after total comparison.
- Confirm the required invalid and recovery paths through the full suite: negative, blank, non-finite, and over-limit values do not add a revision; the marked field receives plain-language feedback. Malformed vault JSON receives stable recovery guidance.
- Confirm PDF download, JSON-vault download, revision comparison, restore-as-draft, free one-quote behavior, Studio Pass verification behavior, and demo/real-vault separation through the claim and full-suite checks.
- Confirm the live real-vault workflow in separate browser contexts: create a quote and Revision 1, create a review link, create an acknowledgment code as the recipient, import it as the owner, and block the review link. The recipient then received **This review link is revoked**.

## Privacy, PWA, and deployment checks

- Check the full request log during live demo editing, saving, and sample-link creation: every request used `https://quote-revision-vault.sociobot.in`; no analytics, advertising, remote-font, tracking, or automatic-sync request appeared.
- Check the live real-link request bodies: create used only `action`, `expiresAt`, and `ownerKey`; block used only `action` and `ownerKey`. Neither body contained the test quote or customer text.
- Confirm offline operation: after an online `/demo` visit and active service-worker controller, an offline rate change to `$902.00` saved and remained present after an offline reload.
- Check PWA delivery: manifest has 192 px, 512 px, and maskable icons; `sw.js` uses a versioned cache, `skipWaiting`, and `clients.claim`; application code presents an update-ready reload message.
- Check live response policy: CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and the camera/microphone/geolocation permissions policy are present. `sw.js` is `no-cache, no-store, must-revalidate`; hashed JS and CSS are `public, max-age=31536000, immutable`.
- Confirm live routes: `/`, `/demo`, `/vault`, `/privacy`, `/terms`, `/ack`, `/robots.txt`, `/sitemap.xml`, and the manifest returned 200. A missing route returned the designed 404.
- Confirm candidate/live identity. SHA-256 values matched for `dist/index.html`, `/assets/index-CjRN7VsJ.js`, `/assets/index-HRGWlOpy.css`, and `sw.js`.

## Accessibility and responsive checks

- Check semantic metadata and structure: `lang=en`, route titles, one h1, one main landmark, skip link, labelled forms, image alt text, and visible focus behavior are present.
- Run Playwright axe WCAG A/AA checks on `/`, `/demo`, `/vault`, `/privacy`, `/terms`, `/ack`, and the 404 route. Zero serious or critical findings were returned for every route.
- Check keyboard-only operation through the complete suite and live 390 px browser: the first Tab reaches the skip link; it has a designed visible focus indicator; navigation moves focus to the destination h1.
- Check 390 px layout: document width equals viewport width (390 px), required controls are touch-sized in the suite, and the live reduced-motion browser reports `0.00001s` transition and animation durations.
- The repository does not include a `verify-url.sh`; equivalent live browser checks above cover its title, language, landmark, alt-text, and console checks.

## API allowance and performance measurement

- Check the deployed review-link POST allowance from one client and one minute window. Requests 1–30 received their normal application responses (one 201 followed by duplicate-link 409 responses); request 31 returned 429 with `Retry-After: 60`. The observed allowance is **30 POST requests per minute**.
- A fresh Lighthouse 12.8.2 run emitted performance 93, accessibility 100, FCP 1,006 ms, LCP 1,156 ms, and CLS 0, then its browser tab stopped while Lighthouse captured its full-page image. This is recorded as a verifier-environment measurement limitation, not a product defect: independent Playwright runs completed without a browser or page error, and the build and caching budgets passed.
- This is a PWA, not a library or CLI. It has no sign-in flow, so a consumer-installation or identity-provider check does not apply.

## Defects by severity

| Severity | Finding |
| --- | --- |
| None | No release-blocking, high, medium, or low product defect identified. |

## Handoff

The candidate is ready for factory release handling. The only follow-up is optional: repeat Lighthouse in an environment where its full-page image capture completes, if a clean Lighthouse artifact is required in addition to the completed browser, accessibility, caching, and bundle checks.
