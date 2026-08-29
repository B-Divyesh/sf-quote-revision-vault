# Quote Revision Vault

Quote Revision Vault is a quote editor for solo service providers. It works without an internet connection after the first visit. Save every quote version, compare line-item changes, export a PDF, and send a customer review link.

Quotes stay in this browser until you export a backup file or copy a review link. The free vault creates one quote with its revision history.

Try the isolated sample at `/demo` or `/?demo=1`. It opens a separate sample workspace. Demo links stay local and never use the live review-link service.

## Run and verify

Requirements: Node.js 22 and npm.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

The production build command is `npm run build`. It creates `dist/`, with `dist/index.html` at its root.

## Main workflow

1. Open `/vault` and create a quote.
2. Add the client, line items, scope, and revision reason.
3. Save a revision, then compare any two revisions.
4. Export a saved revision as a PDF or create a dated review link.
5. Export a JSON vault file for backup or device transfer.

A customer can return an acknowledgment code. It records review, not a legal signature. The owner can block a real review link on every device. Before showing a quote, the app checks whether that link is active.

## Privacy and licenses

The app does not load analytics, ads, remote fonts, tracking scripts, or automatic cloud sync. It does not create customer profiles or track customer activity. The review-link service receives no quote contents. The service stores a random link ID and expiry date. It stores no quote or customer details.

License verification sends only a pasted Studio Pass token to Sociobot. People with a verified Studio Pass can create more than one quote. The app offers no payment form.

See `/privacy` and `/terms` in the app. The code is MIT licensed.

## Deployment details

The static site deploys from `dist/`. The `api/` function keeps review-link status and rate-limit counts. To deploy it, set `QRV_STORAGE` to an Azure Storage connection string and create the `QuoteReviewLinks` and `QuoteReviewRate` tables.
