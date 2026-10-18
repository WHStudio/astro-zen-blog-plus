import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDate, formatZonedISODate, getZonedYear, isPublished } from '../src/utils/date.ts';

test('archive year uses the configured timezone instead of the host zone', () => {
  const date = new Date('2025-12-31T16:30:00.000Z');
  assert.equal(getZonedYear(date, 'Asia/Shanghai'), 2026);
  assert.equal(getZonedYear(date, 'UTC'), 2025);
});

test('sitemap dates use the configured timezone', () => {
  const date = new Date('2025-12-31T16:30:00.000Z');
  assert.equal(formatZonedISODate(date, 'Asia/Shanghai'), '2026-01-01');
  assert.equal(formatZonedISODate(date, 'UTC'), '2025-12-31');
  assert.equal(formatDate(date, 'Asia/Shanghai'), '2026年1月1日');
});

test('future dates stay unpublished', () => {
  const now = new Date('2026-10-17T00:00:00.000Z');
  assert.equal(isPublished(new Date('2026-10-16T00:00:00.000Z'), now), true);
  assert.equal(isPublished(new Date('2099-01-01T00:00:00.000Z'), now), false);
});
