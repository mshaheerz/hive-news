export { appRouter, type AppRouter } from './root';
export { createContext, type Context, type Database } from './context';
export { createCallerFactory } from './trpc';

// Re-export routers for direct access if needed
export { articlesRouter } from './routers/articles';
export { companiesRouter } from './routers/companies';
export { reportersRouter } from './routers/reporters';
export { providersRouter } from './routers/providers';
export { settingsRouter } from './routers/settings';
export { dashboardRouter } from './routers/dashboard';
export { categoriesRouter } from './routers/categories';

// Re-export auth middleware
export { authenticatedProcedure, adminProcedure } from './middleware/auth';
