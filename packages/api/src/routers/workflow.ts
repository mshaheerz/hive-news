import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import type { Context } from '../context';
import { settings, companies } from '@jaurnalist/db/schema';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

const ARTICLE_GENERATION_QUEUE = 'article-generation';

let generationQueue: Queue | null = null;

function getGenerationQueue() {
  if (generationQueue) return generationQueue;
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  generationQueue = new Queue(ARTICLE_GENERATION_QUEUE, { connection });
  return generationQueue;
}

const workflowModeEnum = z.enum(['scheduled', 'continuous', 'on-demand']);

const upsertSetting = async (ctx: Context, key: string, value: string) => {
  await ctx.db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });
};

export const workflowRouter = router({
  status: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'workflow_running'))
      .limit(1);

    const modeRow = await ctx.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'workflow_mode'))
      .limit(1);

    const intervalRow = await ctx.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'workflow_interval'))
      .limit(1);

    const running = rows[0] ? rows[0].value === 'true' : true;
    const mode = (modeRow[0]?.value as string | undefined) ?? 'scheduled';
    const interval = intervalRow[0] ? Number(intervalRow[0].value) || 300 : 300;

    return { running, mode, interval };
  }),

  start: publicProcedure
    .input(
      z.object({
        mode: workflowModeEnum,
        intervalSeconds: z.number().min(10).default(300),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        upsertSetting(ctx, 'workflow_running', 'true'),
        upsertSetting(ctx, 'workflow_mode', input.mode),
        upsertSetting(ctx, 'workflow_interval', input.intervalSeconds.toString()),
      ]);

      const activeCompanies = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.isActive, true));

      if (activeCompanies.length === 0) {
        return { companyCount: 0, queued: 0 };
      }

      const queue = getGenerationQueue();
      await Promise.all(
        activeCompanies.map((company) =>
          queue.add('generate', { companyId: company.id }, { removeOnComplete: 100, removeOnFail: 200 }),
        ),
      );

      return { companyCount: activeCompanies.length, queued: activeCompanies.length };
    }),

  stop: publicProcedure.mutation(async ({ ctx }) => {
    await upsertSetting(ctx, 'workflow_running', 'false');
    return { stopped: true };
  }),
});
