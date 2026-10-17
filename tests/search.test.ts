import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeHtml, escapeRegExp, highlightText } from '../src/utils/search.ts';

test('search text is escaped before it is inserted as HTML', () => {
  const highlighted = highlightText('<img src=x onerror=alert(1)>', 'img');
  assert.equal(highlighted.includes('<img'), false);
  assert.match(highlighted, /&lt;/);
  assert.match(highlighted, /<mark [^>]*>img<\/mark>/);
});

test('regular expression metacharacters are matched literally', () => {
  assert.equal(highlightText('a+b (c)', '(c)'), 'a+b <mark class="bg-yellow-200 dark:bg-yellow-800">(c)</mark>');
  assert.doesNotThrow(() => highlightText('nothing', '(a+)+'));
  assert.equal(escapeRegExp('(a+)+'), '\\(a\\+\\)\\+');
  assert.equal(escapeHtml(`"'<>&`), '&quot;&#39;&lt;&gt;&amp;');
});
