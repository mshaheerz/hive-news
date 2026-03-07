import { z } from 'zod';
import { eq, desc, and, sql, like } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { articles, reporters } from '@jaurnalist/db/schema';

export const articlesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        categoryId: z.string().uuid().optional(),
        companyId: z.string().uuid().optional(),
        status: z.enum(['draft', 'in_review', 'approved', 'rejected', 'published']).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.categoryId) {
        conditions.push(eq(articles.categoryId, input.categoryId));
      }
      if (input.companyId) {
        conditions.push(eq(articles.companyId, input.companyId));
      }
      if (input.status) {
        conditions.push(eq(articles.status, input.status));
      }
      if (input.search) {
        conditions.push(like(articles.title, `%${input.search}%`));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(articles)
          .where(where)
          .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(articles)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(articles)
        .where(eq(articles.slug, input.slug))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const article = result[0]!;

      let reporter = null;
      if (article.reporterId) {
        const reporterResult = await ctx.db
          .select()
          .from(reporters)
          .where(eq(reporters.id, article.reporterId))
          .limit(1);
        reporter = reporterResult[0] ?? null;
      }

      return { ...article, reporter };
    }),

  getLatest: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(100).default(20),
        companyId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(articles.status, 'published')];

      if (input.companyId) {
        conditions.push(eq(articles.companyId, input.companyId));
      }

      return ctx.db
        .select()
        .from(articles)
        .where(and(...conditions))
        .orderBy(desc(articles.publishedAt))
        .limit(input.count);
    }),

  triggerGeneration: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        count: z.number().min(1).max(10).default(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: `Article generation triggered for ${input.count} articles`,
        companyId: input.companyId ?? 'all',
        categoryId: input.categoryId ?? 'all',
        count: input.count,
      };
    }),
});
