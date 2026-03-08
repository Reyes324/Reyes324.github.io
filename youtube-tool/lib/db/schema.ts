import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const contents = sqliteTable('contents', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'video' | 'article'
  sourceUrl: text('source_url').notNull(),
  sourceLanguage: text('source_language'), // 'en' | 'zh' | 'auto'

  // 元信息
  title: text('title'),
  author: text('author'),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // 视频时长(秒)
  siteName: text('site_name'),

  // 处理状态
  status: text('status').default('pending'),
  error: text('error'),

  // 原始内容
  contentOriginal: text('content_original'),
  contentZh: text('content_zh'),
  transcriptRaw: text('transcript_raw'), // JSON string
  transcriptSource: text('transcript_source'), // 'youtube' | 'whisper' | null

  // 生成结果
  summary: text('summary'), // JSON string
  podcastScript: text('podcast_script'), // JSON string
  audioUrl: text('audio_url'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
