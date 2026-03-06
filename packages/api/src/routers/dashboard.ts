import { z } from 'zod';
import { eq, sql, and, gte } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { articles, reporters, companies, generationLogs } from '@jaurnalist/db/schema';

export const dashboardRouter = router({
  stats: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
        since: z.date().optional(),
      }).default({}),
    )
    .query(async ({ ctx, input }) => {
      const articleConditions = [];
      if (input.companyId) {
        articleConditions.push(eq(articles.companyId, input.companyId));
      }
      if (input.since) {
        articleConditions.push(gte(articles.createdAt, input.since));
      }

      const articleWhere = articleConditions.length > 0 ? and(...articleConditions) : undefined;

      const [articleStats, reporterStats, companyStats] = await Promise.all([
        ctx.db
          .select({
            total: sql<number>`count(*)`,
            published: sql<number>`count(*) filter (where ${articles.status} = 'published')`,
            draft: sql<number>`count(*) filter (where ${articles.status} = 'draft')`,
            rejected: sql<number>`count(*) filter (where ${articles.status} = 'rejected')`,
            failed: sql<number>`count(*) filter (where ${articles.status} = 'failed')`,
            totalTokens: sql<number>`coalesce(sum(${articles.tokenCount}), 0)`,
            avgTokens: sql<number>`coalesce(avg(${articles.tokenCount}), 0)`,
          })
          .from(articles)
          .where(articleWhere),

        ctx.db
          .select({
            total: sql<number>`count(*)`,
            active: sql<number>`count(*) filter (where ${reporters.isActive} = true)`,
          })
          .from(reporters),

        ctx.db
          .select({
            total: sql<number>`count(*)`,
          })
          .from(companies),
      ]);

      return {
        articles: articleStats[0] ?? {
          total: 0,
          published: 0,
          draft: 0,
          rejected: 0,
          failed: 0,
          totalTokens: 0,
          avgTokens: 0,
        },
        reporters: reporterStats[0] ?? { total: 0, active: 0 },
        companies: companyStats[0] ?? { total: 0 },
      };
    }),

  agentStatus: publicProcedure.query(async ({ ctx }) => {
    // Check for recent generation activity (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeGenerations = await ctx.db
      .select({
        id: generationLogs.id,
        companyId: generationLogs.companyId,
        status: generationLogs.status,
        startedAt: generationLogs.startedAt,
        articlesGenerated: generationLogs.articlesGenerated,
      })
      .from(generationLogs)
      .where(
        and(
          eq(generationLogs.status, 'running'),
          gte(generationLogs.startedAt, fiveMinutesAgo),
        ),
      )
      .orderBy(generationLogs.startedAt);

    return {
      isGenerating: activeGenerations.length > 0,
      activeGenerations,
    };
  }),
});
