export type ProviderType = 'openai' | 'anthropic' | 'google' | 'groq' | 'openrouter' | 'ollama';

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl?: string;
  isLocal: boolean;
  maxRpm: number;
  configJson?: Record<string, unknown>;
}
