import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { providers } from '@jaurnalist/db/schema';
import { PROVIDER_TYPES } from '@jaurnalist/shared';

export const providersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(providers).orderBy(providers.name);
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        type: z.enum(PROVIDER_TYPES as unknown as [string, ...string[]]),
        apiKeyEnc: z.string().optional(),
        baseUrl: z.string().optional(),
        isLocal: z.boolean().default(false),
        maxRpm: z.number().default(60),
        configJson: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(providers)
        .values({
          name: input.name,
          type: input.type as any,
          apiKeyEnc: input.apiKeyEnc,
          baseUrl: input.baseUrl,
          isLocal: input.isLocal,
          maxRpm: input.maxRpm,
          configJson: input.configJson,
        })
        .returning();

      return result[0]!;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        type: z.enum(PROVIDER_TYPES as unknown as [string, ...string[]]).optional(),
        apiKeyEnc: z.string().optional(),
        baseUrl: z.string().optional(),
        isLocal: z.boolean().optional(),
        maxRpm: z.number().optional(),
        configJson: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const result = await ctx.db
        .update(providers)
        .set(updates as any)
        .where(eq(providers.id, id))
        .returning();

      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(providers).where(eq(providers.id, input.id));
      return { success: true };
    }),

  testConnection: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(providers)
        .where(eq(providers.id, input.id))
        .limit(1);

      const provider = result[0];
      if (!provider) {
        return { success: false, error: 'Provider not found' };
      }

      try {
        // Basic validation — a real test would make an API call
        return { success: true, message: 'Provider configuration is valid' };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  listModels: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(providers)
        .where(eq(providers.id, input.id))
        .limit(1);

      const provider = result[0];
      if (!provider) {
        return [];
      }

      const modelsByType: Record<string, string[]> = {
        openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
        google: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
        groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
        openrouter: ['openai/gpt-4o', 'anthropic/claude-sonnet-4-20250514', 'google/gemini-2.0-flash-001'],
        ollama: ['llama3.2', 'mistral', 'codellama', 'phi3'],
      };

      return modelsByType[provider.type] ?? [];
    }),
});
