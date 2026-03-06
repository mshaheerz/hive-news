import { z } from 'zod';
import type { LanguageModel } from 'ai';
import { BaseAgent } from './base-agent';

const TopicAssignmentSchema = z.object({
  topic: z.string().describe('The topic to write about'),
  category: z.string().describe('The category this topic belongs to'),
  briefing: z.string().describe('Brief instructions for the reporter on how to approach this topic'),
});

export type TopicAssignment = z.infer<typeof TopicAssignmentSchema>;

const TopicSelectionOutputSchema = z.object({
  topics: z.array(TopicAssignmentSchema).describe('List of selected topics with assignments'),
});

const ReviewResultSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'revision_requested']).describe('Editorial decision'),
  score: z.number().min(1).max(10).describe('Quality score from 1 to 10'),
  feedback: z.string().describe('Detailed editorial feedback'),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

export interface TopicSelectionInput {
  categories: string[];
  recentTitles: string[];
  count: number;
}

export interface ReviewInput {
  article: {
    title: string;
    content: string;
    summary: string;
  };
  duplicateScore?: number;
  recentTitles?: string[];
}

export class CEOAgent extends BaseAgent {
  constructor(model: LanguageModel, systemPrompt: string) {
    super(model, systemPrompt);
  }

  async execute(input: TopicSelectionInput): Promise<TopicAssignment[]> {
    return this.selectTopics(input);
  }

  async selectTopics(input: TopicSelectionInput): Promise<TopicAssignment[]> {
    const { categories, recentTitles, count } = input;
    const clampedCount = Math.min(Math.max(count, 1), 10);

    const recentTitlesList = recentTitles.length > 0
      ? recentTitles.map((t) => `- ${t}`).join('\n')
      : 'No recent articles.';

    const prompt = `Select ${clampedCount} compelling news topics for your newsroom to cover.

Available categories: ${categories.join(', ')}

Recently published article titles (avoid similar topics):
${recentTitlesList}

Select ${clampedCount} diverse, newsworthy topics spread across different categories. For each topic, provide a clear briefing for the assigned reporter explaining the angle and key points to cover.`;

    const result = await this.generateObjectResponse(prompt, TopicSelectionOutputSchema, {
      schemaName: 'TopicSelectionOutput',
      schemaDescription: 'Selected topics for the newsroom to cover',
      temperature: 0.9,
      maxTokens: 2048,
    });

    return result.topics.slice(0, clampedCount);
  }

  async reviewArticle(input: ReviewInput): Promise<ReviewResult> {
    const { article, duplicateScore, recentTitles } = input;

    const duplicateInfo = duplicateScore !== undefined
      ? `\nDuplicate similarity score: ${(duplicateScore * 100).toFixed(1)}% ${duplicateScore > 0.8 ? '(HIGH - likely duplicate)' : duplicateScore > 0.5 ? '(MODERATE - similar content exists)' : '(LOW - appears original)'}`
      : '';

    const recentTitlesList = recentTitles && recentTitles.length > 0
      ? `\nRecent article titles:\n${recentTitles.map((t) => `- ${t}`).join('\n')}`
      : '';

    const prompt = `Review the following article for publication.

Title: ${article.title}
Summary: ${article.summary}
${duplicateInfo}
${recentTitlesList}

Article content:
---
${article.content}
---

Evaluate this article on the following criteria:
1. Quality of writing (clarity, structure, grammar)
2. Newsworthiness and relevance
3. Accuracy and depth of coverage
4. Engagement and readability
5. Originality (considering duplicate score and recent titles)

Provide a score from 1-10 and your editorial decision:
- Score 7-10: Approve for publication
- Score 4-6: Request revision with specific feedback
- Score 1-3: Reject with explanation`;

    return this.generateObjectResponse(prompt, ReviewResultSchema, {
      schemaName: 'ReviewResult',
      schemaDescription: 'Editorial review decision for a submitted article',
      temperature: 0.5,
      maxTokens: 1024,
    });
  }
}
