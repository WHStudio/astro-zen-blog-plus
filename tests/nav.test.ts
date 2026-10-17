import assert from 'node:assert/strict';
import test from 'node:test';
import { isNavActive } from '../src/utils/nav.ts';

test('nav highlight follows the current path, including nested blog URLs', () => {
  assert.equal(isNavActive('/', '/'), true);
  assert.equal(isNavActive('/', '/blog'), false);
  assert.equal(isNavActive('/blog', '/blog'), true);
  assert.equal(isNavActive('/blog', '/blog/'), true);
  assert.equal(isNavActive('/blog', '/blog/mdtest'), true);
  assert.equal(isNavActive('/tags', '/tags/测试'), true);
  assert.equal(isNavActive('/archive', '/blog'), false);
});
