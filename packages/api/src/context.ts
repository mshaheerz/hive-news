import type { createDb } from '@jaurnalist/db';

export type Database = ReturnType<typeof createDb>;

export interface Context {
  db: Database;
}

export function createContext(opts: { db: Database }): Context {
  return {
    db: opts.db,
  };
}
