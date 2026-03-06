import { z } from 'zod';
import type { LanguageModel } from 'ai';
import { BaseAgent } from './base-agent';

const ArticleOutputSchema = z.object({
  title: z.string().describe('Compelling article title, under 100 characters'),
  content: z.string().describe('Full article content in markdown format'),
  summary: z.string().describe('1-2 sentence summary for article previews'),
});

export type ArticleOutput = z.infer<typeof ArticleOutputSchema>;

export interface ReporterInput {
  topic: string;
  category: string;
  targetLength?: number;
  briefing?: string;
  styleGuide?: string;
}

export class ReporterAgent extends BaseAgent {
  constructor(model: LanguageModel, systemPrompt: string) {
    super(model, systemPrompt);
  }

  async execute(input: ReporterInput): Promise<ArticleOutput> {
    const targetWords = input.targetLength ?? 800;

    const prompt = `Write an article about the following topic.

Topic: ${input.topic}
Category: ${input.category}
Target word count: ${targetWords} words
${input.briefing ? `\nEditor's briefing: ${input.briefing}` : ''}
${input.styleGuide ? `\nStyle guide: ${input.styleGuide}` : ''}

Write a complete, well-structured article following journalistic standards. Include a compelling title, engaging content, and a brief summary.`;

    return this.generateObjectResponse(prompt, ArticleOutputSchema, {
      schemaName: 'ArticleOutput',
      schemaDescription: 'A generated news article with title, content, and summary',
      maxTokens: Math.max(4096, Math.ceil(targetWords * 2)),
      temperature: 0.8,
    });
  }
}
