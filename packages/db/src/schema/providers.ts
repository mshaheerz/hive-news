import { pgTable, pgEnum, uuid, varchar, text, boolean, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const providerTypeEnum = pgEnum('provider_type', [
  'openai',
  'anthropic',
  'google',
  'groq',
  'openrouter',
  'ollama',
]);

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: providerTypeEnum('type').notNull(),
  baseUrl: text('base_url'),
  apiKeyEnc: text('api_key_enc'),
  isLocal: boolean('is_local').default(false),
  maxRpm: integer('max_rpm').default(60),
  configJson: jsonb('config_json'),
  createdAt: timestamp('created_at').defaultNow(),
});
