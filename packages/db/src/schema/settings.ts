import { pgTable, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  key: varchar('key', { length: 200 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
