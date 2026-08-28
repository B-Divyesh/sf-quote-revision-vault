'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { handleReviewLink } = require('./logic');

const id = '90ef96ac-4cbd-4a02-9186-2a4514d04a2f';
const ownerKey = 'a'.repeat(43);
const now = Date.parse('2026-08-28T12:00:00.000Z');

test('registry stores no quote contents and supports authorized cross-device revocation', () => {
  const created = handleReviewLink({ method: 'POST', params: { id }, body: { action: 'create', expiresAt: new Date(now + 86400000).toISOString(), ownerKey, snapshot: { client: 'must not be stored' } } }, undefined, now);
  assert.equal(created.response.status, 201);
  assert.deepEqual(Object.keys(created.entity).sort(), ['PartitionKey', 'RowKey', 'expiresAt', 'ownerKeyHash', 'revokedAt']);
  assert.equal(JSON.stringify(created.entity).includes('must not be stored'), false);
  assert.equal(handleReviewLink({ method: 'GET', params: { id } }, created.entity, now).response.body, '{"state":"active"}');

  const denied = handleReviewLink({ method: 'POST', params: { id }, body: { action: 'revoke', ownerKey: 'b'.repeat(43) } }, created.entity, now);
  assert.equal(denied.response.status, 403);

  const revoked = handleReviewLink({ method: 'POST', params: { id }, body: { action: 'revoke', ownerKey } }, created.entity, now);
  assert.equal(revoked.response.status, 200);
  assert.equal(handleReviewLink({ method: 'GET', params: { id } }, [created.entity, revoked.entity], now).response.body, '{"state":"revoked"}');
  assert.equal(handleReviewLink({ method: 'POST', params: { id }, body: { action: 'revoke', ownerKey } }, [created.entity, revoked.entity], now).entity, undefined);
});

test('registry reports expiry and rejects excessive lifetimes', () => {
  const entity = { expiresAt: new Date(now - 1).toISOString(), ownerKeyHash: '0'.repeat(64), revokedAt: '' };
  assert.equal(handleReviewLink({ method: 'GET', params: { id } }, entity, now).response.body, '{"state":"expired"}');
  const tooLong = handleReviewLink({ method: 'POST', params: { id }, body: { action: 'create', expiresAt: new Date(now + 32 * 86400000).toISOString(), ownerKey } }, undefined, now);
  assert.equal(tooLong.response.status, 400);
});

test('registry selects the requested row when the table binding returns a partition array', () => {
  const other = { RowKey: '1f46c7d2-92cc-4e68-8e3a-6a211a228d51', expiresAt: new Date(now + 86400000).toISOString(), revokedAt: '' };
  const requested = { RowKey: id, expiresAt: new Date(now + 86400000).toISOString(), ownerKeyHash: '0'.repeat(64) };
  const tombstone = { RowKey: `${id}:revoked`, revokedAt: new Date(now).toISOString() };
  assert.equal(handleReviewLink({ method: 'GET', params: { id } }, [other, requested, tombstone], now).response.body, '{"state":"revoked"}');
  const absentId = '2f46c7d2-92cc-4e68-8e3a-6a211a228d52';
  assert.equal(handleReviewLink({ method: 'GET', params: { id: absentId } }, [other, requested], now).response.status, 404);
});

test('write requests return 429 with Retry-After after the per-minute limit', async () => {
  const endpoint = require('./index');
  const bucket = String(Math.floor(Date.now() / 60000));
  const rateRows = [];
  let last;
  for (let count = 0; count < 31; count += 1) {
    const context = { bindings: { storedLink: undefined, rateRows }, res: undefined };
    await endpoint(context, {
      method: 'POST',
      params: { id, bucket },
      headers: { 'x-forwarded-for': `203.0.113.9:${4000 + count}` },
      body: { action: 'create', expiresAt: new Date(Date.now() + 86400000).toISOString(), ownerKey }
    });
    if (context.bindings.savedRate) rateRows.push(context.bindings.savedRate);
    last = context.res;
  }
  assert.equal(last.status, 429);
  assert.equal(last.headers['retry-after'], '60');
});
