import { eq, desc, ne, and, sql } from 'drizzle-orm';
import { articles } from '@jaurnalist/db/src/schema/articles';
import { cosineSimilarity } from '@jaurnalist/ai/src/utils/dedup';
import type { DuplicateDetectionJobData } from '../queues/duplicate-detection.queue';

interface DuplicateResult {
  isDuplicate: boolean;
  similarity: number;
  duplicateOfId?: string;
  duplicateOfTitle?: string;
}

export async function processDetectDuplicates(
  data: DuplicateDetectionJobData,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
): Promise<DuplicateResult> {
  const { articleId } = data;

  // Fetch the target article
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article) {
    throw new Error(`Article not found: ${articleId}`);
  }

  // TODO: When pgvector embedding column is added, use vector similarity search
  // For now, use a simple text-based comparison with recent articles

  // Fetch recent articles from the same company for comparison
  const recentArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      companyId: articles.companyId,
    })
    .from(articles)
    .where(
      and(
        eq(articles.companyId, article.companyId),
        ne(articles.id, articleId),
      ),
    )
    .orderBy(desc(articles.createdAt))
    .limit(50);

  if (recentArticles.length === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  // Simple word-frequency based similarity as fallback
  // In production, this would use pgvector embeddings
  const targetWords = extractWordFrequency(article.title + ' ' + article.content);

  let maxSimilarity = 0;
  let duplicateOfId: string | undefined;
  let duplicateOfTitle: string | undefined;

  for (const recent of recentArticles) {
    const recentWords = extractWordFrequency(recent.title + ' ' + recent.content);
    const similarity = wordFrequencySimilarity(targetWords, recentWords);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      duplicateOfId = recent.id;
      duplicateOfTitle = recent.title;
    }
  }

  const DUPLICATE_THRESHOLD = 0.85;

  return {
    isDuplicate: maxSimilarity >= DUPLICATE_THRESHOLD,
    similarity: maxSimilarity,
    duplicateOfId: maxSimilarity >= DUPLICATE_THRESHOLD ? duplicateOfId : undefined,
    duplicateOfTitle: maxSimilarity >= DUPLICATE_THRESHOLD ? duplicateOfTitle : undefined,
  };
}

function extractWordFrequency(text: string): Map<string, number> {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
}

function wordFrequencySimilarity(a: Map<string, number>, b: Map<string, number>): number {
  const allKeys = new Set([...a.keys(), ...b.keys()]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of allKeys) {
    const valA = a.get(key) ?? 0;
    const valB = b.get(key) ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
