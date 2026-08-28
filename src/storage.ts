import type { Quote } from './types';

const DB_VERSION = 1;
let activeDemo = false;

export function setDemoStorage(value: boolean) {
  activeDemo = value;
}

function dbName() {
  return activeDemo ? 'qrv-demo-v1' : 'qrv-real-v1';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName(), DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('quotes')) {
        request.result.createObjectStore('quotes', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listQuotes(): Promise<Quote[]> {
  const db = await openDb();
  return new Promise<Quote[]>((resolve, reject) => {
    const request = db.transaction('quotes').objectStore('quotes').getAll();
    request.onsuccess = () => resolve((request.result as Quote[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export async function saveQuote(quote: Quote): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('quotes', 'readwrite');
    tx.objectStore('quotes').put(structuredClone(quote));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }).finally(() => db.close());
}

export async function removeQuote(id: string): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('quotes', 'readwrite');
    tx.objectStore('quotes').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }).finally(() => db.close());
}

export async function resetDemo(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('qrv-demo-v1');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

export async function exportVault(): Promise<string> {
  return JSON.stringify({ format: 'quote-revision-vault', version: 1, exportedAt: new Date().toISOString(), quotes: await listQuotes() }, null, 2);
}

export async function importVault(text: string): Promise<number> {
  const data = JSON.parse(text) as { format?: string; quotes?: Quote[] };
  if (data.format !== 'quote-revision-vault' || !Array.isArray(data.quotes)) throw new Error('This is not a Quote Revision Vault export.');
  for (const quote of data.quotes) {
    if (!quote.id || !Array.isArray(quote.revisions)) throw new Error('One quote is missing its revision history.');
    await saveQuote(quote);
  }
  return data.quotes.length;
}
