import type { db } from '@jaurnalist/db';

export type Database = typeof db;

export interface Context {
  db: Database;
}

export function createContext(opts: { db: Database }): Context {
  return {
    db: opts.db,
  };
}
