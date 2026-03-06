import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { settings } from '@jaurnalist/db/schema';

export const settingsRouter = router({
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key))
        .limit(1);

      return result[0] ?? null;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(settings).orderBy(settings.key);

    // Return as a key-value map for convenience
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }),

  update: publicProcedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert: insert or update on conflict
      const result = await ctx.db
        .insert(settings)
        .values({
          key: input.key,
          value: input.value,
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: input.value,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result[0]!;
    }),

  getWorkflowMode: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'workflow_mode'))
      .limit(1);

    const mode = result[0]?.value ?? 'autonomous';
    return mode as 'autonomous' | 'supervised' | 'manual';
  }),
});
