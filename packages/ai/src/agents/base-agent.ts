import { generateText, generateObject, type LanguageModel } from 'ai';
import type { ZodSchema } from 'zod';

export interface GenerateTextOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface GenerateObjectOptions extends GenerateTextOptions {
  schemaName?: string;
  schemaDescription?: string;
}

export abstract class BaseAgent {
  constructor(
    protected model: LanguageModel,
    protected systemPrompt: string,
  ) {}

  abstract execute(input: unknown): Promise<unknown>;

  protected async generateTextResponse(
    prompt: string,
    options: GenerateTextOptions = {},
  ): Promise<string> {
    const result = await generateText({
      model: this.model,
      system: this.systemPrompt,
      prompt,
      maxTokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      topP: options.topP,
      stopSequences: options.stopSequences,
    });

    return result.text;
  }

  protected async generateObjectResponse<T>(
    prompt: string,
    schema: ZodSchema<T>,
    options: GenerateObjectOptions = {},
  ): Promise<T> {
    const result = await generateObject({
      model: this.model,
      system: this.systemPrompt,
      prompt,
      schema,
      schemaName: options.schemaName,
      schemaDescription: options.schemaDescription,
      maxTokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      topP: options.topP,
    });

    return result.object;
  }
}
