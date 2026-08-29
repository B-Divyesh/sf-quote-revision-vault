# Review 3 handoff — Quote Revision Vault

**Completed:** 2026-08-29 UTC
**Scope:** Adversarial review only; no product code was changed.
**Live URL:** https://quote-revision-vault.sociobot.in

## Delivered

- Wrote `.factory/review-3.md` with a **FAIL** verdict and five findings.
- Verified the live landing at 390 × 844 and 1440 × 1000, the sample sandbox, reset, review-link isolation, routes, links, metadata, 404 response, README, claims contract, and all prior review/polish history.
- Attempted the required clean clone verification. `npm ci` fails because the repository has no committed lockfile.
- As diagnostic fallback only, used `npm install` in a disposable clone; all 12 declared claim IDs, `npm run typecheck`, and `npm run build` passed.

## Blocking follow-up

1. Keep audience text and “Try it with sample data” visible on the first 1440 × 1000 screen.
2. Commit a deterministic lockfile so the documented `npm ci` works from a clean clone.
3. Repair the standalone `404.html` footer regression before re-review.

## How to re-verify

```sh
npm ci
for claim in $(node -e "for (const x of require('./.factory/claims.json')) console.log(x.id)"); do
  npm test -- --grep "@claim:$claim"
done
npm run typecheck
npm run build
```

Then test live `/` at 1440 × 1000 without scrolling: the headline, audience sentence, and primary demo action must all be visible. Check `/missing-stop` returns HTTP 404 and uses the same footer as app routes.

## Known gaps

See `review-3.md`: the hero layout, clean-install failure, 404 footer regression, two unlisted claims, and the vague demo-exit label remain.
