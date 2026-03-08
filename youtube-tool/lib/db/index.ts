import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Initialize schema on first run (for local dev)
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_language TEXT,
      title TEXT,
      author TEXT,
      thumbnail_url TEXT,
      duration INTEGER,
      site_name TEXT,
      status TEXT DEFAULT 'pending',
      error TEXT,
      content_original TEXT,
      content_zh TEXT,
      transcript_raw TEXT,
      transcript_source TEXT,
      summary TEXT,
      podcast_script TEXT,
      audio_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
