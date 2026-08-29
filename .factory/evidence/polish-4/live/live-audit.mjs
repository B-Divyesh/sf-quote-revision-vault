import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://quote-revision-vault.sociobot.in';
const evidence = '.factory/evidence/polish-4/live';
const checks = { base, timestamp: new Date().toISOString(), routes: {}, axe: {}, demo: {}, registryPrivacy: {}, mobile: {}, offline: {}, errors: [] };
const expect = (condition, message) => { if (!condition) throw new Error(message); };
const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  page.on('console', (message) => { if (message.type() === 'error') checks.errors.push(message.text()); });
  const requestUrls = [];
  page.on('request', (request) => requestUrls.push(request.url()));

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  expect(await page.title() === 'Quote Revision Vault — Save and compare quote revisions', 'Landing title is stale');
  expect(await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/`, 'Landing canonical is stale');
  expect(await page.locator('meta[property="og:title"]').getAttribute('content') === 'Quote Revision Vault — Save and compare quote revisions', 'Landing Open Graph title is stale');
  for (const selector of ['#landing-title', '.hero-deck', '.hero-actions', '.facts']) {
    const box = await page.locator(selector).boundingBox();
    expect(Boolean(box && box.y >= 0 && box.y + box.height <= 1000), `Desktop first-screen overflow: ${selector}`);
  }
  await page.screenshot({ path: `${evidence}/first-screen-desktop.png`, fullPage: false });
  checks.routes.landing = { title: await page.title(), canonical: await page.locator('link[rel="canonical"]').getAttribute('href') };

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).searchParams.get('demo') === '1', 'One-click demo path is not ?demo=1');
  const banner = page.getByLabel('Demo mode');
  expect((await banner.innerText()).includes('Demo — sample data, nothing is saved'), 'Demo banner copy is wrong');
  expect(await page.getByRole('button', { name: 'Reset demo' }).count() === 1, 'Demo reset is missing');
  expect(await page.getByRole('link', { name: 'Open my real vault' }).getAttribute('href') === '/vault', 'Demo exit action is wrong');
  expect(await page.getByRole('heading', { name: 'Customer review link' }).count() === 1, 'Demo uses stale review receipt terminology');
  await page.screenshot({ path: `${evidence}/demo-desktop.png`, fullPage: false });
  await page.locator('#quote-title').fill('Live-only sample edit');
  await page.locator('#revision-reason').fill('Live demo reset check');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  await page.getByText('Revision 4', { exact: true }).first().waitFor();
  expect(await page.getByText('Revision 4', { exact: true }).count() > 0, 'Demo did not save a revision');
  await page.getByRole('button', { name: 'Create review link' }).click();
  await page.locator('#share-output').getByText('Sample review link created.').waitFor();
  const sampleLink = await page.locator('#share-output span').innerText();
  expect(!requestUrls.some((url) => new URL(url).pathname.includes('/api/review-links/')), 'Demo review link contacted the live registry');
  const demoRecipient = await browser.newContext();
  const demoRecipientPage = await demoRecipient.newPage();
  const demoRecipientRequests = [];
  demoRecipientPage.on('request', (request) => demoRecipientRequests.push(request.url()));
  await demoRecipientPage.goto(sampleLink, { waitUntil: 'networkidle' });
  expect(await demoRecipientPage.getByRole('heading', { name: 'Review this saved quote' }).count() === 1, 'Sample review link could not be opened');
  await demoRecipientPage.locator('#ack-name').fill('Live sample recipient');
  await demoRecipientPage.getByRole('button', { name: 'Create acknowledgment code' }).click();
  expect(!demoRecipientRequests.some((url) => new URL(url).pathname.includes('/api/review-links/')), 'Demo recipient contacted the live registry');
  await demoRecipient.close();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForURL(/\/demo$/);
  await page.waitForLoadState('networkidle');
  expect(await page.locator('#quote-title').inputValue() === 'Harbour Street identity refresh', 'Demo reset did not restore sample');
  await page.goto(`${base}/vault`, { waitUntil: 'networkidle' });
  expect(await page.getByRole('heading', { name: 'Your first revision starts here' }).count() === 1, 'Demo data reached the real vault');
  expect(requestUrls.every((url) => new URL(url).origin === base), 'Landing/demo made an off-origin request');
  checks.demo = { demoUrl: `${base}/?demo=1`, resetTitle: 'Harbour Street identity refresh', requests: requestUrls.length, registryRequests: 0 };

  const registryContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const registryPage = await registryContext.newPage();
  let createRequest;
  registryPage.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname.includes('/api/review-links/')) createRequest = request;
  });
  await registryPage.goto(`${base}/vault`, { waitUntil: 'networkidle' });
  await registryPage.locator('#empty-new').click();
  await registryPage.locator('#quote-title').fill('Private live quote');
  await registryPage.locator('#client').fill('Private live customer');
  await registryPage.locator('#desc-0').fill('Private planning');
  await registryPage.locator('#rate-0').fill('500');
  await registryPage.locator('#revision-reason').fill('Initial private revision');
  await registryPage.getByRole('button', { name: 'Save new revision' }).click();
  await registryPage.getByRole('button', { name: 'Create review link' }).click();
  await registryPage.locator('#share-output').getByText('Review link created.').waitFor();
  expect(Boolean(createRequest), 'Live review-link create request was not made');
  const createBody = createRequest.postDataJSON();
  expect(JSON.stringify(Object.keys(createBody).sort()) === JSON.stringify(['action', 'expiresAt', 'ownerKey']), 'Live create request contains extra data');
  expect(!JSON.stringify(createBody).includes('Private live quote') && !JSON.stringify(createBody).includes('Private live customer'), 'Live create request leaks quote content');
  await registryPage.reload({ waitUntil: 'networkidle' });
  await registryPage.getByRole('button', { name: 'Block review link' }).click();
  await registryPage.getByText('The review link is blocked on every device.').waitFor();
  checks.registryPrivacy = { endpoint: new URL(createRequest.url()).pathname, bodyKeys: Object.keys(createBody).sort(), blocked: true };
  await registryContext.close();

  const licenseContext = await browser.newContext();
  const licensePage = await licenseContext.newPage();
  await licensePage.route('https://api.sociobot.in/api/v1/products/quote-revision-vault/verify?license=offline-token', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await licensePage.goto(`${base}/vault`, { waitUntil: 'networkidle' });
  await licensePage.locator('#empty-new').click();
  await licensePage.locator('#new-quote').click();
  await licensePage.locator('#license-token').fill('offline-token');
  await licensePage.getByRole('button', { name: 'Verify license' }).click();
  await licensePage.getByText('This license is not active or could not be checked. Keep the one-quote vault and try again when you are online.').waitFor();
  expect(await licensePage.locator('.quote-list li').count() === 1, 'Unavailable license verification unlocked more than one quote');
  checks.license = { unavailableVerifierKeepsOneQuote: true };
  await licenseContext.close();

  const missing = await desktop.request.get(`${base}/missing-review-4`);
  expect(missing.status() === 404, 'Missing route did not return HTTP 404');
  await page.goto(`${base}/missing-review-4`, { waitUntil: 'networkidle' });
  expect(await page.locator('footer .build-id').innerText() === 'Version 1.0.0 · Build 2026-08-29', '404 footer has no build identifier');
  await page.screenshot({ path: `${evidence}/404-desktop.png`, fullPage: false });
  checks.routes.notFound = { status: missing.status(), build: await page.locator('footer .build-id').innerText() };

  await page.goto(`${base}/ack`, { waitUntil: 'networkidle' });
  expect(await page.locator('meta[name="description"]').getAttribute('content') === 'Review one saved quote revision and create an acknowledgment code.', 'Acknowledgment metadata is stale');
  checks.routes.ack = { title: await page.title(), description: await page.locator('meta[name="description"]').getAttribute('content') };
  const sitemap = await (await desktop.request.get(`${base}/sitemap.xml`)).text();
  expect(sitemap.includes(`${base}/ack`), 'Sitemap omits /ack');
  checks.routes.sitemapHasAck = true;

  for (const path of ['/', '/demo', '/privacy', '/terms', '/ack', '/missing-review-4']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = result.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')).map((item) => item.id);
    expect(serious.length === 0, `Axe failures on ${path}: ${serious.join(', ')}`);
    checks.axe[path] = { violations: serious };
  }
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${base}/`, { waitUntil: 'networkidle' });
  const privacy = mobilePage.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Privacy' });
  const privacyBox = await privacy.boundingBox();
  expect(await privacy.isVisible() && Boolean(privacyBox && privacyBox.height >= 44), 'Mobile Privacy header link is missing or too small');
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(!overflow, 'Mobile landing overflows horizontally');
  await mobilePage.screenshot({ path: `${evidence}/first-screen-mobile.png`, fullPage: false });
  await mobilePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: `${evidence}/demo-mobile.png`, fullPage: false });
  checks.mobile = { privacyTargetHeight: privacyBox?.height, horizontalOverflow: overflow };
  await mobile.close();

  const offline = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const offlinePage = await offline.newPage();
  await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), undefined, { timeout: 20000 });
  await offline.setOffline(true);
  await offlinePage.locator('#rate-0').fill('903');
  await offlinePage.locator('#revision-reason').fill('Live offline persistence check');
  await offlinePage.getByRole('button', { name: 'Save new revision' }).click();
  await offlinePage.getByText('Revision 4', { exact: true }).first().waitFor();
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  expect(await offlinePage.getByText('Revision 4', { exact: true }).count() > 0, 'Offline revision did not persist after reload');
  expect(await offlinePage.locator('#comparison').innerText().then((text) => text.includes('$903.00')), 'Offline saved value did not persist');
  checks.offline = { savedRate: 903, reload: true };
  await offline.close();

  checks.errors = checks.errors.filter((error) => !error.includes('server responded with a status of 404'));
  expect(checks.errors.length === 0, `Console errors: ${checks.errors.join(' | ')}`);
  await writeFile(`${evidence}/checks.json`, JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks, null, 2));
} finally {
  await browser.close();
}
