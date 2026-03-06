import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Validate authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);

  // TODO: Validate the federation token against known peers
  // import { db } from '@jaurnalist/db';
  // const peer = await db.query.federationPeers.findFirst({ where: eq(peers.token, token) });
  // if (!peer) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

  if (!token) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.article || !body.article.title || !body.article.content) {
      return NextResponse.json(
        { error: 'Invalid article payload: title and content are required' },
        { status: 400 }
      );
    }

    // TODO: Store the federated article
    // const { article } = body;
    // await db.insert(articles).values({
    //   title: article.title,
    //   slug: article.slug,
    //   summary: article.summary,
    //   content: article.content,
    //   categoryId: article.categoryId,
    //   reporterId: article.reporterId,
    //   status: 'published',
    //   source: 'federation',
    //   sourceInstanceId: peer.instanceId,
    //   publishedAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Article received and queued for publishing',
    });
  } catch (error) {
    console.error('Federation publish error:', error);
    return NextResponse.json(
      { error: 'Failed to process federated article' },
      { status: 500 }
    );
  }
}
