# Independent verification 3 — PASS

**Candidate:** `7ade908a9ff5df2d2ab12e7a1a33b74d5f7f90a0`
**Live URL:** https://quote-revision-vault.sociobot.in
**Verified:** 2026-08-29 UTC
**Verdict:** **PASS — release accepted**

The fresh production build and deployment match. No release-blocking defect was found.

## Mandatory opening checks

### Cold first read

**PASS.** On a fresh live desktop visit, the first screen says: **“Revise quotes without losing the past.”** It says this is **“For solo service providers who need to prove what changed before billing.”** The first clear action is **“Try it with sample data,”** followed by **“See three saved revisions and their price changes.”** The one-click link opens the isolated `/demo` workspace. This answers what it does, for whom, and what to do first in plain words.

### Claims contract

`.factory/claims.json` exists and has nine entries. From a clean `npm ci`, I ran every listed command separately, exactly as declared. Each invokes the configured Playwright product entry point and passed in both desktop Chromium and the 390×844 mobile project:

| Claim | Result |
| --- | --- |
| `revision-history` | PASS (2/2) |
| `pdf-export` | PASS (2/2) |
| `vault-export` | PASS (2/2) |
| `review-link` | PASS (2/2) |
| `demo-isolation` | PASS (2/2) |
| `local-privacy` | PASS (2/2) |
| `no-tracking-sync` | PASS (2/2) |
| `offline-reload` | PASS (2/2) |
| `free-one-quote` | PASS (2/2) |

No unlisted visitor-facing claim was found in the landing page or README: revision history/diff, PDF, vault export, review link, local-only storage, no tracking/sync, offline reload, and the one-quote free limit each map to the declared contract.

## Fresh local verification

- `npm ci`: passed; 79 packages audited, 0 vulnerabilities.
- `npm test`: passed. The four review-registry Node tests and all 40 Playwright tests passed; `test-results/.last-run.json` is `{"status":"passed","failedTests":[]}`.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- There is no lint script beyond the available test/typecheck/build scripts.
- First-load app JavaScript is 13.38 KB gzip and CSS is 4.38 KB gzip. PDF dependencies are split into lazy chunks; no font files ship. This is within the static PWA initial-JS and CSS budgets.

## Live product and deployment verification

- Deployment identity: a new local production build exactly matched the live app shell. SHA-256 values were `e563c1b49b83623c68dd9374a95219204b7971c651c4917c699004a605e4af87` for `assets/index-CcKkUl0q.js`, `21a2d9847ea16663ff5012a732ef0d7d0aa6c3cb8516274ec126d7a61883e4ec` for CSS, and `73f808cc988040c4d9d28c4553367755d31ad60a5af4f858e8d26a4c15b3e7c4` for `sw.js`.
- The live normal flow saved Revision 4, exported `harbour-street-identity-refresh-revision-4.pdf` with the `%PDF` signature, created a seven-day review link, showed it in a separate browser context, accepted an acknowledgment code, and after owner blocking showed **“This review link is revoked”** in a fresh recipient context. No console/page errors occurred.
- Boundary and recovery flow: rate `-5` was rejected with **“Rate must be from 0 to 1,000,000,000.”**, focus moved to the invalid rate field, and no Revision 4 was created. Correcting the rate to `900` saved Revision 4 and preserved earlier revisions.
- Live IndexedDB-unavailable recovery showed **“Your vault could not open.”** Clicking **Reload the vault** reloaded into **“Keep every quote revision”** with no CSP console error. This confirms the prior inline-handler deployment failure is repaired.
- `/`, `/demo`, `/vault`, `/privacy`, `/terms`, the manifest, service worker, assets, and a missing SPA route all returned HTTP 200. All rendered landing links resolved: internal routes returned 200 and the labelled external Param Factory link returned 200.
- `verify-url.sh` passed against the live URL (HTTP 200; 767 ms observed load; title, `lang=en`, one `h1`, `main`, image alt text, and labelled buttons present; zero console errors). Its screenshots and JSON are in `.factory/evidence/verification-3/`.

## Privacy, API, PWA, accessibility, and mobile

- Playwright request capture on a cold landing visit and a complete `/demo` edit/save flow recorded only `quote-revision-vault.sociobot.in` requests: document, self-hosted JS, CSS, and image. No analytics, advertising, remote font, tracking, or cloud-sync request occurred. The live review-link POST contained only `action`, expiry, and random owner key; quote contents remained in the URL fragment.
- Response headers include HTTPS HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, permissions policy, and a restrictive CSP with response-header `frame-ancestors 'none'`. Hashed JS/CSS have `public, max-age=31536000, immutable`; `sw.js` has `no-cache, no-store, must-revalidate`.
- Server-side allowance was exercised live with malformed, quote-free POSTs from one client: requests 1–30 returned 400, request 31 and later returned **429** with `Retry-After: 60`. Observed write allowance: **30 requests per minute**. This matches the managed review-link API and verifies rate enforcement without storing a quote.
- After first live `/demo` load, the PWA was controlled by active `qrv-shell-v10`; `registration.update()` completed without error. With the browser set offline, `/demo` reloaded and showed the bundled Revision 3. The worker uses versioned shell caching, `skipWaiting`, and `clients.claim`; no newer worker was available during the check.
- Live Playwright axe WCAG A/AA analysis on `/demo` returned zero violations, including zero serious/critical. Keyboard Enter on an empty revision reason announced **“The revision was not saved. Say what changed.”**, focused `#revision-reason`, and exposed a visible 4px brass focus ring.
- At 390px, document width equalled scroll width (390px). All principal controls were at least 44px high; footer links measured 59.94×46.34, 50.25×46.34, and 237.44×46.34px. Reduced-motion resolved animation and transition durations to `1e-05s`. No console/page errors occurred.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Notes

Studio Pass sales are explicitly unavailable and no checkout link is exposed, avoiding the formerly dead billing endpoint. The free one-quote product remains usable and the existing-license restore/verify path is covered by the test suite. This is not recorded as a defect because the page makes no purchasability claim.
