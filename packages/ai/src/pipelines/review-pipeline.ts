import type { CEOAgent, ReviewResult } from '../agents/ceo-agent';
import type { ArticleOutput } from '../agents/reporter-agent';
import { cosineSimilarity } from '../utils/dedup';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  duplicateOf?: string;
}

/**
 * Review an article using the CEO agent.
 * Optionally includes duplicate checking context.
 */
export async function reviewArticle(
  ceoAgent: CEOAgent,
  article: ArticleOutput,
  recentArticles: Array<{ title: string }> = [],
  duplicateScore?: number,
): Promise<ReviewResult> {
  return ceoAgent.reviewArticle({
    article,
    duplicateScore,
    recentTitles: recentArticles.map((a) => a.title),
  });
}

/**
 * Check if an article is a duplicate based on embedding similarity.
 */
export function checkDuplicates(
  articleEmbedding: number[],
  recentEmbeddings: Array<{ embedding: number[]; title: string }>,
  threshold: number = 0.85,
): DuplicateCheckResult {
  let maxSimilarity = 0;
  let duplicateOf: string | undefined;

  for (const recent of recentEmbeddings) {
    const similarity = cosineSimilarity(articleEmbedding, recent.embedding);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      duplicateOf = recent.title;
    }
  }

  return {
    isDuplicate: maxSimilarity >= threshold,
    similarity: maxSimilarity,
    duplicateOf: maxSimilarity >= threshold ? duplicateOf : undefined,
  };
}
