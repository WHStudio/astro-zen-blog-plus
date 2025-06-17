import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
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
