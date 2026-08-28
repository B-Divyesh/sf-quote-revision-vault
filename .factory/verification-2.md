# Independent verification 2 — FAIL

**Candidate:** `6522757564577152be9cc65574b4a038f5717c65`  
**Live URL:** https://quote-revision-vault.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — release blocked**

The live entry JS and CSS are byte-for-byte identical to a fresh production build of this candidate. These are current product/deployment findings, not stale deployment or build-only failures.

## Mandatory opening checks

### Cold first read

**PASS.** A cold live page says **“Revise quotes without losing the past,”** identifies **“solo service providers who need to prove what changed before billing,”** and presents **Try it with sample data** with **“See three saved revisions and their price changes.”** The link opens `/demo` in one click. No console or page errors occurred.

### Claims contract

`.factory/claims.json` exists with ten entries. After `npm ci`, every declared command was run separately through the configured `/demo` Playwright entry point. All passed in both desktop Chromium and 390×844 mobile projects:

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
| `paid-license` | PASS (2/2; cached fixture, not real checkout) |

## Release-blocking defects

### High — the advertised Studio Pass checkout is dead

The landing page and terms advertise a $29 one-time Studio Pass and expose **Buy at Sociobot checkout**. Fresh live GET and HEAD requests to `https://api.sociobot.in/api/v1/products/quote-revision-vault/checkout` returned **HTTP 404**. The GET response body was:

```json
{"error":"enabled factory product","status":404}
```

Customers cannot purchase the advertised multiple-quote feature. This violates the paid-unlock contract and the requirement that no user-facing link be dead. The existing handoff identifies the missing factory billing-catalog registration; fresh evidence confirms it remains unresolved. Enable/register the product and verify the hosted checkout redirect and returned-license flow before release.

### Medium — storage-unavailable recovery is blocked by CSP

The live `/vault` storage-unavailable state renders **Reload the vault** with inline `onclick="location.reload()"`, but the deployed CSP permits only `script-src 'self'`.

In a fresh browser context with IndexedDB unavailable, `/vault` correctly showed **Your vault could not open**. Clicking **Reload the vault** neither reloaded the page nor recovered, and the browser reported:

```text
Executing inline event handler violates the following Content Security Policy directive 'script-src 'self'' … The action has been blocked.
```

Bind this action from the app script (or make it a link) without weakening the CSP.

### Medium — footer links miss the mobile touch-target baseline

At a fresh live 390×844 viewport, footer **Privacy**, **Terms**, and **Built by Param Factory** measured 26.34px high (51.94×26.34, 42.25×26.34, and 229.44×26.34), below the required 44×44px touch target. Increase their clickable area and add them to the 390px target regression test.

## Verification that passed

- `npm ci` passed (79 packages audited; 0 vulnerabilities); `npm test` passed all 4 registry tests and 36 Playwright tests; `npm run typecheck` and `npm run build` passed and produced `dist/`.
- Initial app JS is 13.46KB gzip; initial CSS is 4.36KB gzip; no font assets ship; mobile AVIF is 20,362 bytes. PDF libraries are dynamically imported.
- Live normal workflow: edited sample data, saved Revision 4, and downloaded `harbour-street-identity-refresh-revision-4.pdf` with a `%PDF` header.
- Live boundary/recovery: rate `-5` was rejected with an announced, bound field error and focus on `#rate-0`; correcting it to `900` saved Revision 4 without changing earlier revisions.
- Live review-link flow: created a 7-day link; a distinct recipient context read it and created an acknowledgment code; after owner revocation a fresh recipient saw **This review link is revoked**. No console errors occurred.
- Privacy: cold load and live demo edit/save made no off-origin requests. Quote content remains in the review-link fragment; the registry receives status metadata only.
- PWA: `/demo` was controlled by `qrv-shell-v9`; after a first visit, offline reload retained Revision 3 and showed the offline status with no errors. Worker source has versioned cleanup, `skipWaiting`, `clients.claim`, and the update-ready reload path.
- Mobile: document width was exactly 390px. Principal workflow controls (demo controls, PDF, delete, add, restore, review-link, import) were 44px high; reduced-motion animation duration resolved to `1e-05s`.
- Accessibility: live Playwright axe WCAG A/AA analysis on `/demo` returned zero violations, including zero serious/critical. Labels, landmarks, one h1, error focus/announcement, and a visible 4px focus ring were inspected. The standalone axe CLI could not launch because its Selenium Chrome launcher cannot locate Chrome in this container; the Playwright axe result used the installed browser.
- Routing/headers: `/`, `/demo`, `/vault`, `/privacy`, `/terms`, manifest, service worker, assets, and an unknown SPA route returned 200. CSP, HSTS, nosniff, strict-origin referrer policy, and permissions policy are present. Versioned JS/CSS return one-year immutable caching; `sw.js` returns `no-cache, no-store, must-revalidate`.
- Deployment identity: live/local SHA-256 matched for `index-CYpbMCqp.js` (`3c02ccc94fc7af151756d4542a109bf10d05f40c0eda9f993fc71e22cb8f37ba`) and `index-D0mJ9cQl.css` (`44a8bcab99ddd1e13f5f7478558523e1ee404dce8abe35ce8c1ca44c09692f6a`).
- Rate limits: fresh API write burst reached 429 on request 31 (`Retry-After: 60`); a separate rapid live GET burst returned 240×404 then 30×429, first 429 at request 241 with `Retry-After: 60`.

## Performance note

Fresh Lighthouse CLI attempts with the preinstalled Playwright Chromium could not connect in this container. The candidate's checked-in current Lighthouse artifact reports 100/100 performance and accessibility, but the independent decision above relies only on fresh evidence recorded here.

## Required re-verification

1. Register/enable the `quote-revision-vault` checkout in the Sociobot billing catalog and verify a public hosted-checkout redirect plus license return.
2. Replace the CSP-blocked storage reload handler and test the unavailable-IndexedDB error path under production CSP.
3. Bring footer links to 44×44px and add them to the mobile regression test.
4. Rerun all ten clean demo claims, full test/build, and live checkout, PWA, mobile, accessibility, headers, and rate-limit checks.
