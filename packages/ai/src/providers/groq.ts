import { createOpenAI } from '@ai-sdk/openai';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export function createGroqProvider(apiKey: string) {
  return createOpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
  });
}
