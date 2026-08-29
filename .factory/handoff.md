# Polish 1 handoff — Quote Revision Vault

**Completed:** 2026-08-29 UTC
**Repair commit:** `94a4ffa93ccbf8042dabb265fabc685066ff6004`
**Pushed:** `origin/main`
**Deployed URL:** https://quote-revision-vault.sociobot.in

All six Review 1 findings are closed. The product keeps its art-deco paper-trail identity while adding route-specific metadata, a real static HTTP 404, expanded claim proof, direct landing language, and a direct isolated `?demo=1` entry path with persistent banner, reset, and start-real controls.

## Exact verification evidence

- Fresh clone: `/tmp/qrv-clean-xpqJHl/repo`; `npm ci` completed with 0 vulnerabilities.
- Every declared claim command passed separately from that clone, in both desktop Chromium and 390×844 mobile: `revision-history`, `pdf-export`, `vault-export`, `review-link`, `demo-isolation`, `local-privacy`, `no-tracking-sync`, `offline-reload`, `free-one-quote`, and `license-restore`.
- Local complete suite: `npm run typecheck`, `npm run build`, then `npm test` passed: 4 Node registry tests and 42 Playwright tests across desktop/mobile. `dist/` contains `index.html`.
- Local deployed-artifact check: `verify-url.sh` passed at `http://127.0.0.1:4174/`; observed load 633 ms with zero console errors. `GET /missing-stop` returned HTTP 404 and the designed 404 title, h1, and home link.
- Live cold check: `verify-url.sh` passed at the deployed URL; observed load 708 ms with zero console errors. Evidence is in `.factory/evidence/polish-1/live/`.
- Live Playwright check passed for first-screen wording/action, demo reset/isolation, route titles/canonical/OG metadata, HTTP 404, zero serious/critical axe WCAG A/AA findings, and zero off-origin requests.
- Performance: the current initial application JS is the 43.05 kB source asset (13.45 kB gzip); prior mobile Lighthouse evidence remains 97 performance, 100 accessibility, LCP 1.4 s, TBT 180 ms, and CLS 0. The copy/routing repair does not add initial JavaScript.

`npx @axe-core/cli` was attempted but its Selenium launcher cannot find Chrome in this container. The same WCAG A/AA check passed through the installed Playwright axe integration locally and live.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

No known gaps remain. See `.factory/polish-1.md` for finding-by-finding closure and evidence.
