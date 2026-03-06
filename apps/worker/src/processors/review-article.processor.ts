import { eq, and, desc } from 'drizzle-orm';
import type { ProviderRegistry } from '@jaurnalist/ai/src/providers/registry';
import { CEOAgent } from '@jaurnalist/ai/src/agents/ceo-agent';
import { articles } from '@jaurnalist/db/src/schema/articles';
import { reporters } from '@jaurnalist/db/src/schema/reporters';
import { reviewLogs } from '@jaurnalist/db/src/schema/review-logs';
import type { CeoReviewJobData } from '../queues/ceo-review.queue';
import type { ReviewAction } from '@jaurnalist/shared';

interface ReviewResult {
  action: ReviewAction;
  score: number;
  feedback: string;
}

export async function processReviewArticle(
  data: CeoReviewJobData,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
  registry: ProviderRegistry,
): Promise<ReviewResult> {
  const { articleId, companyId } = data;

  // Fetch article
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article) {
    throw new Error(`Article not found: ${articleId}`);
  }

  // Fetch CEO
  const [ceo] = await db
    .select()
    .from(reporters)
    .where(and(eq(reporters.companyId, companyId), eq(reporters.role, 'ceo')))
    .limit(1);

  if (!ceo) {
    throw new Error(`No CEO reporter found for company: ${companyId}`);
  }

  // Get recent titles for context
  const recentArticles = await db
    .select({ title: articles.title })
    .from(articles)
    .where(eq(articles.companyId, companyId))
    .orderBy(desc(articles.createdAt))
    .limit(20);

  const recentTitles = recentArticles.map((a) => a.title);

  // Create CEO agent and run review
  const ceoModel = registry.getModel(ceo.providerId, ceo.modelId);
  const systemPrompt = ceo.personaPrompt ?? `You are the editor-in-chief. Review articles for quality, accuracy, and newsworthiness.`;
  const ceoAgent = new CEOAgent(ceoModel, systemPrompt);

  const review = await ceoAgent.reviewArticle({
    article: {
      title: article.title,
      content: article.content,
      summary: article.summary ?? '',
    },
    recentTitles,
  });

  // Map review decision to action
  const action: ReviewAction = review.decision === 'approved'
    ? 'approved'
    : review.decision === 'rejected'
      ? 'rejected'
      : 'revision_requested';

  // Update article status
  const newStatus = action === 'approved' ? 'approved' as const : action === 'rejected' ? 'rejected' as const : 'in_review' as const;

  await db
    .update(articles)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(articles.id, articleId));

  // Save review log
  await db.insert(reviewLogs).values({
    articleId,
    reviewerId: ceo.id,
    action,
    feedback: review.feedback,
    score: review.score,
    isDuplicate: false,
  });

  return {
    action,
    score: review.score,
    feedback: review.feedback,
  };
}
