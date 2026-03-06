import { router } from './trpc';
import { articlesRouter } from './routers/articles';
import { companiesRouter } from './routers/companies';
import { reportersRouter } from './routers/reporters';
import { providersRouter } from './routers/providers';
import { settingsRouter } from './routers/settings';
import { dashboardRouter } from './routers/dashboard';

export const appRouter = router({
  articles: articlesRouter,
  companies: companiesRouter,
  reporters: reportersRouter,
  providers: providersRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
