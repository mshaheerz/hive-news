import { Command } from 'commander';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { getDbUrl, loadConfig } from '../utils/config-file';
import { printError, printSuccess, printWarning } from '../utils/display';

export function registerStartCommand(program: Command) {
  program
    .command('start')
    .description('Start the article generation worker')
    .option('-m, --mode <mode>', 'Worker mode: scheduled or continuous', 'scheduled')
    .option('-i, --interval <seconds>', 'Interval in seconds between generation cycles', '1800')
    .option('-c, --companies <slugs>', 'Comma-separated company slugs to process')
    .action(async (opts) => {
      try {
        const config = await loadConfig();
        const dbUrl = getDbUrl(config);

        if (!dbUrl) {
          printError('Database URL not configured. Run `jaurnalist init` first.');
          process.exit(1);
        }

        const mode = opts.mode === 'continuous' ? 'continuous' : 'scheduled';
        const interval = parseInt(opts.interval, 10);

        if (isNaN(interval) || interval < 10) {
          printError('Interval must be a number >= 10 seconds');
          process.exit(1);
        }

        printWarning(`Starting worker in ${mode} mode (interval: ${interval}s)...`);

        const env: Record<string, string> = {
          ...process.env as Record<string, string>,
          DATABASE_URL: dbUrl,
          WORKER_MODE: mode,
          INTERVAL_SECONDS: String(interval),
        };

        if (config?.redis?.url) {
          env.REDIS_URL = config.redis.url;
        }

        if (opts.companies) {
          env.COMPANY_SLUGS = opts.companies;
        }

        // Spawn the worker process
        const workerPath = resolve(__dirname, '../../worker/src/index.ts');
        const child = spawn('npx', ['tsx', workerPath], {
          env,
          stdio: 'inherit',
          cwd: resolve(__dirname, '../../../'),
        });

        child.on('error', (err) => {
          printError(`Failed to start worker: ${err.message}`);
          process.exit(1);
        });

        child.on('exit', (code) => {
          if (code !== 0) {
            printError(`Worker exited with code ${code}`);
            process.exit(code ?? 1);
          }
          printSuccess('Worker stopped');
        });

        // Forward signals to child
        const forwardSignal = (signal: NodeJS.Signals) => {
          child.kill(signal);
        };
        process.on('SIGINT', () => forwardSignal('SIGINT'));
        process.on('SIGTERM', () => forwardSignal('SIGTERM'));
      } catch (err) {
        printError(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    });
}
