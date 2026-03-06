import { eq, desc, and } from 'drizzle-orm';
import type { ProviderRegistry } from '@jaurnalist/ai/src/providers/registry';
import { ArticlePipeline, type CompanyData } from '@jaurnalist/ai/src/pipelines/article-pipeline';
import { companies } from '@jaurnalist/db/src/schema/companies';
import { reporters } from '@jaurnalist/db/src/schema/reporters';
import { articles } from '@jaurnalist/db/src/schema/articles';
import { categories } from '@jaurnalist/db/src/schema/categories';
import { slugify } from '@jaurnalist/shared';
import type { ArticleGenerationJobData } from '../queues/article-generation.queue';

interface GenerationResult {
  articleId: string | null;
  title: string;
  status: string;
  error?: string;
}

export async function processArticleGeneration(
  data: ArticleGenerationJobData,
  db: ReturnType<typeof import('@jaurnalist/db').createDb>,
  registry: ProviderRegistry,
): Promise<GenerationResult[]> {
  const { companyId, categorySlug, count } = data;

  // Fetch company
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  // Fetch CEO reporter
  const [ceo] = await db
    .select()
    .from(reporters)
    .where(and(eq(reporters.companyId, companyId), eq(reporters.role, 'ceo')))
    .limit(1);

  if (!ceo) {
    throw new Error(`No CEO reporter found for company: ${company.name}`);
  }

  // Fetch active reporters
  const companyReporters = await db
    .select()
    .from(reporters)
    .where(
      and(
        eq(reporters.companyId, companyId),
        eq(reporters.role, 'reporter'),
        eq(reporters.isActive, true),
      ),
    );

  if (companyReporters.length === 0) {
    throw new Error(`No active reporters found for company: ${company.name}`);
  }

  // Fetch categories
  const allCategories = await db.select().from(categories);
  const categoryNames = categorySlug
    ? allCategories.filter((c) => c.slug === categorySlug).map((c) => c.name)
    : allCategories.map((c) => c.name);

  // Fetch recent article titles
  const recentArticles = await db
    .select({ title: articles.title })
    .from(articles)
    .where(eq(articles.companyId, companyId))
    .orderBy(desc(articles.createdAt))
    .limit(20);

  const recentTitles = recentArticles.map((a) => a.title);

  // Build company data for pipeline
  const companyData: CompanyData = {
    id: company.id,
    name: company.name,
    ceoProviderId: ceo.providerId,
    ceoModelId: ceo.modelId,
    ceoSystemPrompt: ceo.personaPrompt ?? `You are the editor-in-chief of ${company.name}. You select compelling topics and review articles for quality.`,
    reporters: companyReporters.map((r) => ({
      id: r.id,
      name: r.journalistName,
      providerId: r.providerId,
      modelId: r.modelId,
      systemPrompt: r.personaPrompt ?? `You are ${r.journalistName}, a journalist at ${company.name}.`,
      categories: r.categories ?? [],
    })),
    categories: categoryNames,
    recentTitles,
    recentEmbeddings: [],
  };

  // Run the pipeline
  const pipeline = new ArticlePipeline(registry);
  const generated = await pipeline.runCycle(companyData);

  // Save generated articles to DB
  const results: GenerationResult[] = [];

  for (const gen of generated) {
    if (gen.article) {
      const matchingCategory = allCategories.find(
        (c) => c.name.toLowerCase() === gen.topic.category.toLowerCase(),
      );

      const articleSlug = slugify(gen.article.title) + '-' + Date.now().toString(36);

      try {
        const [inserted] = await db
          .insert(articles)
          .values({
            companyId: company.id,
            reporterId: gen.reporterId,
            categoryId: matchingCategory?.id ?? allCategories[0]!.id,
            title: gen.article.title,
            slug: articleSlug,
            content: gen.article.content,
            summary: gen.article.summary,
            status: gen.review?.decision === 'approved' ? 'approved' : 'draft',
          })
          .returning({ id: articles.id });

        results.push({
          articleId: inserted!.id,
          title: gen.article.title,
          status: gen.status,
        });
      } catch (err) {
        results.push({
          articleId: null,
          title: gen.article.title,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    } else {
      results.push({
        articleId: null,
        title: gen.topic.topic,
        status: gen.status,
        error: gen.error,
      });
    }
  }

  return results;
}
