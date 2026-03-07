import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { articles, categories, reporters, companies } from '@jaurnalist/db/schema';
import { createDb } from '@jaurnalist/db';

const STATUS_VALUES = ['draft', 'in_review', 'approved', 'rejected', 'published'] as const;
type ArticleStatus = (typeof STATUS_VALUES)[number];

const connectionString = process.env.DATABASE_URL;
const dbClient = connectionString ? createDb(connectionString) : null;

export async function GET(request: NextRequest) {
  if (!dbClient) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const rawLimit = Number(searchParams.get('limit') ?? 20);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;
  const rawOffset = Number(searchParams.get('offset') ?? 0);
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;
  const categorySlug = searchParams.get('category');
  const companySlug = searchParams.get('company');
  const requestedStatus = (searchParams.get('status') as ArticleStatus) ?? 'published';
  const status = STATUS_VALUES.includes(requestedStatus) ? requestedStatus : 'published';

  try {
    const conditions = [eq(articles.status, status)];

    if (categorySlug) {
      const categoryRow = await dbClient
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (categoryRow.length === 0) {
        return NextResponse.json({ articles: [], total: 0, limit, offset, hasMore: false });
      }
      conditions.push(eq(articles.categoryId, categoryRow[0]!.id));
    }

    if (companySlug) {
      const companyRow = await dbClient
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.slug, companySlug))
        .limit(1);
      if (companyRow.length === 0) {
        return NextResponse.json({ articles: [], total: 0, limit, offset, hasMore: false });
      }
      conditions.push(eq(articles.companyId, companyRow[0]!.id));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let articleQuery = dbClient
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        content: articles.content,
        publishedAt: articles.publishedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
        reporter: {
          id: reporters.id,
          journalistName: reporters.journalistName,
          modelId: reporters.modelId,
          avatarUrl: reporters.avatarUrl,
          company: {
            name: companies.name,
          },
        },
      })
      .from(articles)
      .leftJoin(categories, eq(categories.id, articles.categoryId))
      .leftJoin(reporters, eq(reporters.id, articles.reporterId))
      .leftJoin(companies, eq(companies.id, articles.companyId));

    if (whereClause) {
      articleQuery = articleQuery.where(whereClause);
    }

    const articleRows = await articleQuery
      .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    let totalQuery = dbClient
      .select({ count: sql<number>`count(*)` })
      .from(articles);

    if (whereClause) {
      totalQuery = totalQuery.where(whereClause);
    }

    const totalResult = await totalQuery.limit(1);
    const total = totalResult[0]?.count ?? 0;

    const serialized = articleRows.map((row) => {
      const category = row.category ?? {
        id: '',
        name: 'General',
        slug: 'general',
        color: '#999',
      };
      const reporter = row.reporter ?? {
        id: '',
        journalistName: 'Reporter',
        modelId: '',
        avatarUrl: null,
        company: { name: 'Unknown' },
      };

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        summary: row.summary ?? '',
        content: row.content,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color ?? '#999',
        },
        reporter: {
          id: reporter.id,
          journalistName: reporter.journalistName ?? 'Reporter',
          modelId: reporter.modelId ?? '',
          avatarUrl: reporter.avatarUrl ?? null,
          company: {
            name: reporter.company?.name ?? 'Unknown',
          },
        },
      };
    });

    return NextResponse.json({
      articles: serialized,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
