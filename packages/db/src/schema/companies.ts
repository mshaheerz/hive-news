import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  ceoId: uuid('ceo_id'), // FK to reporters, nullable initially due to circular reference
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
