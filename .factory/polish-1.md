# Polish 1 — review finding closure

**Candidate repaired:** `7ade908a9ff5df2d2ab12e7a1a33b74d5f7f90a0`  
**Review repaired:** `727e9891393cde8375e372df7a39767d76f1ad70`  
**Repair commit:** `94a4ffa93ccbf8042dabb265fabc685066ff6004`  
**Live URL:** https://quote-revision-vault.sociobot.in

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `setMeta` now updates canonical, Open Graph, and Twitter title, description, image, and URL on every route. Demo mode canonicalizes to `/demo`. | `every route sets its own canonical and social metadata`; live cold check covered `/`, `/demo`, `/vault`, `/privacy`, and `/terms` with one matching canonical and OG title each. |
| F-1-2 | Added a designed, standalone `404.html` and `404.css`; Static Web Apps now rewrites only the known app routes and uses `responseOverrides.404` for unknown URLs. The preview server mirrors this production behavior. | `unknown paths return a designed HTTP 404 with a home link`; live `GET /missing-stop` returned `404`, title `Page not found — Quote Revision Vault`, one h1, and a home link. |
| F-1-3 | Removed the untestable unavailable-sales and free-export/backup wording from landing, Terms, and README. Added the bounded, tested existing-license promise to the contract. | `@claim:license-restore`; clean-clone command `npm test -- --grep @claim:license-restore` passed in desktop and 390px projects. No checkout link or unavailable-sales wording remains. |
| F-1-4 | Revision-history coverage selects Revision 1 and Revision 3 and asserts their distinct totals. Offline coverage saves an offline Revision 4 and proves it survives an offline reload. | `@claim:revision-history` and `@claim:offline-reload`, both run from the clean clone and passing in desktop and 390px projects. |
| F-1-5 | Replaced route/metaphor headings with direct section names: “Sample revision comparison,” “How quote revisions work,” “Quote data stays in this browser,” and “What this tool does not do.” Replaced “Send the receipt” with “Send a review link.” | `.factory/copy-audit.md` dated 2026-08-29: every landing unit is under 22 words, has no banned wording, and uses one terminology table. Live screenshot: `.factory/evidence/polish-1/live/recheck-mobile.png`. |
| F-1-6 | First-screen privacy fact now says “this browser” and names export/review-link exceptions. Rewrote README and Privacy copy in plain language; technical deployment terms are isolated under “Deployment details.” | Live cold landing check and `.factory/copy-audit.md`; README uses the same browser/review-link vocabulary. |

## Earlier verification findings retained as regressions

The repository has no earlier `.factory/review-*.md` or `.factory/polish-*.md` beyond Review 1. The earlier independent verification reports were also rechecked rather than accepted on history alone:

| Earlier finding | Current evidence |
| --- | --- |
| Recipient-visible review-link revocation | `@claim:review-link` uses owner and fresh recipient contexts; it passed from the clean clone. |
| Invalid rates and quantities could save | `rejects negative, blank, non-finite, and excessive line values without changing history` passed in the full suite. |
| Storage recovery was blocked by CSP | `storage recovery reload is CSP-safe and works after storage becomes available` passed. |
| Mobile controls and footer links were too small | `390px controls, including footer links, meet touch size and the page has no horizontal overflow` passed. |
| Hashed assets lacked immutable caching | `static response policy gives hashed assets immutable caching` passed. |
| Malformed import exposed parser details | `malformed backups get stable plain-language feedback` passed. |
| Unavailable Studio Pass checkout was exposed | `landing and terms do not expose a payment checkout while no sale is offered` passed. |

## Final live evidence

- `verify-url.sh https://quote-revision-vault.sociobot.in/ .factory/evidence/polish-1/live` passed: HTTP 200, 708 ms observed load, title, `lang=en`, one h1, main landmark, image alt text, labelled buttons, and zero console errors. Screenshots: `.factory/evidence/polish-1/live/screenshot-desktop.png` and `.factory/evidence/polish-1/live/screenshot-mobile.png`.
- Cold live Playwright recheck passed on a fresh mobile context: first-screen action, `/demo` banner/reset/start-real isolation, all five route metadata records, `GET /missing-stop` HTTP 404, zero serious/critical axe WCAG A/AA findings, zero console errors, and zero off-origin requests.
- `npx @axe-core/cli` was attempted against local `/demo`, but its Selenium launcher could not find Chrome in this container. The installed Playwright Chromium axe integration is the authoritative run; it passed locally in the full suite and live in the cold recheck.
