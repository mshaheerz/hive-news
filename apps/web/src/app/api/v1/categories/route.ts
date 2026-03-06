import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Replace with actual DB query using @jaurnalist/db
    // import { db } from '@jaurnalist/db';
    // import { categories } from '@jaurnalist/db/schema';
    // const result = await db.select().from(categories).orderBy(categories.name);

    const categories: any[] = [];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
