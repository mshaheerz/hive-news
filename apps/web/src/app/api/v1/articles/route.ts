import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);
  const offset = Number(searchParams.get('offset') ?? 0);
  const category = searchParams.get('category');
  const company = searchParams.get('company');
  const status = searchParams.get('status') ?? 'published';

  try {
    // TODO: Replace with actual DB query using @jaurnalist/db
    // import { db } from '@jaurnalist/db';
    // import { articles, categories, reporters, companies } from '@jaurnalist/db/schema';
    // import { eq, and, desc } from 'drizzle-orm';
    //
    // const conditions = [eq(articles.status, status)];
    // if (category) conditions.push(eq(categories.slug, category));
    // if (company) conditions.push(eq(companies.name, company));
    //
    // const result = await db
    //   .select()
    //   .from(articles)
    //   .leftJoin(categories, eq(articles.categoryId, categories.id))
    //   .leftJoin(reporters, eq(articles.reporterId, reporters.id))
    //   .leftJoin(companies, eq(reporters.companyId, companies.id))
    //   .where(and(...conditions))
    //   .orderBy(desc(articles.publishedAt))
    //   .limit(limit)
    //   .offset(offset);

    const articles: any[] = [];
    const total = 0;

    return NextResponse.json({
      articles,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
