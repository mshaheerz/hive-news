import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const apiTokens = pgTable('api_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  prefix: varchar('prefix', { length: 8 }).notNull(),
  scopes: text('scopes').array(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
