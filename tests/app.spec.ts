import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

async function createSavedRealQuote(page: import('@playwright/test').Page) {
  await page.goto('/vault');
  await page.locator('#empty-new').click();
  await page.locator('#quote-title').fill('Riverbend signage update');
  await page.locator('#client').fill('Avery Patel');
  await page.locator('#desc-0').fill('Site survey');
  await page.locator('#rate-0').fill('500');
  await page.locator('#revision-reason').fill('Initial quote');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  await expect(page.getByText('Revision 1', { exact: true })).toBeVisible();
}

test('landing page explains the job and has no serious accessibility errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Revise quotes without losing earlier prices or scope');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious','critical'].includes(violation.impact || ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('vault supports keyboard use, clear errors, and accessible landmarks', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.locator('#revision-reason').fill('');
  await page.getByRole('button', { name: 'Save new revision' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#vault-status')).toHaveText('The revision was not saved. Say what changed.');
  await expect(page.locator('#revision-reason')).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious','critical'].includes(violation.impact || ''))).toEqual([]);
});

test('every route sets its own canonical and social metadata', async ({ page }) => {
  const routes = [
    ['/', 'Quote Revision Vault — Revise quotes safely'],
    ['/demo', 'Demo — Quote Revision Vault'],
    ['/vault', 'Vault — Quote Revision Vault'],
    ['/privacy', 'Privacy — Quote Revision Vault'],
    ['/terms', 'Terms — Quote Revision Vault']
  ];
  for (const [path, title] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const expectedCanonical = `https://quote-revision-vault.sociobot.in${path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expectedCanonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expectedCanonical);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  }
});

test('unknown paths return a designed HTTP 404 with a home link', async ({ page, request }) => {
  const response = await request.get('/missing-stop');
  expect(response.status()).toBe(404);
  await page.goto('/missing-stop');
  await expect(page).toHaveTitle('Page not found — Quote Revision Vault');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
});

test('@claim:revision-history keeps saved revisions and shows their changes', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Revision 3', { exact: true })).toBeVisible();
  await page.locator('#rate-0').fill('900');
  await page.locator('#revision-reason').fill('Raised workshop rate');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  await expect(page.getByText('Revision 4', { exact: true })).toBeVisible();
  await expect(page.locator('#comparison')).toContainText('$850.00');
  await expect(page.locator('#comparison')).toContainText('$900.00');
  await page.locator('#compare-from').selectOption('rev-sample-1');
  await page.locator('#compare-to').selectOption('rev-sample-3');
  await expect(page.locator('#comparison')).toContainText('$4,510.00');
  await expect(page.locator('#comparison')).toContainText('$4,290.00');
});

test('@claim:pdf-export downloads the saved revision as a PDF', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export revision 3 PDF/ }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(download.suggestedFilename()).toMatch(/revision-3\.pdf$/);
  expect(path).toBeTruthy();
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).subarray(0, 4).toString()).toBe('%PDF');
});

test('@claim:vault-export downloads all local quote history as JSON', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export vault file' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let text = '';
  for await (const chunk of stream!) text += chunk.toString();
  const data = JSON.parse(text);
  expect(data.format).toBe('quote-revision-vault');
  expect(data.quotes[0].revisions).toHaveLength(3);
});

test('@claim:review-link creates an expiring review link and revokes it for fresh recipients', async ({ page, browser }) => {
  await createSavedRealQuote(page);
  await page.locator('#share-days').selectOption('7');
  await page.getByRole('button', { name: 'Create review link' }).click();
  const output = page.locator('#share-output');
  await expect(output).toContainText('/ack#packet=');
  const text = await output.locator('span').innerText();
  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  await recipientPage.goto(text);
  await expect(recipientPage.getByRole('heading', { level: 1 })).toHaveText('Review this saved quote');
  await expect(recipientPage.getByText('Riverbend signage update')).toBeVisible();
  await expect(recipientPage.getByText('Review link expires:', { exact: false })).toBeVisible();
  await recipientPage.locator('#ack-name').fill('Mara Chen');
  await recipientPage.getByRole('button', { name: 'Create acknowledgment code' }).click();
  const receipt = await recipientPage.locator('#receipt-result').inputValue();
  expect(receipt.length).toBeGreaterThan(40);
  const packetParam = new URL(text).hash.slice('#packet='.length);
  const packet = JSON.parse(Buffer.from(packetParam.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  const expiringId = crypto.randomUUID();
  const expiringAt = new Date(Date.now() + 100).toISOString();
  await page.request.post(`/api/review-links/${Math.floor(Date.now() / 60000)}/${expiringId}`, { data: { action: 'create', expiresAt: expiringAt, ownerKey: 'e'.repeat(43) } });
  packet.shareId = expiringId; packet.expiresAt = expiringAt;
  const expiringPacket = Buffer.from(JSON.stringify(packet)).toString('base64url');
  await page.waitForTimeout(150);
  await recipientPage.goto(`/ack#packet=${expiringPacket}`);
  await expect(recipientPage.getByRole('heading', { level: 1 })).toHaveText('This review link is expired');
  await expect(recipientPage.getByText('Harbour Street identity refresh')).toHaveCount(0);
  await page.getByRole('button', { name: 'Import acknowledgment code' }).click();
  await page.locator('#receipt-code').fill(receipt);
  await page.getByRole('button', { name: 'Import code' }).click();
  await expect(page.getByText('1 acknowledgment imported.')).toBeVisible();
  await page.getByRole('button', { name: 'Block review link' }).click();
  await expect(page.locator('#vault-status')).toHaveText('The review link is blocked on every device.');
  await recipientPage.goto(text);
  await expect(recipientPage.getByRole('heading', { level: 1 })).toHaveText('This review link is revoked');
  await expect(recipientPage.getByText('Harbour Street identity refresh')).toHaveCount(0);
  const freshRecipient = await browser.newContext();
  const freshPage = await freshRecipient.newPage();
  await freshPage.goto(text);
  await expect(freshPage.getByRole('heading', { level: 1 })).toHaveText('This review link is revoked');
  await expect(freshPage.getByText('Harbour Street identity refresh')).toHaveCount(0);
  await expect(freshPage.locator('#ack-form')).toHaveCount(0);
  await recipient.close();
  await freshRecipient.close();
});

test('real review links fail closed when their live status cannot be checked', async ({ page }) => {
  await createSavedRealQuote(page);
  await page.getByRole('button', { name: 'Create review link' }).click();
  const url = await page.locator('#share-output span').innerText();
  await page.route('**/api/review-links/**', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"offline"}' }));
  await page.goto(url);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This quote cannot be shown yet');
  await expect(page.getByText('Harbour Street identity refresh')).toHaveCount(0);
  await expect(page.locator('#ack-form')).toHaveCount(0);
});

test('@claim:demo-isolation keeps every sample action outside the real vault and live registry', async ({ page, browser }) => {
  const registryRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/review-links/')) registryRequests.push(request.url()); });
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();
  await page.locator('#quote-title').fill('Changed only in demo');
  await page.locator('#revision-reason').fill('Demo-only title change');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  await page.getByRole('button', { name: 'Create review link' }).click();
  const sampleLink = await page.locator('#share-output span').innerText();
  expect(sampleLink).toContain('/ack#packet=');
  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  recipientPage.on('request', (request) => { if (request.url().includes('/api/review-links/')) registryRequests.push(request.url()); });
  await recipientPage.goto(sampleLink);
  await expect(recipientPage.getByRole('heading', { level: 1 })).toHaveText('Review this saved quote');
  await recipientPage.locator('#ack-name').fill('Sample recipient');
  await recipientPage.getByRole('button', { name: 'Create acknowledgment code' }).click();
  const receipt = await recipientPage.locator('#receipt-result').inputValue();
  await page.getByRole('button', { name: 'Import acknowledgment code' }).click();
  await page.locator('#receipt-code').fill(receipt);
  await page.getByRole('button', { name: 'Import code' }).click();
  await page.getByRole('button', { name: 'Block review link' }).click();
  await expect(page.locator('#vault-status')).toHaveText('The sample review link is blocked in this demo workspace.');
  expect(registryRequests).toEqual([]);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#quote-title')).toHaveValue('Harbour Street identity refresh');
  await page.goto('/vault');
  await expect(page.getByRole('heading', { name: 'Your first revision starts here' })).toBeVisible();
  await expect(page.getByText('Changed only in demo')).toHaveCount(0);
  await recipient.close();
});

test('@claim:local-privacy sends no quote data to another origin', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/demo');
  await page.locator('#notes').fill('Private scope note');
  await page.locator('#revision-reason').fill('Changed note');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  expect(outside).toEqual([]);
});

test('@claim:no-tracking-sync loads no tracking or automatic cloud sync', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.locator('#notes').fill('Changed locally');
  await page.locator('#revision-reason').fill('Local-only change');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.some((url) => /analytics|tracking|doubleclick|fonts\.(googleapis|gstatic)/i.test(url))).toBe(false);
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
});

test('@claim:offline-reload saves and reloads a revision without a network after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByText('Revision 3', { exact: true })).toBeVisible();
  await page.waitForFunction(async () => {
    if (!navigator.serviceWorker?.controller) return false;
    const script = document.querySelector<HTMLScriptElement>('script[type="module"]')?.src;
    return Boolean(script && await caches.match(script));
  });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const nextWorker = registration?.installing || registration?.waiting;
    if (nextWorker && nextWorker.state !== 'activated') {
      await new Promise<void>((resolve) => {
        const check = () => { if (nextWorker.state === 'activated') resolve(); };
        nextWorker.addEventListener('statechange', check);
        check();
      });
    }
  });
  await context.setOffline(true);
  await page.locator('#rate-0').fill('901');
  await page.locator('#revision-reason').fill('Offline rate correction');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  await expect(page.getByText('Revision 4', { exact: true })).toBeVisible();
  await expect(page.locator('#comparison')).toContainText('$901.00');
  await page.reload();
  await expect(page.getByText('Revision 4', { exact: true })).toBeVisible();
  await expect(page.locator('#comparison')).toContainText('$901.00');
});

test('@claim:license-restore only a positive verification unlocks a second real quote', async ({ page, browser }) => {
  await page.route('https://api.sociobot.in/api/v1/products/quote-revision-vault/verify?license=valid-token', route => route.fulfill({ contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
  await page.goto('/vault');
  await page.locator('#empty-new').click();
  await page.locator('#new-quote').click();
  await page.locator('#license-token').fill('valid-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio Pass active. You can create more quotes.')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('#new-quote').click();
  await expect(page.locator('.quote-list li')).toHaveCount(2);

  for (const [token, response] of [['bad-token', '{"valid":false,"reason":"invalid"}'], ['offline-token', null]] as const) {
    const context = await browser.newContext();
    const candidate = await context.newPage();
    await candidate.route(`https://api.sociobot.in/api/v1/products/quote-revision-vault/verify?license=${token}`, route => response === null ? route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }) : route.fulfill({ contentType: 'application/json', body: response }));
    await candidate.goto('/vault');
    await candidate.locator('#empty-new').click();
    await candidate.locator('#new-quote').click();
    await candidate.locator('#license-token').fill(token);
    await candidate.getByRole('button', { name: 'Verify license' }).click();
    await expect(candidate.getByText('This license is not active or could not be checked. Keep the one-quote vault and try again when you are online.')).toBeVisible();
    await expect(candidate.locator('.quote-list li')).toHaveCount(1);
    await context.close();
  }
});

test('@claim:license-data sends only the pasted license token to Sociobot', async ({ page }) => {
  let requestUrl = '';
  let requestMethod = '';
  await page.route('https://api.sociobot.in/api/v1/products/quote-revision-vault/verify?license=*', route => { requestUrl = route.request().url(); requestMethod = route.request().method(); return route.fulfill({ contentType: 'application/json', body: '{"valid":false,"reason":"invalid"}' }); });
  await page.goto('/vault');
  await page.locator('#empty-new').click();
  await page.locator('#quote-title').fill('Private proposal 2026');
  await page.locator('#client').fill('Private customer');
  await page.locator('#new-quote').click();
  await page.locator('#license-token').fill('only-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  const request = new URL(requestUrl);
  expect(request.origin).toBe('https://api.sociobot.in');
  expect(request.pathname).toBe('/api/v1/products/quote-revision-vault/verify');
  expect(requestMethod).toBe('GET');
  expect(request.searchParams.get('license')).toBe('only-token');
  expect(request.searchParams.size).toBe(1);
  expect(requestUrl).not.toContain('Private%20proposal');
  expect(requestUrl).not.toContain('Private%20customer');
});

test('@claim:scope-boundaries offers no payment, invoice, or legal e-signature action', async ({ page, request }) => {
  for (const path of ['/', '/terms']) {
    await page.goto(path);
    await expect(page.locator('form')).toHaveCount(0);
    await expect(page.locator('a[href*="checkout"], a[href*="invoice"], a[href*="signature"]')).toHaveCount(0);
  }
  await page.goto('/');
  await expect(page.getByText('No payments or invoices.')).toBeVisible();
  await expect(page.getByText('No legal e-signatures.')).toBeVisible();
  await page.goto('/terms');
  await expect(page.getByText('Quote Revision Vault records quote changes. It offers no payments, invoices, or legal e-signatures.')).toBeVisible();
  await expect(page.getByText('It is not a legally binding electronic signature.')).toBeVisible();
  for (const path of ['/checkout', '/invoice', '/signature']) expect((await request.get(path)).status()).toBe(404);
});

test('@claim:free-one-quote allows one real quote and asks for a license before the second', async ({ page }) => {
  await page.goto('/vault');
  await page.locator('#empty-new').click();
  await expect(page.locator('.quote-list li')).toHaveCount(1);
  await page.locator('#new-quote').click();
  await expect(page.getByRole('dialog', { name: 'Use your Studio Pass' })).toBeVisible();
  await expect(page.locator('.quote-list li')).toHaveCount(1);
});

test('rejects negative, blank, non-finite, and excessive line values without changing history', async ({ page }) => {
  await page.goto('/demo');
  const save = page.getByRole('button', { name: 'Save new revision' });
  await page.locator('#revision-reason').fill('Amount boundary check');

  await page.locator('#rate-0').fill('-5');
  await save.click();
  await expect(page.locator('#vault-status')).toHaveText('The revision was not saved. Correct the marked amount.');
  await expect(page.locator('#rate-0')).toHaveValue('-5');
  await expect(page.getByText('Revision 4', { exact: true })).toHaveCount(0);
  await expect(page.locator('#rate-error-0')).toContainText('Rate must be from 0');

  await page.locator('#rate-0').fill('850');
  await page.locator('#qty-0').fill('');
  await save.click();
  await expect(page.locator('#qty-error-0')).toHaveText('Enter a quantity.');
  await expect(page.getByText('Revision 4', { exact: true })).toHaveCount(0);

  await page.locator('#qty-0').evaluate((input: HTMLInputElement) => { input.value = '1e999'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  await save.click();
  await expect(page.locator('#qty-0')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Revision 4', { exact: true })).toHaveCount(0);

  await page.locator('#qty-0').fill('1');
  await page.locator('#rate-0').fill('1000000001');
  await save.click();
  await expect(page.locator('#rate-error-0')).toContainText('1,000,000,000');
  await expect(page.getByText('Revision 4', { exact: true })).toHaveCount(0);
});

test('malformed backups get stable plain-language feedback', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#import-vault').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await expect(page.locator('#vault-status')).toHaveText('This file is not a Quote Revision Vault backup. Choose an exported vault JSON file.');
  await expect(page.locator('#vault-status')).not.toContainText('position');
});

test('390px controls, including footer links, meet touch size and the page has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const selector of ['#reset-demo', '#start-real', '#export-pdf', '#delete-quote', '#add-item', '#restore-revision', '#create-share', '#import-receipt']) {
    const box = await page.locator(selector).boundingBox();
    expect(box, selector).not.toBeNull();
    expect(box!.height, selector).toBeGreaterThanOrEqual(44);
  }
  for (const selector of ['.footer-links a[href="/privacy"]', '.footer-links a[href="/terms"]', '.footer-links a[href="https://hello-factory.sociobot.in"]']) {
    const box = await page.locator(selector).boundingBox();
    expect(box, selector).not.toBeNull();
    expect(box!.width, selector).toBeGreaterThanOrEqual(44);
    expect(box!.height, selector).toBeGreaterThanOrEqual(44);
  }
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
});

test('storage recovery reload is CSP-safe and works after storage becomes available', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.addInitScript(() => {
    const nativeIndexedDb = window.indexedDB;
    if (!sessionStorage.getItem('qrv-storage-blocked-once')) {
      sessionStorage.setItem('qrv-storage-blocked-once', 'true');
      Object.defineProperty(window, 'indexedDB', { configurable: true, get: () => { throw new DOMException('Storage is blocked.', 'SecurityError'); } });
    } else {
      Object.defineProperty(window, 'indexedDB', { configurable: true, value: nativeIndexedDb });
    }
  });
  await page.goto('/vault');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your vault could not open');
  await page.getByRole('button', { name: 'Reload the vault' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Keep every quote revision');
  expect(consoleErrors.filter((message) => /Content Security Policy|inline event handler/i.test(message))).toEqual([]);
});

test('landing and terms do not expose a payment checkout while no sale is offered', async ({ page }) => {
  for (const path of ['/', '/terms']) {
    await page.goto(path);
    await expect(page.locator('a[href*="api.sociobot.in/api/v1/products/quote-revision-vault/checkout"]')).toHaveCount(0);
    await expect(page.getByText(/sales are unavailable/i)).toHaveCount(0);
  }
});

test('static response policy gives hashed assets immutable caching', async () => {
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8'));
  const assets = config.routes.find((route: { route: string }) => route.route === '/assets/*');
  expect(assets.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');
  const worker = config.routes.find((route: { route: string }) => route.route === '/sw.js');
  expect(worker.headers['Cache-Control']).toContain('no-store');
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
  for (const route of ['/demo', '/vault', '/privacy', '/terms', '/ack']) {
    expect(config.routes.find((entry: { route: string }) => entry.route === route)?.rewrite).toBe('/index.html');
  }
});
