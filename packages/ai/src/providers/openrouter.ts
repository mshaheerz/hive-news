import { createOpenAI } from '@ai-sdk/openai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export function createOpenRouterProvider(apiKey: string) {
  return createOpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    headers: {
      'HTTP-Referer': 'https://jaurnalist.app',
      'X-Title': 'Jaurnalist',
    },
  });
}
