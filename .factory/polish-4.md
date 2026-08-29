# Polish 4 — cumulative adversarial review closure

**Candidate repaired:** `af3b7a06c43bed117964440818db26aba76e6c69`
**Review repaired:** `cbc688471a07532047283846e393308b387ef9f1`
**Repair commit:** `2a1570036e65d4f81f73c4074c93c0918541bce7`
**Deployed work order:** `quote-revision-vault-polish-4`
**Live URL:** https://quote-revision-vault.sociobot.in

All numbered findings in Reviews 1–4 were rechecked. “Retained” rows name the already-correct implementation and its current regression evidence rather than relying on an older closure note.

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Retained per-route title, description, canonical, Open Graph, and Twitter updates; the route metadata regression now includes `/ack`. | `every route sets its own canonical and social metadata`; live [checks](evidence/polish-4/live/checks.json) records the landing canonical and `/ack` title. |
| F-1-2 | Retained the standalone art-deco 404 and Static Web Apps 404 response override. | `unknown paths return a designed HTTP 404 with a home link`; live `GET /missing-review-4` was 404 and [404 screenshot](evidence/polish-4/live/404-desktop.png). |
| F-1-3 | Retained removal of unavailable-sales and unproved free-export wording; payment, invoice, and signature boundaries remain explicit and tested. | `@claim:scope-boundaries`; clean clone pass and live landing check at https://quote-revision-vault.sociobot.in. |
| F-1-4 | Retained the arbitrary Revision 1/3 comparison and offline-created Revision 4 reload coverage. | `@claim:revision-history`, `@claim:offline-reload`; live [checks](evidence/polish-4/live/checks.json) reloaded the offline $903 revision. |
| F-1-5 | Retained direct section names and “review link” workflow copy. | `.factory/copy-audit.md`; live [first screen](evidence/polish-4/live/first-screen-desktop.png). |
| F-1-6 | Retained “this browser” privacy wording and plain-language README explanations. | `.factory/copy-audit.md`; `@claim:local-privacy`; live landing at https://quote-revision-vault.sociobot.in. |
| F-2-1 | Retained local-only demo review links; demo creation, recipient acknowledgment, blocking, and reset skip the registry. | `@claim:demo-isolation`; live [checks](evidence/polish-4/live/checks.json) records `registryRequests: 0`, and [demo mobile](evidence/polish-4/live/demo-mobile.png). |
| F-2-2 | Retained fail-closed licensing: new or unavailable tokens do not unlock extra quotes. | `@claim:license-restore`; live [checks](evidence/polish-4/live/checks.json) records `unavailableVerifierKeepsOneQuote: true`. |
| F-2-3 | Retained the legal/payment and license-request claim entries and observable tests. | `@claim:scope-boundaries`, `@claim:license-data`; clean-clone claim pass. |
| F-2-4 | Retained short, plain README privacy sentences. | `.factory/copy-audit.md`; current README audit has no sentence over 22 words. |
| F-2-5 | Retained the product-specific app and fallback footer sentence. | `unknown paths return a designed HTTP 404 with a home link`; live [404 screenshot](evidence/polish-4/live/404-desktop.png). |
| F-3-1 | Retained the desktop hero sizing and first-screen bounding-box regression. | `landing page explains the job and has no serious accessibility errors`; live [first screen](evidence/polish-4/live/first-screen-desktop.png). |
| F-3-2 | Retained the committed npm lockfile and clean-checkout workflow. | Fresh clone `/tmp/qrv-polish4-clean.Cb2PZk/repo`: `npm ci` completed with 0 vulnerabilities, then all claims/full suite/build passed. |
| F-3-3 | Retained the matching 404 footer description and external-link disclosure. | `unknown paths return a designed HTTP 404 with a home link`; live [404 screenshot](evidence/polish-4/live/404-desktop.png). |
| F-3-4 | Retained provenance and MIT claim contracts. | `@claim:art-provenance`, `@claim:mit-license`; clean-clone claim pass. |
| F-3-5 | Retained the result-naming demo exit label “Open my real vault.” | `@claim:demo-isolation`; live [demo desktop](evidence/polish-4/live/demo-desktop.png). |
| F-4-1 | Added `review-registry-privacy` to the claim contract and a browser/API regression that captures the real product POST and verifies the status-only registry entity. | `@claim:review-registry-privacy`; live [checks](evidence/polish-4/live/checks.json) records only `action`, `expiresAt`, and `ownerKey` and then blocks the created link. |
| F-4-2 | Replaced the vague “Revise quotes safely” metadata with “Save and compare quote revisions” in initial HTML and route metadata. | `every route sets its own canonical and social metadata`; live [verify](evidence/polish-4/live/verify.json) and [checks](evidence/polish-4/live/checks.json). |
| F-4-3 | Renamed the demo panel to “Customer review link,” rewrote `/ack` metadata, rewrote the manifest, and removed the remaining PDF “receipt” phrase. | `uses review link and acknowledgment terminology in the app and installed metadata`; live [demo desktop](evidence/polish-4/live/demo-desktop.png), live `/ack`, and manifest check in [checks](evidence/polish-4/live/checks.json). |
| F-4-4 | Kept Privacy in the 390px header by removing the mobile rule that hid the third navigation link. | `390px header keeps Privacy visible with a touch-sized target`; live [first screen mobile](evidence/polish-4/live/first-screen-mobile.png) and `privacyTargetHeight: 44` in [checks](evidence/polish-4/live/checks.json). |
| F-4-5 | Added the identical version/build identifier to the standalone 404 footer and compare it to the app footer. | `unknown paths return a designed HTTP 404 with a home link`; live [404 screenshot](evidence/polish-4/live/404-desktop.png) and 404 result in [checks](evidence/polish-4/live/checks.json). |
| F-4-6 | Added `/ack` to `public/sitemap.xml` and tested the shipped sitemap. | `sitemap lists every public product route including the acknowledgment route`; live sitemap result in [checks](evidence/polish-4/live/checks.json). |

## Final verification

- Fresh clone at `2a1570036e65d4f81f73c4074c93c0918541bce7`: `npm ci` passed with 0 vulnerabilities; all 15 commands named in `.factory/claims.json` passed individually in desktop Chromium and 390×844 Chromium.
- Full clean-clone suite: 4 API tests and 62 Playwright tests passed. `npm run typecheck` and `npm run build` passed, producing `dist/index.html`.
- Local verifier: [verify.json](evidence/polish-4/local/verify.json) reports HTTP 200, title/lang/h1/main/alt/button checks, and no console errors. Local Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.20 s, CLS 0 ([report](evidence/polish-4/local/lighthouse.json)).
- Deployed with `/opt/fleet/lib/deploy-static.sh quote-revision-vault dist`; deployment ID `063bb2c6-9430-4b75-a38b-5e8c299706f4` completed successfully.
- Live verifier: [verify.json](evidence/polish-4/live/verify.json) reports HTTP 200, 780 ms observed load, correct title/lang/h1/main/alt/button checks, and no console errors. Live Lighthouse: 100/100/100/100; LCP 1.06 s, CLS 0 ([report](evidence/polish-4/live/lighthouse.json)).
- Live cold audit: [checks](evidence/polish-4/live/checks.json) rechecked title/canonical, `?demo=1`, reset, real-vault separation, demo registry isolation, real review-link request privacy, unavailable license fail-closed behavior, HTTP 404, `/ack`, sitemap, 390px navigation/overflow, offline save/reload, and axe on six public routes. It recorded zero serious/critical axe violations and zero unexpected console errors.

No numbered review finding remains unresolved.
