import { z } from 'zod';
import { eq, sql, and } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { reporters, articles } from '@jaurnalist/db/schema';

export const reportersRouter = router({
  list: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
      }).default({}),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.companyId) {
        conditions.push(eq(reporters.companyId, input.companyId));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return ctx.db
        .select()
        .from(reporters)
        .where(where)
        .orderBy(reporters.journalistName);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(reporters)
        .where(eq(reporters.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),

  getStats: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const reporter = await ctx.db
        .select()
        .from(reporters)
        .where(eq(reporters.id, input.id))
        .limit(1);

      if (!reporter[0]) return null;

      const stats = await ctx.db
        .select({
          articleCount: sql<number>`count(*)`,
          avgTokens: sql<number>`coalesce(avg(${articles.tokensUsed}), 0)`,
          totalTokens: sql<number>`coalesce(sum(${articles.tokensUsed}), 0)`,
          publishedCount: sql<number>`count(*) filter (where ${articles.status} = 'published')`,
          rejectedCount: sql<number>`count(*) filter (where ${articles.status} = 'rejected')`,
        })
        .from(articles)
        .where(eq(articles.reporterId, input.id));

      return {
        reporter: reporter[0],
        stats: stats[0] ?? {
          articleCount: 0,
          avgTokens: 0,
          totalTokens: 0,
          publishedCount: 0,
          rejectedCount: 0,
        },
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        journalistName: z.string().min(1).max(200),
        companyId: z.string().uuid(),
        providerId: z.string().uuid(),
        modelId: z.string().min(1).max(100),
        role: z.enum(['ceo', 'reporter']),
        personaPrompt: z.string().optional(),
        categories: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(reporters)
        .values({
          journalistName: input.journalistName,
          companyId: input.companyId,
          providerId: input.providerId,
          modelId: input.modelId,
          role: input.role,
          personaPrompt: input.personaPrompt,
          categories: input.categories,
          isActive: input.isActive,
          avatarUrl: input.avatarUrl,
          bio: input.bio,
        })
        .returning();

      return result[0]!;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        journalistName: z.string().min(1).max(200).optional(),
        providerId: z.string().uuid().optional(),
        modelId: z.string().optional(),
        role: z.enum(['ceo', 'reporter']).optional(),
        personaPrompt: z.string().optional(),
        categories: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const result = await ctx.db
        .update(reporters)
        .set(updates as any)
        .where(eq(reporters.id, id))
        .returning();

      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(reporters).where(eq(reporters.id, input.id));
      return { success: true };
    }),
});
