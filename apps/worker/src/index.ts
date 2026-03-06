import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import cron from 'node-cron';
import { createDb } from '@jaurnalist/db';
import { ProviderRegistry } from '@jaurnalist/ai/src/providers/registry';
import { providers } from '@jaurnalist/db/src/schema/providers';
import { companies } from '@jaurnalist/db/src/schema/companies';
import { eq } from 'drizzle-orm';

import { createArticleGenerationWorker, ARTICLE_GENERATION_QUEUE } from './queues/article-generation.queue';
import { createCeoReviewWorker, CEO_REVIEW_QUEUE } from './queues/ceo-review.queue';
import { createDuplicateDetectionWorker, DUPLICATE_DETECTION_QUEUE } from './queues/duplicate-detection.queue';
import { createPublishWorker, PUBLISH_QUEUE } from './queues/publish.queue';
import { setupScheduledMode } from './scheduler/cron';
import { setupContinuousMode } from './scheduler/continuous';

const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;
const WORKER_MODE = process.env.WORKER_MODE ?? 'scheduled';
const INTERVAL_SECONDS = parseInt(process.env.INTERVAL_SECONDS ?? '1800', 10);

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const db = createDb(DATABASE_URL);

async function buildProviderRegistry() {
  const registry = new ProviderRegistry();
  const allProviders = await db.select().from(providers);

  for (const p of allProviders) {
    registry.add({
      id: p.id,
      type: p.type,
      apiKey: p.apiKeyEnc ?? undefined,
      baseUrl: p.baseUrl ?? undefined,
    });
  }

  return registry;
}

async function main() {
  console.log('[worker] Starting jaurnalist worker...');
  console.log(`[worker] Mode: ${WORKER_MODE}`);
  console.log(`[worker] Interval: ${INTERVAL_SECONDS}s`);

  const registry = await buildProviderRegistry();
  console.log(`[worker] Loaded ${registry.list().length} AI providers`);

  const activeCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.isActive, true));
  console.log(`[worker] Found ${activeCompanies.length} active companies`);

  if (REDIS_URL) {
    console.log('[worker] Redis detected, using BullMQ queues');

    const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

    const articleQueue = new Queue(ARTICLE_GENERATION_QUEUE, { connection });
    const reviewQueue = new Queue(CEO_REVIEW_QUEUE, { connection });
    const dupeQueue = new Queue(DUPLICATE_DETECTION_QUEUE, { connection });
    const publishQueue = new Queue(PUBLISH_QUEUE, { connection });

    const workers = [
      createArticleGenerationWorker(connection, db, registry, reviewQueue),
      createCeoReviewWorker(connection, db, registry, publishQueue),
      createDuplicateDetectionWorker(connection, db),
      createPublishWorker(connection, db),
    ];

    if (WORKER_MODE === 'continuous') {
      await setupContinuousMode(db, articleQueue, INTERVAL_SECONDS);
    } else {
      await setupScheduledMode(db, articleQueue, INTERVAL_SECONDS);
    }

    console.log('[worker] All BullMQ workers started');

    const shutdown = async () => {
      console.log('\n[worker] Graceful shutdown initiated...');
      for (const worker of workers) {
        await worker.close();
      }
      await connection.quit();
      console.log('[worker] Shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } else {
    console.log('[worker] No Redis URL, falling back to node-cron scheduling');

    const { processArticleGeneration } = await import('./processors/generate-article.processor');

    const cronExpression = intervalToCron(INTERVAL_SECONDS);
    console.log(`[worker] Cron expression: ${cronExpression}`);

    const task = cron.schedule(cronExpression, async () => {
      console.log(`[worker] Cron tick at ${new Date().toISOString()}`);
      for (const company of activeCompanies) {
        try {
          await processArticleGeneration(
            { companyId: company.id },
            db,
            registry,
          );
        } catch (err) {
          console.error(`[worker] Error processing company ${company.slug}:`, err);
        }
      }
    });

    task.start();
    console.log('[worker] Cron scheduler started');

    const shutdown = () => {
      console.log('\n[worker] Graceful shutdown initiated...');
      task.stop();
      console.log('[worker] Shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

function intervalToCron(seconds: number): string {
  if (seconds < 60) {
    return `*/${seconds} * * * * *`;
  }
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `*/${minutes} * * * *`;
  }
  const hours = Math.max(1, Math.round(minutes / 60));
  return `0 */${hours} * * *`;
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
