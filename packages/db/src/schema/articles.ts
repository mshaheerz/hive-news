import { pgTable, pgEnum, uuid, varchar, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { reporters } from './reporters';
import { categories } from './categories';

export const articleStatusEnum = pgEnum('article_status', [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'published',
]);

export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id),
    reporterId: uuid('reporter_id')
      .notNull()
      .references(() => reporters.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull().unique(),
    content: text('content').notNull(),
    summary: text('summary'),
    status: articleStatusEnum('status').notNull().default('draft'),
    metadataJson: jsonb('metadata_json'),
    tokensUsed: integer('tokens_used'),
    generationMs: integer('generation_ms'),
    // TODO: add pgvector embedding column
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('articles_slug_idx').on(table.slug),
    index('articles_company_id_idx').on(table.companyId),
    index('articles_reporter_id_idx').on(table.reporterId),
    index('articles_category_id_idx').on(table.categoryId),
    index('articles_status_idx').on(table.status),
    index('articles_published_at_idx').on(table.publishedAt),
  ],
);
