'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { detectUrlType } from '@/lib/url-detector';

interface Props {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

const TYPE_LABELS = {
  youtube: { label: '检测到 YouTube 视频', color: 'text-red-500' },
  article: { label: '检测到网页文章', color: 'text-primary' },
  unknown: { label: '请输入有效的 YouTube 或文章链接', color: 'text-destructive' },
};

const EXAMPLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export function UrlInput({ onSubmit, disabled }: Props) {
  const [url, setUrl] = useState('');
  const [urlType, setUrlType] = useState<'youtube' | 'article' | 'unknown' | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (val.trim().length > 8) {
      setUrlType(detectUrlType(val.trim()));
    } else {
      setUrlType(null);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim()) onSubmit(url.trim());
    },
    [url, onSubmit]
  );

  const handleExample = useCallback(() => {
    setUrl(EXAMPLE_URL);
    setUrlType(detectUrlType(EXAMPLE_URL));
  }, []);

  const showBadge = urlType !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={handleChange}
          placeholder="粘贴 YouTube 视频链接或文章 URL…"
          disabled={disabled}
          autoFocus
          className="
            h-12 flex-1 rounded-xl border border-input bg-card px-4 text-base
            placeholder:text-muted-foreground
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow duration-150
          "
        />
        <Button
          type="submit"
          disabled={disabled || !url.trim() || urlType === 'unknown'}
          className="h-12 px-6 rounded-xl font-medium"
        >
          {disabled ? '处理中…' : '提炼内容'}
        </Button>
      </div>

      {/* URL type indicator */}
      {showBadge && (
        <p
          className={`text-sm animate-in ${TYPE_LABELS[urlType!].color}`}
          aria-live="polite"
        >
          {TYPE_LABELS[urlType!].label}
        </p>
      )}

      {/* Empty state hint */}
      {!url && (
        <p className="text-sm text-muted-foreground">
          没有链接？{' '}
          <button
            type="button"
            onClick={handleExample}
            className="underline underline-offset-2 hover:text-foreground transition-colors duration-100"
          >
            试试这个示例
          </button>
        </p>
      )}
    </form>
  );
}
