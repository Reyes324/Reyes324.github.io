import { NextRequest } from 'next/server';
import { db, initDb } from '@/lib/db';
import { contents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await initDb();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      let done = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 120; // 2 minutes at 1s intervals

      while (!done && attempts < MAX_ATTEMPTS) {
        try {
          const [row] = await db
            .select()
            .from(contents)
            .where(eq(contents.id, id))
            .limit(1);

          if (!row) {
            send({ error: '记录不存在' });
            break;
          }

          send({
            id: row.id,
            status: row.status,
            title: row.title,
            type: row.type,
            error: row.error,
            summary: row.summary ? JSON.parse(row.summary) : null,
            podcastScript: row.podcastScript ? JSON.parse(row.podcastScript) : null,
            audioUrl: row.audioUrl,
            thumbnailUrl: row.thumbnailUrl,
            author: row.author,
            siteName: row.siteName,
            sourceUrl: row.sourceUrl,
            duration: row.duration,
            sourceLanguage: row.sourceLanguage,
          });

          if (row.status === 'done' || row.status === 'error') {
            done = true;
          }
        } catch (err) {
          send({ error: String(err) });
          done = true;
        }

        if (!done) {
          await new Promise((r) => setTimeout(r, 1000));
        }
        attempts++;
      }

      if (!done) {
        send({ error: '处理超时，请刷新页面重试' });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
