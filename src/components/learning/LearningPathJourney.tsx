import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Play, Lock, ArrowLeft, Trophy } from "lucide-react";
import type { LearningPath, UserPathProgress } from "@/hooks/useLearningPaths";
import type { Lesson } from "@/hooks/useLessons";

interface LearningPathJourneyProps {
  path: LearningPath;
  lessons: Lesson[];
  progress?: UserPathProgress;
  lessonCompletionMap: Map<string, boolean>;
  onBack: () => void;
  onLessonClick: (lessonId: string) => void;
  onStart: () => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; line: string }> = {
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-500', line: 'bg-emerald-500/30' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500', line: 'bg-blue-500/30' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-500', line: 'bg-amber-500/30' },
  violet: { bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-500', line: 'bg-violet-500/30' },
  rose: { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-500', line: 'bg-rose-500/30' },
  cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-500', line: 'bg-cyan-500/30' },
  primary: { bg: 'bg-primary', border: 'border-primary', text: 'text-primary', line: 'bg-primary/30' },
};

export const LearningPathJourney = ({
  path,
  lessons,
  progress,
  lessonCompletionMap,
  onBack,
  onLessonClick,
  onStart,
}: LearningPathJourneyProps) => {
  const pathLessons = path.lesson_ids
    .map(id => lessons.find(l => l.id === id))
    .filter(Boolean) as Lesson[];

  const colors = COLOR_MAP[path.color] || COLOR_MAP.primary;
  const isStarted = !!progress;
  const completedCount = pathLessons.filter(l => lessonCompletionMap.get(l.id)).length;
  const isPathComplete = completedCount === pathLessons.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{path.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{path.title}</h2>
              <p className="text-muted-foreground">{path.description}</p>
            </div>
          </div>
        </div>
        <Badge variant="outline">{path.difficulty}</Badge>
      </div>

      {/* Completion Banner */}
      {isPathComplete && (
        <Card className="p-6 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/30">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-500" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Path Complete!</h3>
              <p className="text-muted-foreground">
                You've mastered all {pathLessons.length} lessons in this path.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Journey Map */}
      <div className="relative">
        {/* Vertical line */}
        <div className={`absolute left-6 top-8 bottom-8 w-0.5 ${colors.line}`} />

        <div className="space-y-1">
          {pathLessons.map((lesson, index) => {
            const isCompleted = lessonCompletionMap.get(lesson.id);
            const previousCompleted = index === 0 || lessonCompletionMap.get(pathLessons[index - 1]?.id);
            const isUnlocked = index === 0 || previousCompleted;
            const isCurrent = isStarted && !isCompleted && isUnlocked;

            return (
              <div
                key={lesson.id}
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-card border border-border shadow-lg scale-[1.02]' 
                    : isCompleted 
                    ? 'bg-muted/30' 
                    : 'hover:bg-muted/20'
                } ${!isUnlocked ? 'opacity-50' : 'cursor-pointer'}`}
                onClick={() => isUnlocked && onLessonClick(lesson.id)}
              >
                {/* Node */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted 
                    ? `${colors.bg} ${colors.border}` 
                    : isCurrent
                    ? `bg-background ${colors.border}`
                    : 'bg-muted border-muted-foreground/30'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : !isUnlocked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <span className="text-lg font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{lesson.emoji}</span>
                    <h3 className={`font-medium truncate ${!isUnlocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {lesson.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{lesson.category}</span>
                  </div>
                </div>

                {/* Action */}
                {isCurrent && (
                  <Button size="sm" className={colors.bg}>
                    <Play className="w-4 h-4 mr-1" />
                    Continue
                  </Button>
                )}
                {isCompleted && (
                  <Badge variant="secondary" className="text-emerald-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      {!isStarted && (
        <Button className="w-full" size="lg" onClick={onStart}>
          <Play className="w-5 h-5 mr-2" />
          Start This Path
        </Button>
      )}
    </div>
  );
};
