import { pgTable, pgEnum, uuid, varchar, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { providers } from './providers';

export const reporterRoleEnum = pgEnum('reporter_role', ['ceo', 'reporter']);

export const reporters = pgTable('reporters', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id),
  providerId: uuid('provider_id')
    .notNull()
    .references(() => providers.id),
  modelId: varchar('model_id', { length: 100 }).notNull(),
  journalistName: varchar('journalist_name', { length: 200 }).notNull(),
  personaPrompt: text('persona_prompt'),
  role: reporterRoleEnum('role').notNull(),
  categories: text('categories').array(),
  isActive: boolean('is_active').default(true),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  statsJson: jsonb('stats_json'),
  createdAt: timestamp('created_at').defaultNow(),
});
