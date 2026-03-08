import { Progress } from '@/components/ui/progress';

const STEPS = [
  { key: 'pending', label: '准备中' },
  { key: 'extracting', label: '提取内容' },
  { key: 'translating', label: '翻译' },
  { key: 'summarizing', label: '生成摘要' },
  { key: 'generating_podcast', label: '生成播客脚本' },
  { key: 'generating_audio', label: '生成语音' },
  { key: 'done', label: '完成' },
];

export function ProcessingStatus({ status }: { status: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const progress = currentIdx < 0 ? 0 : Math.round((currentIdx / (STEPS.length - 1)) * 100);
  const currentStep = STEPS[currentIdx] ?? STEPS[0];

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{currentStep.label}…</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <ol className="flex gap-1 flex-wrap">
        {STEPS.filter((s) => s.key !== 'pending').map((step, i) => {
          const stepIdx = STEPS.findIndex((s) => s.key === step.key);
          const done = stepIdx < currentIdx;
          const active = stepIdx === currentIdx;
          return (
            <li
              key={step.key}
              className={`
                flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                ${done ? 'bg-primary/10 text-primary' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}
            >
              {done && <span>✓</span>}
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
