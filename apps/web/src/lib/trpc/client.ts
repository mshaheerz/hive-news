import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@jaurnalist/api';

export const trpc = createTRPCReact<AppRouter>();
