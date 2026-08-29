# Quote Revision Vault — polish round 3 handoff

**Completed:** 2026-08-29 UTC

**Work order:** `quote-revision-vault-polish-3`

**Repair commit deployed:** `793ad5c`

**Live URL:** https://quote-revision-vault.sociobot.in

## Delivered

- Reworked the desktop hero scale so the job, audience, primary demo action, and three facts fit inside 1440×1000. The art-deco transit-poster identity is unchanged.
- Made the landing action enter `/?demo=1` directly. The persistent banner offers **Reset demo** and **Open my real vault**; demo storage and review links remain isolated.
- Corrected the standalone 404 footer and external-link disclosure. Route metadata, real HTTP 404 handling, SPA focus, back navigation, legal links, and mobile layout remain covered.
- Added `art-provenance` and `mit-license` to `.factory/claims.json` with one tagged test each. All visitor-facing claims now have a claim entry and observable test.
- Refreshed `package-lock.json`, pinned Node 22/npm 10.9.8, and added a clean-checkout quality workflow.
- Updated the demo guide, copy audit, MIT heading, service-worker cache version, and 84-character verb-first catalog description.

## Exact verification evidence

- Fresh clone of `793ad5c`: `npm ci` passed with 0 vulnerabilities.
- Every one of the 14 claim commands passed separately in both configured projects. Claim IDs and the clean-clone result are recorded in `.factory/evidence/polish-3/clean-clone.json`.
- Full clean-clone `npm test`: 4 Node registry tests and 50 Playwright tests passed.
- Clean-clone `npm run typecheck` and `npm run build`: passed. Output contains `dist/index.html`; initial JS is 13.58 KB gzip and CSS is 4.40 KB gzip.
- Local `/opt/fleet/lib/verify-url.sh`: passed in 646 ms with zero console errors. Evidence: `.factory/evidence/polish-3/local/`.
- Local Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1507 ms, CLS 0, total blocking time 26 ms.
- Deployed with `/opt/fleet/lib/deploy-static.sh quote-revision-vault dist`; Azure deployment `7fdef72d-2e07-44d5-a79a-f105470c9544` succeeded.
- Live `/opt/fleet/lib/verify-url.sh`: passed in 899 ms with zero console errors. Evidence: `.factory/evidence/polish-3/live/`.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1063 ms, CLS 0, total blocking time 26 ms.
- Fresh live browser checks: all first-screen elements end above 1000px; no 390px overflow; zero serious/critical axe findings; zero demo registry/off-origin requests; offline Revision 4 persisted; `/missing-stop` returned HTTP 404; standard routes logged zero console errors.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

## Known gaps and next steps

None. Every finding in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` is closed and regression-tested.
