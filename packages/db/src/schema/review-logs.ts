import { pgTable, pgEnum, uuid, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { articles } from './articles';
import { reporters } from './reporters';

export const reviewActionEnum = pgEnum('review_action', [
  'approved',
  'rejected',
  'revision_requested',
  'flagged_duplicate',
]);

export const reviewLogs = pgTable('review_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id),
  reviewerId: uuid('reviewer_id')
    .notNull()
    .references(() => reporters.id),
  action: reviewActionEnum('action').notNull(),
  feedback: text('feedback'),
  score: integer('score'),
  isDuplicate: boolean('is_duplicate').default(false),
  duplicateOfId: uuid('duplicate_of_id').references(() => articles.id),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at').defaultNow(),
});
