const SLUG = 'quote-revision-vault';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86400000;
const OFFLINE_GRACE = 7 * DAY;

interface Verdict { valid: boolean; checkedAt: number; reason: string }

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  // A URL can carry a typo or an expired token.  It is deliberately not a
  // license until the verification endpoint has positively confirmed it.
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: false, checkedAt: 0, reason: 'unverified' }));
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

export function hasLicense(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || '') as Verdict;
    return verdict.valid && verdict.checkedAt > 0;
  } catch {
    return false;
  }
}

export function hasStoredLicense(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: false, checkedAt: 0, reason: 'unverified' }));
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || '{}') as Partial<Verdict>;
    if (!force && cached.checkedAt && Date.now() - cached.checkedAt < DAY) return Boolean(cached.valid);
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('License check is unavailable.');
    const data = await response.json() as { valid: boolean; reason: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: data.valid, reason: data.reason, checkedAt: Date.now() }));
    return data.valid;
  } catch {
    // A person who was already verified can continue while temporarily
    // offline. A newly pasted token never receives that grace period.
    try {
      const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || '{}') as Partial<Verdict>;
      return cached.valid === true && Boolean(cached.checkedAt) && Date.now() - Number(cached.checkedAt) <= OFFLINE_GRACE;
    } catch {
      return false;
    }
  }
}
