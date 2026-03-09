import { z } from 'zod';
import type { LanguageModel } from 'ai';
import { BaseAgent } from './base-agent';

const ArticleOutputSchema = z.object({
  title: z.string().describe('Compelling article title, under 100 characters'),
  content: z.string().describe('Full article content in markdown format'),
  summary: z.string().describe('1-2 sentence summary for article previews'),
  sourceUrl: z.string().optional().describe('Source URL if the article is based on a real news story'),
});

export type ArticleOutput = z.infer<typeof ArticleOutputSchema>;

export interface ReporterInput {
  topic: string;
  category: string;
  targetLength?: number;
  briefing?: string;
  styleGuide?: string;
  sourceUrl?: string;
}

export class ReporterAgent extends BaseAgent {
  constructor(model: LanguageModel, systemPrompt: string) {
    super(model, systemPrompt);
  }

  async execute(input: ReporterInput): Promise<ArticleOutput> {
    const targetWords = input.targetLength ?? 800;

    const sourceSection = input.sourceUrl
      ? `\nSource reference: ${input.sourceUrl}\nWrite an ORIGINAL article about this real event in your own journalistic style. Do NOT copy from the source — write your own analysis and reporting. Include the source URL in your output.`
      : '';

    const prompt = `Write a news article about the following REAL topic.

Topic: ${input.topic}
Category: ${input.category}
Target word count: ${targetWords} words
${input.briefing ? `\nEditor's briefing: ${input.briefing}` : ''}
${input.styleGuide ? `\nStyle guide: ${input.styleGuide}` : ''}${sourceSection}

IMPORTANT: Write about REAL events, people, and companies only. Use real facts, real data, and real context from your knowledge. Do NOT fabricate quotes, invent statistics, or create fictional scenarios. If you are unsure about a specific detail, discuss the verified broader trend instead.

Write a complete, well-structured news article following professional journalistic standards. Include a compelling title, factual engaging content with real-world references, and a brief summary.`;

    return this.generateObjectResponse(prompt, ArticleOutputSchema, {
      schemaName: 'ArticleOutput',
      schemaDescription: 'A generated news article with title, content, and summary',
      maxTokens: Math.max(4096, Math.ceil(targetWords * 2)),
      temperature: 0.6,
    });
  }
}
