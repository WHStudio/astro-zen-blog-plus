import { getCollection } from 'astro:content';
import { postHref } from '../../utils/paths';
import { filterPublishedPosts } from '../../utils/posts';
import { toSearchText } from '../../utils/search';

export async function GET() {
  const posts = filterPublishedPosts(await getCollection('blog'));

  const searchData = posts.map((post) => {
    return {
      title: post.data.title,
      description: post.data.description ?? '',
      tags: post.data.tags ?? [],
      slug: post.id,
      href: postHref(post.id),
      content: toSearchText(post.body),
    };
  });

  return new Response(JSON.stringify(searchData), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
