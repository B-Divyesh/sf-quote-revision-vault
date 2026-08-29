# Independent verification 7 — Quote Revision Vault

**Result: PASS**

**Verified:** 2026-08-29 UTC

**Candidate:** `af3b7a06c43bed117964440818db26aba76e6c69`
**Live URL:** https://quote-revision-vault.sociobot.in

## Release decision

Confirm this candidate meets the researched brief and the factory acceptance contract. No release-blocking defect was identified. The deployed main JavaScript, CSS, and service worker are byte-for-byte equal to this candidate's production build.

## First-read check

**PASS.** Check a cold desktop load of the live root. The first screen says that the product revises quotes without losing earlier prices or scope. It says it is for solo service providers who need to prove what changed before billing. It offers **Try it with sample data** and says that the click shows three saved revisions and their price changes. The action is one click and opens the isolated demo.

## Declared claim checks

Confirm a clean `npm ci`, then run every exact command in `.factory/claims.json` separately through the configured demo entry point. All 14 commands passed in the desktop and 390 px Playwright projects.

| Claim ID | Result |
| --- | --- |
| `revision-history` | PASS |
| `pdf-export` | PASS |
| `vault-export` | PASS |
| `review-link` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS |
| `no-tracking-sync` | PASS |
| `offline-reload` | PASS |
| `free-one-quote` | PASS |
| `license-restore` | PASS |
| `license-data` | PASS |
| `scope-boundaries` | PASS |
| `art-provenance` | PASS |
| `mit-license` | PASS |

Confirm claim coverage: 14 claim records and 14 `@claim:` checks are present. The claim records cover revision history, PDF and vault export, review links, demo isolation, local data handling, offline reload, free-tier and license behavior, scope boundaries, art provenance, and the MIT license.

## Local quality checks

- Confirm dependency installation: `npm ci` installed 78 packages and completed successfully.
- Confirm the complete suite: `npm test` passed 4 Node API logic checks and 52 Playwright checks in 1.5 minutes.
- Check static analysis: `npm run typecheck` passed. No separate lint command is declared.
- Confirm the exact production build: `npm run build` passed and produced `dist/`.
- Check production budgets: entry JavaScript is 13.58 KB gzip and entry CSS is 4.40 KB gzip. Both are within the PWA first-load budgets.
- Check repository consistency: `git diff --check` passed before documentation updates.

## Product workflow checks

- Confirm invalid-value recovery on the live demo: a `-1` rate showed `The revision was not saved. Correct the marked amount.` and did not save a revision. Correcting the rate to 902 saved Revision 4 and the comparison showed `$902.00`.
- Confirm PDF output on the live demo: Revision 4 downloaded as `harbour-street-identity-refresh-revision-4.pdf`, began with `%PDF`, and was 5,750 bytes.
- Confirm the representative real-vault flow on the live site: create a quote, save Revision 1, create a seven-day review link, open it in a separate browser context, create an acknowledgment code, import it, block the link, and open it in a fresh context. The fresh context showed `THIS REVIEW LINK IS REVOKED`.
- Confirm free-tier behavior: a fresh real vault created one quote; choosing a second quote opened the Studio Pass dialog.
- Check boundary and recovery coverage in the complete suite: negative, blank, non-finite, and over-limit line values retain history and show field feedback; malformed vault JSON shows stable plain-language feedback.

## Live PWA, privacy, and response checks

- Confirm privacy from a fresh live demo save: the full request log contained only the product origin (`/demo`, main JS, and CSS). No external analytics, ads, remote fonts, tracking, or automatic sync request appeared. The declared license-data check separately confirms that a license request carries only the pasted token to Sociobot.
- Confirm PWA operation: `/demo` has an active controller for `sw.js`, cache `qrv-shell-v12`, and `registration.update()` completed with an active worker. After an online visit, the demo saved a revision and reloaded offline with Revision 4 still available. The service worker uses a versioned cache, `skipWaiting`, and `clients.claim`.
- Confirm update delivery headers: `sw.js` returned `Cache-Control: no-cache, no-store, must-revalidate`; hashed assets returned `Cache-Control: public, max-age=31536000, immutable`.
- Check response policy: live GET responses include CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, permissions policy, and HSTS. The CSP permits only the product origin plus the documented Sociobot license origin.
- Confirm route and link behavior: `/`, `/demo`, `/vault`, `/privacy`, `/terms`, and `/ack` each returned 200 with one `main`, one `h1`, and the expected title. `/missing-stop` returned the designed 404. Internal navigation targets returned 200 where applicable; the Param Factory link returned 200; the privacy contact is a `mailto:` link.
- Confirm deployment identity: exact comparisons passed for `dist/assets/index-N3TsdQSg.js`, `dist/assets/index-2foinvAW.css`, and `dist/sw.js` against the live files. Main JS SHA-256: `b4f2a1bfb6eb45d0cff959ac94c64170fc6f0fefc37a08ec53251d6999b1480d`.

## Accessibility and responsive checks

- Confirm the required baseline with `/opt/fleet/lib/verify-url.sh`: HTTP 200, title, `lang=en`, one h1, one main landmark, zero images without `alt`, zero unlabeled buttons, and zero console or page errors.
- Confirm live axe WCAG A/AA results: zero serious or critical findings on the demo.
- Check keyboard-only behavior from a cold demo: the first Tab reaches `Skip to main content`; its focus indicator is a visible 4 px solid brass outline. The complete suite repeats this cold-load order and checks navigation heading focus.
- Confirm 390 px behavior: viewport width, document width, and body width were all 390 px; no horizontal overflow or mobile console error occurred. The complete suite also checks the specified controls and footer links at 44 px or larger.
- Confirm reduced motion: the live reduced-motion context matched the media preference and used `0.00001s` transition and animation durations.

## Performance and API allowance checks

- Confirm live mobile Lighthouse on `/demo`: performance 94, accessibility 100, LCP 1,179.5 ms, CLS 0, and total network weight 40,838 bytes. The run used Lighthouse 12.8.2 with the installed Chromium and full-page capture disabled.
- Confirm the documented review-link write allowance on the deployed API. In one client time window, requests 1 through 30 returned the normal validation response (400 for the intentionally incomplete request); requests 31 and 32 returned 429 with `Retry-After: 60`. The observed allowance is 30 POST requests per minute.
- Check product applicability: this is a PWA, not a library or CLI, so no consumer package or command-line check applies. It has no sign-in flow, so no identity-provider check applies.

## Defects by severity

| Severity | Finding |
| --- | --- |
| None | No release-blocking, high, medium, or low defect identified in this verification. |

## Evidence and next step

Evidence from `verify-url.sh` is in `.factory/evidence/verification-7/`. Command output for the build, claim checks, full suite, browser checks, headers, asset comparison, Lighthouse, and API allowance was recorded during this verification.

Confirm the next action: this candidate is ready for release handling by the factory.
