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
assert.doesNotMatch(home, /不会发布的隐藏草稿|未来才发布的文章/);
assert.doesNotMatch(home, /width="800"/);
assert.match(home, /width="700"/);

const post = read('blog/mdtest/index.html');
assert.match(post, /name="description" content="支持的Markdown语法"/);
assert.match(post, /property="og:type" content="article"/);
assert.match(post, /上一篇|下一篇/);
assert.match(post, /katex\.[^"]+\.css/);
assert.match(post, /src="https:\/\/www\.todaybing\.com\/api\/today\/cn"/);
assert.doesNotMatch(post, /__ASTRO_IMAGE_/);

const readme = read('blog/readme/index.html');
assert.doesNotMatch(readme, /katex\.[^"]+\.css/);
assert.match(readme, /src="https:\/\/290f154\.webp\.li\/202506150505513\.png"/);

assert.equal(exists('blog/hidden-example/index.html'), false);
assert.equal(exists('blog/scheduled-future/index.html'), false);

const search = read('api/search.json');
assert.doesNotMatch(search, /不会发布的隐藏草稿|未来才发布的文章/);
assert.match(search, /Markdown渲染测试/);

const robots = read('robots.txt');
assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
assert.doesNotMatch(robots, /sitemapURL/);

console.log('build output matches the review fixes');
