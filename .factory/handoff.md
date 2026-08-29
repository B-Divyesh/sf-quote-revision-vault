# Review 2 handoff — Quote Revision Vault

**Completed:** 2026-08-29 UTC
**Reviewed deployment:** https://quote-revision-vault.sociobot.in
**Review commit:** pending this handoff commit

No product code was modified. `.factory/review-2.md` records a **FAIL** with two blocking findings:

1. `/demo` review-link actions call the production status registry, so demo activity can persist remote records despite the “nothing is saved” banner.
2. An arbitrary pasted Studio Pass token unlocks additional quotes when the verification request fails.

It also records unlisted legal/payment/license-data claims, one overlong technical README sentence, and a generic footer slogan.

## Verification performed

- Opened the live landing in fresh 390×844 and 1440×1000 contexts: clear cold-read result, no console errors, no off-origin initial requests, no horizontal overflow.
- Used the live one-click demo: realistic sample displayed immediately; banner, reset, and start-real local isolation worked; demo and real IndexedDB databases were separate.
- Confirmed the demo remote-persistence defect from the production flow/source path.
- Confirmed the license defect in a live fresh context by returning HTTP 503 for verification, entering `not-a-license`, and creating two real-vault quotes without a license dialog.
- In clean clone `/tmp/qrv-review-2-03FGRt/repo`, ran `npm ci`, every `claims.json` command, `npm test`, `npm run typecheck`, and `npm run build`; all completed successfully and build generated `dist/`.
- Checked live titles, metadata, 404 status/page, crawl links, route focus/back behaviour, headers, and prior Review 1 repairs.

## Re-run

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Known gaps are the five findings in `.factory/review-2.md`; do not treat the passing existing tests as closure for the two blocking flows.
