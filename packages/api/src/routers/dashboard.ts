import { z } from 'zod';
import { eq, sql, and, gte, desc } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { articles, reporters, companies, reviewLogs } from '@jaurnalist/db/schema';
import { workflowLogs } from '@jaurnalist/db/schema';

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
            inReview: sql<number>`count(*) filter (where ${articles.status} = 'in_review')`,
            approved: sql<number>`count(*) filter (where ${articles.status} = 'approved')`,
            totalTokens: sql<number>`coalesce(sum(${articles.tokensUsed}), 0)`,
            avgTokens: sql<number>`coalesce(avg(${articles.tokensUsed}), 0)`,
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
          approved: 0,
          draft: 0,
          rejected: 0,
          inReview: 0,
          totalTokens: 0,
          avgTokens: 0,
        },
        reporters: reporterStats[0] ?? { total: 0, active: 0 },
        companies: companyStats[0] ?? { total: 0 },
      };
    }),

  agentStatus: publicProcedure.query(async () => {
    // TODO: Implement when generation_logs table is added
    return {
      isGenerating: false,
      activeGenerations: [],
    };
  }),

  logs: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(8),
      }),
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db
        .select({
          id: workflowLogs.id,
          event: workflowLogs.event,
          message: workflowLogs.message,
          metadata: workflowLogs.metadata,
          createdAt: workflowLogs.createdAt,
          companyId: workflowLogs.companyId,
          reporterId: workflowLogs.reporterId,
          companyName: companies.name,
          reporterName: reporters.journalistName,
        })
        .from(workflowLogs)
        .leftJoin(companies, eq(workflowLogs.companyId, companies.id))
        .leftJoin(reporters, eq(workflowLogs.reporterId, reporters.id))
        .orderBy(desc(workflowLogs.createdAt))
        .limit(input.limit);

      return entries.map((entry) => ({
        id: entry.id,
        event: entry.event,
        message: entry.message,
        metadata: entry.metadata ?? null,
        createdAt: entry.createdAt,
        companyId: entry.companyId,
        companyName: entry.companyName ?? 'Unknown',
        reporterId: entry.reporterId ?? undefined,
        reporterName: entry.reporterName ?? undefined,
      }));
    }),

  reviewLogs: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        action: z.enum(['approved', 'rejected', 'revision_requested', 'flagged_duplicate']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const actionCondition = input.action ? eq(reviewLogs.action, input.action) : undefined;

      const rows = await ctx.db
        .select({
          id: reviewLogs.id,
          action: reviewLogs.action,
          feedback: reviewLogs.feedback,
          score: reviewLogs.score,
          isDuplicate: reviewLogs.isDuplicate,
          createdAt: reviewLogs.createdAt,
          articleId: reviewLogs.articleId,
          articleTitle: articles.title,
          reviewerName: reporters.journalistName,
          companyName: companies.name,
        })
        .from(reviewLogs)
        .leftJoin(articles, eq(reviewLogs.articleId, articles.id))
        .leftJoin(reporters, eq(reviewLogs.reviewerId, reporters.id))
        .leftJoin(companies, eq(articles.companyId, companies.id))
        .where(actionCondition)
        .orderBy(desc(reviewLogs.createdAt))
        .limit(input.limit);

      return rows.map((row) => ({
        id: row.id,
        action: row.action,
        feedback: row.feedback ?? null,
        score: row.score ?? null,
        isDuplicate: row.isDuplicate,
        createdAt: row.createdAt,
        articleId: row.articleId,
        articleTitle: row.articleTitle ?? 'Untitled',
        reviewerName: row.reviewerName ?? 'CEO',
        companyName: row.companyName ?? 'Unknown',
      }));
    }),
});
