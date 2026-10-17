import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { formatLocalTimestamp, resolvePostPath } from '../scripts/add-post.js';

test('new posts cannot escape the content directory or overwrite a file', () => {
  const blogDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-posts-'));
  const created = resolvePostPath('第一篇', blogDir);
  assert.equal(created, path.join(blogDir, '第一篇.md'));
  assert.throws(() => resolvePostPath('../secret', blogDir));
  assert.throws(() => resolvePostPath('nested/name', blogDir));
  fs.writeFileSync(created, 'existing');
  assert.equal(fs.existsSync(created), true);
});

test('new post timestamps include the local offset', () => {
  const stamp = formatLocalTimestamp(new Date('2026-10-17T02:05:00.000Z'));
  assert.match(stamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000[+-]\d{2}:\d{2}$/);
});
