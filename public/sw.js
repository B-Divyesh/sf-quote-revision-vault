const CACHE = 'qrv-shell-v12';
const APP_SHELL = '/app-shell';
const STATIC_FILES = ['/offline.html', '/offline.css', '/404.html', '/404.css', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-180.png', '/assets/revision-route-480.avif', '/assets/revision-route-480.webp', '/assets/revision-route.avif', '/assets/revision-route.webp', '/assets/revision-route.jpg'];

async function fetchFresh(path) {
  return fetch(new Request(path, { cache: 'reload' }));
}

async function cacheable(response) {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetchFresh('/');
    const html = await response.clone().text();
    await cache.put(APP_SHELL, await cacheable(response));
    const builtFiles = [...html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)].map((match) => match[1]);
    const files = [...new Set([...STATIC_FILES, ...builtFiles])];
    await Promise.all(files.map(async (path) => {
      const asset = await fetchFresh(path);
      if (asset.ok) await cache.put(path, await cacheable(asset));
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then(async (cache) => cache.put(APP_SHELL, await cacheable(copy)));
      return response;
    }).catch(async () => (await caches.match(APP_SHELL)) || (await caches.match('/offline.html'))));
    return;
  }
  event.respondWith(caches.match(url.pathname, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE).then(async (cache) => cache.put(request, await cacheable(response.clone())));
    return response;
  })));
});
