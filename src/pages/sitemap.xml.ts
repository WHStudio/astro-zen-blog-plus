import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { filterPublishedPosts } from '../utils/posts';
import { siteConfig } from '../config';

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('blog');
  const publishedPosts = filterPublishedPosts(allPosts);

  const site = siteConfig.site.replace(/\/$/, '');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${site}/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${site}/archive/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${site}/tags/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ${publishedPosts.map(post => `
  <url>
    <loc>${site}/blog/${post.slug}/</loc>
    <lastmod>${post.data.updated.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
