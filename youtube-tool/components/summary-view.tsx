import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Summary {
  core_summary: string;
  key_points: string[];
  quotes: string[];
  reflections: string[];
}

export function SummaryView({ summary }: { summary: Summary }) {
  return (
    <div className="space-y-4">
      {/* Core summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">核心摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{summary.core_summary}</p>
        </CardContent>
      </Card>

      {/* Key points */}
      {summary.key_points?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">关键观点</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {summary.key_points.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Quotes */}
      {summary.quotes?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">金句</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.quotes.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground leading-relaxed"
              >
                {quote}
              </blockquote>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reflections */}
      {summary.reflections?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">延伸思考</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.reflections.map((q, i) => (
              <div key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary font-medium flex-shrink-0">?</span>
                <span>{q}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
