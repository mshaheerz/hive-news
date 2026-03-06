import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { processDetectDuplicates } from '../processors/detect-duplicates.processor';

export const DUPLICATE_DETECTION_QUEUE = 'duplicate-detection';

export interface DuplicateDetectionJobData {
  articleId: string;
}

export function addDuplicateCheckJob(
  queue: Queue<DuplicateDetectionJobData>,
  data: DuplicateDetectionJobData,
) {
  return queue.add('check-duplicate', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}

export function createDuplicateDetectionWorker(
  connection: ConnectionOptions,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
) {
  const worker = new Worker<DuplicateDetectionJobData>(
    DUPLICATE_DETECTION_QUEUE,
    async (job) => {
      console.log(`[dedup] Checking duplicates for article ${job.data.articleId}`);
      const result = await processDetectDuplicates(job.data, db);
      console.log(`[dedup] Article ${job.data.articleId}: similarity=${result.similarity.toFixed(3)}, isDuplicate=${result.isDuplicate}`);
      return result;
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[dedup] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
