import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    created: z.date(),
    updated: z.date().optional(),
    tags: z.array(z.string()).optional(),
    hidden: z.boolean().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
