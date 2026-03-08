import { YoutubeTranscript } from 'youtube-transcript';
import { extractYoutubeId } from './url-detector';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface VideoMeta {
  title: string;
  author: string;
  thumbnailUrl: string;
  duration?: number;
}

export async function getYoutubeTranscript(url: string): Promise<{
  segments: TranscriptSegment[];
  language: string;
} | null> {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const segments: TranscriptSegment[] = transcript.map((item) => ({
      start: item.offset / 1000,
      end: (item.offset + item.duration) / 1000,
      text: item.text,
    }));

    // Detect language from first few segments
    const sampleText = segments
      .slice(0, 10)
      .map((s) => s.text)
      .join(' ');
    const isChinese = /[\u4e00-\u9fa5]/.test(sampleText);
    const language = isChinese ? 'zh' : 'en';

    return { segments, language };
  } catch (err) {
    console.error('YouTube transcript fetch failed:', err);
    return null;
  }
}

export async function getVideoMeta(url: string): Promise<VideoMeta | null> {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  try {
    // Use YouTube oEmbed API (no key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();

    return {
      title: data.title,
      author: data.author_name,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (err) {
    console.error('Video meta fetch failed:', err);
    return null;
  }
}

export function segmentsToText(segments: TranscriptSegment[]): string {
  return segments.map((s) => s.text).join(' ');
}

export function groupSegmentsByParagraph(
  segments: TranscriptSegment[],
  maxGapSeconds = 3
): TranscriptSegment[][] {
  const groups: TranscriptSegment[][] = [];
  let current: TranscriptSegment[] = [];

  for (let i = 0; i < segments.length; i++) {
    current.push(segments[i]);
    const next = segments[i + 1];
    const gap = next ? next.start - segments[i].end : Infinity;
    if (gap > maxGapSeconds || !next) {
      groups.push(current);
      current = [];
    }
  }

  return groups;
}
