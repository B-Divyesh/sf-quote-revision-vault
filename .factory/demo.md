# Demo sandbox

- URL: `https://quote-revision-vault.sociobot.in/demo` locally `http://localhost:5173/demo`.
- Sample: Harbour Street Bakery brand refresh with three saved revisions, changed quantities, one removed line, scope notes, and totals.
- Storage: IndexedDB database `qrv-demo-v1`. Real records use `qrv-real-v1` and are never read in demo mode.
- Reset: use **Reset demo** in the persistent banner. This deletes and reseeds only `qrv-demo-v1`.
- Leave: use **Start for real**. Demo records are not copied.
- Offline: load the demo once, then disable the network and reload `/demo`.
