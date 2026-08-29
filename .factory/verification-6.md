# Independent verification 6 — Quote Revision Vault

**Result: FAIL**

**Verified:** 2026-08-29 UTC
**Candidate:** `c94e23404e3e5ca5661f06cc5fc83bfe83d6ca05`
**Live URL:** https://quote-revision-vault.sociobot.in

## Release decision

The candidate is not ready to release because the initial keyboard focus order does not meet the required navigation baseline. All other checks listed below passed or produced the stated evidence.

## Release-blocking finding

| Severity | Check | Evidence | Required correction |
| --- | --- | --- | --- |
| High | Check that the first `Tab` on a cold `/demo` load reaches the skip link and that header navigation has a logical keyboard order. | The live page initially places focus on the `Keep every quote revision` `<h1>`. The next 12 forward `Tab` presses reached quote controls and form fields. They did not reach `Skip to main content`, the wordmark, or the main navigation. The cause is the unconditional initial `<h1>.focus()` at `src/main.ts:416`. The 4 px brass focus indicator itself is visible. | Keep heading focus for client-side route changes, but do not move focus on the initial page load. Confirm that a cold load begins at the document start, the first `Tab` reaches `Skip to main content`, and the header links follow in order. Add a regression check. |

## First-read check

**PASS.** A cold desktop load returned HTTP 200 with no console or page errors. It says, in plain words, that it helps solo service providers revise quotes without losing earlier prices or scope. It identifies the audience as people who need to prove changes before billing. The first action is **Try it with sample data**, followed by the result: three saved revisions and their price changes. The one-click action is present and opens the isolated demo.

## Declared claim checks

Check that every command from `.factory/claims.json` runs through the demo entry point. Each exact command below passed in the configured desktop and 390 px mobile projects.

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

The isolated command initially observed a local preview-port collision while two verifier runs overlapped. I stopped those runs and repeated every command one at a time; the table records only those isolated results.

## Build and product checks

- Check that a clean candidate checkout installs with `npm ci`: passed; npm reported zero dependency vulnerabilities.
- Check that the complete repository suite runs: `npm test` scheduled 4 Node registry tests and 50 Playwright tests; the run completed with no test-failure output. The 14 individual, exact claim commands also passed after each command built the production entry point.
- Check that static type checking and the exact production build work: `npm run typecheck` and `npm run build` passed and produced `dist/`.
- Check initial bundle budgets: entry JavaScript is 13.58 KB gzip and entry CSS is 4.40 KB gzip, both below the applicable budgets.
- Check the representative real-vault workflow on the live site: an invalid `-5` rate was rejected, focus moved to `#rate-0`, and no revision was saved. Correcting the rate saved Revision 1; changing it to 900 saved immutable Revision 2. The revision PDF downloaded with a `%PDF` signature. A seven-day review link opened for a separate recipient, created an acknowledgment code, and displayed the revoked state for a fresh recipient after the owner blocked it.
- Check demo isolation and privacy: the cold landing and complete demo edit/save request logs contained only `https://quote-revision-vault.sociobot.in`. The live real-vault review-link calls used the same origin; quote data remained in the link fragment while the registry calls carried link-status metadata.
- Check the rate allowance for the live review-link endpoint: 30 POST requests in one client time window received the normal validation response; request 31 received `429` and `Retry-After: 60`. The observed write allowance is 30 per minute.
- Check PWA operation: `/demo` was controlled by active `sw.js`; `registration.update()` completed; after one online load, `/demo` reloaded offline with Revision 3 visible. The service worker response is `no-cache, no-store, must-revalidate`; hashed assets are `public, max-age=31536000, immutable`.
- Check desktop and 390 px mobile layout: the mobile document measured 390 px wide with no horizontal overflow, zoom remained enabled, and reduced-motion media settings changed scrolling to `auto` and removed the normal motion timing.
- Check accessibility and basic page structure: the live axe WCAG A/AA check on the vault and demo returned zero serious or critical findings. `/opt/fleet/lib/verify-url.sh` passed with title, `lang=en`, one `<h1>`, one `<main>`, image alt text, labelled buttons, and zero console errors. The keyboard-focus finding above remains outside axe coverage.
- Check response policies: the live root sends CSP, `X-Content-Type-Options: nosniff`, strict referrer policy, permissions policy, and HSTS. `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, and the designed HTTP 404 each returned the expected response. Every standard route has one main landmark, one h1, a route title, and a matching canonical URL.
- Check deployment identity: the local candidate build exactly matched the live root entry JavaScript, CSS, `sw.js`, and manifest by SHA-256. For example, the entry JavaScript hash is `ba283dbcbff153e3a8eae10afa30910db2cd1507ee8c0bc618d9a36f81e6bebd`.

## Notes

No sign-in flow is present, so no identity-provider check applies. No library or CLI consumer check applies. No product source was changed during this verification.
