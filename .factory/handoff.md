# Quote Revision Vault handoff

## What shipped

- Offline-first quote editor backed by separate real and demo IndexedDB databases.
- Immutable saved revisions with reasons, timestamps, line-item diffs, total changes, and draft restoration.
- PDF export for a saved revision and JSON export/import for the whole vault.
- Self-contained customer review links with 7, 14, or 30-day expiry.
- Customer acknowledgment codes that the quote owner can import.
- One-click `/demo` with three realistic Harbour Street Bakery revisions, reset, and exit controls.
- Free creation of one quote. A $29 one-time Studio Pass enables creation of more quotes.
- Sociobot checkout, returned-license capture, daily verification cache, restore-by-token, and invalid-license notice.
- Installable PWA shell, offline reload, update notice, manifest, icons, metadata, 404 route, security headers, privacy, and terms.
- Product-specific art-deco transit poster system and generated original poster art in AVIF, WebP, and JPEG.

## Verification

- Clean dependency install: `npm ci` — passed, 0 vulnerabilities.
- Automated suite: `npm test` — 22 passed across desktop Chromium and a 390×844 mobile viewport.
- Production build: `npm run build` — passed; `dist/index.html` exists.
- Claim tests: all eight entries in `.factory/claims.json` passed.
- Offline: demo reopened with Playwright network disabled on desktop and mobile.
- Accessibility: Playwright axe scans passed on landing and the populated vault. Standalone axe CLI found 0 violations.
- URL smoke test: title, `lang`, one `h1`, `main`, alt text, labels, and console passed. Load was 633 ms locally.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse lab metrics: LCP 1.1 s, CLS 0, total blocking time 50 ms. INP is unavailable in a single-load lab run.
- Initial assets: 12.52 KB gzip JS, 4.26 KB gzip CSS, no font files, and 20 KB mobile AVIF hero.
- Evidence: `.factory/evidence/verify.json`, `axe.json`, `lighthouse.json`, and desktop/mobile screenshots.

## Known gap

The deploy target is static and quote data has no server. A review link can therefore be blocked only in the browser that created it. Its embedded expiry is enforced on every device, but cross-device revocation would require a small server-side token registry. The UI and README state this limit instead of implying global revocation.

The factory must register the live Sociobot billing product before checkout can complete. No product ID or payment-provider secret is stored here.

## Next steps

1. Register the product slug with the Sociobot billing API and confirm the production return URL.
2. If global link revocation becomes mandatory, add a privacy-minimal token-status endpoint with no quote contents.
3. Run a 30-day pilot and measure how often revised quotes send the generated review receipt.
