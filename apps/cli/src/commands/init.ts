import { Command } from 'commander';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { printSuccess, printError, printWarning } from '../utils/display';
import { loadConfig, saveConfig, type JaurnalistConfig } from '../utils/config-file';

const CONFIG_DIR = join(homedir(), '.jaurnalist');
const CONFIG_PATH = join(CONFIG_DIR, 'config.toml');

export function registerInitCommand(program: Command) {
  program
    .command('init')
    .description('Initialize jaurnalist configuration and database')
    .option('--db-url <url>', 'PostgreSQL connection string')
    .option('--redis-url <url>', 'Redis connection string (optional)')
    .option('--central-api <url>', 'Central API URL (optional)')
    .action(async (opts) => {
      try {
        const dbUrl = opts.dbUrl ?? process.env.DATABASE_URL;
        if (!dbUrl) {
          printError('Database URL is required. Use --db-url or set DATABASE_URL env var.');
          process.exit(1);
        }

        // Create config directory
        await mkdir(CONFIG_DIR, { recursive: true });

        // Build config
        const config: JaurnalistConfig = {
          database: {
            url: dbUrl,
          },
          redis: opts.redisUrl ? { url: opts.redisUrl } : undefined,
          api: opts.centralApi ? { url: opts.centralApi } : undefined,
          worker: {
            mode: 'scheduled',
            intervalSeconds: 1800,
          },
        };

        // Write config file
        await saveConfig(config);
        printSuccess(`Configuration saved to ${CONFIG_PATH}`);

        // Run database migrations
        printWarning('Running database migrations...');
        const { createDb } = await import('@jaurnalist/db');
        const db = createDb(dbUrl);

        // Create default categories
        const { DEFAULT_CATEGORIES } = await import('@jaurnalist/shared');
        const { categories } = await import('@jaurnalist/db/src/schema/categories');

        for (const cat of DEFAULT_CATEGORIES) {
          try {
            await db.insert(categories).values({
              name: cat.name,
              slug: cat.slug,
              color: cat.color,
              icon: cat.icon,
            }).onConflictDoNothing();
          } catch {
            // Category may already exist
          }
        }

        printSuccess('Default categories created');
        printSuccess('Initialization complete! Run `jaurnalist status` to verify.');
      } catch (err) {
        printError(`Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    });
}
