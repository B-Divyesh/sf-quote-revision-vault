# Independent verification 2 — FAIL

**Candidate:** `6522757564577152be9cc65574b4a038f5717c65`  
**Live URL:** https://quote-revision-vault.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — release blocked**

The live entry JS and CSS are byte-for-byte identical to a fresh production build of this candidate. This is therefore a current deployment/product finding, not a stale-deployment or build-only failure.

## Release-blocking finding

### High — the advertised paid purchase path is unavailable

The landing page and Terms advertise the $29 one-time Studio Pass and expose **Buy at Sociobot checkout**. Fresh verification of its configured target returned:

```text
GET https://api.sociobot.in/api/v1/products/quote-revision-vault/checkout
HTTP/2 404
content-type: application/json
```

Consequently, a customer cannot purchase the feature advertised as permitting multiple quotes. This fails the paid-unlock contract and the end-to-end product requirement. The pre-existing handoff identifies the same missing factory billing-catalog registration; fresh evidence confirms it remains unresolved. Register the product/checkout in the Sociobot billing catalog, then re-verify the redirect and returned license flow. No product-code fix was made in this verification.

## Other finding

### Medium — footer links miss the mobile touch-target baseline

On a fresh live 390 x 844 browser, the visible footer links measured 26.34px high: **Privacy** (51.94 x 26.34), **Terms** (42.25 x 26.34), and **Built by Param Factory** (229.44 x 26.34). The stated accessibility/mobile baseline is 44 x 44px for interactive targets. Increase the clickable area without changing the visual hierarchy and add these links to the mobile target regression test.

## Mandatory opening checks

### Claim contract

`.factory/claims.json` exists with ten entries. A bare clean clone has no installed npm executables; after the required `npm ci`, I ran every declared command separately through the configured Playwright demo entry point. Each command passed in both desktop and 390px projects (two browser results per command):

| Claim | Result |
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
| `paid-license` | PASS (cached valid-fixture license; does not prove checkout availability) |

The paid-license test proves the local entitlement behavior, but the required real checkout URL above is independently broken.

### Cold first read

**PASS.** A cold live 390px page returned HTTP 200 with no console errors. The first screen plainly says it lets users **“Revise quotes without losing the past,”** names **“solo service providers who need to prove what changed before billing,”** and presents **“Try it with sample data”** with **“See three saved revisions and their price changes.”** The action is one click to `/demo`.

## Verification passed

- Clean setup: `npm ci` completed successfully (79 packages audited, 0 vulnerabilities).
- Tests: `npm test` passed: four review-registry node tests and all 36 configured Playwright tests (`test-results/.last-run.json` reports `passed`). `npm run typecheck` passed.
- Exact build: `npm run build` (`tsc && vite build`) passed and produced `dist/`.
- Deployment identity: SHA-256 values matched local `dist` and live assets exactly:
  - `index-CYpbMCqp.js`: `3c02ccc94fc7af151756d4542a109bf10d05f40c0eda9f993fc71e22cb8f37ba`
  - `index-D0mJ9cQl.css`: `44a8bcab99ddd1e13f5f7478558523e1ee404dce8abe35ce8c1ca44c09692f6a`
- Core workflow: live `/demo` showed the seeded three-revision quote; a fresh normal save with rate `900` produced Revision 4 and preserved prior revisions. A negative rate was rejected with the announced message **“The revision was not saved. Correct the marked amount.”**, `aria-invalid="true"`, and no Revision 4. Live PDF and vault downloads were emitted with expected revision/JSON names.
- Privacy and errors: the cold landing and live demo edit/save generated no page or console errors and no off-origin requests. The only cold-load resources were same-origin HTML, entry JS/CSS, and the self-hosted AVIF image.
- Accessibility: independent live Playwright Axe WCAG A/AA analysis on `/demo` returned no violations, hence zero serious/critical findings. All checked routes (`/`, `/demo`, `/vault`, `/privacy`, `/terms`, and a missing route) had one `<main>`, one `<h1>`, and route-correct titles. Keyboard focus was visible: the focused export button had a solid `rgb(192, 138, 39)` 4px outline.
- Mobile layout: at 390px the document width was exactly 390px (no horizontal overflow); the principal workflow controls met 44px, apart from the footer links reported above.
- PWA/offline: live `/demo` acquired `qrv-shell-v9` service-worker control. After first load, an offline reload retained Revision 3, showed **OFFLINE — CHANGES STILL SAVE**, and produced no errors. The worker uses versioned cache cleanup, `skipWaiting`, `clients.claim`, and the in-app update-ready toast path.
- Headers/caching: live HTML uses short revalidation; hashed JS/CSS return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`. CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive permissions policy were present. The manifest, icons, offline fallback, robots, sitemap, privacy, and terms routes were reachable.
- Budget: initial entry JS is 13,307 bytes gzip, CSS 4,379 bytes gzip, and mobile AVIF 20,362 bytes (all within stated static/PWA budgets; no fonts ship).
- Review-link API rate limit: a fresh 35-write burst yielded 201 for requests 1–30 and 429 for requests 31–35 with `Retry-After: 60` and `Cache-Control: no-store`. This establishes the observed threshold as 30 writes/minute.
- Factory license-verifier rate limit: a 100-request invalid-token burst yielded 200 for 1–29 and 429 from request 30; first 429 included `Retry-After: 1` and `x-ratelimit-after: 1`.

## Re-verification required

1. Complete the factory billing registration so `.../checkout` no longer returns 404; test a hosted checkout redirect and the returned license capture/verification flow.
2. Make every footer link at least 44 x 44px on mobile and cover it in the 390px regression test.
3. Re-run the ten clean-demo claim commands, live paid path, and mobile accessibility check. Do not mark the candidate accepted until the checkout succeeds.
