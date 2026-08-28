import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test('landing page explains the job and has no serious accessibility errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Revise quotes without losing the past');
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

test('legal and missing routes set distinct titles and keep one page heading', async ({ page }) => {
  for (const [path, title] of [['/privacy', 'Privacy — Quote Revision Vault'], ['/terms', 'Terms — Quote Revision Vault'], ['/missing-stop', 'Page not found — Quote Revision Vault']]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  }
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
  await page.goto('/demo');
  await page.locator('#share-days').selectOption('7');
  await page.getByRole('button', { name: 'Create review link' }).click();
  const output = page.locator('#share-output');
  await expect(output).toContainText('/ack#packet=');
  const text = await output.locator('span').innerText();
  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  await recipientPage.goto(text);
  await expect(recipientPage.getByRole('heading', { level: 1 })).toHaveText('Review this saved quote');
  await expect(recipientPage.getByText('Harbour Street identity refresh')).toBeVisible();
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
  await page.goto('/demo');
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

test('review links fail closed when their live status cannot be checked', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Create review link' }).click();
  const url = await page.locator('#share-output span').innerText();
  await page.route('**/api/review-links/**', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"offline"}' }));
  await page.goto(url);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This quote cannot be shown yet');
  await expect(page.getByText('Harbour Street identity refresh')).toHaveCount(0);
  await expect(page.locator('#ack-form')).toHaveCount(0);
});

test('@claim:demo-isolation keeps sample changes outside the real vault', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#quote-title').fill('Changed only in demo');
  await page.goto('/vault');
  await expect(page.getByRole('heading', { name: 'Your first revision starts here' })).toBeVisible();
  await expect(page.getByText('Changed only in demo')).toHaveCount(0);
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

test('@claim:offline-reload opens the demo without a network after first visit', async ({ page, context }) => {
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
  await page.reload();
  await expect(page.getByText('Revision 3', { exact: true })).toBeVisible();
});

test('an existing valid Studio Pass unlocks creation of more than one real quote', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:quote-revision-vault','test-token');
    localStorage.setItem('sb_license_verdict:quote-revision-vault',JSON.stringify({valid:true,reason:'ok',checkedAt:Date.now()}));
  });
  await page.goto('/vault');
  await page.locator('#empty-new').click();
  await expect(page.locator('.quote-list li')).toHaveCount(1);
  await page.locator('#new-quote').click();
  await expect(page.locator('.quote-list li')).toHaveCount(2);
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

test('landing and terms do not expose an unavailable billing checkout', async ({ page }) => {
  for (const path of ['/', '/terms']) {
    await page.goto(path);
    await expect(page.locator('a[href*="api.sociobot.in/api/v1/products/quote-revision-vault/checkout"]')).toHaveCount(0);
    await expect(page.getByText('Studio Pass sales are unavailable while the billing catalog is updated.')).toBeVisible();
  }
});

test('static response policy gives hashed assets immutable caching', async () => {
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8'));
  const assets = config.routes.find((route: { route: string }) => route.route === '/assets/*');
  expect(assets.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');
  const worker = config.routes.find((route: { route: string }) => route.route === '/sw.js');
  expect(worker.headers['Cache-Control']).toContain('no-store');
});
