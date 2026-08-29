# Polish 2 handoff — Quote Revision Vault

**Completed:** 2026-08-29 UTC
**Repair commits:** `e50b14ef395a53376aa986826800016c9c97df2a`, `2246e00`
**Deployment:** `677db962-80f3-4382-a4a8-a112911fe99b`
**Live URL:** https://quote-revision-vault.sociobot.in

## Delivered

- Made the complete `/demo` review-link path local-only. Sample packets never call the production registry; the banner is now true for create, open, import, and block actions.
- Changed Studio Pass handling to fail closed. Fresh pasted and URL-returned tokens are unverified until Sociobot replies positively. Only a previously verified cached result receives the explicit seven-day offline grace.
- Added the missing claim contract and tests for license request data and payment/invoice/e-signature boundaries. The catalog description is now verb-first and 66 characters.
- Rewrote the technical README privacy sentence and footer slogan. The product keeps its art-deco transit-paper identity.
- Preserved and rechecked all Review 1 fixes: metadata, designed 404, routing/focus, touch targets, offline PWA, export/import, privacy, and direct copy.

## Verify

```sh
npm ci
npm test
npm run typecheck
npm run build
```

For exact claim coverage, run every command in `.factory/claims.json`. All 13 were run separately from final clean clone `/tmp/qrv-polish-2-final`, then the full 46-Playwright-test suite passed. The clean install reported 0 vulnerabilities. The license-data claim also asserts the verifier uses a GET with only the pasted token and no entered quote or customer content.

`npm run build` produces `dist/index.html`. The static deploy was completed with `/opt/fleet/lib/deploy-static.sh quote-revision-vault /work/repo/dist`.

## Live evidence

- `verify-url.sh` passed locally and live. Live result: HTTP 200, 834 ms observed load, one title/lang/main/h1, image alt text, labelled controls, and zero console errors. See `.factory/evidence/polish-2/live/`.
- Cold live mobile demo test created, imported, and blocked a sample review link with zero registry requests and no horizontal overflow. See `demo-mobile.png`.
- Cold live license test intercepted verification with HTTP 503; `not-a-license` remained at one quote with the retry message. See `license-fail-closed.png`.
- Live axe WCAG A/AA recheck reported zero serious or critical violations. `/missing-stop` returned HTTP 404. Production entry JS is 13.57 KB gzip; CSS is 4.38 KB gzip.

## Known gaps

None. The service still intentionally has no checkout because it does not advertise a sale. Real review links continue to use the status-only managed API; demo links never do.
