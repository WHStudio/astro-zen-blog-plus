# Astro Zen Blog Plus

基于[Astro Zen Blog](https://github.com/larry-xue/astro-zen-blog)主题的汉化，并对部分功能进行改进。

如果您觉得这个项目有帮助，请考虑给原作者和我点个star⭐️。

[Demo](https://azbp.netlify.app/)

[原版REAMDE](https://github.com/larry-xue/astro-zen-blog/blob/main/docs/README_CN.md)

## 功能改进

- 🎨 UI和细节优化
- 🌓 暗色模式增强
- 🔍 搜索功能升级
- 🕰️ 精确时间设计
- 📇 内置博客目录
- 🔒 博客隐藏功能
- ✒️ 更好的 Markdown 和 LaTeX 支持
- 🚮 移除 RSS 和 Google Analysis
- 💡 更多惊喜...

## 性能展示

由[PageSpeed Insights](https://pagespeed.web.dev/)提供支持

**四项全满，快如闪电！**

![mobile](https://290f154.webp.li/202506150505513.png)

![desktop](https://290f154.webp.li/202506150507214.png)

## 安装和调试

1. 克隆本项目：

   ```bash
   git clone git@github.com:WHStudio/astro-zen-blog-plus.git
   ```

   ```bash
   cd astro-zen-blog-plus
   ```

2. 安装依赖：

   ```bash
   pnpm i
   ```

3. 启动开发服务器：

   ```bash
   pnpm dev
   ```

## 自定义站点信息

打开 `src/config.ts` 并自定义您的网站设置：

```typescript
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
```

## 创建新文章

为了方便创建新文章，本模板提供了 pnpm 脚本：

```bash
# 这将创建一个新md文件，并保存至 src/content/blog/文件名.md
pnpm new-post 文件名
```

你可以通过修改 scripts/new-post.js 文件来定制新文章的模板。

## 构建和部署

1. 构建静态资源：

   ```bash
   pnpm build
   ```

2. 或者 无服务器部署：

   构建命令 `pnpm build`，输出 `dist`。

   - [Cloudflare Pages](https://pages.cloudflare.com/)

   - [Vercel](https://vercel.com/)

   - [netlify](https://netlify.com/)

## 许可证

该项目基于 MIT 许可证 - 查看 LICENSE 文件了解详情。
