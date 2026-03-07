import { workflowLogs } from '@jaurnalist/db/schema';

type CreateDbReturn = ReturnType<typeof import('@jaurnalist/db').createDb>;

export type WorkflowLogMetadata = Record<string, unknown>;

export interface WorkflowLogInput {
  companyId: string;
  event: string;
  message: string;
  reporterId?: string | null;
  metadata?: WorkflowLogMetadata | null;
}

export async function logWorkflowEvent(db: CreateDbReturn, input: WorkflowLogInput) {
  if (!db) return;
  try {
    await db.insert(workflowLogs).values({
      companyId: input.companyId,
      reporterId: input.reporterId ?? null,
      event: input.event,
      message: input.message,
      metadata: input.metadata ?? null,
    });
  } catch (err) {
    console.warn('[workflow-log] failed to record event', err);
  }
}
