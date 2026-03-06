import type { LanguageModel } from 'ai';
import type { ArticleStatus } from '@jaurnalist/shared';
import { ProviderRegistry } from '../providers/registry';
import { CEOAgent, type TopicAssignment, type ReviewResult } from '../agents/ceo-agent';
import { ReporterAgent, type ArticleOutput } from '../agents/reporter-agent';
import { isDuplicate } from '../utils/dedup';
import { RateLimiter } from '../utils/rate-limiter';

export interface GeneratedArticle {
  topic: TopicAssignment;
  article: ArticleOutput | null;
  review: ReviewResult | null;
  reporterId: string;
  status: ArticleStatus;
  error?: string;
}

export interface PipelineConfig {
  maxConcurrent?: number;
  rateLimitPerMinute?: number;
  duplicateThreshold?: number;
  targetArticleLength?: number;
}

export interface CompanyData {
  id: string;
  name: string;
  ceoProviderId: string;
  ceoModelId: string;
  ceoSystemPrompt: string;
  reporters: Array<{
    id: string;
    name: string;
    providerId: string;
    modelId: string;
    systemPrompt: string;
    categories: string[];
  }>;
  categories: string[];
  recentTitles: string[];
  recentEmbeddings: number[][];
}

const DEFAULT_CONFIG: Required<PipelineConfig> = {
  maxConcurrent: 3,
  rateLimitPerMinute: 30,
  duplicateThreshold: 0.85,
  targetArticleLength: 800,
};

export class ArticlePipeline {
  private config: Required<PipelineConfig>;
  private rateLimiter: RateLimiter;

  constructor(
    private registry: ProviderRegistry,
    config: PipelineConfig = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimiter = new RateLimiter(this.config.rateLimitPerMinute, 60_000);
  }

  async runCycle(companyData: CompanyData): Promise<GeneratedArticle[]> {
    const { reporters, categories, recentTitles, recentEmbeddings } = companyData;

    // 1. Create CEO agent
    const ceoModel = this.registry.getModel(companyData.ceoProviderId, companyData.ceoModelId);
    const ceoAgent = new CEOAgent(ceoModel, companyData.ceoSystemPrompt);

    // 2. CEO selects topics
    const topicCount = Math.min(reporters.length, 5);
    await this.rateLimiter.acquire();
    const topics = await ceoAgent.selectTopics({
      categories,
      recentTitles,
      count: topicCount,
    });

    // 3. Assign reporters by category match
    const assignments = this.assignReporters(topics, reporters);

    // 4. Generate articles in parallel (with concurrency limit)
    const results: GeneratedArticle[] = [];
    const chunks = this.chunk(assignments, this.config.maxConcurrent);

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(async ({ topic, reporter }) => {
          await this.rateLimiter.acquire();

          const reporterModel = this.registry.getModel(reporter.providerId, reporter.modelId);
          const reporterAgent = new ReporterAgent(reporterModel, reporter.systemPrompt);

          const article = await reporterAgent.execute({
            topic: topic.topic,
            category: topic.category,
            targetLength: this.config.targetArticleLength,
            briefing: topic.briefing,
          });

          return { topic, reporter, article };
        }),
      );

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          const { topic, reporter, article } = result.value;

          // 5. Check duplicates (placeholder - would use embeddings in production)
          // For now, we skip embedding-based dedup if no embeddings are available

          // 6. CEO reviews
          await this.rateLimiter.acquire();
          const review = await ceoAgent.reviewArticle({
            article,
            recentTitles,
          });

          const status: ArticleStatus = review.decision === 'approved' ? 'published' : review.decision === 'revision_requested' ? 'draft' : 'rejected';

          results.push({
            topic,
            article,
            review,
            reporterId: reporter.id,
            status,
          });
        } else {
          const assignment = chunk[chunkResults.indexOf(result)];
          results.push({
            topic: assignment!.topic,
            article: null,
            review: null,
            reporterId: assignment!.reporter.id,
            status: 'failed',
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          });
        }
      }
    }

    return results;
  }

  private assignReporters(
    topics: TopicAssignment[],
    reporters: CompanyData['reporters'],
  ): Array<{ topic: TopicAssignment; reporter: CompanyData['reporters'][number] }> {
    return topics.map((topic) => {
      // Find a reporter whose categories include the topic's category
      const matchingReporter = reporters.find((r) =>
        r.categories.some((c) => c.toLowerCase() === topic.category.toLowerCase()),
      );

      // Fallback to random reporter if no category match
      const reporter = matchingReporter ?? reporters[Math.floor(Math.random() * reporters.length)]!;

      return { topic, reporter };
    });
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
