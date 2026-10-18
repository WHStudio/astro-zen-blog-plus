import assert from 'node:assert/strict';
import test from 'node:test';
import { filterPublishedPosts, filterRoutablePosts, getPostsByTag, getWordCount, hasMath, sortPostsByDate } from '../src/utils/posts.ts';

function post(id, data, body = '') {
  return { id, data, body };
}

test('published filter removes hidden and future posts', () => {
  const now = new Date('2026-10-17T00:00:00.000Z');
  const posts = [
    post('visible', { hidden: false, created: new Date('2024-01-01T00:00:00.000Z'), tags: ['a'] }),
    post('hidden', { hidden: true, created: new Date('2024-01-01T00:00:00.000Z'), tags: ['隐藏'] }),
    post('future', { hidden: false, created: new Date('2099-01-01T00:00:00.000Z'), tags: ['未来'] }),
    post('hidden-future', { hidden: true, created: new Date('2099-01-01T00:00:00.000Z'), tags: ['隐藏'] }),
  ];
  assert.deepEqual(filterPublishedPosts(posts, now).map((entry) => entry.id), ['visible']);
  assert.deepEqual(filterRoutablePosts(posts, now).map((entry) => entry.id), ['visible', 'hidden']);
});

test('sorting does not mutate the original array', () => {
  const older = post('older', { created: new Date('2020-01-01T00:00:00.000Z') });
  const newer = post('newer', { created: new Date('2024-01-01T00:00:00.000Z') });
  const posts = [older, newer];
  const sorted = sortPostsByDate(posts);
  assert.deepEqual(posts.map((entry) => entry.id), ['older', 'newer']);
  assert.deepEqual(sorted.map((entry) => entry.id), ['newer', 'older']);
});

test('word count and math detection accept missing bodies', () => {
  assert.equal(getWordCount(undefined), 0);
  assert.equal(getWordCount('你好 world'), 7);
  assert.equal(getWordCount('质能 $E=mc^2$ 公式'), 4);
  assert.equal(hasMath(undefined), false);
  assert.equal(hasMath('质能 $E=mc^2$'), true);
  assert.equal(hasMath('价格是 $16'), false);
});

test('tag lookup ignores hidden and future posts', () => {
  const now = new Date('2026-10-17T00:00:00.000Z');
  const posts = [
    post('visible', { hidden: false, created: new Date('2024-01-01T00:00:00.000Z'), tags: ['笔记'] }),
    post('hidden', { hidden: true, created: new Date('2024-01-01T00:00:00.000Z'), tags: ['笔记'] }),
    post('future', { hidden: false, created: new Date('2099-01-01T00:00:00.000Z'), tags: ['笔记'] }),
    post('other', { hidden: false, created: new Date('2024-01-01T00:00:00.000Z'), tags: ['其他'] }),
  ];
  assert.deepEqual(getPostsByTag(posts, '笔记', now).map((entry) => entry.id), ['visible']);
});
