# Quote Revision Vault — independent verification 6 handoff

**Result: FAIL**
**Verified:** 2026-08-29 UTC
**Candidate:** `c94e23404e3e5ca5661f06cc5fc83bfe83d6ca05`
**Live URL:** https://quote-revision-vault.sociobot.in

The live deployment matches the candidate build, and all 14 declared claim commands passed in isolated desktop and 390 px runs. The candidate is not ready to release because a cold page load puts keyboard focus on the page h1. Forward `Tab` then starts in the vault controls rather than the required skip link and header navigation. See `.factory/verification-6.md` for exact evidence and the required correction.

## How to verify locally

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

Then load `/demo` in a new browser context. Check that the initial `Tab` reaches **Skip to main content**, followed by the wordmark and main navigation. This check currently fails on the candidate.

## Verified evidence

- Check that all declared claim commands pass: 14/14 passed after isolated reruns.
- Check that type checking and the production build pass: both passed; `dist/` was produced.
- Check that the live first screen is plain and tryable in one click: passed.
- Check that the live real-vault workflow, PDF export, review-link acknowledgment and revocation, demo isolation, offline reload, headers, caching, and deployment asset identity work: passed.
- Check that the review-link write allowance responds after the limit: 30 accepted requests followed by `429` with `Retry-After: 60`.
- Check live axe serious/critical findings and the URL verifier: zero findings and verifier passed.

## Next step

Correct the initial keyboard focus order and add a regression check before a new release decision. No product source was changed during independent verification.
