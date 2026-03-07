import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { categories } from '@jaurnalist/db/schema';

export const categoriesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
        icon: categories.icon,
      })
      .from(categories)
      .orderBy(categories.name);
    return rows;
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        color: z.string().min(4).max(7).optional(),
        icon: z.string().max(4).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(categories).values(input).returning();
      return row;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        slug: z.string().min(1),
        color: z.string().min(4).max(7).optional(),
        icon: z.string().max(4).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(categories)
        .set({
          name: input.name,
          slug: input.slug,
          color: input.color,
          icon: input.icon,
        })
        .where(eq(categories.id, input.id))
        .returning();
      return row;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
      return { deletedId: input.id };
    }),
});
