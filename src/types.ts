export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface QuoteSnapshot {
  title: string;
  client: string;
  business: string;
  currency: string;
  validUntil: string;
  items: LineItem[];
  notes: string;
}

export interface Revision {
  id: string;
  number: number;
  createdAt: string;
  reason: string;
  snapshot: QuoteSnapshot;
}

export interface ShareLink {
  id: string;
  revisionId: string;
  createdAt: string;
  expiresAt: string;
  ownerKey?: string;
  revokedAt?: string;
}

export interface Acknowledgement {
  shareId: string;
  revisionId: string;
  quoteId: string;
  name: string;
  notedAt: string;
  note: string;
}

export interface Quote extends QuoteSnapshot {
  id: string;
  revisions: Revision[];
  shares: ShareLink[];
  acknowledgements: Acknowledgement[];
  updatedAt: string;
}

export interface SharePacket {
  version: 2;
  shareId: string;
  quoteId: string;
  revisionId: string;
  revisionNumber: number;
  expiresAt: string;
  snapshot: QuoteSnapshot;
}
