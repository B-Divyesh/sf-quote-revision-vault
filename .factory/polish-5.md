# Polish 5 — cumulative adversarial review closure

**Candidate repaired:** `b395fa4eaeca0eb93c3d315c8f542279651718b5`
**Review repaired:** `cd8ca6f59d280eea326730e3d11a07dc0603a065`
**Repair commit:** `fdc2967e9997fddcc50b5ecae6178f8b5036c63d`
**Deployed work order:** `quote-revision-vault-polish-5`
**Live URL:** https://quote-revision-vault.sociobot.in

Every numbered finding from Reviews 1–5 was rechecked as current behaviour. The repair adds the final missing claim contract instead of removing the useful product boundary.

| Finding | Change made or verified | Evidence |
| --- | --- | --- |
| F-1-1 | Each app route updates title, description, canonical, Open Graph, and Twitter metadata. | Live route records in [checks](evidence/polish-5/live/checks.json); `every route sets its own canonical and social metadata`. |
| F-1-2 | Unknown paths use the art-deco 404 and return HTTP 404. | Live `GET /missing-polish-5` was 404; [404 screenshot](evidence/polish-5/live/404-desktop.png). |
| F-1-3 | Unproved sales, checkout, and “free export” wording remains absent; the retained scope boundary is claimed and tested. | `@claim:scope-boundaries` from the clean clone; live landing check. |
| F-1-4 | History test selects Revisions 1 and 3; offline test saves and reloads Revision 4. | `@claim:revision-history`, `@claim:offline-reload`; live [checks](evidence/polish-5/live/checks.json) records offline `$905`. |
| F-1-5 | Landing sections use direct names and “review link” terminology. | [First-screen screenshot](evidence/polish-5/live/first-screen-desktop.png); `.factory/copy-audit.md`. |
| F-1-6 | Browser-local privacy wording names export and review-link exceptions; README deployment terms remain separate. | `@claim:local-privacy`; live cold-request check in [checks](evidence/polish-5/live/checks.json). |
| F-2-1 | Demo review links stay local, skip the registry, reset with the sample, and never enter the real vault. | `@claim:demo-isolation`; live [demo screenshot](evidence/polish-5/live/demo-desktop.png) and `registryRequests: 0` in checks. |
| F-2-2 | New, invalid, and unavailable licenses fail closed; only a verified Studio Pass permits another quote. | `@claim:license-restore` clean-clone pass. |
| F-2-3 | Payment, invoice, legal-signature, and license-request boundaries have explicit claim entries. | `@claim:scope-boundaries` and `@claim:license-data` clean-clone passes. |
| F-2-4 | README privacy copy is split into short, plain sentences. | `.factory/copy-audit.md`; no audited sentence exceeds 22 words. |
| F-2-5 | App and 404 footers use the product-specific quote-revision description. | [404 screenshot](evidence/polish-5/live/404-desktop.png); `unknown paths return a designed HTTP 404 with a home link`. |
| F-3-1 | Desktop first screen keeps the headline, audience, action, and facts within 1440×1000. | `landing page explains the job and has no serious accessibility errors`; [first-screen screenshot](evidence/polish-5/live/first-screen-desktop.png). |
| F-3-2 | Committed npm lockfile supports a deterministic `npm ci` clean clone. | `/tmp/qrv-polish5-clean.tENlrL/repo`: `npm ci`, all claims, suite, type-check, and build passed. |
| F-3-3 | Standalone 404 matches the app footer and labels the external factory link. | Live [404 screenshot](evidence/polish-5/live/404-desktop.png); checks record the shared build identifier. |
| F-3-4 | Generated-art provenance and MIT licence each have a claim contract. | `@claim:art-provenance` and `@claim:mit-license` clean-clone passes. |
| F-3-5 | Demo exit names its result: “Open my real vault.” | `@claim:demo-isolation`; live [demo screenshot](evidence/polish-5/live/demo-desktop.png). |
| F-4-1 | Real review-link creation sends and stores status data only. | `@claim:review-registry-privacy`; live checks record only `action`, `expiresAt`, and `ownerKey`. |
| F-4-2 | Landing metadata says “Save and compare quote revisions,” without the vague safety claim. | Live verifier and [checks](evidence/polish-5/live/checks.json). |
| F-4-3 | Demo, acknowledgment route, and manifest consistently use review-link/acknowledgment terms. | `uses review link and acknowledgment terminology in the app and installed metadata`; live demo screenshot. |
| F-4-4 | The 390px header keeps a 44px Privacy target with no horizontal overflow. | [Mobile screenshot](evidence/polish-5/live/first-screen-mobile.png); checks record `privacyTargetHeight: 44`. |
| F-4-5 | Designed 404 footer includes the shared build identifier. | [404 screenshot](evidence/polish-5/live/404-desktop.png); checks record `Version 1.0.0 · Build 2026-08-29`. |
| F-4-6 | `/ack` is in the sitemap. | Live sitemap assertion in [checks](evidence/polish-5/live/checks.json). |
| F-5-1 | Added `no-customer-tracking`: “Does not create customer profiles or track customer activity.” Privacy and README now state the same boundary. Its browser test creates a real review link, recipient acknowledgment, and import; it proves only POST/GET review-status calls occur, no customer content leaves the browser, and IndexedDB has only the `quotes` store. | `@claim:no-customer-tracking` passed separately from the clean clone; live [customer-boundary screenshot](evidence/polish-5/live/customer-boundary.png) and `customerBoundary` in [checks](evidence/polish-5/live/checks.json). |

## Verification

- Fresh clone `/tmp/qrv-polish5-clean.tENlrL/repo`: `npm ci` completed with 0 vulnerabilities. All 16 commands declared in `.factory/claims.json` passed separately in desktop Chromium and the 390×844 mobile project: `revision-history`, `pdf-export`, `vault-export`, `review-link`, `review-registry-privacy`, `demo-isolation`, `local-privacy`, `no-tracking-sync`, `no-customer-tracking`, `offline-reload`, `free-one-quote`, `license-restore`, `license-data`, `scope-boundaries`, `art-provenance`, and `mit-license`.
- That clean clone then passed `npm test` (4 API tests and 64 browser tests), `npm run typecheck`, and `npm run build`; `dist/index.html` exists. Initial app JavaScript is 13.62 KB gzip and CSS is 4.39 KB gzip.
- Local production verification: [verify result](evidence/polish-5/local/verify.json) has the correct title, `lang=en`, one h1, main landmark, alt text, labelled controls, and zero console errors. Local Lighthouse: Performance 94, Accessibility 100, Best Practices 100, SEO 100; LCP 1.45 s, CLS 0 ([report](evidence/polish-5/local/lighthouse.json)).
- Deployed with `/opt/fleet/lib/deploy-static.sh quote-revision-vault dist`; deployment ID `019a6c04-16e2-4c6a-b896-e8d2bc069d17` succeeded. The custom domain returned 200 cold and an unknown path returned 404.
- Live production verification: [verify result](evidence/polish-5/live/verify.json) reports 678 ms observed load and zero console errors. Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.06 s, CLS 0 ([report](evidence/polish-5/live/lighthouse.json)).
- The post-deploy live audit at https://quote-revision-vault.sociobot.in rechecked demo isolation/reset, metadata, history focus, mobile layout, CSP headers, sitemap, 404, offline save/reload, and axe on seven routes. It found zero serious/critical axe violations and zero unexpected console errors ([checks](evidence/polish-5/live/checks.json)).

No review finding remains unresolved. No known gaps remain.
