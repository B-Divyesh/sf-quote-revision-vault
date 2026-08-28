# Quote Revision Vault repair handoff

**Verifier findings repaired and deployed.**

- Work order: `quote-revision-vault-repair-1`
- Repaired candidate: `1d65c423eaeb227e2981c666b6680b4048babd36`
- Verification report: `c143d46ddbcabcda362c38d5cf54197d8d75d7b5`
- Repair commit: `c1a7094` plus the final registry/evidence handoff commit
- Live URL: https://quote-revision-vault.sociobot.in
- Final deployment ID: `4f0e56a9-9646-49bc-ba57-44d2cbc30fdd`
- Verified: 2026-08-28 UTC

## Repairs

1. Review links now register a random ID, expiry, owner-key hash, and append-only revocation marker in a same-origin managed function. Quote and customer contents remain in the URL fragment and never enter the registry. A recipient must receive a live `active` result before any quote content renders. Revoked, expired, missing, offline, and failed-status links fail closed. The service worker bypasses `/api/`, so an earlier active response cannot survive revocation. Writes use a durable 30-per-minute client limit.
2. Revision saving validates raw quantity and rate fields before creating an immutable snapshot. Blank, non-finite, non-positive quantity, negative rate, and configured upper bounds produce bound field errors, move focus to the first error, announce the failure, and leave the draft available to correct.
3. The unprovable “unlimited quotes” promise was narrowed to “multiple quotes.” The claims contract now covers all landing/privacy promises, including free-one-quote behavior and no tracking or automatic sync. Every claim has one matching browser test.
4. All reported mobile controls are 44px high. The line amount and remove action now occupy explicit mobile grid cells; document width is exactly 390px in a 390px viewport.
5. `/assets/*` now returns a one-year immutable cache policy. `sw.js` returns no-cache/no-store, the shell cache is `qrv-shell-v9`, and API responses are never cached by the service worker.
6. Malformed vault JSON now returns one stable, plain-language recovery message without parser internals.

## Local verification

- `npm ci`: passed; 79 packages audited, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm test`: passed 4/4 registry unit tests and 36/36 Playwright tests across desktop Chromium and 390×844 mobile.
- Every one of the 10 commands in `.factory/claims.json` was also run separately: 2/2 browser projects passed for each claim.
- `npm run build`: passed; `dist/index.html` exists. Initial app JS is 13.46 KB gzip and CSS is 4.36 KB gzip. No fonts ship; the mobile hero AVIF is 20,362 bytes.
- Exact regressions cover cross-context revocation, stale-status cache bypass, status-check failure, expiry, unauthorized revocation, durable rate policy, all requested numeric boundaries, malformed import copy, touch sizes, horizontal overflow, and cache headers.

## Live verification

- Separate owner and recipient profiles: active link showed the quote and form; after owner revocation, both the already-opened recipient and a fresh recipient saw the revoked state with zero quote-title matches and no acknowledgment form.
- Registry API: create `201 active`; read `200 active`; wrong owner key `403`; revoke `200 revoked`; read after revoke `200 revoked`; repeated revoke `200 revoked`.
- Rate policy: the 31st write in one minute returned `429`, `Retry-After: 60`, and `Cache-Control: no-store`.
- Invalid amount: `-5` stayed in the editable rate field, the error was announced, and Revision 4 did not exist.
- Mobile: document width 390px; all sampled reported controls measured 44px high. Keyboard Enter activated save, announced the missing reason, and focused `#revision-reason`.
- Accessibility: live Playwright axe on `/demo` found 0 WCAG A/AA violations (25 passed rules). Its one incomplete contrast check is caused by the CSS paper texture; the token contrast was manually verified in the design record.
- PWA: `qrv-shell-v9` controlled the page; offline reload retained Revision 3, showed the offline indicator, and produced no page errors.
- Privacy: the live edit/save flow made no off-origin requests and logged no console errors.
- `verify-url.sh`: HTTP 200, 632ms observed load, title/lang/main present, one h1, zero missing alt text, zero unlabeled buttons, zero console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1s, CLS 0, total blocking time 20ms.
- Response headers: hashed assets return `public, max-age=31536000, immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`; CSP, nosniff, referrer, and permissions policies remain present.
- Build identity: live `/assets/index-CYpbMCqp.js` and local `dist` both SHA-256 `3c02ccc94fc7af151756d4542a109bf10d05f40c0eda9f993fc71e22cb8f37ba`.
- Evidence refreshed in `.factory/evidence/` (desktop/mobile screenshots, verify report, axe report, and Lighthouse JSON).

## Deployment configuration

The original Static Web App/PWA deployment class is unchanged. The managed API uses the existing `sf-quote-revision-vault` Static Web App, its `QRV_STORAGE` app setting, and the isolated `QuoteReviewLinks` and `QuoteReviewRate` tables. No quote content is stored server-side.

## Known external issue

The pre-existing Studio Pass license verifier works and invalid tokens lock correctly. The factory billing catalog does not currently list `quote-revision-vault`, so its prescribed production checkout route returns HTTP 404. No product code can register that factory billing record, and the registration helper named by the paid-unlock contract is absent from this worker image. Existing license behavior was preserved; factory billing registration is still required before accepting new purchases.

## Run

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run preview
```
