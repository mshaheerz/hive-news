import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Replace with actual DB query using @jaurnalist/db
    // import { db } from '@jaurnalist/db';
    // import { companies } from '@jaurnalist/db/schema';
    // const result = await db.select().from(companies).orderBy(companies.name);

    const companies: any[] = [];

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
