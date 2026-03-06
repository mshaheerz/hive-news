import { TRPCError } from '@trpc/server';
import { t } from '../trpc';

/**
 * Auth middleware for future use.
 * Currently passes through all requests.
 */

/**
 * Middleware that checks for an authenticated session.
 * For now, this is a passthrough that can be extended later.
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  // TODO: Implement actual authentication check
  // For now, pass through all requests
  return next({
    ctx: {
      ...ctx,
    },
  });
});

/**
 * Middleware that checks for admin privileges.
 * For now, this is a passthrough that can be extended later.
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  // TODO: Implement actual admin check
  // For now, pass through all requests
  return next({
    ctx: {
      ...ctx,
    },
  });
});

/** Procedure that requires authentication */
export const authenticatedProcedure = t.procedure.use(isAuthenticated);

/** Procedure that requires admin privileges */
export const adminProcedure = t.procedure.use(isAdmin);
