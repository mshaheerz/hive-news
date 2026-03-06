/**
 * Estimate the number of tokens in a text string.
 * Uses a rough heuristic: ~1 token per 0.75 words.
 * This is an approximation; actual token counts vary by model and tokenizer.
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return Math.ceil(words.length / 0.75);
}

/**
 * Estimate the cost of a generation based on token counts and per-token pricing.
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  inputPricePerMillion: number,
  outputPricePerMillion: number,
): number {
  const inputCost = (inputTokens / 1_000_000) * inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputPricePerMillion;
  return inputCost + outputCost;
}
