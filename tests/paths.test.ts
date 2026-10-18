import assert from 'node:assert/strict';
import test from 'node:test';
import { postHref } from '../src/utils/paths.ts';

test('post links encode each path segment', () => {
  assert.equal(postHref('readme'), '/blog/readme');
  assert.equal(postHref('笔记/第一篇'), '/blog/%E7%AC%94%E8%AE%B0/%E7%AC%AC%E4%B8%80%E7%AF%87');
  assert.equal(postHref('a b&c'), '/blog/a%20b%26c');
});
