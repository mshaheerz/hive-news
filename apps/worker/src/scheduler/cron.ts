import { Queue } from 'bullmq';
import { eq } from 'drizzle-orm';
import { companies } from '@jaurnalist/db/schema';
import { addScheduledJob, type ArticleGenerationJobData } from '../queues/article-generation.queue';

/**
 * Set up scheduled mode: one repeatable BullMQ job per active company,
 * firing every `intervalSeconds`.
 */
export async function setupScheduledMode(
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
  queue: Queue<ArticleGenerationJobData>,
  intervalSeconds: number,
): Promise<void> {
  const activeCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.isActive, true));

  if (activeCompanies.length === 0) {
    console.log('[scheduler] No active companies found, skipping schedule setup');
    return;
  }

  // Convert interval to cron expression
  const cronExpr = intervalToCron(intervalSeconds);
  console.log(`[scheduler] Setting up scheduled mode: ${cronExpr} for ${activeCompanies.length} companies`);

  for (const company of activeCompanies) {
    await addScheduledJob(queue, cronExpr, { companyId: company.id });
    console.log(`[scheduler] Scheduled generation for company: ${company.name} (${company.slug})`);
  }

  console.log('[scheduler] Scheduled mode setup complete');
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
