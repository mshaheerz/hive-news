import { router } from './trpc';
import { articlesRouter } from './routers/articles';
import { companiesRouter } from './routers/companies';
import { reportersRouter } from './routers/reporters';
import { providersRouter } from './routers/providers';
import { settingsRouter } from './routers/settings';
import { dashboardRouter } from './routers/dashboard';
import { workflowRouter } from './routers/workflow';
import { categoriesRouter } from './routers/categories';

export const appRouter = router({
  articles: articlesRouter,
  companies: companiesRouter,
  reporters: reportersRouter,
  providers: providersRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
  workflow: workflowRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
