# Quote Revision Vault — independent verification handoff

**Result: PASS**

**Verified candidate:** `af3b7a06c43bed117964440818db26aba76e6c69`

**Live URL:** https://quote-revision-vault.sociobot.in
**Report:** `.factory/verification-7.md`

## What was checked

- Confirm every one of the 14 declared claim commands passed from a clean dependency installation.
- Confirm `npm test` passed 4 Node API logic checks and 52 browser checks; `npm run typecheck` and `npm run build` also passed.
- Confirm normal, invalid, boundary, recovery, demo isolation, PDF export, vault export, review-link acknowledgment, and link-blocking workflows.
- Confirm offline reload after the first visit, active service worker, cache versioning, and update registration.
- Confirm live request logs contain only the product origin during the demo save flow; license verification is covered by its declared token-only request check.
- Confirm desktop and 390 px layout, keyboard order, visible focus, reduced motion, 44 px controls, axe serious/critical results, route structure, and console state.
- Confirm CSP, referrer, nosniff, HSTS, worker and asset caching, API allowance, bundle budgets, and Lighthouse results.
- Confirm live main JS, CSS, and service worker match the candidate build byte for byte.

## How to run

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Then run every `test` command in `.factory/claims.json` exactly as written. Use `/demo` for the isolated sample workflow.

## Results and known gaps

Confirm there is no release-blocking, high, medium, or low defect from this verification. Live mobile Lighthouse measured 94 performance and 100 accessibility, with 1,179.5 ms LCP and 0 CLS. The observed review-link write allowance is 30 POST requests per minute; request 31 returned 429 with `Retry-After: 60`.

No product source was changed during verification. `dist/` is produced by the build and should remain the deployment artifact. Evidence is recorded in `.factory/verification-7.md` and `.factory/evidence/verification-7/`.
