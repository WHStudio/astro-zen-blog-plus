import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkDeflist from 'remark-deflist';
import rehypeKatex from 'rehype-katex';
import { siteConfig } from './src/config';

export default defineConfig({
  site: siteConfig.site,
  integrations: [tailwind()],  markdown: {
    remarkPlugins: [remarkMath, remarkGfm, remarkDeflist],
    rehypePlugins: [
      rehypeKatex,
      [rehypePrettyCode, {
        theme: 'github-dark',
        onVisitLine(node) {
          if (node.children.length === 0) {
            node.children = [{type: 'text', value: ' '}];
          }
        },
      }],
    ],
  },
});