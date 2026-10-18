import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkDeflist from 'remark-deflist';
import rehypeKatex from 'rehype-katex';
import { siteConfig } from './src/config';
import { katexFontDisplaySwap } from './src/plugins/katex-font-display.mjs';
import { rehypeTaskListLabels } from './src/plugins/rehype-task-list-labels.ts';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: siteConfig.site,
  integrations: [],

  markdown: {
    // Built-in Shiki runs before rehype plugins and is what paints fenced code.
    shikiConfig: {
      theme: 'github-dark-high-contrast',
    },
    processor: unified({
      remarkPlugins: [remarkMath, remarkGfm, remarkDeflist],
      rehypePlugins: [
        rehypeKatex,
        rehypeTaskListLabels,
        [rehypePrettyCode, {
          theme: 'github-dark-high-contrast',
          onVisitLine(node) {
            if (node.children.length === 0) {
              node.children = [{type: 'text', value: ' '}];
            }
          },
        }],
      ],
    }),
  },

  vite: {
    plugins: [tailwindcss(), katexFontDisplaySwap()],
  },
});