import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Allow: /blog/
Allow: /tags/
Allow: /archive/

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap.xml', site);
  console.log('sitemapURL = ', sitemapURL);
  return new Response(getRobotsTxt(sitemapURL));
};
