import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, CheckCircle2, Play, Lock } from "lucide-react";
import type { LearningPath, UserPathProgress } from "@/hooks/useLearningPaths";

interface LearningPathCardProps {
  path: LearningPath;
  progress?: UserPathProgress;
  lessonCompletionMap: Map<string, boolean>;
  onClick: () => void;
  onStart: () => void;
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  primary: 'from-primary/20 to-primary/10 border-primary/30',
};

const TEXT_COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-500',
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  violet: 'text-violet-500',
  rose: 'text-rose-500',
  cyan: 'text-cyan-500',
  primary: 'text-primary',
};

export const LearningPathCard = ({
  path,
  progress,
  lessonCompletionMap,
  onClick,
  onStart,
}: LearningPathCardProps) => {
  const completedLessons = path.lesson_ids.filter(id => lessonCompletionMap.get(id)).length;
  const totalLessons = path.lesson_ids.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isStarted = !!progress;
  const isCompleted = progressPercent === 100;

  const colorClass = COLOR_MAP[path.color] || COLOR_MAP.primary;
  const textColorClass = TEXT_COLOR_MAP[path.color] || TEXT_COLOR_MAP.primary;

  return (
    <Card 
      className={`p-5 bg-gradient-to-br ${colorClass} cursor-pointer hover:shadow-lg transition-all group`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{path.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground truncate">{path.title}</h3>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {path.description}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {path.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {totalLessons} lessons
            </span>
          </div>

          {isStarted ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={textColorClass}>{completedLessons}/{totalLessons} completed</span>
                <span className="text-muted-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          ) : (
            <Button 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
            >
              <Play className="w-4 h-4 mr-1" />
              Start Path
            </Button>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </div>
    </Card>
  );
};
