# Quote Revision Vault — polish 4 handoff

**Result: PASS — no known review findings remain**

**Repaired candidate:** `af3b7a06c43bed117964440818db26aba76e6c69`
**Review source:** `cbc688471a07532047283846e393308b387ef9f1`
**Repair commit:** `2a1570036e65d4f81f73c4074c93c0918541bce7`
**Live URL:** https://quote-revision-vault.sociobot.in

## What changed

- Added and tested the service-side review-link privacy claim. A real create-link request contains only `action`, `expiresAt`, and `ownerKey`; the registry stores status fields only.
- Replaced vague “safely” metadata with the plain, tested job: “Save and compare quote revisions.”
- Standardized customer terminology on “review link” and “acknowledgment,” including the demo, `/ack`, PWA manifest, and PDF output.
- Kept Privacy visible in the 390px header, completed the 404 footer build identifier, and added `/ack` to the sitemap.
- Preserved all earlier fixes: one-click isolated `?demo=1`, reset/real-vault separation, fail-closed licensing, offline save/reload, real routing/404/legal links, direct copy, local-first storage, and the art-deco transit-paper identity.

The verb-first catalog description is now: “Track client quote revisions without losing earlier prices, scope, or proof of what changed.” It is 92 characters.

## How to run and verify

```sh
npm ci
# Run every command listed in .factory/claims.json
npm test
npm run typecheck
npm run build
npm run preview
```

## Exact evidence

- Fresh clone `/tmp/qrv-polish4-clean.Cb2PZk/repo` at `2a1570036e65d4f81f73c4074c93c0918541bce7`: `npm ci` passed with 0 vulnerabilities. All 15 claim commands passed separately in desktop and 390×844 Chromium. The full suite passed 4 API tests and 62 Playwright tests; typecheck and build passed.
- Build output exists at `dist/index.html`. Initial app JavaScript is 13.58 KB gzip and CSS is 4.39 KB gzip; PDF code remains lazy-loaded.
- Local production verification: [verify.json](evidence/polish-4/local/verify.json) shows HTTP 200, correct title/lang/h1/main/alt/button checks, and zero console errors. Local Lighthouse: 100/100/100/100, LCP 1.20 s, CLS 0 ([report](evidence/polish-4/local/lighthouse.json)).
- Deployment used the configured static work-order command: `/opt/fleet/lib/deploy-static.sh quote-revision-vault dist`. Azure deployment `063bb2c6-9430-4b75-a38b-5e8c299706f4` succeeded.
- Cold live verification after deployment: [verify.json](evidence/polish-4/live/verify.json) shows HTTP 200 in 780 ms with zero console errors. Live Lighthouse: 100/100/100/100, LCP 1.06 s, CLS 0 ([report](evidence/polish-4/live/lighthouse.json)).
- [Live checks](evidence/polish-4/live/checks.json) confirm `?demo=1` sample/reset/real-vault separation, zero demo registry calls, privacy-safe real review-link POST, unavailable-license fail-closed behavior, metadata, HTTP 404, `/ack` sitemap coverage, 44px mobile Privacy target/no overflow, offline $903 reload, and zero serious/critical axe violations on `/`, `/demo`, `/privacy`, `/terms`, `/ack`, and the 404.

See `.factory/polish-4.md` for the required finding-by-finding mapping.

## Known gaps and next steps

None. The product remains an offline-first quote revision tool; it intentionally does not add an AI feature because the core job is protecting local quote data and preserving revisions.
