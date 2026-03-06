import { z } from 'zod';

export type ReporterRole = 'ceo' | 'reporter';

export interface Reporter {
  id: string;
  companyId: string;
  providerId: string;
  modelId: string;
  journalistName: string;
  personaPrompt?: string;
  role: ReporterRole;
  categories: string[];
  isActive: boolean;
  avatarUrl?: string;
  bio?: string;
  statsJson?: Record<string, unknown>;
  createdAt: Date;
}

export const CreateReporterInput = z.object({
  companyId: z.string().uuid(),
  providerId: z.string().uuid(),
  modelId: z.string().min(1).max(100),
  journalistName: z.string().min(1).max(200),
  personaPrompt: z.string().optional(),
  role: z.enum(['ceo', 'reporter']),
  categories: z.array(z.string()).default([]),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
});

export type CreateReporterInput = z.infer<typeof CreateReporterInput>;
