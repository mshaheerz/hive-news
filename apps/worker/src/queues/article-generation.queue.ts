import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import type { ProviderRegistry } from '@jaurnalist/ai/src/providers/registry';
import { processArticleGeneration } from '../processors/generate-article.processor';

export const ARTICLE_GENERATION_QUEUE = 'article-generation';

export interface ArticleGenerationJobData {
  companyId: string;
  categorySlug?: string;
  count?: number;
}

export function addGenerationJob(
  queue: Queue<ArticleGenerationJobData>,
  data: ArticleGenerationJobData,
) {
  return queue.add('generate', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}

export function addScheduledJob(
  queue: Queue<ArticleGenerationJobData>,
  cronExpr: string,
  data: ArticleGenerationJobData,
) {
  return queue.upsertJobScheduler(
    `scheduled-${data.companyId}`,
    { pattern: cronExpr },
    {
      name: 'generate-scheduled',
      data,
      opts: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    },
  );
}

export function addContinuousJob(
  queue: Queue<ArticleGenerationJobData>,
  intervalSec: number,
  data: ArticleGenerationJobData,
) {
  return queue.upsertJobScheduler(
    'continuous-generation',
    { every: intervalSec * 1000 },
    {
      name: 'generate-continuous',
      data,
      opts: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    },
  );
}

export function createArticleGenerationWorker(
  connection: ConnectionOptions,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
  registry: ProviderRegistry,
  reviewQueue: Queue,
) {
  const worker = new Worker<ArticleGenerationJobData>(
    ARTICLE_GENERATION_QUEUE,
    async (job) => {
      console.log(`[generate] Processing job ${job.id} for company ${job.data.companyId}`);
      const result = await processArticleGeneration(job.data, db, registry);
      console.log(`[generate] Job ${job.id} completed: ${result.length} articles`);

      // Queue review jobs for generated articles
      for (const article of result) {
        if (article.articleId) {
          await reviewQueue.add('review', {
            articleId: article.articleId,
            companyId: job.data.companyId,
          });
        }
      }

      return result;
    },
    {
      connection,
      concurrency: 2,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[generate] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
