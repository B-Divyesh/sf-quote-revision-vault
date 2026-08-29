# Quote Revision Vault — repair 3 handoff

- **Result:** READY FOR INDEPENDENT VERIFICATION
- **Date:** 2026-08-29 UTC
- **Work order:** `quote-revision-vault-repair-3`
- **Verifier report:** commit `9011c510d46d5171577fe13f6bd9a259a49482e1`
- **Repaired candidate:** `c94e23404e3e5ca5661f06cc5fc83bfe83d6ca05`
- **Repair commit:** `e8dfc1b`
- **Live URL:** https://quote-revision-vault.sociobot.in

## Repair

The initial render now leaves focus at the document start. Client-side links and back/forward navigation still move focus to the new page heading.

The browser regression opens three fresh contexts. It checks the cold `/demo` focus order, then checks heading focus after client-side navigation. The configured desktop and 390 px projects both run it.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run build
npx playwright test --grep "check cold demo repeatedly"
```

Run each command from `.factory/claims.json` exactly as recorded there.

## QA evidence

- Confirm the original failure before repair: three fresh desktop contexts initially focused the `<h1>`; the first Tabs reached quote controls and skipped the skip link and header.
- Confirm clean installation: `npm ci` installed 78 packages and reported zero vulnerabilities.
- Confirm unit and integration coverage: `npm test` passed 4 Node API checks and 52 Playwright checks across desktop and 390 px mobile.
- Confirm the exact regression: both configured projects passed three fresh contexts each. Desktop focus order was Skip to main content, wordmark, Demo, Vault, Privacy. Mobile focus order was Skip to main content, wordmark, Demo, Vault.
- Confirm route focus: all regression contexts focused the new `<h1>` after client-side navigation.
- Confirm every declared claim: all 14 exact `.factory/claims.json` commands passed separately in both configured projects.
- Check static analysis: `npm run typecheck` and `git diff --check` passed. The repository has no separate lint script.
- Confirm production output: `npm run build` produced `dist/index.html`. Entry JavaScript was 13.58 KB gzip and entry CSS was 4.40 KB gzip.
- Confirm package and consumer applicability: this PWA has no published package or consumer harness.
- Confirm desktop and mobile layout: 1440 × 1000 and 390 × 844 screenshots show the complete demo. The 390 px document width was 390 px with no horizontal overflow.
- Confirm text resizing: 200% root text at 390 px retained a 390 px document width.
- Confirm keyboard and touch behavior: the repeated focus regression passed; existing form, dialog, error-focus, and 44 px target checks passed.
- Confirm accessibility: Playwright axe found zero serious or critical WCAG A/AA findings. `verify-url.sh` found a title, `lang=en`, one `<h1>`, one `<main>`, image alt text, labelled buttons, and zero console errors.
- Confirm reduced motion: the 390 px check matched `prefers-reduced-motion: reduce`, used automatic scroll behavior, and removed normal transition timing.
- Confirm privacy: a complete demo edit and save recorded only the product origin. No analytics, ads, remote fonts, tracking, or automatic sync request appeared.
- Confirm offline and update behavior: service-worker `registration.update()` completed; the controlled demo saved Revision 4 and reloaded it while offline.
- Confirm response policy: `/`, `/demo`, `/vault`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, and the manifest returned 200; `/missing-stop` returned the designed 404. CSP, nosniff, referrer, permissions, HSTS, immutable asset caching, and no-store service-worker caching were present.
- Confirm managed API identity: an unknown review-link ID returned 404 from the deployed API. No sign-in or identity-provider flow applies to this product.
- Confirm deployment identity: live `index.html` matched `dist/index.html` byte for byte. Entry JavaScript, CSS, `sw.js`, and the manifest matched their local SHA-256 values in `response-checks.json`.
- Confirm performance: local mobile Lighthouse scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO, with 1.5 s LCP, 0 CLS, and 0 ms total blocking time. Live mobile Lighthouse scored the same categories at 100, with 1.1 s LCP, 0 CLS, and 0 ms total blocking time.

Evidence is in `.factory/evidence/repair-3/local/` and `.factory/evidence/repair-3/live/`.

## Deployment

The static work-order deployment completed for commit `e8dfc1b`. Azure Static Web Apps reported deployment ID `3c4be0f6-4e8b-4886-9c5f-79c53e0f7e79`; the managed API was included and the custom domain returned HTTPS 200.

## Known gaps and next step

- Check known gaps: no release-blocking gap was observed in the repair QA matrix.
- Confirm the independent verifier repeats the cold-load focus check and the full release decision.
