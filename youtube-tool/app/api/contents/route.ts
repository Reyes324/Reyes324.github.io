import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { contents } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  await initDb();
  const rows = await db
    .select({
      id: contents.id,
      type: contents.type,
      title: contents.title,
      author: contents.author,
      siteName: contents.siteName,
      thumbnailUrl: contents.thumbnailUrl,
      status: contents.status,
      sourceUrl: contents.sourceUrl,
      createdAt: contents.createdAt,
    })
    .from(contents)
    .orderBy(desc(contents.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}
