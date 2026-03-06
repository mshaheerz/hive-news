import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { processPublishArticle } from '../processors/publish-article.processor';

export const PUBLISH_QUEUE = 'publish';
export const ARTICLES_PUBLISHED_CHANNEL = 'articles:published';

export interface PublishJobData {
  articleId: string;
}

export function addPublishJob(
  queue: Queue<PublishJobData>,
  data: PublishJobData,
) {
  return queue.add('publish', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 200,
    removeOnFail: 500,
  });
}

export function createPublishWorker(
  connection: ConnectionOptions,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
) {
  // Create a separate Redis connection for PUB/SUB publishing
  const redisUrl = process.env.REDIS_URL;
  const pubClient = redisUrl ? new IORedis(redisUrl) : null;

  const worker = new Worker<PublishJobData>(
    PUBLISH_QUEUE,
    async (job) => {
      console.log(`[publish] Publishing article ${job.data.articleId}`);
      const result = await processPublishArticle(job.data, db);
      console.log(`[publish] Article ${job.data.articleId} published: ${result.title}`);

      // Publish SSE event via Redis PUB/SUB
      if (pubClient) {
        const event = JSON.stringify({
          event: 'article:published',
          data: {
            articleId: result.articleId,
            title: result.title,
            slug: result.slug,
            reporterId: result.reporterId,
            categoryId: result.categoryId,
          },
        });
        await pubClient.publish(ARTICLES_PUBLISHED_CHANNEL, event);
        console.log(`[publish] Published event to ${ARTICLES_PUBLISHED_CHANNEL}`);
      }

      return result;
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[publish] Job ${job?.id} failed:`, err.message);
  });

  worker.on('closed', async () => {
    if (pubClient) {
      await pubClient.quit();
    }
  });

  return worker;
}
