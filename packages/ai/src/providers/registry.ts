import type { LanguageModel } from 'ai';
import type { ProviderType } from '@jaurnalist/shared';

import { createOpenAIProvider } from './openai';
import { createAnthropicProvider } from './anthropic';
import { createGoogleProvider } from './google';
import { createGroqProvider } from './groq';
import { createOpenRouterProvider } from './openrouter';
import { createOllamaProvider } from './ollama';

export interface ProviderConfig {
  id: string;
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
}

type AIProvider = ReturnType<typeof createOpenAIProvider> | ReturnType<typeof createAnthropicProvider> | ReturnType<typeof createGoogleProvider>;

export function createProvider(config: { type: ProviderType; apiKey?: string; baseUrl?: string }): AIProvider {
  const { type, apiKey, baseUrl } = config;

  switch (type) {
    case 'openai':
      if (!apiKey) throw new Error('OpenAI requires an API key');
      return createOpenAIProvider(apiKey);

    case 'anthropic':
      if (!apiKey) throw new Error('Anthropic requires an API key');
      return createAnthropicProvider(apiKey);

    case 'google':
      if (!apiKey) throw new Error('Google requires an API key');
      return createGoogleProvider(apiKey);

    case 'groq':
      if (!apiKey) throw new Error('Groq requires an API key');
      return createGroqProvider(apiKey);

    case 'openrouter':
      if (!apiKey) throw new Error('OpenRouter requires an API key');
      return createOpenRouterProvider(apiKey);

    case 'ollama':
      return createOllamaProvider(baseUrl);

    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

export function getModel(provider: AIProvider, modelId: string): LanguageModel {
  return provider(modelId) as LanguageModel;
}

export class ProviderRegistry {
  private providers = new Map<string, { config: ProviderConfig; instance: AIProvider }>();

  add(config: ProviderConfig): void {
    const instance = createProvider(config);
    this.providers.set(config.id, { config, instance });
  }

  remove(id: string): boolean {
    return this.providers.delete(id);
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id)?.instance;
  }

  getConfig(id: string): ProviderConfig | undefined {
    return this.providers.get(id)?.config;
  }

  getModel(providerId: string, modelId: string): LanguageModel {
    const provider = this.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    return getModel(provider, modelId);
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }

  list(): ProviderConfig[] {
    return Array.from(this.providers.values()).map((p) => p.config);
  }

  clear(): void {
    this.providers.clear();
  }
}
