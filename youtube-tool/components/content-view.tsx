'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface ContentData {
  contentOriginal: string | null;
  contentZh: string | null;
  transcriptRaw: TranscriptSegment[] | null;
  sourceLanguage: string | null;
}

export function ContentView({
  contentId,
  sourceLanguage,
}: {
  contentId: string;
  sourceLanguage: string;
}) {
  const [data, setData] = useState<ContentData | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${contentId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [contentId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">加载中…</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">内容加载失败</p>;
  }

  const hasOriginal = sourceLanguage === 'en' && data.contentOriginal;
  const displayText = showOriginal ? data.contentOriginal : data.contentZh;
  const hasTranscript = data.transcriptRaw && data.transcriptRaw.length > 0;

  return (
    <div className="space-y-4">
      {/* Language toggle */}
      {hasOriginal && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs h-7"
          >
            {showOriginal ? '查看中文译文' : '查看英文原文'}
          </Button>
        </div>
      )}

      {/* Transcript with timestamps (video) */}
      {hasTranscript && !showOriginal ? (
        <div className="space-y-1">
          {data.transcriptRaw!.map((seg, i) => (
            <div key={i} className="flex gap-3 py-1 border-b border-border/50 last:border-0">
              <span className="flex-shrink-0 text-xs text-muted-foreground font-mono w-14 pt-0.5">
                {formatTime(seg.start)}
              </span>
              <p className="text-sm leading-relaxed flex-1">{seg.text}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Plain text */
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm leading-[1.85] whitespace-pre-wrap">{displayText}</p>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
