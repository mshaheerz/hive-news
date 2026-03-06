export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const connectData = JSON.stringify({ type: 'connected', timestamp: Date.now() });
      controller.enqueue(encoder.encode(`data: ${connectData}\n\n`));

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          const data = JSON.stringify({ type: 'heartbeat', timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // TODO: Subscribe to Redis PUB/SUB or PG LISTEN/NOTIFY for new articles
      // When a new article is published:
      // const articleData = JSON.stringify({ type: 'new-article', data: article });
      // controller.enqueue(encoder.encode(`data: ${articleData}\n\n`));

      // Store cleanup for when the stream is cancelled
      (controller as any)._cleanup = () => clearInterval(heartbeatInterval);
    },
    cancel(controller) {
      (controller as any)._cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
