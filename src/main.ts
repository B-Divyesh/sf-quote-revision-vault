import './style.css';
import { emptyQuote, sampleQuote } from './sample';
import { exportVault, importVault, listQuotes, removeQuote, resetDemo, saveQuote, setDemoStorage } from './storage';
import type { Acknowledgement, LineItem, Quote, QuoteSnapshot, Revision, SharePacket } from './types';
import { captureLicense, checkoutUrl, hasLicense, hasStoredLicense, storeLicense, verifyLicense } from './license';

const app = document.querySelector<HTMLDivElement>('#app')!;
let quotes: Quote[] = [];
let activeId = '';
let compareFrom = '';
let compareTo = '';
let isDemo = false;
let dialogOpener: HTMLElement | null = null;

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
const money = (value: number, currency = 'USD') => {
  try { return new Intl.NumberFormat('en', { style: 'currency', currency }).format(value); }
  catch { return `${currency} ${value.toFixed(2)}`; }
};
const total = (snapshot: QuoteSnapshot) => snapshot.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
const dateText = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

function encode(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode<T>(value: string): T {
  const base = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base.padEnd(Math.ceil(base.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

function navLink(path: string, label: string) {
  const current = location.pathname === path || (path === '/demo' && isDemo);
  return `<a href="${path}"${current ? ' aria-current="page"' : ''}>${label}</a>`;
}

function header() {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Quote Revision Vault home">
        <svg aria-hidden="true" viewBox="0 0 32 32"><rect x="3" y="2" width="26" height="28" fill="none" stroke="#C08A27" stroke-width="2"/><path d="M10 2v28M22 2v28M7 11h18M7 21h18" stroke="#F4E7CB" stroke-width="2"/><circle cx="10" cy="11" r="2.5" fill="#C08A27"/><circle cx="22" cy="21" r="2.5" fill="#C08A27"/></svg>
        <span>Quote Revision Vault</span>
      </a>
      <nav class="nav" aria-label="Main navigation">${navLink('/demo','Demo')}${navLink('/vault','Vault')}${navLink('/privacy','Privacy')}</nav>
    </header>
    ${isDemo ? `<aside class="demo-banner" aria-label="Demo mode"><span>Demo — sample data, nothing is saved</span><button id="reset-demo" type="button">Reset demo</button><a href="/vault" id="start-real">Start for real</a></aside>` : ''}
    ${hasStoredLicense() && !hasLicense() ? `<aside class="license-banner" role="status">The saved license is no longer active. <a href="${checkoutUrl}">Buy a Studio Pass at Sociobot checkout</a>.</aside>` : ''}
    <div class="route-announcer" aria-live="polite" id="route-announcer"></div>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-inner"><div><p>Keep the quote you sent and the change you made.</p><p class="provenance">Original poster art generated for this product. Version 1.0.0 · Build 2026-08-28</p></div><nav class="footer-links" aria-label="Footer">${navLink('/privacy','Privacy')}${navLink('/terms','Terms')}<a href="https://hello-factory.sociobot.in">Built by Param Factory (external)</a></nav></div></footer>`;
}

function page(content: string) {
  app.innerHTML = header() + content + footer();
  bindGlobal();
}

function setMeta(title: string, description: string) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
}

function landing() {
  setMeta('Quote Revision Vault — Track every quote change', 'Revise a client quote without losing the price, scope, or version you sent before.');
  page(`<main id="main">
    <section class="hero" aria-labelledby="landing-title">
      <div class="hero-copy">
        <p class="eyebrow">A clear route through every revision</p>
        <h1 id="landing-title" tabindex="-1">Revise quotes without losing the past</h1>
        <p class="hero-deck">For solo service providers who need to prove what changed before billing.</p>
        <div class="hero-actions"><a class="button" href="/demo">Try it with sample data</a><span class="action-note">See three saved revisions and their price changes.</span></div>
        <ul class="facts"><li>Quote data stays here until you share it</li><li>Works offline after your first visit</li><li>Free for one quote · $29 once for more</li></ul>
      </div>
      <div class="hero-art">
        <picture><source media="(max-width: 600px)" type="image/avif" srcset="/assets/revision-route-480.avif"><source media="(max-width: 600px)" type="image/webp" srcset="/assets/revision-route-480.webp"><source type="image/avif" srcset="/assets/revision-route.avif"><source type="image/webp" srcset="/assets/revision-route.webp"><img src="/assets/revision-route.jpg" width="760" height="1140" fetchpriority="high" decoding="async" alt="An art-deco route carries quote pages through a brass archive gate."></picture>
      </div>
    </section>
    <section class="section dark"><div class="shell route-preview">
      <div><p class="eyebrow">Live revision preview</p><h2>See the exact change</h2><ol class="route-track"><li><strong>Revision 1</strong><span>Initial quote · $4,510</span></li><li><strong>Revision 2</strong><span>More packaging · $5,810</span></li><li><strong>Revision 3</strong><span>Sign moved out · $4,290</span></li></ol></div>
      <div class="diff-board" aria-label="Sample change comparison"><div class="diff-row"><strong>Line item</strong><span>Before</span><span>After</span></div><div class="diff-row"><strong>Packaging templates</strong><span class="before">4 × $420</span><span class="after">2 × $420</span></div><div class="diff-row"><strong>Storefront sign</strong><span class="before">$680</span><span class="after">Removed</span></div><div class="diff-row"><strong>Quote total</strong><span class="before">$5,810</span><span class="after">$4,290</span></div></div>
    </div></section>
    <section class="section"><div class="shell"><p class="eyebrow">How it works</p><h2>Save. Compare. Send.</h2><div class="steps"><div class="step"><h3>Save each revision</h3><p>Name the reason for every price or scope change.</p></div><div class="step"><h3>Compare any two</h3><p>Read line-item changes and totals in one view.</p></div><div class="step"><h3>Send the receipt</h3><p>Export a PDF or copy a dated review link.</p></div></div></div></section>
    <section class="section dark"><div class="shell boundaries"><div><p class="eyebrow">Local by default</p><h2>Your records stay close</h2><p class="measure">Quotes and revisions stay in this browser. Export a vault file for your own backup.</p></div><div><p class="eyebrow">Clear boundaries</p><h2>This is not bookkeeping</h2><ul><li>No payments or invoices.</li><li>No legal e-signatures.</li><li>No customer tracking.</li><li>No cloud account or automatic sync.</li></ul></div></div></section>
    <section class="section"><div class="shell"><div class="paid-ticket"><div><p class="eyebrow">One-time Studio Pass</p><h2>Create more than one quote</h2><p>Pay $29 once to create unlimited quotes. One quote, every revision, PDF export, and backups stay free.</p></div><div><p class="price">$29 once</p><a class="button" href="${checkoutUrl}">Buy at Sociobot checkout</a><p><button type="button" class="button ghost small" id="restore-license">Paste a license</button></p></div></div></div></section>
  </main>`);
  bindLicense();
}

async function loadVault() {
  try {
    quotes = await listQuotes();
    if (isDemo && quotes.length === 0) {
      const seeded = sampleQuote();
      await saveQuote(seeded);
      quotes = [seeded];
    }
    if (!activeId || !quotes.some((quote) => quote.id === activeId)) activeId = quotes[0]?.id || '';
    renderVault();
  } catch {
    setMeta('Vault unavailable — Quote Revision Vault', 'Open your local quote revision history.');
    page(`<main id="main" class="page"><div class="shell"><h1 tabindex="-1">Your vault could not open</h1><p>Browser storage is blocked or unavailable. Allow site storage, then reload this page.</p><button class="button" type="button" onclick="location.reload()">Reload the vault</button></div></main>`);
  }
}

function quoteSnapshot(quote: Quote): QuoteSnapshot {
  return structuredClone({ title: quote.title, client: quote.client, business: quote.business, currency: quote.currency, validUntil: quote.validUntil, items: quote.items, notes: quote.notes });
}

function renderVault() {
  setMeta(`${isDemo ? 'Demo' : 'Vault'} — Quote Revision Vault`, isDemo ? 'Try a sample quote with three saved revisions.' : 'Edit quotes and compare every saved revision.');
  const quote = quotes.find((item) => item.id === activeId);
  page(`<main id="main" class="page"><div class="shell">
    <div class="vault-head"><div><p class="eyebrow">${isDemo ? 'Sample workspace' : 'Local workspace'}</p><h1 tabindex="-1">Keep every quote revision</h1></div><span class="offline-pill">Offline — changes still save</span></div>
    <div class="vault-layout">
      <aside class="quote-rail" aria-label="Saved quotes"><h2>Quotes</h2>
        ${quotes.length ? `<ul class="quote-list">${quotes.map((item) => `<li><button type="button" data-open-quote="${item.id}" aria-current="${item.id === activeId}"><strong>${escapeHtml(item.title || 'Untitled quote')}</strong><small>${item.revisions.length} revision${item.revisions.length === 1 ? '' : 's'}</small></button></li>`).join('')}</ul>` : `<p>No quotes yet. Create one to start its revision history.</p>`}
        <div class="rail-actions"><button class="button secondary small" id="new-quote" type="button">Create a quote</button><button class="button ghost small" id="backup-vault" type="button">Export vault file</button><label class="button ghost small" for="import-vault">Import vault file</label><input id="import-vault" type="file" accept="application/json" hidden></div>
      </aside>
      <section class="editor" aria-label="Quote editor">${quote ? editorHtml(quote) : emptyVaultHtml()}</section>
    </div>
  </div></main>`);
  bindVault(quote);
}

function emptyVaultHtml() {
  return `<div class="empty"><h2>Your first revision starts here</h2><p>Add a quote, then save the first version you send.</p><button class="button" id="empty-new" type="button">Create a quote</button></div>`;
}

function itemRow(item: LineItem, index: number, currency: string) {
  return `<div class="item-row" data-item-id="${item.id}">
    <div class="field"><label for="desc-${index}">Description</label><input id="desc-${index}" data-field="description" value="${escapeHtml(item.description)}"></div>
    <div class="field"><label for="qty-${index}">Quantity</label><input id="qty-${index}" data-field="quantity" type="number" min="0" step="0.01" value="${item.quantity}"></div>
    <div class="field"><label for="rate-${index}">Rate</label><input id="rate-${index}" data-field="rate" type="number" min="0" step="0.01" value="${item.rate}"></div>
    <output class="amount" aria-label="Line amount">${money(item.quantity * item.rate, currency)}</output>
    <button class="icon-button" type="button" data-remove-item="${item.id}" aria-label="Remove ${escapeHtml(item.description || `item ${index + 1}`)}">×</button>
  </div>`;
}

function editorHtml(quote: Quote) {
  const latest = quote.revisions.at(-1);
  const currentFrom = compareFrom && quote.revisions.some((revision) => revision.id === compareFrom) ? compareFrom : quote.revisions.at(-2)?.id || latest?.id || '';
  const currentTo = compareTo && quote.revisions.some((revision) => revision.id === compareTo) ? compareTo : latest?.id || '';
  compareFrom = currentFrom; compareTo = currentTo;
  return `<div class="editor-toolbar"><h2>Edit current draft</h2><div class="toolbar-buttons">${latest ? `<button type="button" class="button secondary small" id="export-pdf">Export revision ${latest.number} PDF</button>` : ''}<button type="button" class="button ghost small danger" id="delete-quote">Delete quote</button></div></div>
    <div class="form-grid">
      <div class="field full"><label for="quote-title">Quote title</label><input id="quote-title" data-quote-field="title" value="${escapeHtml(quote.title)}" required></div>
      <div class="field"><label for="client">Client</label><input id="client" data-quote-field="client" value="${escapeHtml(quote.client)}" required></div>
      <div class="field"><label for="business">Your business</label><input id="business" data-quote-field="business" value="${escapeHtml(quote.business)}"></div>
      <div class="field"><label for="valid-until">Valid until</label><input id="valid-until" data-quote-field="validUntil" type="date" value="${escapeHtml(quote.validUntil)}"></div>
      <div class="field"><label for="currency">Currency</label><select id="currency" data-quote-field="currency">${['USD','EUR','GBP','INR','CAD','AUD'].map((currency) => `<option${quote.currency === currency ? ' selected' : ''}>${currency}</option>`).join('')}</select></div>
    </div>
    <section class="items" aria-labelledby="items-title"><div class="items-head"><h3 id="items-title">Line items</h3><button type="button" id="add-item" class="button secondary small">Add line item</button></div><div id="item-rows">${quote.items.map((item,index) => itemRow(item,index,quote.currency)).join('')}</div><p class="total">Draft total: <output id="draft-total">${money(total(quote), quote.currency)}</output></p></section>
    <div class="field"><label for="notes">Scope notes</label><textarea id="notes" data-quote-field="notes">${escapeHtml(quote.notes)}</textarea></div>
    <div class="save-panel"><div class="field"><label for="revision-reason">What changed in this revision?</label><input id="revision-reason" maxlength="120" value="${quote.revisions.length ? '' : 'Initial quote'}" placeholder="Example: Added two packaging sizes"></div><button class="button" id="save-revision" type="button">Save new revision</button></div>
    <p class="status" id="vault-status" aria-live="polite"></p>
    ${quote.revisions.length ? historyHtml(quote, currentFrom, currentTo) : `<section class="history"><h2>No saved revisions</h2><p>Finish the quote, name the change, and save its first revision.</p></section>`}`;
}

function historyHtml(quote: Quote, fromId: string, toId: string) {
  return `<section class="history" aria-labelledby="history-title"><p class="eyebrow">Immutable history</p><h2 id="history-title">Revision route</h2><div class="history-grid"><ol class="revision-list">${quote.revisions.map((revision) => `<li><button type="button" data-revision="${revision.id}" aria-pressed="${revision.id === toId}"><strong>Revision ${revision.number}</strong><small>${escapeHtml(revision.reason)}</small><small>${dateText(revision.createdAt)}</small></button></li>`).join('')}</ol><div class="compare"><div class="compare-controls"><div class="field"><label for="compare-from">Compare from</label><select id="compare-from">${revisionOptions(quote,fromId)}</select></div><div class="field"><label for="compare-to">Compare to</label><select id="compare-to">${revisionOptions(quote,toId)}</select></div></div><div id="comparison">${comparisonHtml(quote,fromId,toId)}</div><button class="button secondary small" id="restore-revision" type="button">Restore revision ${quote.revisions.find(r => r.id === toId)?.number} as draft</button></div></div>${shareHtml(quote,toId)}</section>`;
}

function revisionOptions(quote: Quote, selected: string) {
  return quote.revisions.map((revision) => `<option value="${revision.id}"${revision.id === selected ? ' selected' : ''}>Revision ${revision.number} — ${escapeHtml(revision.reason)}</option>`).join('');
}

function comparisonHtml(quote: Quote, fromId: string, toId: string) {
  const before = quote.revisions.find((revision) => revision.id === fromId)!;
  const after = quote.revisions.find((revision) => revision.id === toId)!;
  if (!before || !after) return '<p>Choose two revisions to compare.</p>';
  const ids = [...new Set([...before.snapshot.items.map(i => i.id), ...after.snapshot.items.map(i => i.id)])];
  const rows = ids.map((id) => {
    const a = before.snapshot.items.find(i => i.id === id);
    const b = after.snapshot.items.find(i => i.id === id);
    const changed = !a || !b || a.description !== b.description || a.quantity !== b.quantity || a.rate !== b.rate;
    return `<tr><td data-label="Item">${escapeHtml(b?.description || a?.description || 'Item')} ${changed ? '<span class="change-tag">Changed</span>' : ''}</td><td data-label="Before">${a ? `${a.quantity} × ${money(a.rate,before.snapshot.currency)} = ${money(a.quantity*a.rate,before.snapshot.currency)}` : 'Not included'}</td><td data-label="After">${b ? `${b.quantity} × ${money(b.rate,after.snapshot.currency)} = ${money(b.quantity*b.rate,after.snapshot.currency)}` : 'Removed'}</td></tr>`;
  }).join('');
  const noteChanged = before.snapshot.notes !== after.snapshot.notes;
  return `<table class="comparison-table"><thead><tr><th>Item</th><th>Before · Revision ${before.number}</th><th>After · Revision ${after.number}</th></tr></thead><tbody>${rows}<tr><td data-label="Item"><strong>Total</strong></td><td data-label="Before">${money(total(before.snapshot),before.snapshot.currency)}</td><td data-label="After">${money(total(after.snapshot),after.snapshot.currency)}</td></tr>${noteChanged ? `<tr><td data-label="Item">Scope notes <span class="change-tag">Changed</span></td><td data-label="Before">${escapeHtml(before.snapshot.notes)}</td><td data-label="After">${escapeHtml(after.snapshot.notes)}</td></tr>` : ''}</tbody></table>`;
}

function shareHtml(quote: Quote, revisionId: string) {
  const activeShares = quote.shares.slice().reverse();
  return `<section class="share-panel" aria-labelledby="share-title"><h3 id="share-title">Customer review receipt</h3><p>Copy a self-contained link with this saved revision. The link expires on the date you choose.</p><p class="notice">A customer can note their review, but this is not a legal signature. Revoking a link blocks it only in this browser.</p><div class="share-grid"><div class="field"><label for="share-days">Link expires after</label><select id="share-days"><option value="7">7 days</option><option value="14" selected>14 days</option><option value="30">30 days</option></select></div><button class="button small" type="button" id="create-share" data-revision-id="${revisionId}">Create review link</button></div><div id="share-output"></div>${activeShares.length ? `<h3>Created links</h3><ul class="share-list">${activeShares.map((share) => `<li><span><strong>${share.revokedAt ? 'Revoked here' : 'Active'}</strong><br><small>Expires ${new Date(share.expiresAt).toLocaleDateString()}</small></span>${share.revokedAt ? '' : `<button class="button ghost small" type="button" data-revoke-share="${share.id}">Block link here</button>`}</li>`).join('')}</ul>` : ''}<button class="button ghost small" id="import-receipt" type="button">Import acknowledgment code</button>${quote.acknowledgements.length ? `<p>${quote.acknowledgements.length} acknowledgment${quote.acknowledgements.length === 1 ? '' : 's'} imported.</p>` : ''}</section>`;
}

function status(message: string, error = false) {
  const output = document.querySelector<HTMLElement>('#vault-status');
  if (output) { output.textContent = message; output.classList.toggle('error', error); }
}

function bindVault(quote?: Quote) {
  document.querySelectorAll<HTMLElement>('[data-open-quote]').forEach((button) => button.addEventListener('click', () => { activeId = button.dataset.openQuote!; compareFrom = ''; compareTo = ''; renderVault(); }));
  const create = async () => {
    if (!hasLicense() && quotes.length >= 1 && !isDemo) { showLicenseDialog(); return; }
    const next = emptyQuote(); await saveQuote(next); quotes.unshift(next); activeId = next.id; renderVault();
  };
  document.querySelector('#new-quote')?.addEventListener('click', create);
  document.querySelector('#empty-new')?.addEventListener('click', create);
  document.querySelector('#backup-vault')?.addEventListener('click', async () => downloadText(await exportVault(), 'quote-revision-vault-backup.json', 'application/json'));
  document.querySelector<HTMLInputElement>('#import-vault')?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    try { const count = await importVault(await file.text()); status(`Imported ${count} quote${count === 1 ? '' : 's'}.`); await loadVault(); }
    catch (error) { status(`${error instanceof Error ? error.message : 'The file could not be imported'} Choose an exported vault JSON file.`, true); }
  });
  if (!quote) return;
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-quote-field]').forEach((input) => input.addEventListener('input', () => {
    const key = input.dataset.quoteField as keyof QuoteSnapshot;
    (quote as unknown as Record<string,string>)[key] = input.value;
    quote.updatedAt = new Date().toISOString();
    void saveQuote(quote);
    updateTotals(quote);
  }));
  document.querySelectorAll<HTMLInputElement>('.item-row input').forEach((input) => input.addEventListener('input', () => {
    const row = input.closest<HTMLElement>('.item-row')!;
    const item = quote.items.find((entry) => entry.id === row.dataset.itemId)!;
    const key = input.dataset.field;
    if (key === 'description') item.description = input.value;
    if (key === 'quantity') item.quantity = Number(input.value);
    if (key === 'rate') item.rate = Number(input.value);
    quote.updatedAt = new Date().toISOString(); void saveQuote(quote); updateTotals(quote);
  }));
  document.querySelector('#add-item')?.addEventListener('click', () => { quote.items.push({ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }); renderVault(); });
  document.querySelectorAll<HTMLElement>('[data-remove-item]').forEach((button) => button.addEventListener('click', () => { if (quote.items.length === 1) { status('A quote needs at least one line item. Edit this item instead.', true); return; } quote.items = quote.items.filter((item) => item.id !== button.dataset.removeItem); void saveQuote(quote); renderVault(); }));
  document.querySelector('#save-revision')?.addEventListener('click', () => void saveRevision(quote));
  document.querySelector('#delete-quote')?.addEventListener('click', async () => { if (confirm(`Delete “${quote.title || 'Untitled quote'}” and all its revisions? This cannot be undone.`)) { await removeQuote(quote.id); quotes = quotes.filter((item) => item.id !== quote.id); activeId = quotes[0]?.id || ''; renderVault(); } });
  document.querySelector('#export-pdf')?.addEventListener('click', async () => { const revision = quote.revisions.at(-1); if (!revision) return; status('Preparing the PDF…'); try { const { exportRevisionPdf } = await import('./pdf'); await exportRevisionPdf(quote, revision); status(`Downloaded revision ${revision.number} PDF.`); } catch { status('The PDF could not be created. Reload the page and try again.', true); } });
  bindHistory(quote);
}

function updateTotals(quote: Quote) {
  const output = document.querySelector<HTMLOutputElement>('#draft-total'); if (output) output.value = money(total(quote), quote.currency);
  document.querySelectorAll<HTMLElement>('.item-row').forEach((row) => { const item = quote.items.find((entry) => entry.id === row.dataset.itemId); const out = row.querySelector<HTMLOutputElement>('.amount'); if (item && out) out.value = money(item.quantity * item.rate, quote.currency); });
}

async function saveRevision(quote: Quote) {
  const reason = document.querySelector<HTMLInputElement>('#revision-reason')?.value.trim() || '';
  if (!quote.title.trim() || !quote.client.trim()) { status('The revision was not saved. Add a quote title and client.', true); return; }
  if (!quote.items.length || quote.items.some((item) => !item.description.trim())) { status('The revision was not saved. Name every line item.', true); return; }
  if (!reason) { status('The revision was not saved. Say what changed.', true); document.querySelector<HTMLInputElement>('#revision-reason')?.focus(); return; }
  const revision: Revision = { id: crypto.randomUUID(), number: quote.revisions.length + 1, createdAt: new Date().toISOString(), reason, snapshot: quoteSnapshot(quote) };
  quote.revisions.push(revision); quote.updatedAt = revision.createdAt; await saveQuote(quote); compareTo = revision.id; compareFrom = quote.revisions.at(-2)?.id || revision.id; renderVault(); status(`Revision ${revision.number} saved. The earlier revisions were not changed.`);
}

function bindHistory(quote: Quote) {
  const rerenderComparison = () => { const area = document.querySelector('#comparison'); if (area) area.innerHTML = comparisonHtml(quote,compareFrom,compareTo); const restore = document.querySelector<HTMLButtonElement>('#restore-revision'); const rev = quote.revisions.find(r=>r.id===compareTo); if (restore && rev) restore.textContent = `Restore revision ${rev.number} as draft`; };
  document.querySelector<HTMLSelectElement>('#compare-from')?.addEventListener('change', (event) => { compareFrom = (event.target as HTMLSelectElement).value; rerenderComparison(); });
  document.querySelector<HTMLSelectElement>('#compare-to')?.addEventListener('change', (event) => { compareTo = (event.target as HTMLSelectElement).value; rerenderComparison(); });
  document.querySelectorAll<HTMLElement>('[data-revision]').forEach((button) => button.addEventListener('click', () => { compareTo = button.dataset.revision!; document.querySelector<HTMLSelectElement>('#compare-to')!.value = compareTo; document.querySelectorAll('[data-revision]').forEach((node) => node.setAttribute('aria-pressed',String(node === button))); rerenderComparison(); }));
  document.querySelector('#restore-revision')?.addEventListener('click', () => { const revision = quote.revisions.find(r => r.id === compareTo); if (!revision) return; Object.assign(quote, structuredClone(revision.snapshot)); quote.updatedAt = new Date().toISOString(); void saveQuote(quote); renderVault(); status(`Revision ${revision.number} restored as a draft. Save it to create a new revision.`); });
  document.querySelector('#create-share')?.addEventListener('click', () => void createShare(quote));
  document.querySelectorAll<HTMLElement>('[data-revoke-share]').forEach((button) => button.addEventListener('click', async () => { const share = quote.shares.find(s => s.id === button.dataset.revokeShare); if (!share) return; share.revokedAt = new Date().toISOString(); localStorage.setItem(`qrv-revoked:${share.id}`,'1'); await saveQuote(quote); renderVault(); status('The review link is now blocked in this browser.'); }));
  document.querySelector('#import-receipt')?.addEventListener('click', () => showReceiptDialog(quote));
}

async function createShare(quote: Quote) {
  const revisionId = document.querySelector<HTMLElement>('#create-share')?.dataset.revisionId || '';
  const revision = quote.revisions.find(r => r.id === revisionId); if (!revision) return;
  const days = Number(document.querySelector<HTMLSelectElement>('#share-days')?.value || 14);
  const shareId = crypto.randomUUID(); const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
  quote.shares.push({ id: shareId, revisionId, createdAt: new Date().toISOString(), expiresAt }); await saveQuote(quote);
  const packet: SharePacket = { version: 1, shareId, quoteId: quote.id, revisionId, revisionNumber: revision.number, expiresAt, snapshot: revision.snapshot };
  const url = `${location.origin}/ack#packet=${encode(packet)}`;
  const output = document.querySelector('#share-output')!; output.innerHTML = `<p class="share-output"><strong>Review link created.</strong><br><span>${escapeHtml(url)}</span></p><button class="button secondary small" id="copy-share" type="button">Copy review link</button>`;
  document.querySelector('#copy-share')?.addEventListener('click', async () => { await navigator.clipboard.writeText(url); status('Review link copied.'); });
}

function bindGlobal() {
  document.querySelector('#reset-demo')?.addEventListener('click', async () => { await resetDemo(); location.href = '/demo'; });
  document.querySelector('#start-real')?.addEventListener('click', () => { location.href = '/vault'; });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((link) => link.addEventListener('click', (event) => { if (link.target || link.hasAttribute('download')) return; event.preventDefault(); navigate(link.getAttribute('href')!); }));
}

function bindLicense() { document.querySelector('#restore-license')?.addEventListener('click', showLicenseDialog); }

function showLicenseDialog() {
  showDialog(`<h2 id="dialog-title">Use your Studio Pass</h2><p>Paste the license from your purchase email.</p><div class="field"><label for="license-token">License</label><input id="license-token" autocomplete="off"></div><p id="dialog-status" class="status" aria-live="polite"></p><div class="dialog-actions"><button class="button ghost" data-close-dialog type="button">Cancel</button><button class="button" id="check-license" type="button">Verify license</button></div>`);
  document.querySelector('#check-license')?.addEventListener('click', async () => { const token = document.querySelector<HTMLInputElement>('#license-token')?.value.trim(); const out = document.querySelector('#dialog-status')!; if (!token) { out.textContent = 'Paste a license first.'; return; } storeLicense(token); out.textContent = 'Checking the license…'; const valid = await verifyLicense(true); if (valid) { out.textContent = 'Studio Pass active. You can create more quotes.'; setTimeout(() => { closeDialog(); if (location.pathname === '/vault') renderVault(); }, 600); } else { out.textContent = 'This license is not active. Check the token and try again.'; } });
}

function showReceiptDialog(quote: Quote) {
  showDialog(`<h2 id="dialog-title">Import acknowledgment</h2><p>Paste the code your customer sent back.</p><div class="field"><label for="receipt-code">Acknowledgment code</label><textarea id="receipt-code"></textarea></div><p id="dialog-status" class="status" aria-live="polite"></p><div class="dialog-actions"><button class="button ghost" data-close-dialog type="button">Cancel</button><button class="button" id="save-receipt" type="button">Import code</button></div>`);
  document.querySelector('#save-receipt')?.addEventListener('click', async () => { try { const receipt = decode<Acknowledgement>(document.querySelector<HTMLTextAreaElement>('#receipt-code')!.value.trim()); if (receipt.quoteId !== quote.id || !receipt.shareId || !receipt.notedAt) throw new Error(); if (!quote.acknowledgements.some(a => a.shareId === receipt.shareId)) quote.acknowledgements.push(receipt); await saveQuote(quote); closeDialog(); renderVault(); status(`Imported ${receipt.name}'s acknowledgment.`); } catch { document.querySelector('#dialog-status')!.textContent = 'This code does not match the current quote. Ask the customer to copy it again.'; } });
}

function showDialog(content: string) {
  dialogOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const wrap = document.createElement('div');
  wrap.className = 'dialog-backdrop';
  wrap.innerHTML = `<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">${content}</section>`;
  document.body.append(wrap);
  wrap.querySelector<HTMLElement>('input,textarea,button')?.focus();
  wrap.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click',closeDialog));
  wrap.addEventListener('keydown',(event) => {
    if (event.key === 'Escape') { closeDialog(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...wrap.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}
function closeDialog() { document.querySelector('.dialog-backdrop')?.remove(); dialogOpener?.focus(); dialogOpener = null; }

function downloadText(text: string, name: string, type: string) { const url = URL.createObjectURL(new Blob([text], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

function legal(kind: 'privacy'|'terms') {
  if (kind === 'privacy') {
    setMeta('Privacy — Quote Revision Vault','How Quote Revision Vault stores local quote and license data.');
    page(`<main id="main" class="page"><article class="shell legal"><p class="eyebrow">Privacy</p><h1 tabindex="-1">Your quotes stay in your browser</h1><p>Quote Revision Vault stores quotes and revision history in IndexedDB on this device. Demo records use a separate database.</p><h2>Data you choose to send</h2><p>A review link contains one saved revision. Anyone with that link can read its contents until it expires.</p><p>License verification sends only your license token to the Sociobot billing API. We do not load analytics, ads, remote fonts, or tracking scripts.</p><h2>Delete or move your records</h2><p>Delete a quote inside the vault. Clear this site’s browser data to remove everything. Export a vault file before moving devices.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></article></main>`);
  } else {
    setMeta('Terms — Quote Revision Vault','Terms for using Quote Revision Vault and its review receipts.');
    page(`<main id="main" class="page"><article class="shell legal"><p class="eyebrow">Terms</p><h1 tabindex="-1">Use the vault as a record</h1><p>Quote Revision Vault helps you record quote changes. It does not provide bookkeeping, legal, tax, payment, or signature services.</p><h2>Review receipts</h2><p>A customer acknowledgment records that a person reviewed a revision. It is not a legally binding electronic signature.</p><h2>Your responsibility</h2><p>You control your local records and backups. Check every quote and PDF before sending or billing.</p><h2>Studio Pass</h2><p>The $29 Studio Pass is a one-time purchase to create unlimited quotes. Sociobot and Dodo act as merchant of record. A refund revokes the license.</p><h2>Warranty</h2><p>The software is provided as available without a promise that it fits every business process. Your legal rights under local law still apply.</p></article></main>`);
  }
}

function acknowledgment() {
  setMeta('Review a quote — Quote Revision Vault','Review one saved quote revision and copy an acknowledgment receipt.');
  const params = new URLSearchParams(location.hash.slice(1)); const raw = params.get('packet'); let packet: SharePacket | undefined;
  try { if (raw) packet = decode<SharePacket>(raw); } catch { packet = undefined; }
  if (!packet || packet.version !== 1) { page(`<main id="main" class="page"><div class="shell"><h1 tabindex="-1">This review link is incomplete</h1><p>The quote data is missing. Ask the sender to create and copy the link again.</p><a class="button" href="/">Return home</a></div></main>`); return; }
  const expired = Date.now() > new Date(packet.expiresAt).getTime(); const revoked = localStorage.getItem(`qrv-revoked:${packet.shareId}`) === '1'; const snapshot = packet.snapshot;
  page(`<main id="main" class="page"><div class="shell"><article class="ack-card"><p class="eyebrow">Revision review</p><h1 tabindex="-1">Review this saved quote</h1>${expired || revoked ? `<p class="notice"><strong>This link is ${revoked ? 'revoked' : 'expired'}.</strong> Ask the sender for a new review link.</p>` : ''}<h2>${escapeHtml(snapshot.title)}</h2><div class="ack-meta"><span><strong>Prepared for</strong>${escapeHtml(snapshot.client)}</span><span><strong>From</strong>${escapeHtml(snapshot.business || 'Not named')}</span><span><strong>Revision</strong>${packet.revisionNumber}</span></div><table class="ack-items"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>${snapshot.items.map(item => `<tr><td>${escapeHtml(item.description)}<br><small>${item.quantity} × ${money(item.rate,snapshot.currency)}</small></td><td>${money(item.quantity*item.rate,snapshot.currency)}</td></tr>`).join('')}</tbody></table><p class="ack-total">Total: ${money(total(snapshot),snapshot.currency)}</p><h2>Scope notes</h2><p>${escapeHtml(snapshot.notes || 'No notes.')}</p><p><strong>Valid until:</strong> ${escapeHtml(snapshot.validUntil || 'Not set')}<br><strong>Review link expires:</strong> ${new Date(packet.expiresAt).toLocaleDateString()}</p>${expired || revoked ? '' : `<section id="ack-form"><h2>Note your review</h2><p>This records that you saw this revision. It is not a legal signature.</p><div class="field"><label for="ack-name">Your name</label><input id="ack-name"></div><div class="field"><label for="ack-note">Optional note</label><textarea id="ack-note"></textarea></div><button class="button" id="acknowledge" type="button">Create acknowledgment code</button><div id="ack-output" aria-live="polite"></div></section>`}</article></div></main>`);
  document.querySelector('#acknowledge')?.addEventListener('click', async () => { const name = document.querySelector<HTMLInputElement>('#ack-name')!.value.trim(); const output = document.querySelector('#ack-output')!; if (!name) { output.innerHTML = '<p class="status error">Add your name before creating the code.</p>'; return; } const receipt: Acknowledgement = { shareId: packet!.shareId, revisionId: packet!.revisionId, quoteId: packet!.quoteId, name, notedAt: new Date().toISOString(), note: document.querySelector<HTMLTextAreaElement>('#ack-note')!.value.trim() }; const code = encode(receipt); output.innerHTML = `<p class="notice"><strong>Acknowledgment created.</strong> Send this code to the quote owner.</p><textarea id="receipt-result" aria-label="Acknowledgment code" readonly>${code}</textarea><button class="button secondary small" id="copy-receipt" type="button">Copy acknowledgment code</button>`; document.querySelector('#copy-receipt')?.addEventListener('click', async () => { await navigator.clipboard.writeText(code); (document.querySelector('#copy-receipt') as HTMLButtonElement).textContent = 'Code copied'; }); });
}

function notFound() {
  setMeta('Page not found — Quote Revision Vault','Return to Quote Revision Vault.');
  page(`<main id="main" class="page"><div class="shell"><p class="eyebrow">Route ended</p><h1 tabindex="-1">This stop is not on the route</h1><p>The page may have moved, or the address may be wrong.</p><a class="button" href="/">Return home</a></div></main>`);
}

async function route() {
  isDemo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1'; setDemoStorage(isDemo);
  if (location.pathname === '/' && !isDemo) landing();
  else if (location.pathname === '/demo' || location.pathname === '/vault' || isDemo) await loadVault();
  else if (location.pathname === '/privacy') legal('privacy');
  else if (location.pathname === '/terms') legal('terms');
  else if (location.pathname === '/ack') acknowledgment();
  else notFound();
  document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  const announcer = document.querySelector('#route-announcer'); if (announcer) announcer.textContent = document.title;
}

function navigate(path: string) { history.pushState({},'',path); window.scrollTo(0,0); void route(); }

captureLicense();
window.addEventListener('popstate', () => void route());
window.addEventListener('online', () => document.body.classList.remove('offline'));
window.addEventListener('offline', () => document.body.classList.add('offline'));
if (!navigator.onLine) document.body.classList.add('offline');
if ('serviceWorker' in navigator && !import.meta.env.DEV) navigator.serviceWorker.register('/sw.js').then((registration) => { registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { const toast = document.createElement('div'); toast.className = 'demo-banner'; toast.innerHTML = '<span>An app update is ready.</span><button type="button">Reload now</button>'; toast.querySelector('button')?.addEventListener('click',() => location.reload()); document.body.prepend(toast); } }); }); }).catch(() => undefined);
void route().then(async () => {
  if (hasStoredLicense() && !await verifyLicense()) await route();
});
