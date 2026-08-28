# Independent verification — FAIL

**Candidate:** `1d65c423eaeb227e2981c666b6680b4048babd36` (`main` at the start of verification)
**Live URL:** https://quote-revision-vault.sociobot.in
**Verified:** 2026-08-28 UTC
**Verdict:** **FAIL — release blocked**

The deployed entry CSS and JS match a fresh production build of the candidate byte-for-byte, so these are candidate defects, not a stale deployment or a deployment-only failure.

## Mandatory opening checks

### Declared claims

`.factory/claims.json` exists and contains eight entries. After `npm ci`, I ran every command listed in it against the app's `/demo` entry point. All passed in both Chromium desktop and the configured 390×844 mobile project:

| Claim | Command | Result |
| --- | --- | --- |
| Revision history | `npm test -- --grep @claim:revision-history` | PASS (2/2) |
| PDF export | `npm test -- --grep @claim:pdf-export` | PASS (2/2) |
| Vault JSON export | `npm test -- --grep @claim:vault-export` | PASS (2/2) |
| Review link | `npm test -- --grep @claim:review-link` | PASS (2/2) |
| Demo isolation | `npm test -- --grep @claim:demo-isolation` | PASS (2/2) |
| Local privacy | `npm test -- --grep @claim:local-privacy` | PASS (2/2) |
| Offline reload | `npm test -- --grep @claim:offline-reload` | PASS (2/2) |
| Paid license | `npm test -- --grep @claim:paid-license` | PASS (2/2) |

The combined run ended with `test-results/.last-run.json` status `passed`. This does not cure the claim-coverage finding below.

### Cold first read of the live landing page

PASS. A fresh desktop browser received HTTP 200 with no console errors. The first screen says **“Revise quotes without losing the past”**, says it is **“For solo service providers who need to prove what changed before billing,”** and puts **“Try it with sample data”** beside **“See three saved revisions and their price changes.”** The one-click link opens `/demo`.

## Release-blocking defects

### Critical — review links cannot be revoked for recipients

The researched brief requires expiry-controlled **and revocable** link tokens. The implementation stores revocation only in `localStorage` (`qrv-revoked:<shareId>`), and its UI explicitly says “blocks it only in this browser.”

Fresh live reproduction:

1. Opened `/demo`, created a review link, reloaded the owner page, and clicked **Block link here**. Owner status was: `The review link is now blocked in this browser.`
2. Opened the saved link in a separate fresh browser context.
3. Result: `revokedNotice: 0`, quote title visible (`quoteVisible: 1`), and the recipient acknowledgment form was enabled (`ackForm: 1`).

This leaves quote contents accessible and acknowledges a supposedly blocked link on another device. A privacy-minimal server-side token-status registry (token id, expiry, revocation state; never quote contents) is required before release.

### High — negative rates are accepted and saved as immutable revisions

The rate control declares `min="0"`, but saving bypasses native form validation and performs no numeric validation. On live `/demo`, I entered `-5` in the first rate, entered a revision reason, and saved. After 750 ms the UI reported:

`Revision 4 saved. The earlier revisions were not changed.`

The live comparison then showed `1 × -$5.00 = -$5.00` and changed the total from `$4,290.00` to `$3,435.00`. This is exactly the wrong-billing failure the product is meant to prevent. Reject negative/non-finite amounts (and invalid quantities) before saving, announce the field-specific error, and preserve the editable draft for recovery.

### High — claim contract is incomplete for marketing promises

The landing page promises **“Pay $29 once to create unlimited quotes.”** The sole `paid-license` claim instead says only “permits more than one quote,” and its test creates exactly two quotes. It does not prove the unlimited promise. Other claim-like statements such as no customer tracking / no cloud account or automatic sync also have no corresponding entries. The claims contract requires each relied-on claim to be listed and observable in the demo sandbox; unlisted claims fail review until a test is added or the copy is narrowed.

## Other defects

### Medium — mobile touch targets are below the required 44 px

Live 390×844 inspection found visible interactive controls below 44 px high: demo banner **Reset demo** and **Start for real** (32 px); small primary product actions such as **Export revision 3 PDF**, **Delete quote**, **Add line item**, **Restore revision 3 as draft**, **Create review link**, and **Import acknowledgment code** (40 px); mobile nav is 43 px. The document was also 397 px wide for a 390 px viewport. Visual inspection showed the layout otherwise stacks cleanly, but these controls do not meet the stated touch-target baseline.

### Medium — hashed assets are not immutably cached

The live entry and every checked hashed JS asset return `Cache-Control: public, must-revalidate, max-age=30`; for example `/assets/index-vRPPU4uW.js`, `html2canvas-hBE6b_MV.js`, and `jspdf.es.min-BALykm7x.js`. This fails the PWA/performance requirement for long-lived immutable caching of hashed assets. Set an immutable, long TTL route policy for `/assets/*` while retaining short revalidation for HTML and `sw.js`.

### Low — malformed vault-file feedback exposes parser jargon

Uploading `{bad` as a JSON vault produced: `Expected property name or '}' in JSON at position 1 (line 1 column 2) Choose an exported vault JSON file.` It provides a next step, but does not explain the problem in plain language. Replace the parser message with a stable, user-facing explanation such as “This file is not a Quote Revision Vault backup. Choose an exported vault JSON file.”

## Checks that passed

- Clean install: `npm ci` passed; audit reported 0 vulnerabilities.
- Full automated suite: `npm test` passed, 22/22 (desktop and 390×844 mobile).
- Type check and exact build: `npm run build` (`tsc && vite build`) passed and produced `dist/`.
- Candidate/deployment identity: live `/assets/index-DFf60oAe.css` SHA-256 is `3c5b58decc7630cc5e6a766cfd64e1719a6ebac7543582e0048c1653b55fd95e`, identical to `dist`; live `/assets/index-vRPPU4uW.js` SHA-256 is `521310c504c04ff1790cb0062f211b168b746af18bed190dc81e41fc709e847b`, identical to `dist`.
- Live routing/headers: `/`, `/demo`, `/vault`, `/privacy`, `/terms`, manifest, service worker, assets, and a missing SPA route all returned 200. CSP, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and permissions policy are present.
- Privacy/network: during a live demo edit and save, the browser requested only the site document, entry JS, and CSS from `quote-revision-vault.sociobot.in`; no quote data left the origin. Invalid-license verification made only the documented request to `api.sociobot.in` and correctly reported the token inactive.
- Accessibility: live `/demo` axe (`wcag2a,wcag2aa`) returned zero violations, including zero serious/critical; no console errors. The standalone axe CLI could not run because its Selenium launcher cannot locate its own Chrome binary in this container, so Playwright axe is the authoritative run.
- Reduced motion: a live 390 px context with `prefers-reduced-motion: reduce` resolved revision animation duration to `1e-05s`.
- Offline/PWA: after the first live `/demo` load, `navigator.serviceWorker.controller` was present. With the browser context offline, reload still showed Revision 3 and the offline pill, with no page errors.
- Response-rate limiting: the only product server-side request, `GET https://api.sociobot.in/api/v1/products/quote-revision-vault/verify?license=invalid-qa-token`, returned 69×429 in a 100-request burst after 31×200. A simultaneous 200-request burst produced `HTTP/2 429`, `Retry-After: 1`, and `x-ratelimit-after: 1`.
- Build budgets: entry JS is 12.52 KB gzip, entry CSS 4.26 KB gzip, no fonts, and mobile AVIF hero 20,362 bytes; all are within stated first-load asset budgets. Fresh Lighthouse could not be completed: Lighthouse 12 rejected/failed to connect to the preinstalled Playwright Chromium. No prior Lighthouse score was relied on for this verification.

## Required remediation and re-verification

1. Implement recipient-visible revocation with an expiry/revocation-only token registry and add a cross-browser/context claim test.
2. Validate all monetary/quantity values before save; add boundary tests for negative, blank, non-finite, and large values.
3. Bring every relied-on claim into `.factory/claims.json` with a matching observable demo test, particularly the unlimited license promise.
4. Increase mobile interactive target sizes to at least 44×44 px and eliminate horizontal overflow.
5. Configure immutable caching for versioned assets, then rerun clean claims, live PWA, mobile, header, and accessibility verification.
