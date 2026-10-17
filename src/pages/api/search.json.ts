import { getCollection } from 'astro:content';
import { filterPublishedPosts } from '../../utils/posts';

export async function GET() {
  const posts = filterPublishedPosts(await getCollection('blog'));

  const searchData = posts.map((post) => {
    const cleanContent = (post.body ?? '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/<img[^>]*>/g, '')
      .replace(/<(video|audio)[^>]*>.*?<\/(video|audio)>/gs, '')
      .replace(/\.(png|jpg|jpeg|gif|webp|svg|avif|mp4|webm|mp3|wav|ogg)/gi, '');

    return {
      title: post.data.title,
      description: post.data.description ?? '',
      tags: post.data.tags ?? [],
      slug: post.id,
      content: cleanContent,
    };
  });

  return new Response(JSON.stringify(searchData), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
