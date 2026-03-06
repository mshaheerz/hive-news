import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const federationInstances = pgTable('federation_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  apiUrl: text('api_url').notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  lastSeenAt: timestamp('last_seen_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
