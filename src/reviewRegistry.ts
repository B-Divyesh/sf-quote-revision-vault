export type ReviewLinkState = 'active' | 'revoked' | 'expired';

interface RegistryResponse {
  state?: ReviewLinkState;
  message?: string;
}

async function request(id: string, init?: RequestInit): Promise<RegistryResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const bucket = Math.floor(Date.now() / 60000);
    const response = await fetch(`/api/review-links/${bucket}/${encodeURIComponent(id)}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({})) as RegistryResponse;
    if (!response.ok) throw new Error(data.message || 'The review-link service is unavailable.');
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function registerReviewLink(id: string, expiresAt: string, ownerKey: string): Promise<void> {
  await request(id, { method: 'POST', body: JSON.stringify({ action: 'create', expiresAt, ownerKey }) });
}

export async function revokeReviewLink(id: string, ownerKey: string): Promise<void> {
  await request(id, { method: 'POST', body: JSON.stringify({ action: 'revoke', ownerKey }) });
}

export async function getReviewLinkState(id: string): Promise<ReviewLinkState> {
  const data = await request(id, { method: 'GET' });
  if (!data.state) throw new Error('The review-link status is missing.');
  return data.state;
}

export function randomOwnerKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
