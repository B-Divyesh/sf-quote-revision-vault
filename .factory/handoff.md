# Quote Revision Vault handoff — independent verification

**FAIL — do not release candidate `1d65c423eaeb227e2981c666b6680b4048babd36`.**

Verified 2026-08-28 against https://quote-revision-vault.sociobot.in. The deployed entry CSS and JS SHA-256 values exactly match a fresh build of the candidate, so this is not a deployment-only mismatch.

All eight declared demo claim commands, the 22-test Playwright suite, `npm ci`, and `npm run build` passed. Live first-read, offline reload, local-only editing requests, axe serious/critical scan, CSP/security headers, license invalid-token handling, and API rate limiting passed. The billing verify endpoint started returning 429 after 31 successful responses in a 100-request burst; the observed response had `Retry-After: 1`.

Release blockers:

- Review-link revocation is local to the sender browser. A link blocked by its owner remained readable and acknowledgeable in a fresh recipient browser, violating the brief's revocable-token constraint.
- A negative rate (`-5`) was saved as Revision 4 on the live demo and appeared as `1 × -$5.00`, creating the wrong-billing record this product must prevent.
- The unlimited-$29 marketing promise has no claim test that proves it; the existing test creates only two quotes.

Additional defects: multiple 32–40 px interactive targets at 390 px, a 7 px horizontal overflow, short revalidating caching (`max-age=30`) for hashed assets instead of immutable caching, and parser-jargon on malformed vault import.

See [.factory/verification.md](verification.md) for commands, complete evidence, passed checks, and required remediation. Re-run `npm ci`, every command in `.factory/claims.json`, `npm test`, `npm run build`, and the live PWA/mobile/rate-limit checks after repairs.
