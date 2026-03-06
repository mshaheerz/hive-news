import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { companies, reporters } from '@jaurnalist/db/schema';

export const companiesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(companies).orderBy(companies.name);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),

  getWithReporters: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const companyResult = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, input.id))
        .limit(1);

      const company = companyResult[0];
      if (!company) return null;

      const companyReporters = await ctx.db
        .select()
        .from(reporters)
        .where(eq(reporters.companyId, input.id))
        .orderBy(reporters.name);

      return { ...company, reporters: companyReporters };
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        description: z.string().optional(),
        defaultProviderId: z.string().uuid().optional(),
        defaultModelId: z.string().optional(),
        categories: z.array(z.string()).default([]),
        settings: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(companies)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          defaultProviderId: input.defaultProviderId,
          defaultModelId: input.defaultModelId,
          categories: input.categories,
          settings: input.settings,
        })
        .returning();

      return result[0]!;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        defaultProviderId: z.string().uuid().optional(),
        defaultModelId: z.string().optional(),
        categories: z.array(z.string()).optional(),
        settings: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const result = await ctx.db
        .update(companies)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(companies.id, id))
        .returning();

      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(companies).where(eq(companies.id, input.id));
      return { success: true };
    }),
});
