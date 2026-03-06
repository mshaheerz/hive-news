import { eq } from 'drizzle-orm';
import { articles } from '@jaurnalist/db/src/schema/articles';
import type { PublishJobData } from '../queues/publish.queue';

interface PublishResult {
  articleId: string;
  title: string;
  slug: string;
  reporterId: string;
  categoryId: string;
  publishedAt: Date;
}

export async function processPublishArticle(
  data: PublishJobData,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
): Promise<PublishResult> {
  const { articleId } = data;

  // Fetch article
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article) {
    throw new Error(`Article not found: ${articleId}`);
  }

  if (article.status === 'published') {
    return {
      articleId: article.id,
      title: article.title,
      slug: article.slug,
      reporterId: article.reporterId,
      categoryId: article.categoryId,
      publishedAt: article.publishedAt ?? new Date(),
    };
  }

  const now = new Date();

  // Update article status to published
  await db
    .update(articles)
    .set({
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    })
    .where(eq(articles.id, articleId));

  return {
    articleId: article.id,
    title: article.title,
    slug: article.slug,
    reporterId: article.reporterId,
    categoryId: article.categoryId,
    publishedAt: now,
  };
}
