# Demo sandbox

- URL: `https://quote-revision-vault.sociobot.in/demo` or `https://quote-revision-vault.sociobot.in/?demo=1`; locally `http://localhost:5173/demo`.
- Sample: Harbour Street Bakery brand refresh with three saved revisions, changed quantities, one removed line, scope notes, and totals.
- Storage: the demo uses its own browser database, `qrv-demo-v1`. Real records use `qrv-real-v1` and are never read in demo mode.
- Reset: use **Reset demo** in the persistent banner. This deletes and reseeds only `qrv-demo-v1`.
- Leave: use **Open my real vault**. Demo records are not copied.
- Offline: load the demo once, then disable the network and reload `/demo`.
- Review links: demo review links are self-contained samples. They never call the live registry; blocking changes only the demo workspace. Real-vault review links keep quote data in the URL fragment and use the registry only for status metadata.
