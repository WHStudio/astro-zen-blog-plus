import type { PostFilter } from "./utils/posts";

export interface SiteConfig {
  title: string;
  slogan: string;
  description?: string;
  site: string,
  social: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
  homepage: PostFilter;
  search?: boolean;
}

export const siteConfig: SiteConfig = {
  site: "https://example.com/", // 您的网站 URL
  title: "您的博客",
  slogan: "探索世界与自我",
  description: "在这里写描述",
  social: {
    // 原版集成的一些联系方式, 不需要则留空
    github: "https://github.com/username",
    linkedin: "https://www.linkedin.com/in/username",
    email: "your@email.com",
  },
  homepage: {
    maxPosts: 5, // 主页显示的最大文章数量
    tags: [], // 仅显示包含这些标签的文章
    excludeTags: [], // 排除包含这些标签的文章
  },
  search: true, // 启用本地搜索
};
