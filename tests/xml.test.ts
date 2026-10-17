import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeXml } from '../src/utils/xml.ts';

test('sitemap locations escape XML metacharacters', () => {
  assert.equal(escapeXml(`https://example.com/a&b<"'>`), 'https://example.com/a&amp;b&lt;&quot;&apos;&gt;');
});
