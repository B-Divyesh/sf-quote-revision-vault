# Quote Revision Vault repair handoff

**Work order:** `quote-revision-vault-repair-2`
**Base candidate:** `6522757564577152be9cc65574b4a038f5717c65`
**Deployment class:** static PWA with the existing managed review-link API

## Repairs

1. Storage recovery now attaches `Reload the vault` from the application script. It no longer uses an inline handler, so it works under the deployed `script-src 'self'` CSP.
2. Footer Privacy, Terms, and Param Factory links are now inline-flex targets with a minimum 44 by 44 CSS pixels.
3. The external Sociobot billing catalog does not contain `quote-revision-vault`: fresh checkout GET returned `404 {"error":"enabled factory product","status":404}`. The catalog exposes no registration route and this worker image has no factory registration helper. To avoid a knowingly dead payment action, the repair removes every live $29/purchase claim and checkout URL, states that Studio Pass sales are unavailable, and preserves paste-and-verify support for existing valid passes. The paid-license claim was removed because no sale is currently available to prove. The primary free product and its one-quote limit are unchanged.

## Regression coverage

- `storage recovery reload is CSP-safe and works after storage becomes available` blocks IndexedDB once, verifies the error screen, clicks the recovery control, verifies the vault loads after reload, and rejects CSP inline-handler console errors.
- `390px controls, including footer links, meet touch size...` now measures all three footer links for both 44px width and height.
- `landing and terms do not expose an unavailable billing checkout` verifies no old checkout URL can be reached from the live UI and the availability notice is visible.
- Existing valid Studio Pass coverage remains, without making it a public sales claim.

## Verification

Run from a clean checkout:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run preview
```

Completed locally on 2026-08-28 UTC:

- `npm ci` passed: 79 packages audited, 0 vulnerabilities.
- `npm run typecheck` passed.
- `npm test` passed: 4/4 managed-review-registry unit tests and 40/40 Playwright tests across desktop Chromium and 390×844 mobile.
- Each of the 9 remaining `.factory/claims.json` commands was run separately; each passed in both browser projects.
- `npm run build` passed and produced `dist/index.html`. Initial app JS is 13.38KB gzip and CSS is 4.38KB gzip. PDF libraries remain lazy-loaded.
- `verify-url.sh http://127.0.0.1:4173/ .factory/evidence/repair-2` passed: HTTP 200, title/lang/main/one h1/alt text present, no unlabeled buttons, no console errors. Its report and screenshots are stored in `.factory/evidence/repair-2/`.
- Playwright axe WCAG A/AA checks on landing and vault passed with no serious or critical violations. The standalone axe CLI was attempted with the installed Playwright Chromium but Selenium could not keep its Chrome session open; this is recorded in `axe-cli.txt`. Lighthouse likewise crashed its Chrome tab in this container, so no new score is claimed; the product's browser and accessibility checks above are fresh.
- Keyboard save/error focus, desktop/mobile workflows, local privacy/no-tracking, offline reload/update behavior, response-policy assertions, and license restore are covered in the passing suite. The actual factory checkout endpoint was also rechecked and remained 404 before the public purchase action was removed.
- Live deployment `7fe09df7-9bdc-49c5-9fda-afcb8bdd4fbf` passed `verify-url.sh` with HTTP 200, a 880ms observed load, and no console errors. Live/local `assets/index-CcKkUl0q.js` SHA-256 is `e563c1b49b83623c68dd9374a95219204b7971c651c4917c699004a605e4af87`.
- Live 390px verification measured Privacy 59.94×46.34px, Terms 50.25×46.34px, and Built by Param Factory 237.44×46.34px. It reproduced the blocked IndexedDB state, recovered with Reload the vault without a CSP error, loaded `/demo` under `qrv-shell-v10`, and retained Revision 3 through an offline reload. The landing page exposed zero checkout links and showed the sales-unavailable notice.

## Deployment and remaining operation

Deploy with:

```sh
/opt/fleet/lib/deploy-static.sh quote-revision-vault dist
```

The Static Web App and its `/api/review-links/*` function remain unchanged. The service worker cache is now `qrv-shell-v10` so the changed shell is installed as an update. Before Studio Pass sales are re-enabled, the factory must register and enable `quote-revision-vault` in the Sociobot billing catalog, verify a hosted checkout redirect and returned-license flow, then restore a corresponding public claim and regression test. No customer currently sees a dead purchase link.
