import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');

function read(relativePath) {
  return fs.readFileSync(path.join(dist, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(dist, relativePath));
}

assert.equal(exists('sitemap-index.xml'), false, 'obsolete sitemap index should not be emitted');
assert.equal(exists('sitemap.xml'), true);

const sitemap = read('sitemap.xml');
assert.match(sitemap, /\/tags\//);
assert.match(sitemap, /blog\/readme\//);
assert.match(sitemap, /blog\/mdtest\//);
assert.match(sitemap, /<loc>https:\/\/example\.com\/blog\/mdtest\/<\/loc>\s*<lastmod>2025-06-18<\/lastmod>/);
assert.match(sitemap, /<loc>https:\/\/example\.com\/blog\/readme\/<\/loc>\s*<lastmod>2026-05-10<\/lastmod>/);
assert.doesNotMatch(sitemap, /hidden-example/);
assert.doesNotMatch(sitemap, /scheduled-future/);
assert.doesNotMatch(sitemap, /<loc>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)[^<]*<\/loc>/);

const home = read('index.html');
assert.match(home, /name="description" content="在这里写描述"/);
assert.match(home, /rel="canonical"/);
assert.match(home, /property="og:title"/);
assert.match(home, /rel="sitemap" href="\/sitemap\.xml"/);
assert.match(home, /data-astro-transition-persist="site-header"/);
assert.doesNotMatch(home, /katex\.[^"]+\.css/);
assert.doesNotMatch(home, /rel="stylesheet"/);
assert.doesNotMatch(home, /fetchpriority="high"/);
assert.match(home, /<style[\s>]/);
assert.doesNotMatch(home, /不会发布的隐藏草稿|未来才发布的文章/);
assert.doesNotMatch(home, /width="800"/);
assert.match(home, /width="700"/);
assert.match(home, /跳到主要内容/);
assert.match(home, /2026年5月10日/);
assert.doesNotMatch(home, />\d{4}-\d{2}-\d{2}T/);

const post = read('blog/mdtest/index.html');
assert.match(post, /name="description" content="支持的Markdown语法"/);
assert.match(post, /property="og:type" content="article"/);
assert.match(post, /上一篇|下一篇/);
assert.match(post, /2025年6月18日 02:30/);
assert.doesNotMatch(post, /rel="stylesheet"/);
assert.doesNotMatch(post, /katex\.[^"]+\.css/);
assert.match(post, /font-display:\s*swap/);
assert.doesNotMatch(post, /font-display:\s*block/);
assert.match(post, /src="https:\/\/www\.todaybing\.com\/api\/today\/cn"/);
assert.match(post, /alt="必应壁纸"/);
assert.match(post, /width="1920"/);
assert.match(post, /height="1080"/);
assert.match(post, /loading="lazy"/);
assert.match(post, /<label><input type="checkbox"/);
assert.match(post, /#bdc4cc/i);
assert.doesNotMatch(post, /__ASTRO_IMAGE_/);

const readme = read('blog/readme/index.html');
assert.doesNotMatch(readme, /katex\.[^"]+\.css/);
assert.doesNotMatch(readme, /font-display:/);
assert.match(readme, /src="https:\/\/290f154\.webp\.li\/202506150505513\.png"/);
assert.match(readme, /width="1597"/);
assert.match(readme, /height="487"/);
assert.match(readme, /width="1598"/);
assert.match(readme, /height="467"/);
const coverPreload = readme.match(/rel="preload" as="image" href="(\/_astro\/readme-cover[^"]+)"/);
assert.ok(coverPreload, 'hero cover should be preloaded');
const coverImg = readme.match(/<img[^>]*src="(\/_astro\/readme-cover[^"]+)"[^>]*>/);
assert.ok(coverImg, 'hero cover should be an img');
assert.equal(coverPreload[1], coverImg[1]);
assert.match(coverImg[0], /fetchpriority="high"/);
assert.match(coverImg[0], /decoding="sync"/);
assert.match(coverImg[0], /loading="eager"/);

assert.equal(exists('blog/hidden-example/index.html'), true);
assert.equal(exists('blog/scheduled-future/index.html'), false);

const hidden = read('blog/hidden-example/index.html');
assert.match(hidden, /可以通过地址直接打开/);
assert.match(hidden, /name="robots" content="noindex, nofollow"/);
assert.doesNotMatch(hidden, /href="\/tags\//);
assert.doesNotMatch(hidden, /上一篇|下一篇/);
assert.doesNotMatch(read('blog/index.html'), /hidden-example|不会发布的隐藏草稿/);
assert.doesNotMatch(read('archive/index.html'), /hidden-example|不会发布的隐藏草稿/);
assert.doesNotMatch(read('tags/index.html'), /#隐藏/);
assert.doesNotMatch(post, /hidden-example/);

const search = read('api/search.json');
assert.doesNotMatch(search, /不会发布的隐藏草稿|未来才发布的文章/);
assert.match(search, /Markdown渲染测试/);
assert.match(search, /"href":"\/blog\/mdtest"/);
assert.doesNotMatch(search, /todaybing\.com/);

const robots = read('robots.txt');
assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
assert.doesNotMatch(robots, /sitemapURL/);

console.log('build output matches the review fixes');
