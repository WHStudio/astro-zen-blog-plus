import type { CollectionEntry } from 'astro:content';
import { isPublished } from './date';

export interface PostFilter {
  maxPosts?: number;
  tags?: string[];
  excludeTags?: string[];
}

export function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return [...posts].sort((a, b) => {
    const dateA = a.data.updated ?? a.data.created;
    const dateB = b.data.updated ?? b.data.created;
    return dateB.valueOf() - dateA.valueOf();
  });
}

export function getAdjacentPosts(posts: CollectionEntry<'blog'>[], id: string): {
  newer?: CollectionEntry<'blog'>;
  older?: CollectionEntry<'blog'>;
} {
  const sorted = sortPostsByDate(filterPublishedPosts(posts));
  const index = sorted.findIndex((post) => post.id === id);
  if (index === -1) return {};
  return {
    newer: index > 0 ? sorted[index - 1] : undefined,
    older: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

export function filterPublishedPosts(posts: CollectionEntry<'blog'>[], now = new Date()): CollectionEntry<'blog'>[] {
  return posts.filter(post => !post.data.hidden && isPublished(post.data.created, now));
}

export function filterRoutablePosts(posts: CollectionEntry<'blog'>[], now = new Date()): CollectionEntry<'blog'>[] {
  return posts.filter(post => isPublished(post.data.created, now));
}

export function filterPosts(posts: CollectionEntry<'blog'>[], filter: PostFilter = {}): CollectionEntry<'blog'>[] {
  let filteredPosts = filterPublishedPosts(posts);

  // Filter by tags
  if (filter.tags?.length) {
    filteredPosts = filteredPosts.filter(post => 
      filter.tags!.some(tag => post.data.tags?.includes(tag))
    );
  }

  // Filter by excluded tags
  if (filter.excludeTags?.length) {
    filteredPosts = filteredPosts.filter(post => 
      !filter.excludeTags!.some(tag => post.data.tags?.includes(tag))
    );
  }

  // Sort posts by date
  filteredPosts = sortPostsByDate(filteredPosts);

  // Limit number of posts if maxPosts is specified
  if (filter.maxPosts) {
    filteredPosts = filteredPosts.slice(0, filter.maxPosts);
  }

  return filteredPosts;
}

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tag: string, now = new Date()): CollectionEntry<'blog'>[] {
  return filterPublishedPosts(posts, now).filter((post) => post.data.tags?.includes(tag));
}

export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  const publishedPosts = filterPublishedPosts(posts);
  return [...new Set(publishedPosts.flatMap(post => post.data.tags || []))].sort();
}

/**
 * 计算文章内容的字数
 * @param content 文章的原始 markdown 内容
 * @returns 字符数统计
 */
export function hasMath(content: string | undefined): boolean {
  if (!content) return false;
  return /\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/.test(content);
}

export function getWordCount(content: string | undefined): number {
  if (!content) return 0;
  // 移除 frontmatter（YAML 头部）
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');
  
  // 移除 markdown 语法
  let cleanContent = contentWithoutFrontmatter
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]*`/g, '')
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除链接但保留文本
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除列表标记
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // 移除引用标记
    .replace(/^>\s+/gm, '')
    // 移除粗体和斜体标记
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除删除线
    .replace(/~~([^~]+)~~/g, '$1')
    // 移除 HTML 标签
    .replace(/<[^>]*>/g, '')
    // 移除数学公式，避免把 LaTeX 源码算进字数
    .replace(/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$/g, '')
    // 移除多余的空白字符，但保留单个空格
    .replace(/\s+/g, ' ')
    .trim();
  
  // 计算字符数（包括汉字、英文字母、数字、标点符号等，但不包括空格）
  return cleanContent.replace(/\s/g, '').length;
}
