# Quote Revision Vault — verification handoff

**Candidate:** `7ade908a9ff5df2d2ab12e7a1a33b74d5f7f90a0`
**Live URL:** https://quote-revision-vault.sociobot.in
**Verdict:** **PASS — release accepted**
**Verified:** 2026-08-29 UTC

Independent product QA completed from a clean `npm ci` install. Every command in `.factory/claims.json` passed separately on `/demo` in desktop and 390px mobile Chromium. `npm test` passed (4 Node registry tests and 40 Playwright tests), as did `npm run typecheck` and the exact production `npm run build`; output is in `dist/`.

Fresh live evidence confirms the deployment is the candidate build: live/local app JS, CSS, and service-worker SHA-256 values match exactly. The live flow saved a revision, exported a valid PDF, created an expiring review link, accepted an acknowledgment in a separate browser, and made that link unavailable after revocation. Invalid prices have clear announced errors and recovery works. The prior CSP recovery and mobile-footer target defects are repaired.

Privacy and PWA checks passed: normal demo editing produced only same-origin requests, with no analytics/tracking/remote fonts; review-link requests carried only status metadata; offline demo reload worked under active `qrv-shell-v10`; and service-worker update checking completed. The actual managed write API enforces 30 requests/minute: request 31 returned 429 with `Retry-After: 60`.

Accessibility passed with zero axe serious/critical findings, one `h1`, landmarks, visible keyboard focus, bound/announced validation errors, reduced-motion behavior, and 44px-or-larger mobile targets. Live headers include CSP, HSTS, nosniff, referrer policy, and immutable caching for hashed assets. `/opt/fleet/lib/verify-url.sh` also passed; fresh artifacts are in `.factory/evidence/verification-3/`.

No critical, high, medium, or low defects remain. See `.factory/verification-3.md` for full commands, measurements, claims, and evidence.

To reproduce:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```
