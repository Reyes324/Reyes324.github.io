import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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

const STATUS_LABELS: Record<string, string> = {
  pending: '等待中',
  extracting: '提取内容',
  translating: '翻译中',
  summarizing: '生成摘要',
  generating_podcast: '生成播客',
  generating_audio: '生成语音',
  done: '完成',
  error: '失败',
};

export function HistoryList({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-2">
        <p className="text-muted-foreground font-medium">暂无记录</p>
        <p className="text-sm text-muted-foreground">
          提交链接后，处理结果会显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        历史记录
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/content/${item.id}`}
              className="
                flex items-center gap-4 rounded-xl border border-border bg-card p-4
                hover:border-primary/30 hover:bg-accent
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              {/* Thumbnail or icon */}
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="h-12 w-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                  {item.type === 'youtube' ? '▶' : '📄'}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-medium text-sm truncate text-foreground">
                  {item.title ?? item.sourceUrl}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {item.author ?? item.siteName ?? new URL(item.sourceUrl).hostname}
                  </span>
                  {item.createdAt && (
                    <>
                      <span>·</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <Badge
                variant={item.status === 'done' ? 'default' : item.status === 'error' ? 'destructive' : 'secondary'}
                className="flex-shrink-0 text-xs"
              >
                {STATUS_LABELS[item.status ?? 'pending'] ?? item.status}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
