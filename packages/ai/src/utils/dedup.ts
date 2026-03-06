/**
 * Calculate cosine similarity between two embedding vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions must match: got ${a.length} and ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  matchIndex: number | null;
}

/**
 * Check if an embedding is a duplicate of any in a list of recent embeddings.
 */
export function isDuplicate(
  embedding: number[],
  recentEmbeddings: number[][],
  threshold: number = 0.85,
): DuplicateCheckResult {
  let maxSimilarity = 0;
  let matchIndex: number | null = null;

  for (let i = 0; i < recentEmbeddings.length; i++) {
    const similarity = cosineSimilarity(embedding, recentEmbeddings[i]!);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      matchIndex = i;
    }
  }

  return {
    isDuplicate: maxSimilarity >= threshold,
    similarity: maxSimilarity,
    matchIndex: maxSimilarity >= threshold ? matchIndex : null,
  };
}
