import { getCollection } from 'astro:content';

export async function sitemapFilter(page: string): Promise<boolean> {
  // 检查是否为隐藏文章
  const blogPostMatch = page.match(/\/blog\/([^\/]+)\/$/);
  if (blogPostMatch) {
    const slug = blogPostMatch[1];
    try {
      const posts = await getCollection('blog');
      const post = posts.find(p => p.slug === slug);
      return !post?.data.hidden;
    } catch (error) {
      console.warn('Error checking hidden status for', slug, error);
      return true;
    }
  }
  return true;
}
