# Independent verification 9

**Result: PASS**
**Candidate:** `4f89571b1c6efe79fac3c13f0500f34e140744e8`
**Verified:** 2026-08-29 UTC
**Live URL:** https://quote-revision-vault.sociobot.in

## Release-blocking preflight

- From this clean checkout, `npm ci` completed with 0 vulnerabilities.
- `.factory/claims.json` exists and has 16 claims. I ran every declared command independently, exactly as written. All passed in both configured Chromium projects (desktop and 390×844): `revision-history`, `pdf-export`, `vault-export`, `review-link`, `review-registry-privacy`, `demo-isolation`, `local-privacy`, `no-tracking-sync`, `no-customer-tracking`, `offline-reload`, `free-one-quote`, `license-restore`, `license-data`, `scope-boundaries`, `art-provenance`, and `mit-license`.
- Cold live first read passed. Before scrolling, the page says it helps **solo service providers** “revise quotes without losing earlier prices or scope” before billing. The first action is the visible **Try it with sample data** link, with the result stated beside it: “See three saved revisions and their price changes.”

## Local candidate checks

- `npm test` passed: 4 API/unit tests and 64 Playwright browser tests.
- `npm run typecheck` passed.
- `npm run build` passed and produced `dist/index.html`.
- Entry JS is 13.62 KB gzip and entry CSS is 4.39 KB gzip; both are within the static/PWA budgets. Deferred PDF dependencies are not fetched on first load.
- Candidate build hashes exactly match live `index.html`, `assets/index-BlfsgVy7.js`, `assets/index-HRGWlOpy.css`, `sw.js`, and `manifest.webmanifest`. The live response build time is 2026-08-29 15:28:35 UTC.

## Live product QA

- Fresh desktop and 390px contexts passed the one-click demo, realistic three-revision sample, persistent demo banner, reset, and separation from the empty real vault. Creating a demo review link made zero registry calls.
- A fresh real-vault owner/recipient flow created a revision, generated a review link, acknowledged it in another context, imported the code, and used the status registry only for `POST` then `GET`. The create body had only `action`, `expiresAt`, and `ownerKey`; no quote, customer, or acknowledgment contents went off-origin. The real IndexedDB database exposed only the `quotes` store.
- Invalid input recovery passed on live: rate `-5` produced “Rate must be from 0 to 1,000,000,000.”, focused `#rate-0`, and saved no revision. Correcting it to `900` saved Revision 1.
- Offline PWA passed: after an online demo visit and active service-worker controller, saving Revision 4 at `$905` and reloading offline retained the revision and changed value. `registration.update()` completed against the current active worker; the service worker is versioned, calls `skipWaiting`/`clients.claim`, and the deployed script has no-cache headers. No newer deployment existed to induce the update toast.
- Keyboard smoke checks passed: the first Tab reaches the visible 46px skip link with a 4px brass focus outline, Enter moves to `#main`, and the suite covers keyboard save/error focus, dialog trapping, and cold navigation order. Reduced-motion context matched `prefers-reduced-motion: reduce` and the shipped stylesheet replaces transitions/animations with effectively instant states.
- `/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTP 200, title, `lang=en`, one h1, main landmark, image alt coverage, labelled buttons, and zero console/page errors.
- Playwright axe found zero serious/critical WCAG 2 A/AA violations on `/`, `/demo`, `/vault`, `/privacy`, `/terms`, `/ack`, and a missing route. Mobile had no horizontal overflow and its Privacy target was 44px high.
- Privacy/request capture during the demo allowed only product-origin resources; no analytics, ads, remote fonts, tracking scripts, or automatic sync appeared. Response headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and CSP with response-header `frame-ancestors 'none'`. Hashed assets cache for one year immutable; `sw.js` is no-cache.
- The server-side review-link POST allowance was enforced: requests 1–30 from this client returned ordinary validation responses (400 for the deliberately invalid body); requests 31 and 32 returned `429` and `Retry-After: 60`. Observed allowance: **30 POST requests per minute**.

## Defects by severity

None found. No sign-in flow exists, so the Entra tenant requirement is not applicable.

## Evidence

Ephemeral verification artifacts were written outside the repository at `/tmp/qrv-live-evidence/` and `/tmp/qrv-verify-url/`; the clean candidate tree remains code-unmodified.
