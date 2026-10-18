---
title: Astro Zen Blog Plus
description: 项目介绍
created: 2025-06-17T18:00:00.000Z
updated: 2026-05-09T21:20:00.000Z
tags: [关于]
hidden: false
image: ./readme-cover.png
---

基于[Astro Zen Blog](https://github.com/larry-xue/astro-zen-blog)主题的汉化，并对部分功能进行改进。

如果您觉得这个项目有帮助，请考虑给原作者和我点个star⭐️。

[Demo](https://azbp.netlify.app/)

[REAMDE](https://github.com/WHStudio/astro-zen-blog-plus/blob/main/README.md)

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

<img src="https://290f154.webp.li/202506150505513.png" alt="mobile" width="1597" height="487" loading="lazy" decoding="async">

<img src="https://290f154.webp.li/202506150507214.png" alt="desktop" width="1598" height="467" loading="lazy" decoding="async">

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
  timezone: "Asia/Shanghai",
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
# 这将创建一个新 md 文件，并保存至 src/content/blog/文件名.md
pnpm new-post 文件名
```

你可以通过修改 `scripts/add-post.js` 定制新文章的模板。`hidden: true` 的文章仍会生成页面，知道地址的人可以直接打开，但不会进入首页、列表、归档、标签、搜索和站点地图。创建时间晚于构建时间的文章不会生成页面。

## 构建和部署

1. 构建静态资源：

   ```bash
   pnpm build
   ```

   参考Caddyfile配置：

   ```text
   blog.example.com {
     root * /var/www/blog/dist
     file_server
     tls abcd@mail.com
     encode gzip
     handle_errors {
       rewrite * /404.html
       templates
       file_server
     }
   }
   ```

2. 或者 无服务器部署：

   构建命令 `pnpm build`，输出 `dist`。

   - [Cloudflare Pages](https://pages.cloudflare.com/)

   - [Vercel](https://vercel.com/)

   - [netlify](https://netlify.com/)

3. 快捷脚本（可选）

   在Windows上，执行`win-compress.ps1`可以快速打包`dist`为`dist.tar.gz`。

   接下来以Root身份登录您的Linux服务器，执行`linux-decompress.sh`，可以快速部署静态文件。

4. 内容备份与迁移（可选）

   `win-backup.ps1` 和 `linux-backup.sh` 只打包站点自定义内容和已发布文章，不包含主题代码、依赖和构建结果：

   - `src/config.ts`：站点配置
   - `public/`：图标等静态资源
   - `src/content/blog/`：已发布文章

   两个脚本都能打包，也都能解压覆盖。换电脑或升级主题时，先准备好项目代码，再把备份覆盖回去。覆盖会替换上面三项；备份里没有的文章和静态文件会被删除。备份会跳过这些目录中的 `.git`、`node_modules`，以及 `.DS_Store`、`Thumbs.db`、`desktop.ini`。

   Windows（PowerShell 5.1 或 7+，系统自带 `tar`）：

   ```powershell
   # 在项目根目录生成 content-backup-时间戳.tar.gz
   .\win-backup.ps1

   # 覆盖还原
   .\win-backup.ps1 unpack .\content-backup-20261017-120000.tar.gz
   ```

   Linux：

   ```bash
   chmod +x linux-backup.sh
   ./linux-backup.sh pack
   ./linux-backup.sh unpack ./content-backup-20261017-120000.tar.gz
   ```

## 许可证

该项目基于 MIT 许可证 - 查看 LICENSE 文件了解详情。
