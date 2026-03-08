import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { contents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await initDb();

  const [row] = await db
    .select({
      contentOriginal: contents.contentOriginal,
      contentZh: contents.contentZh,
      transcriptRaw: contents.transcriptRaw,
      sourceLanguage: contents.sourceLanguage,
    })
    .from(contents)
    .where(eq(contents.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: '记录不存在' }, { status: 404 });
  }

  return NextResponse.json({
    contentOriginal: row.contentOriginal,
    contentZh: row.contentZh,
    transcriptRaw: row.transcriptRaw ? JSON.parse(row.transcriptRaw) : null,
    sourceLanguage: row.sourceLanguage,
  });
}
