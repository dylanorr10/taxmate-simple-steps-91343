import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DailyTip } from "@/data/dailyTips";

interface DailyTipToastProps {
  tip: DailyTip;
  onDismiss: () => void;
  onReadMore?: () => void;
}

export const DailyTipToast = ({ tip, onDismiss, onReadMore }: DailyTipToastProps) => {
  return (
    <Card className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 p-4 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{tip.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-primary mb-1">💡 Tip of the Day</div>
          <p className="text-sm text-foreground leading-relaxed">{tip.content}</p>
          {tip.relatedLessonId && onReadMore && (
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
              onClick={onReadMore}
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Read more
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};