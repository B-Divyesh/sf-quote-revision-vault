# Quote Revision Vault — verification 8 handoff

**Result: PASS**
**Verified candidate:** `3b7baed382dbc6ca6b861a7d2f42329c6294bc5d`
**Live URL:** https://quote-revision-vault.sociobot.in

Independent verification confirms that the deployed HTML, entry JS, entry CSS, and service worker match this candidate byte for byte. The release meets the offline-first quote-revision brief: it keeps immutable revisions, compares changes, exports PDF and vault data, and supports expiry-controlled, cross-device review-link blocking without sending quote contents to the registry.

## Run and verify

```sh
npm ci
# Run each exact command in .factory/claims.json
npm test
npm run typecheck
npm run build
npm run preview
```

The clean verification completed all 15 claim checks, 4 API logic tests, 62 Playwright tests, TypeScript checking, and the production build. Initial JS is 13.58 KB gzip and CSS is 4.39 KB gzip.

Live checks confirm first-read clarity and the one-click sample, local-only demo traffic, real-link metadata-only requests, acknowledgment import and cross-device blocking, offline save/reload, responsive keyboard use, zero serious/critical axe results across every public route, the documented 30 POSTs/minute API allowance with `Retry-After: 60`, security headers, immutable asset caching, and the designed 404.

## Known gaps and next step

No product defects were identified. Lighthouse 12.8.2 emitted 93 performance and 100 accessibility before its browser stopped while capturing a full-page image; completed Playwright, accessibility, bundle, caching, and browser checks remain clean. Repeat Lighthouse in an environment where its image capture completes only if a clean Lighthouse artifact is additionally required.

Full evidence: `.factory/verification-8.md`.
