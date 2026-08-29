import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://quote-revision-vault.sociobot.in';
const evidence = '.factory/evidence/polish-5/live';
const checks = {
  base,
  timestamp: new Date().toISOString(),
  routes: {},
  demo: {},
  customerBoundary: {},
  mobile: {},
  offline: {},
  axe: {},
  headers: {},
  errors: []
};
const expect = (condition, message) => { if (!condition) throw new Error(message); };
const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  page.on('console', (message) => { if (message.type() === 'error') checks.errors.push(message.text()); });
  const coldRequests = [];
  page.on('request', (request) => coldRequests.push(request.url()));

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  expect(await page.title() === 'Quote Revision Vault — Save and compare quote revisions', 'Landing title is stale');
  expect(await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/`, 'Landing canonical is stale');
  expect(await page.locator('meta[property="og:title"]').getAttribute('content') === 'Quote Revision Vault — Save and compare quote revisions', 'Landing social title is stale');
  for (const selector of ['#landing-title', '.hero-deck', '.hero-actions', '.facts']) {
    const box = await page.locator(selector).boundingBox();
    expect(Boolean(box && box.y >= 0 && box.y + box.height <= 1000), `Desktop first screen overflows: ${selector}`);
  }
  await page.screenshot({ path: `${evidence}/first-screen-desktop.png`, fullPage: false });
  checks.routes.landing = { title: await page.title(), canonical: await page.locator('link[rel="canonical"]').getAttribute('href') };

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).searchParams.get('demo') === '1', 'The one-click demo does not use ?demo=1');
  expect((await page.getByLabel('Demo mode').innerText()).includes('Demo — sample data, nothing is saved'), 'Demo banner is missing');
  expect(await page.getByRole('button', { name: 'Reset demo' }).count() === 1, 'Demo reset is missing');
  expect(await page.getByRole('link', { name: 'Open my real vault' }).getAttribute('href') === '/vault', 'Demo exit is wrong');
  expect(await page.getByText('Harbour Street identity refresh').count() > 0, 'Demo sample is missing');
  await page.screenshot({ path: `${evidence}/demo-desktop.png`, fullPage: false });
  await page.locator('#quote-title').fill('Live demo-only change');
  await page.locator('#revision-reason').fill('Live reset proof');
  await page.getByRole('button', { name: 'Save new revision' }).click();
  await page.getByText('Revision 4', { exact: true }).first().waitFor();
  await page.getByRole('button', { name: 'Create review link' }).click();
  await page.getByText('Sample review link created.').waitFor();
  expect(!coldRequests.some((url) => new URL(url).pathname.includes('/api/review-links/')), 'Demo contacted the live registry');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForURL(/\/demo$/);
  expect(await page.locator('#quote-title').inputValue() === 'Harbour Street identity refresh', 'Demo reset did not restore the sample');
  await page.goto(`${base}/vault`, { waitUntil: 'networkidle' });
  expect(await page.getByRole('heading', { name: 'Your first revision starts here' }).count() === 1, 'Demo data entered the real vault');
  expect(coldRequests.every((url) => new URL(url).origin === base), 'Cold/demo flow made an off-origin request');
  checks.demo = { url: `${base}/?demo=1`, reset: true, registryRequests: 0 };

  const routeTitles = {
    '/': 'Quote Revision Vault — Save and compare quote revisions',
    '/demo': 'Demo — Quote Revision Vault',
    '/vault': 'Vault — Quote Revision Vault',
    '/privacy': 'Privacy — Quote Revision Vault',
    '/terms': 'Terms — Quote Revision Vault',
    '/ack': 'Review a quote — Quote Revision Vault'
  };
  for (const [path, title] of Object.entries(routeTitles)) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    expect(await page.title() === title, `Wrong title for ${path}`);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}${path}`, `Wrong canonical for ${path}`);
    expect(await page.locator('main').count() === 1 && await page.locator('h1').count() === 1, `Missing structure on ${path}`);
    checks.routes[path] = { title, canonical: `${base}${path}` };
  }
  await page.goto(`${base}/vault`, { waitUntil: 'networkidle' });
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Privacy' }).click();
  expect(await page.getByRole('heading', { level: 1 }).evaluate((heading) => heading === document.activeElement), 'Route change did not focus its heading');
  await page.goBack({ waitUntil: 'networkidle' });
  expect(await page.getByRole('heading', { level: 1 }).evaluate((heading) => heading === document.activeElement), 'Back navigation did not focus its heading');
  checks.routes.focusAfterNavigation = true;

  const owner = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const ownerPage = await owner.newPage();
  const serviceRequests = [];
  const otherOrigins = [];
  const watch = (request) => {
    const url = new URL(request.url());
    if (url.origin !== base) otherOrigins.push(request.url());
    if (url.pathname.startsWith('/api/')) serviceRequests.push({ method: request.method(), path: url.pathname, body: request.postData() });
  };
  ownerPage.on('request', watch);
  await ownerPage.goto(`${base}/vault`, { waitUntil: 'networkidle' });
  await ownerPage.locator('#empty-new').click();
  await ownerPage.locator('#quote-title').fill('Live privacy quote');
  await ownerPage.locator('#client').fill('Avery Patel');
  await ownerPage.locator('#desc-0').fill('Site survey');
  await ownerPage.locator('#rate-0').fill('500');
  await ownerPage.locator('#revision-reason').fill('Initial quote');
  await ownerPage.getByRole('button', { name: 'Save new revision' }).click();
  await ownerPage.getByRole('button', { name: 'Create review link' }).click();
  await ownerPage.getByText('Review link created.').waitFor();
  const reviewUrl = await ownerPage.locator('#share-output span').innerText();
  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  recipientPage.on('request', watch);
  await recipientPage.goto(reviewUrl, { waitUntil: 'networkidle' });
  expect(await recipientPage.getByRole('heading', { name: 'Review this saved quote' }).count() === 1, 'Recipient could not open the real review link');
  await recipientPage.locator('#ack-name').fill('Mara Chen');
  await recipientPage.locator('#ack-note').fill('Use the revised sign scope.');
  await recipientPage.getByRole('button', { name: 'Create acknowledgment code' }).click();
  const acknowledgment = await recipientPage.locator('#receipt-result').inputValue();
  await ownerPage.getByRole('button', { name: 'Import acknowledgment code' }).click();
  await ownerPage.locator('#receipt-code').fill(acknowledgment);
  await ownerPage.getByRole('button', { name: 'Import code' }).click();
  await ownerPage.getByText('1 acknowledgment imported.').waitFor();
  expect(otherOrigins.length === 0, 'Customer review flow made an off-origin request');
  expect(serviceRequests.length === 2 && serviceRequests.map((request) => request.method).join(',') === 'POST,GET', 'Unexpected customer service request count');
  expect(serviceRequests.every((request) => /^\/api\/review-links\/\d+\/[0-9a-f-]+$/i.test(request.path)), 'Customer flow reached a non-status API');
  const createRequest = serviceRequests.find((request) => request.method === 'POST');
  expect(JSON.stringify(Object.keys(JSON.parse(createRequest.body || '{}')).sort()) === JSON.stringify(['action', 'expiresAt', 'ownerKey']), 'Review-link create request has extra fields');
  const sent = JSON.stringify(serviceRequests);
  expect(!sent.includes('Avery Patel') && !sent.includes('Mara Chen') && !sent.includes('Use the revised sign scope.'), 'Customer content left the browser');
  const stores = await ownerPage.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open('qrv-real-v1');
    open.onsuccess = () => { resolve([...open.result.objectStoreNames]); open.result.close(); };
    open.onerror = () => reject(open.error);
  }));
  expect(JSON.stringify(stores) === JSON.stringify(['quotes']), 'A customer profile store exists');
  await ownerPage.screenshot({ path: `${evidence}/customer-boundary.png`, fullPage: false });
  checks.customerBoundary = { serviceMethods: serviceRequests.map((request) => request.method), bodyKeys: Object.keys(JSON.parse(createRequest.body || '{}')).sort(), stores, offOriginRequests: otherOrigins.length };
  await recipient.close();
  await owner.close();

  const missing = await desktop.request.get(`${base}/missing-polish-5`);
  expect(missing.status() === 404, 'Unknown path does not return HTTP 404');
  await page.goto(`${base}/missing-polish-5`, { waitUntil: 'networkidle' });
  expect(await page.getByRole('link', { name: 'Return home' }).count() === 1, '404 home action is missing');
  expect(await page.locator('footer .build-id').innerText() === 'Version 1.0.0 · Build 2026-08-29', '404 build identifier is missing');
  await page.screenshot({ path: `${evidence}/404-desktop.png`, fullPage: false });
  checks.routes.notFound = { status: missing.status(), build: await page.locator('footer .build-id').innerText() };
  const sitemap = await (await desktop.request.get(`${base}/sitemap.xml`)).text();
  expect(sitemap.includes(`${base}/ack`), 'Sitemap omits /ack');
  checks.routes.sitemapHasAck = true;

  const response = await desktop.request.get(`${base}/`);
  const csp = response.headers()['content-security-policy'] || '';
  expect(csp.includes("frame-ancestors 'none'"), 'CSP does not set frame-ancestors as a response header');
  checks.headers = { cspFrameAncestors: true, referrerPolicy: response.headers()['referrer-policy'], contentTypeOptions: response.headers()['x-content-type-options'] };
  for (const path of ['/', '/demo', '/vault', '/privacy', '/terms', '/ack', '/missing-polish-5']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const violations = result.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')).map((item) => item.id);
    expect(violations.length === 0, `Axe violations on ${path}: ${violations.join(', ')}`);
    checks.axe[path] = violations;
  }
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${base}/`, { waitUntil: 'networkidle' });
  const privacy = mobilePage.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Privacy' });
  const privacyBox = await privacy.boundingBox();
  expect(await privacy.isVisible() && Boolean(privacyBox && privacyBox.height >= 44), 'Mobile Privacy link is missing or too small');
  expect(!(await mobilePage.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'Mobile page has horizontal overflow');
  await mobilePage.screenshot({ path: `${evidence}/first-screen-mobile.png`, fullPage: false });
  await mobilePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: `${evidence}/demo-mobile.png`, fullPage: false });
  checks.mobile = { privacyTargetHeight: privacyBox?.height, horizontalOverflow: false };
  await mobile.close();

  const offline = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const offlinePage = await offline.newPage();
  await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), undefined, { timeout: 20000 });
  await offline.setOffline(true);
  await offlinePage.locator('#rate-0').fill('905');
  await offlinePage.locator('#revision-reason').fill('Live offline proof');
  await offlinePage.getByRole('button', { name: 'Save new revision' }).click();
  await offlinePage.getByText('Revision 4', { exact: true }).first().waitFor();
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  expect(await offlinePage.getByText('Revision 4', { exact: true }).count() > 0, 'Offline revision did not survive reload');
  expect((await offlinePage.locator('#comparison').innerText()).includes('$905.00'), 'Offline value did not survive reload');
  checks.offline = { savedRate: 905, reload: true };
  await offline.close();

  checks.errors = checks.errors.filter((error) => !error.includes('server responded with a status of 404'));
  expect(checks.errors.length === 0, `Console errors: ${checks.errors.join(' | ')}`);
  await writeFile(`${evidence}/checks.json`, JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks, null, 2));
} finally {
  await browser.close();
}
