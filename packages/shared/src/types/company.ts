import { z } from 'zod';

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ceoId?: string;
  isActive: boolean;
  createdAt: Date;
}

export const CreateCompanyInput = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  ceoId: z.string().uuid().optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanyInput>;
