import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db, initDb } from '@/lib/db';
import { contents } from '@/lib/db/schema';
import { detectUrlType } from '@/lib/url-detector';
import { processContent } from '@/lib/processor';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const urlType = detectUrlType(url.trim());
  if (urlType === 'unknown') {
    return NextResponse.json({ error: 'URL 格式不支持，请输入 YouTube 视频链接或文章链接' }, { status: 400 });
  }

  await initDb();

  const id = nanoid();
  await db.insert(contents).values({
    id,
    type: urlType,
    sourceUrl: url.trim(),
    status: 'pending',
  });

  // Fire and forget — processing runs in background
  processContent(id, url.trim(), urlType).catch((err) => {
    console.error(`Processing failed for ${id}:`, err);
  });

  return NextResponse.json({ id });
}
