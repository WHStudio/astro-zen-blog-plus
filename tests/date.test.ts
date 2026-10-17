import assert from 'node:assert/strict';
import test from 'node:test';
import { getZonedYear, isPublished } from '../src/utils/date.ts';

test('archive year uses the configured timezone instead of the host zone', () => {
  const date = new Date('2025-12-31T16:30:00.000Z');
  assert.equal(getZonedYear(date, 'Asia/Shanghai'), 2026);
  assert.equal(getZonedYear(date, 'UTC'), 2025);
});

test('future dates stay unpublished', () => {
  const now = new Date('2026-10-17T00:00:00.000Z');
  assert.equal(isPublished(new Date('2026-10-16T00:00:00.000Z'), now), true);
  assert.equal(isPublished(new Date('2099-01-01T00:00:00.000Z'), now), false);
});
