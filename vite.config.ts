import { defineConfig } from 'vite';

const previewLinks = new Map<string, { expiresAt: string; ownerKey: string; revoked: boolean }>();

function reviewLinkPreviewApi() {
  return {
    name: 'review-link-preview-api',
    configurePreviewServer(server: { middlewares: { use: (handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/review-links\/([0-9a-f-]+)$/i);
        if (!match) { next(); return; }
        const id = match[1];
        const reply = (status: number, value: unknown) => { res.statusCode = status; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(value)); };
        if (req.method === 'GET') {
          const link = previewLinks.get(id);
          if (!link) { reply(404, { message: 'This review link is not registered.' }); return; }
          reply(200, { state: link.revoked ? 'revoked' : Date.now() > Date.parse(link.expiresAt) ? 'expired' : 'active' });
          return;
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body) as { action?: string; expiresAt?: string; ownerKey?: string };
            const link = previewLinks.get(id);
            if (data.action === 'create' && data.expiresAt && data.ownerKey && !link) { previewLinks.set(id, { expiresAt: data.expiresAt, ownerKey: data.ownerKey, revoked: false }); reply(201, { state: 'active' }); return; }
            if (data.action === 'revoke' && link && data.ownerKey === link.ownerKey) { link.revoked = true; reply(200, { state: 'revoked' }); return; }
            reply(link ? 403 : 404, { message: 'The review-link request was rejected.' });
          } catch { reply(400, { message: 'The review-link request could not be read.' }); }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [reviewLinkPreviewApi()],
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 400
  }
});
