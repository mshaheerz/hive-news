import { createOpenAI } from '@ai-sdk/openai';

const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434/v1';

export function createOllamaProvider(baseUrl?: string) {
  return createOpenAI({
    apiKey: 'ollama',
    baseURL: baseUrl ?? DEFAULT_OLLAMA_BASE_URL,
  });
}
