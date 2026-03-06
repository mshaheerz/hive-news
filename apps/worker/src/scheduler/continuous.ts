import { Queue } from 'bullmq';
import { eq, sql } from 'drizzle-orm';
import { companies } from '@jaurnalist/db/src/schema/companies';
import { categories } from '@jaurnalist/db/src/schema/categories';
import { addContinuousJob, type ArticleGenerationJobData } from '../queues/article-generation.queue';

// Track rotation state to ensure coverage across companies and categories
let companyIndex = 0;
let categoryIndex = 0;

/**
 * Set up continuous mode: a single repeatable BullMQ job that fires every
 * `intervalSeconds`. Each fire picks the next company and category in
 * rotation to ensure coverage.
 */
export async function setupContinuousMode(
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
  queue: Queue<ArticleGenerationJobData>,
  intervalSeconds: number,
): Promise<void> {
  const activeCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.isActive, true));

  if (activeCompanies.length === 0) {
    console.log('[scheduler] No active companies found, skipping continuous setup');
    return;
  }

  const allCategories = await db.select().from(categories);

  console.log(`[scheduler] Setting up continuous mode: every ${intervalSeconds}s`);
  console.log(`[scheduler] Rotating across ${activeCompanies.length} companies and ${allCategories.length} categories`);

  // Use a custom processor wrapper via the repeatable job
  // The job data will contain the next company to process
  // We pick the first company to start
  const firstCompany = activeCompanies[0]!;
  const firstCategory = allCategories.length > 0 ? allCategories[0]! : undefined;

  await addContinuousJob(queue, intervalSeconds, {
    companyId: firstCompany.id,
    categorySlug: firstCategory?.slug,
    count: 1,
  });

  // Set up a listener to rotate on each completion
  queue.on('completed', async () => {
    try {
      // Advance rotation
      categoryIndex = (categoryIndex + 1) % Math.max(allCategories.length, 1);
      if (categoryIndex === 0) {
        companyIndex = (companyIndex + 1) % activeCompanies.length;
      }

      const nextCompany = activeCompanies[companyIndex]!;
      const nextCategory = allCategories.length > 0
        ? allCategories[categoryIndex]!
        : undefined;

      // Update the repeatable job data for the next iteration
      await addContinuousJob(queue, intervalSeconds, {
        companyId: nextCompany.id,
        categorySlug: nextCategory?.slug,
        count: 1,
      });
    } catch (err) {
      console.error('[scheduler] Error rotating continuous job:', err);
    }
  });

  console.log('[scheduler] Continuous mode setup complete');
}
