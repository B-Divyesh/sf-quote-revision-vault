import type { Quote, QuoteSnapshot, Revision } from './types';

const first: QuoteSnapshot = {
  title: 'Harbour Street identity refresh',
  client: 'Mara Chen, Harbour Street Bakery',
  business: 'Northline Design Studio',
  currency: 'USD',
  validUntil: '2026-09-30',
  items: [
    { id: 'sample-1', description: 'Brand discovery workshop', quantity: 1, rate: 850 },
    { id: 'sample-2', description: 'Logo system and usage guide', quantity: 1, rate: 2400 },
    { id: 'sample-3', description: 'Packaging templates', quantity: 3, rate: 420 }
  ],
  notes: 'Includes two review rounds. Final files are supplied after approval.'
};

const second: QuoteSnapshot = {
  ...first,
  items: [
    first.items[0],
    { ...first.items[1], rate: 2600 },
    { ...first.items[2], quantity: 4 },
    { id: 'sample-4', description: 'Storefront sign artwork', quantity: 1, rate: 680 }
  ],
  notes: 'Includes three review rounds. Final files are supplied after approval.'
};

const third: QuoteSnapshot = {
  ...second,
  items: second.items.filter((item) => item.id !== 'sample-4').map((item) =>
    item.id === 'sample-3' ? { ...item, quantity: 2 } : item
  ),
  notes: 'Storefront work moved to a later phase. Includes three review rounds.'
};

const revisions: Revision[] = [
  { id: 'rev-sample-1', number: 1, createdAt: '2026-08-20T09:15:00.000Z', reason: 'Initial quote', snapshot: first },
  { id: 'rev-sample-2', number: 2, createdAt: '2026-08-23T14:40:00.000Z', reason: 'Added sign and extra packaging', snapshot: second },
  { id: 'rev-sample-3', number: 3, createdAt: '2026-08-25T11:05:00.000Z', reason: 'Moved storefront work to phase two', snapshot: third }
];

export function sampleQuote(): Quote {
  return {
    id: 'quote-harbour-street',
    ...structuredClone(third),
    revisions: structuredClone(revisions),
    shares: [],
    acknowledgements: [],
    updatedAt: '2026-08-25T11:05:00.000Z'
  };
}

export function emptyQuote(): Quote {
  const today = new Date();
  const valid = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    title: '', client: '', business: '', currency: 'USD', validUntil: valid,
    items: [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }],
    notes: '', revisions: [], shares: [], acknowledgements: [], updatedAt: today.toISOString()
  };
}
