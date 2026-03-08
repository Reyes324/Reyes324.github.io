import { db } from './db';
import { contents } from './db/schema';
import { eq } from 'drizzle-orm';
import { getYoutubeTranscript, getVideoMeta, segmentsToText } from './youtube';
import { extractArticle } from './article';
import { translateToZh, generateSummary, generatePodcastScript } from './gemini';
import { generatePodcastAudio } from './tts';

type Status =
  | 'pending'
  | 'extracting'
  | 'translating'
  | 'summarizing'
  | 'generating_podcast'
  | 'generating_audio'
  | 'done'
  | 'error';

async function setStatus(id: string, status: Status, extra: Record<string, unknown> = {}) {
  await db
    .update(contents)
    .set({ status, ...extra, updatedAt: new Date().toISOString() } as never)
    .where(eq(contents.id, id));
}

export async function processContent(
  id: string,
  url: string,
  type: 'youtube' | 'article'
) {
  try {
    await setStatus(id, 'extracting');

    let contentOriginal = '';
    let contentZh = '';
    let sourceLanguage = 'en';
    let transcriptRaw: unknown = null;
    let transcriptSource: string | null = null;
    let meta: Record<string, unknown> = {};

    if (type === 'youtube') {
      // Get video metadata
      const videoMeta = await getVideoMeta(url);
      if (videoMeta) {
        meta = {
          title: videoMeta.title,
          author: videoMeta.author,
          thumbnailUrl: videoMeta.thumbnailUrl,
        };
        await db.update(contents).set(meta as never).where(eq(contents.id, id));
      }

      // Get transcript
      const result = await getYoutubeTranscript(url);
      if (!result || result.segments.length === 0) {
        throw new Error('无法获取视频字幕，请确认视频有字幕');
      }

      transcriptRaw = result.segments;
      transcriptSource = 'youtube';
      sourceLanguage = result.language;
      contentOriginal = segmentsToText(result.segments);
    } else {
      // Extract article
      const article = await extractArticle(url);
      if (!article) {
        throw new Error('无法提取文章内容，请确认链接可访问');
      }

      contentOriginal = article.content;
      sourceLanguage = article.language;
      meta = {
        title: article.title,
        author: article.author,
        siteName: article.siteName,
      };
      await db.update(contents).set(meta as never).where(eq(contents.id, id));
    }

    // Translate if English
    if (sourceLanguage === 'en') {
      await setStatus(id, 'translating', {
        contentOriginal,
        sourceLanguage,
        transcriptRaw: transcriptRaw ? JSON.stringify(transcriptRaw) : null,
        transcriptSource,
      });

      contentZh = await translateToZh(contentOriginal);
    } else {
      contentZh = contentOriginal;
    }

    // Generate summary
    await setStatus(id, 'summarizing', {
      contentOriginal,
      contentZh,
      sourceLanguage,
      transcriptRaw: transcriptRaw ? JSON.stringify(transcriptRaw) : null,
      transcriptSource,
    });

    const [row] = await db
      .select({ title: contents.title })
      .from(contents)
      .where(eq(contents.id, id))
      .limit(1);
    const title = row?.title ?? 'Untitled';

    const summary = await generateSummary(contentZh, type === 'youtube' ? 'video' : 'article');

    // Generate podcast script
    await setStatus(id, 'generating_podcast', {
      summary: JSON.stringify(summary),
    });

    const podcastScript = await generatePodcastScript(contentZh, title);

    // Generate audio
    await setStatus(id, 'generating_audio', {
      podcastScript: JSON.stringify(podcastScript),
    });

    const audioUrl = await generatePodcastAudio(podcastScript, id);

    // Done
    await setStatus(id, 'done', { audioUrl });
  } catch (err) {
    console.error(`Processing error for ${id}:`, err);
    await setStatus(id, 'error', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
