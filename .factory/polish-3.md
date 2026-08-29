# Polish 3 — cumulative adversarial review closure

**Candidate repaired:** `8761f57069bd7b3ef1200d4ebc86bd47303203d0`

**Review repaired:** `096f0170c0a52ce97f8fb387fbb8da3ce105f403`

**Repair commit deployed:** `793ad5c`

**Live URL:** https://quote-revision-vault.sociobot.in

Every finding from Reviews 1–3 was rechecked. The table maps each finding to its current implementation and evidence.

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Route navigation updates title, description, canonical, Open Graph, and Twitter metadata. | `every route sets its own canonical and social metadata`; live `/`, `/demo`, `/vault`, `/privacy`, and `/terms` records in `evidence/polish-3/live/checks.json`. |
| F-1-2 | The standalone art-deco `404.html` remains wired through `responseOverrides.404` and returns HTTP 404. | `unknown paths return a designed HTTP 404 with a home link`; live [404 screenshot](evidence/polish-3/live/404-desktop.png); live `/missing-stop` returned 404. |
| F-1-3 | Unavailable-sales and unproved free-export wording remain absent. Payment, invoice, and signature boundaries are tested. | `@claim:scope-boundaries` and `landing and terms do not expose a payment checkout while no sale is offered`; clean-clone pass. |
| F-1-4 | History coverage selects Revision 1 and Revision 3. Offline coverage creates and reloads Revision 4 with its changed value. | `@claim:revision-history`, `@claim:offline-reload`; both passed in both clean-clone projects. Live offline check reloaded Revision 4 at $902. |
| F-1-5 | Direct section names and review-link terminology remain in the landing page. | `.factory/copy-audit.md`; live [desktop screenshot](evidence/polish-3/live/screenshot-desktop.png). |
| F-1-6 | First-screen privacy wording says “this browser” and names export and review-link exceptions. README keeps implementation detail under “Deployment details.” | `@claim:local-privacy`; `.factory/copy-audit.md`; live cold request log had zero off-origin requests. |
| F-2-1 | Demo review links remain self-contained and never call the live registry. The primary action now enters the isolated `/?demo=1` path directly. | `@claim:demo-isolation`; live check exposed only `qrv-demo-v1`, made 0 registry requests, reset the sample, and opened an empty real vault. [Mobile demo](evidence/polish-3/live/demo-mobile.png). |
| F-2-2 | New tokens remain unverified until a positive Sociobot response; invalid and unavailable responses keep the one-quote limit. | `@claim:license-restore` covers valid, invalid, and HTTP 503 responses in both clean-clone projects. |
| F-2-3 | Legal/payment and license-request promises remain listed and observable. | `@claim:license-data` and `@claim:scope-boundaries`; both passed from the clean clone. |
| F-2-4 | README privacy copy remains split into short, plain sentences. | `.factory/copy-audit.md`; no audited copy exceeds 22 words or uses a banned term. |
| F-2-5 | Product-specific footer wording now also appears on the standalone 404. | `unknown paths return a designed HTTP 404 with a home link`; [404 screenshot](evidence/polish-3/live/404-desktop.png). |
| F-3-1 | Removed the 10ch hero cap and reduced the desktop headline scale while preserving the transit-poster composition. Added an exact 1440×1000 bounding-box regression. | `landing page explains the job and has no serious accessibility errors`; live [first screen](evidence/polish-3/live/first-screen-desktop.png): headline bottom 655.66px, audience 753.56px, action 826.56px, facts 962.31px. |
| F-3-2 | Refreshed the committed lockfile, pinned npm 10.9.8 and Node 22, and added a clean-checkout CI job using `npm ci`. | Fresh clone of `793ad5c`: `npm ci` passed with 0 vulnerabilities, all 14 claim commands passed, then the full suite/typecheck/build passed. See `evidence/polish-3/clean-clone.json`. |
| F-3-3 | Replaced the stale 404 slogan with the app footer sentence and added “(external)” to the Param Factory link. | 404 regression test plus live HTTP 404 check and [screenshot](evidence/polish-3/live/404-desktop.png). |
| F-3-4 | Added claim entries and tests for generated-art provenance and the MIT grant. Added the standard “MIT License” heading to `LICENSE`. | `@claim:art-provenance` verifies the source asset, dated prompt sidecar, model, and design record. `@claim:mit-license` verifies the committed grant and warranty text. |
| F-3-5 | Renamed “Start for real” to “Open my real vault” in the banner and demo guide. | `@claim:demo-isolation`; live [mobile demo](evidence/polish-3/live/demo-mobile.png) shows the result-naming action and `/vault` target. |

## Verification

- Clean clone: `npm ci` passed with 0 vulnerabilities. Each of the 14 commands in `.factory/claims.json` passed separately in desktop Chromium and 390×844 Chromium.
- Full clean-clone suite: 4 Node tests and 50 Playwright tests passed. `npm run typecheck` and `npm run build` passed; `dist/index.html` exists.
- Local production verifier: 646 ms observed load, correct title/lang/h1/main/alt/button names, and zero console errors. Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.51 s, CLS 0.
- Live production verifier: 899 ms observed load with the same structural checks and zero console errors. Live Lighthouse: 100/100/100/100; LCP 1.06 s, CLS 0.
- Live cold browser: route metadata, focus on forward/back navigation, 390px overflow, demo/reset/real-vault separation, demo review-link network isolation, axe, offline save/reload, and styled HTTP 404 all passed. Full observations are in `evidence/polish-3/live/checks.json`.

No review finding remains open.
