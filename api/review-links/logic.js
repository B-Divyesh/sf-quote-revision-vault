'use strict';

const { createHash, timingSafeEqual } = require('node:crypto');

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OWNER_KEY = /^[A-Za-z0-9_-]{40,64}$/;
const MAX_LIFETIME = 31 * 86400000;

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function json(status, body, extraHeaders = {}) {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function existingEntity(value, id) {
  if (Array.isArray(value)) return value.find((entity) => entity.RowKey === id || entity.rowKey === id);
  return value || undefined;
}

function hasRevocation(value, id) {
  if (!Array.isArray(value)) return false;
  return value.some((entity) => entity.RowKey === `${id}:revoked` || entity.rowKey === `${id}:revoked`);
}

function sameHash(a, b) {
  const left = Buffer.from(String(a || ''), 'hex');
  const right = Buffer.from(String(b || ''), 'hex');
  return left.length === 32 && right.length === 32 && timingSafeEqual(left, right);
}

function handleReviewLink(req, stored, now = Date.now()) {
  const id = String(req.params?.id || '');
  if (!ID.test(id)) return { response: json(400, { message: 'The review-link ID is invalid.' }) };
  const entity = existingEntity(stored, id);
  const revoked = hasRevocation(stored, id);

  if (String(req.method).toUpperCase() === 'GET') {
    if (!entity) return { response: json(404, { message: 'This review link is not registered.' }) };
    const state = revoked ? 'revoked' : now > Date.parse(entity.expiresAt) ? 'expired' : 'active';
    return { response: json(200, { state }) };
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (body.action === 'create') {
    if (entity) return { response: json(409, { message: 'This review link already exists.' }) };
    const expires = Date.parse(body.expiresAt);
    if (!OWNER_KEY.test(String(body.ownerKey || '')) || !Number.isFinite(expires) || expires <= now || expires > now + MAX_LIFETIME) {
      return { response: json(400, { message: 'The review-link details are invalid.' }) };
    }
    return {
      response: json(201, { state: 'active' }),
      entity: { PartitionKey: 'links', RowKey: id, expiresAt: new Date(expires).toISOString(), ownerKeyHash: hash(body.ownerKey), revokedAt: '' }
    };
  }

  if (body.action === 'revoke') {
    if (!entity) return { response: json(404, { message: 'This review link was not found.' }) };
    if (!OWNER_KEY.test(String(body.ownerKey || '')) || !sameHash(hash(body.ownerKey), entity.ownerKeyHash)) {
      return { response: json(403, { message: 'This device cannot block that review link.' }) };
    }
    if (revoked) return { response: json(200, { state: 'revoked' }) };
    return { response: json(200, { state: 'revoked' }), entity: { PartitionKey: 'links', RowKey: `${id}:revoked`, revokedAt: new Date(now).toISOString() } };
  }

  return { response: json(400, { message: 'The review-link action is invalid.' }) };
}

module.exports = { handleReviewLink, hash };
