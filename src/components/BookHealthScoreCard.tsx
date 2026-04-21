import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, AlertCircle } from "lucide-react";
import { useBookHealthScore } from "@/hooks/useBookHealthScore";
import { scoreLabel, scoreToneClass } from "@/lib/bookHealthScore";
import { BookHealthDetail } from "./BookHealthDetail";

export const BookHealthScoreCard = () => {
  const [open, setOpen] = useState(false);
  const result = useBookHealthScore();
  const { score, fixNow, improve, trend, isLoading } = result;

  if (isLoading) {
    return <Card className="p-6 h-48 shimmer-loading" />;
  }

  return (
    <>
      <Card className="p-6 shadow-card hover-lift animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base">Book Health</h3>
          </div>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend > 0 ? "+" : ""}{trend} this week
            </div>
          )}
        </div>

        <div className="text-center py-4">
          <div className={`text-7xl font-bold ${scoreToneClass(score)}`}>{score}</div>
          <div className="text-sm text-muted-foreground mt-2 font-medium">
            {score}% {scoreLabel(score)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          {fixNow.length > 0 && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">{fixNow.length} fix{fixNow.length === 1 ? "" : "es"}</span>
            </div>
          )}
          {improve.length > 0 && (
            <div className="flex items-center gap-1.5 text-warning">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">{improve.length} to improve</span>
            </div>
          )}
          {fixNow.length === 0 && improve.length === 0 && (
            <span className="text-success font-semibold">Your books are accountant-ready 🎉</span>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
          View details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      <BookHealthDetail open={open} onOpenChange={setOpen} result={result} />
    </>
  );
};

export default BookHealthScoreCard;
