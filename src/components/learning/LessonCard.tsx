import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, BookmarkIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson, UserProgress } from "@/hooks/useLessons";

interface LessonCardProps {
  lesson: Lesson;
  progress?: UserProgress | null;
  onClick?: () => void;
  isLocked?: boolean;
}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const categoryColors: Record<string, string> = {
  "Getting Started": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Tax": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Expenses": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "VAT": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "Bookkeeping": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Financial Statements": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Compliance": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "Payroll": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Admin": "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export const LessonCard = ({ lesson, progress, onClick, isLocked }: LessonCardProps) => {
  const isCompleted = progress?.completed_at !== null && progress?.completed_at !== undefined;
  const isInProgress = progress?.started_at && !isCompleted;
  const isBookmarked = progress?.bookmarked;

  return (
    <Card
      onClick={isLocked ? undefined : onClick}
      className={cn(
        "relative p-4 transition-all duration-200 cursor-pointer group",
        "hover:shadow-md hover:-translate-y-0.5",
        isCompleted && "border-green-500/50 bg-green-50/30 dark:bg-green-950/10",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Status indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isBookmarked && (
          <BookmarkIcon className="w-4 h-4 fill-primary text-primary" />
        )}
        {isCompleted && (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        {isLocked && (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Emoji */}
      <div className="text-4xl mb-3">{lesson.emoji}</div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-2 pr-8 line-clamp-2">
        {lesson.title}
      </h3>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="secondary" className={cn("text-xs", difficultyColors[lesson.difficulty])}>
          {lesson.difficulty}
        </Badge>
        <Badge variant="secondary" className={cn("text-xs", categoryColors[lesson.category] || "bg-muted")}>
          {lesson.category}
        </Badge>
      </div>

      {/* Duration */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Clock className="w-4 h-4 mr-1" />
        {lesson.duration} min
      </div>

      {/* Progress bar for in-progress lessons */}
      {isInProgress && progress?.completion_rate !== undefined && progress.completion_rate > 0 && (
        <div className="mt-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress.completion_rate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress.completion_rate}% complete
          </p>
        </div>
      )}
    </Card>
  );
};
