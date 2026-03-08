import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { contents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await initDb();

  const [row] = await db
    .select({ audioUrl: contents.audioUrl })
    .from(contents)
    .where(eq(contents.id, id))
    .limit(1);

  if (!row?.audioUrl) {
    return NextResponse.json({ error: '音频不存在' }, { status: 404 });
  }

  const filename = path.basename(row.audioUrl);
  const filePath = path.join(process.cwd(), 'public', 'audio', filename);

  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: '音频文件不存在' }, { status: 404 });
  }
}
