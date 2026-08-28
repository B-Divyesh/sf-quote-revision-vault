'use strict';

const { createHash, randomUUID } = require('node:crypto');
const { handleReviewLink } = require('./logic');

function rateDetails(req, rows) {
  const forwarded = req.headers?.['x-forwarded-for'] || req.headers?.['X-Forwarded-For'] || 'unknown';
  const rawClient = String(forwarded).split(',')[0].trim();
  const client = rawClient.replace(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/, '$1').replace(/^\[([^\]]+)\]:\d+$/, '$1');
  const clientHash = createHash('sha256').update(client).digest('hex').slice(0, 20);
  const method = String(req.method).toUpperCase();
  const prefix = `${clientHash}:${method}:`;
  const values = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return { clientHash, method, count: values.filter((row) => String(row.RowKey || row.rowKey || '').startsWith(prefix)).length };
}

module.exports = async function (context, req) {
  const bucket = String(req.params?.bucket || '');
  const currentBucket = Math.floor(Date.now() / 60000);
  if (bucket !== String(currentBucket) && bucket !== String(currentBucket - 1)) {
    context.res = { status: 400, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, body: JSON.stringify({ message: 'The request time window is invalid. Reload and try again.' }) };
    return;
  }
  const rate = rateDetails(req, context.bindings.rateRows);
  const limit = rate.method === 'GET' ? 240 : 30;
  if (rate.count >= limit) {
    context.res = {
      status: 429,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '60' },
      body: JSON.stringify({ message: 'Too many review-link requests. Try again in one minute.' })
    };
    return;
  }
  try {
    const result = handleReviewLink(req, context.bindings.storedLink);
    context.bindings.savedRate = { PartitionKey: bucket, RowKey: `${rate.clientHash}:${rate.method}:${randomUUID()}` };
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
