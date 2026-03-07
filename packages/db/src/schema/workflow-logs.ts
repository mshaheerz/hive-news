import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { reporters } from './reporters';

export const workflowLogs = pgTable('workflow_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id),
  reporterId: uuid('reporter_id').references(() => reporters.id).default(null),
  event: text('event').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
