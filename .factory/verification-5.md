# Independent verification 5 — PASS

**Candidate:** `c94e23404e3e5ca5661f06cc5fc83bfe83d6ca05`  
**Live URL:** https://quote-revision-vault.sociobot.in  
**Verified:** 2026-08-29 UTC  
**Verdict:** **PASS — release accepted**

The deployed static app is the candidate build: the SHA-256 values of `index.html`, the entry JS, entry CSS, and `sw.js` exactly matched a fresh local production build. No release-blocking defect was found.

## Mandatory opening checks

### Cold first read

**PASS.** A new browser context received HTTP 200 and no console or page errors. The first screen says **“Revise quotes without losing earlier prices or scope”**, says **“For solo service providers who need to prove what changed before billing,”** and offers **“Try it with sample data”** beside **“See three saved revisions and their price changes.”** It plainly explains what it does, who it is for, and what to click first; the link enters the isolated sample workspace in one click.

### Claim contract

`.factory/claims.json` exists. From the clean candidate checkout, after `npm ci`, I executed every declared command separately through the configured demo entry point. Every command passed (the Playwright configuration runs desktop Chromium and the 390×844 mobile project):

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
| `license-restore` | PASS |
| `license-data` | PASS |
| `scope-boundaries` | PASS |
| `art-provenance` | PASS |
| `mit-license` | PASS |

The landing page, privacy/terms pages, and README claims were cross-checked against that contract. Revision retention/diff, PDF and vault export, review links, demo isolation, local storage/privacy, no tracking/sync, offline use, the one-quote free limit, license verification boundary, scope exclusions, art provenance, and MIT licensing are covered.

## Clean local verification

- `npm ci` passed: 79 packages audited, 0 vulnerabilities.
- `npm test` passed: 4 Node review-registry tests and 50 Playwright tests.
- `npm run typecheck` passed.
- `npm run build` passed and produced `dist/`.
- No lint script exists beyond the available test/typecheck/build gates.
- Initial app JS is 13.58 KB gzip and CSS is 4.40 KB gzip. PDF dependencies are lazy chunks; no external font files load. This is within the PWA initial-load budgets.

## Live product verification

- Normal flow: saved a real quote revision, created a dated review link, opened it in a separate fresh recipient context, created/imported an acknowledgement code, and blocked the link. The recipient then saw **“This review link is revoked”** and no quote.
- Demo flow: saved Revision 4 and showed the before/after value; the demo made zero registry calls and no off-origin requests.
- Invalid/recovery flow: rate `-5` was rejected with **“Rate must be from 0 to 1,000,000,000.”** and `aria-invalid=true`; correcting it saved Revision 4 without changing earlier revisions. Malformed backup JSON gave stable plain-language feedback. The live PDF began `%PDF`; exported vault JSON was `quote-revision-vault` with four revisions.
- `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and `/ack` returned 200; `/missing-stop` returned the intended 404.
- Candidate/deployment identity: local/live SHA-256 pairs matched for `index.html` (`f6bc…becc`), `index-D2gZfLwZ.js` (`ba28…bebd`), `index-2foinvAW.css` (`5e5a…2f52`), and `sw.js` (`f344…b6dd`).

## Privacy, API, PWA, accessibility, mobile, and headers

- Cold-page and full `/demo` save request logs contained only same-origin document/assets. No analytics, ad, remote-font, tracking, or automatic-sync request occurred. A real review-link API request carried only action, expiry, random link ID, and owner key; quote content stayed in the URL fragment.
- Live response headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, permissions policy, and response-header CSP with `frame-ancestors 'none'`. Hashed JS is `public, max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`.
- The deployed write allowance was exercised from one client in a fresh minute with quote-free requests: creates 1–30 returned 201, and create 31 returned **429** with **`Retry-After: 60`**. Observed allowance: **30 writes per minute**.
- After first visit, the live demo was controlled by `qrv-shell-v12`; `registration.update()` completed, with no waiting update available. With the browser offline, a new revision saved and `/demo` reloaded with Revision 4 still present.
- Live Playwright axe WCAG A/AA checks on landing and demo returned zero serious/critical findings. Keyboard navigation showed the designed 4px brass `:focus-visible` ring; the empty-reason save path is keyboard-operable and focuses the repair field. Reduced-motion media mode resolved transitions to `1e-05s`.
- At 390px, `scrollWidth` equalled 390px. The tested persistent-banner, export, delete, item, restore, review-link, and acknowledgement controls were all 44px high. No console/page errors occurred.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Verification note

An independent Lighthouse CLI attempt could not attach to the container's preinstalled Playwright Chromium. This does not affect the PASS: cold request logging, response headers, bundle budgets, PWA/offline behavior, mobile layout, axe, keyboard focus, and zero-error checks were independently executed. The repository's prior recorded Lighthouse evidence is not relied upon for this verdict.
