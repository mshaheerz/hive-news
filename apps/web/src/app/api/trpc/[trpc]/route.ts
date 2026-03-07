import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@jaurnalist/api';
import { createDb } from '@jaurnalist/db';

const db = createDb(process.env.DATABASE_URL!);

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ db }),
  });

export { handler as GET, handler as POST };
