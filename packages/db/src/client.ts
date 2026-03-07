import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

type PostgresSslMode = 'disable' | 'allow' | 'prefer' | 'require' | 'verify-ca' | 'verify-full';

function resolveSslMode(): boolean | PostgresSslMode {
  const raw = (process.env.DATABASE_SSL_MODE ?? 'require').toLowerCase();

  if (raw === 'false' || raw === 'disable') {
    return false;
  }

  if (raw === 'true') {
    return 'require';
  }

  const allowed: PostgresSslMode[] = ['allow', 'prefer', 'require', 'verify-ca', 'verify-full'];
  if (allowed.includes(raw as PostgresSslMode)) {
    return raw as PostgresSslMode;
  }

  return 'require';
}

export function createDb(connectionString: string) {
  const ssl = resolveSslMode();
  const client = postgres(connectionString, { ssl });
  return drizzle({ client, schema });
}

const connectionString = process.env.DATABASE_URL;
export const db = connectionString ? createDb(connectionString) : null;
