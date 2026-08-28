import { test, expect } from '@playwright/test';
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

test('@claim:review-link creates an expiring review link and imports its acknowledgment', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#share-days').selectOption('7');
  await page.getByRole('button', { name: 'Create review link' }).click();
  const output = page.locator('#share-output');
  await expect(output).toContainText('/ack#packet=');
  const text = await output.locator('span').innerText();
  await page.goto(text);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review this saved quote');
  await expect(page.getByText('Harbour Street identity refresh')).toBeVisible();
  await expect(page.getByText('Review link expires:', { exact: false })).toBeVisible();
  await page.locator('#ack-name').fill('Mara Chen');
  await page.getByRole('button', { name: 'Create acknowledgment code' }).click();
  const receipt = await page.locator('#receipt-result').inputValue();
  expect(receipt.length).toBeGreaterThan(40);
  const currentTime = Date.now();
  await page.clock.setFixedTime(currentTime + 8 * 86400000);
  await page.goto(text);
  await expect(page.getByText('This link is expired.')).toBeVisible();
  await page.clock.setFixedTime(currentTime);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Import acknowledgment code' }).click();
  await page.locator('#receipt-code').fill(receipt);
  await page.getByRole('button', { name: 'Import code' }).click();
  await expect(page.getByText('1 acknowledgment imported.')).toBeVisible();
  await page.getByRole('button', { name: 'Block link here' }).click();
  await page.goto(text);
  await expect(page.getByText('This link is revoked.')).toBeVisible();
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

test('@claim:paid-license unlocks creation of more than one real quote', async ({ page }) => {
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
