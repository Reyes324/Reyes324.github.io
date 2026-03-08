'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PodcastLine {
  speaker: 'Alex' | 'Sam';
  text: string;
}

interface Props {
  script: PodcastLine[];
  audioUrl?: string;
}

export function PodcastView({ script, audioUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  return (
    <div className="space-y-4">
      {/* Audio player */}
      {audioUrl && (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <Button
            onClick={togglePlay}
            variant="default"
            className="h-10 w-10 rounded-full p-0 flex-shrink-0"
            aria-label={playing ? '暂停播客' : '播放播客'}
          >
            {playing ? '⏸' : '▶'}
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium">Alex & Sam 播客</p>
            <p className="text-xs text-muted-foreground">AI 生成·双人对话</p>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      {/* Script */}
      <div className="space-y-3">
        {script.map((line, i) => {
          const isAlex = line.speaker === 'Alex';
          return (
            <div
              key={i}
              className={`flex gap-3 ${isAlex ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                  ${isAlex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
                `}
              >
                {line.speaker[0]}
              </div>
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${isAlex
                    ? 'bg-card border border-border rounded-tl-sm'
                    : 'bg-primary/10 rounded-tr-sm'
                  }
                `}
              >
                <span className="text-xs text-muted-foreground font-medium block mb-1">
                  {line.speaker}
                </span>
                {line.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
