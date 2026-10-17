import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../config';
import { filterPublishedPosts, getAllTags } from '../utils/posts';
import { escapeXml } from '../utils/xml';

function absolute(pathname: string): string {
  const site = siteConfig.site.replace(/\/$/, '');
  return escapeXml(`${site}${pathname}`);
}

export const GET: APIRoute = async () => {
  const publishedPosts = filterPublishedPosts(await getCollection('blog'));
  const tags = getAllTags(publishedPosts);

  const urls = [
    { loc: absolute('/'), changefreq: 'monthly', priority: '1.0' },
    { loc: absolute('/blog/'), changefreq: 'weekly', priority: '0.9' },
    { loc: absolute('/archive/'), changefreq: 'weekly', priority: '0.7' },
    { loc: absolute('/tags/'), changefreq: 'monthly', priority: '0.6' },
    ...tags.map((tag) => ({
      loc: absolute(`/tags/${encodeURIComponent(tag)}/`),
      changefreq: 'weekly',
      priority: '0.5',
    })),
    ...publishedPosts.map((post) => ({
      loc: absolute(`/blog/${post.id}/`),
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: (post.data.updated ?? post.data.created).toISOString().split('T')[0],
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => {
    const lastmod = 'lastmod' in url && url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
    return `  <url>
    <loc>${url.loc}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
