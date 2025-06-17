import type { CollectionEntry } from 'astro:content';
import { isPublished } from './date';

export interface PostFilter {
  maxPosts?: number;
  tags?: string[];
  excludeTags?: string[];
}

export function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts.sort((a, b) => b.data.created.valueOf() - a.data.created.valueOf());
}

export function filterPublishedPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts.filter(post => !post.data.hidden && isPublished(post.data.created));
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

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tag: string): CollectionEntry<'blog'>[] {
  return posts.filter(post => 
    post.data.tags?.includes(tag) &&
    !post.data.hidden &&
    isPublished(post.data.created)
  );
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
export function getWordCount(content: string): number {
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
    // 移除多余的空白字符，但保留单个空格
    .replace(/\s+/g, ' ')
    .trim();
  
  // 计算字符数（包括汉字、英文字母、数字、标点符号等，但不包括空格）
  return cleanContent.replace(/\s/g, '').length;
}
