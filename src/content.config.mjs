import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Notes: dated, newest first. The date is when a thought was had, not when it went up, so
// backdating is expected rather than an oddity. `draft: true` keeps a half-written piece in
// the repo and out of the build — nothing about it reaches a page or the navigation.
//
// Frontmatter, all of it required unless noted:
//   title    string   the heading, and the tab title
//   date     date     YYYY-MM-DD, the day the thought belongs to
//   summary  string   one line, shown in the list and as the meta description
//   draft    boolean  optional, defaults false
//   tags     string[] optional, defaults empty
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { notes };
