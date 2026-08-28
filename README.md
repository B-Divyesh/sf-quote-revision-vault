# Quote Revision Vault

Quote Revision Vault is an offline-first quote editor for solo service providers. It keeps each saved revision and compares line-item changes before billing.

Quotes stay in IndexedDB until you export a vault file or copy a review link. The app works offline after the first visit. The free tier creates one quote with revision history. A $29 one-time Studio Pass permits more than one quote.

Try the isolated sample at `/demo`. It uses a separate IndexedDB database and never copies changes into the real vault.

## Run and verify

Requirements: Node.js 22 and npm.

```sh
npm ci
npm test
npm run build
npm run preview
```

The exact production build command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

Playwright runs the product and claim tests in desktop Chromium and a 390px mobile viewport. Each claim and its verification command is listed in `.factory/claims.json`.

## Main workflow

1. Open `/vault` and create a quote.
2. Add the client, line items, scope, and revision reason.
3. Save a revision, then compare any two revisions.
4. Export the saved revision as PDF or create a dated review link.
5. Export a JSON vault file for backup or device transfer.

The customer can return an acknowledgment code. This records review only and is not a legal signature. The owner can block a link on every device. Every link checks a same-origin status registry before showing the quote.

## Privacy and payment

There are no analytics, ads, remote fonts, or runtime CDNs. The review-link registry stores only a random ID, expiry, secret hash, and revocation time. It never receives quote contents. License verification sends only the pasted license token to Sociobot. Checkout uses the Sociobot billing API; no payment provider is embedded here.

See `/privacy` and `/terms` in the app. The code is MIT licensed.
