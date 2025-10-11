import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target } from "lucide-react";
import { useConfidenceRatings } from "@/hooks/useConfidenceRatings";

export const ConfidenceProgress = () => {
  const { stats, isLoading } = useConfidenceRatings();

  if (isLoading || stats.totalRatings === 0) return null;

  return (
    <Card className="p-4 shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Your Tax Intuition</h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Accuracy Rate</span>
            </div>
            <span className="text-lg font-bold text-success">
              {stats.accuracyRate}%
            </span>
          </div>
          <Progress value={stats.accuracyRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            You correctly predict your knowledge {stats.accuracyRate}% of the time
          </p>
        </div>

        {stats.improvementRate !== 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${stats.improvementRate > 0 ? 'text-success' : 'text-warning'}`} />
              <span className="text-sm font-medium">
                {stats.improvementRate > 0 ? '↗' : '↘'} {Math.abs(stats.improvementRate)}% 
                {stats.improvementRate > 0 ? ' improvement' : ' change'} this month
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.improvementRate > 0 
                ? "Your tax knowledge intuition is getting stronger!"
                : "Keep practicing - awareness leads to mastery!"}
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Based on {stats.totalRatings} confidence ratings
          </p>
        </div>
      </div>
    </Card>
  );
};
