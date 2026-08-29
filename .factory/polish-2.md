# Polish 2 — adversarial review closure

**Candidate repaired:** `ca67b819d7bd61887f4b5b46860d2926a7001f8f`  
**Review repaired:** `078743e77d4aff4144e5c9a1f12cc1af0b489668`  
**Repair commits:** `e50b14ef395a53376aa986826800016c9c97df2a`, `2246e00`
**Live URL:** https://quote-revision-vault.sociobot.in

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Preserved route-specific title, canonical, Open Graph, and Twitter metadata. | `every route sets its own canonical and social metadata`; live `/demo`, `/privacy`, and `/terms` title/canonical check passed. |
| F-1-2 | Preserved the designed 404 response and route configuration. | `unknown paths return a designed HTTP 404 with a home link`; live `GET /missing-stop` returned 404. |
| F-1-3 | Kept unavailable-sales copy and dead checkout links absent. Added the current, testable scope contract. | `@claim:scope-boundaries`; landing and Terms contain no checkout/invoice/signature action or route. |
| F-1-4 | Preserved revision comparison and offline-reload coverage. | `@claim:revision-history` and `@claim:offline-reload` passed from the clean clone. |
| F-1-5 | Preserved plain section headings and direct workflow copy. Replaced the remaining generic footer slogan. | Live landing and [demo mobile screenshot](evidence/polish-2/live/demo-mobile.png); footer now says “Save and compare quote revisions in this browser.” |
| F-1-6 | Preserved browser-local wording and direct privacy explanations. | `.factory/copy-audit.md` has no landing sentence over 22 words or banned wording. |
| F-2-1 | Demo review links now carry a `demo` marker, skip `registerReviewLink`, skip remote revocation, and are checked locally on `/ack`. Demo blocking is explicitly limited to the sample workspace. | Expanded `@claim:demo-isolation` creates, opens, imports, and blocks a demo link while recording zero `/api/review-links/` requests. The same cold live flow recorded `demoRegistryRequests: 0`; [screenshot](evidence/polish-2/live/demo-mobile.png). |
| F-2-2 | New and URL-captured tokens start unverified. A token unlocks only after a positive verifier response. A seven-day offline grace applies only to a previously verified verdict; unavailable and invalid responses retain the one-quote limit. | Rewritten `@claim:license-restore` exercises valid, invalid, and 503 verification responses. Cold live 503 interception retained one quote and showed the retry message; [screenshot](evidence/polish-2/live/license-fail-closed.png). |
| F-2-3 | Added `license-data` and `scope-boundaries` claims and observable tests. Terms and README now use the same bounded payment/signature wording. | `@claim:license-data` captures the Sociobot **GET**, asserts its only query field is the pasted token, and proves an entered quote title/client are absent. `@claim:scope-boundaries` checks landing/Terms forms, actions, and `/checkout`, `/invoice`, and `/signature` 404s. |
| F-2-4 | Replaced the 24-word technical README sentence with two short plain sentences. | README and Privacy now say: “The service stores a random link ID and expiry date. It stores no quote or customer details.” |
| F-2-5 | Replaced the generic footer slogan with a product-specific description. | Live landing footer; [desktop screenshot](evidence/polish-2/live/screenshot-desktop.png). |

## Earlier verification regressions

The pre-review verification findings remain covered: cross-device real-link revocation (`@claim:review-link`), invalid line values, CSP-safe storage recovery, 390px touch targets/no overflow, immutable assets, stable malformed-import feedback, and absent unavailable checkout links all passed in the full suite.

## Verification evidence

- Final fresh clone: `/tmp/qrv-polish-2-final`, `npm ci` completed with 0 vulnerabilities. Every one of the 13 commands named in `.factory/claims.json` passed separately, followed by `npm test` (4 registry tests + 46 Playwright tests), `npm run typecheck`, and `npm run build`.
- Local production check: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence/polish-2/local` passed with zero console errors. Screenshots: [desktop](evidence/polish-2/local/screenshot-desktop.png) and [mobile](evidence/polish-2/local/screenshot-mobile.png).
- Live cold check after deployment: `/opt/fleet/lib/verify-url.sh https://quote-revision-vault.sociobot.in .factory/evidence/polish-2/live` passed: 834 ms observed load, correct title/lang/main/alt/labeled controls, and zero console errors. Live mobile demo/license/metadata/404/axe recheck passed with zero demo registry calls, no mobile overflow, zero serious or critical axe WCAG A/AA findings, and HTTP 404 for `/missing-stop`.
- Production assets: initial app JS is 13.57 KB gzip and CSS is 4.38 KB gzip. The checked-in Lighthouse evidence reports Performance 100, Accessibility 100, Best Practices 100, and SEO 100.
