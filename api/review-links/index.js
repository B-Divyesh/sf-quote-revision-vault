'use strict';

const { handleReviewLink } = require('./logic');

const buckets = new Map();

function allowed(req) {
  const forwarded = req.headers?.['x-forwarded-for'] || req.headers?.['X-Forwarded-For'] || 'unknown';
  const client = String(forwarded).split(',')[0].trim();
  const windowId = Math.floor(Date.now() / 60000);
  const key = `${client}:${windowId}:${String(req.method).toUpperCase()}`;
  const count = (buckets.get(key) || 0) + 1;
  buckets.set(key, count);
  if (buckets.size > 1000) for (const oldKey of buckets.keys()) if (!oldKey.includes(`:${windowId}:`)) buckets.delete(oldKey);
  return count <= (String(req.method).toUpperCase() === 'GET' ? 240 : 30);
}

module.exports = async function (context, req) {
  if (!allowed(req)) {
    context.res = {
      status: 429,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '60' },
      body: JSON.stringify({ message: 'Too many review-link requests. Try again in one minute.' })
    };
    return;
  }
  try {
    const result = handleReviewLink(req, context.bindings.storedLink);
    if (result.entity) context.bindings.savedLink = result.entity;
    context.res = result.response;
  } catch {
    context.res = {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      body: JSON.stringify({ message: 'The review-link request could not be read.' })
    };
  }
};
