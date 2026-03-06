import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import type { ProviderRegistry } from '@jaurnalist/ai/src/providers/registry';
import { processReviewArticle } from '../processors/review-article.processor';

export const CEO_REVIEW_QUEUE = 'ceo-review';

export interface CeoReviewJobData {
  articleId: string;
  companyId: string;
}

export function addReviewJob(
  queue: Queue<CeoReviewJobData>,
  data: CeoReviewJobData,
) {
  return queue.add('review', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}

export function createCeoReviewWorker(
  connection: ConnectionOptions,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
  registry: ProviderRegistry,
  publishQueue: Queue,
) {
  const worker = new Worker<CeoReviewJobData>(
    CEO_REVIEW_QUEUE,
    async (job) => {
      console.log(`[review] Processing review for article ${job.data.articleId}`);
      const result = await processReviewArticle(job.data, db, registry);
      console.log(`[review] Article ${job.data.articleId}: ${result.action}`);

      if (result.action === 'approved') {
        await publishQueue.add('publish', { articleId: job.data.articleId });
      }

      return result;
    },
    {
      connection,
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[review] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
