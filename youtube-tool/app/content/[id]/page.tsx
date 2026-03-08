'use client';

import { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SummaryView } from '@/components/summary-view';
import { ContentView } from '@/components/content-view';
import { PodcastView } from '@/components/podcast-view';
import { ProcessingStatus } from '@/components/processing-status';

interface ContentData {
  id: string;
  status: string;
  title?: string;
  type?: string;
  error?: string;
  summary?: {
    core_summary: string;
    key_points: string[];
    quotes: string[];
    reflections: string[];
  };
  podcastScript?: { speaker: string; text: string }[];
  audioUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  siteName?: string;
  sourceUrl?: string;
  duration?: number;
  sourceLanguage?: string;
}

const DONE_STATUSES = new Set(['done', 'error']);

export default function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ContentData | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/status/${id}`);
    esRef.current = es;

    es.onmessage = (event) => {
      const parsed: ContentData = JSON.parse(event.data);
      setData(parsed);
      if (DONE_STATUSES.has(parsed.status)) {
        es.close();
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [id]);

  const isDone = data?.status === 'done';
  const isError = data?.status === 'error';

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          ← 返回首页
        </Link>

        {/* Header */}
        {data && (
          <div className="flex gap-4 animate-in">
            {data.thumbnailUrl && (
              <img
                src={data.thumbnailUrl}
                alt=""
                className="h-24 w-40 rounded-xl object-cover flex-shrink-0 hidden sm:block"
              />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {data.type && (
                  <Badge variant="secondary" className="text-xs">
                    {data.type === 'youtube' ? 'YouTube 视频' : '网页文章'}
                  </Badge>
                )}
                {data.sourceLanguage && (
                  <Badge variant="outline" className="text-xs">
                    {data.sourceLanguage === 'zh' ? '中文内容' : '英文内容'}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold leading-snug text-foreground">
                {data.title ?? '加载中…'}
              </h1>
              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{data.author ?? data.siteName}</span>
                {data.sourceUrl && (
                  <>
                    <span>·</span>
                    <a
                      href={data.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground transition-colors duration-100"
                    >
                      查看原文
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing progress */}
        {!isDone && !isError && (
          <ProcessingStatus status={data?.status ?? 'pending'} />
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in">
            <p className="font-semibold">处理失败</p>
            <p className="mt-1 text-muted-foreground">{data?.error}</p>
          </div>
        )}

        {/* Content tabs */}
        {isDone && data && (
          <Tabs defaultValue="summary" className="animate-in">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">摘要</TabsTrigger>
              <TabsTrigger value="content" className="flex-1">原文</TabsTrigger>
              <TabsTrigger value="podcast" className="flex-1">播客</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              {data.summary ? (
                <SummaryView summary={data.summary} />
              ) : (
                <p className="text-muted-foreground text-sm">摘要生成中…</p>
              )}
            </TabsContent>
            <TabsContent value="content" className="mt-4">
              <ContentView contentId={id} sourceLanguage={data.sourceLanguage ?? 'en'} />
            </TabsContent>
            <TabsContent value="podcast" className="mt-4">
              {data.podcastScript ? (
                <PodcastView
                  script={data.podcastScript as { speaker: 'Alex' | 'Sam'; text: string }[]}
                  audioUrl={data.audioUrl}
                />
              ) : (
                <p className="text-muted-foreground text-sm">播客脚本生成中…</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
