'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UrlInput } from '@/components/url-input';
import { HistoryList } from '@/components/history-list';

interface HistoryItem {
  id: string;
  type: string;
  title: string | null;
  author: string | null;
  siteName: string | null;
  thumbnailUrl: string | null;
  status: string | null;
  sourceUrl: string;
  createdAt: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/contents')
      .then((r) => r.json())
      .then(setHistory)
      .catch(console.error);
  }, []);

  async function handleSubmit(url: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '提交失败');
      router.push(`/content/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败，请重试');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero section */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              内容提炼
            </h1>
            <p className="text-muted-foreground text-lg">
              粘贴 YouTube 视频链接或文章 URL，自动生成中文摘要和播客
            </p>
          </div>
          <UrlInput onSubmit={handleSubmit} disabled={loading} />
        </div>
      </section>

      {/* History */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-2xl">
          <HistoryList items={history} />
        </div>
      </section>
    </main>
  );
}
