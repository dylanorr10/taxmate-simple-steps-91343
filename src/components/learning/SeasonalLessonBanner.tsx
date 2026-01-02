import { Calendar, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrentSeasonalLesson, getMonthName } from "@/hooks/useSeasonalLessons";
import { useLessonProgress, useUserProgress } from "@/hooks/useLessons";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SeasonalLessonBannerProps {
  onLessonClick?: (lessonId: string) => void;
}

export const SeasonalLessonBanner = ({ onLessonClick }: SeasonalLessonBannerProps) => {
  const navigate = useNavigate();
  const { 
    currentLesson, 
    upcomingLesson, 
    monthName, 
    upcomingMonthName,
    allSeasonalLessons 
  } = useCurrentSeasonalLesson();
  
  const { data: progress } = useLessonProgress(currentLesson?.id);
  const { data: allProgress } = useUserProgress();
  
  // Calculate seasonal completion
  const completedSeasonalCount = allSeasonalLessons.filter(lesson => 
    allProgress?.some(p => p.lesson_id === lesson.id && p.completed_at)
  ).length;
  const totalSeasonalCount = allSeasonalLessons.length;
  const completionPercent = totalSeasonalCount > 0 
    ? Math.round((completedSeasonalCount / totalSeasonalCount) * 100) 
    : 0;

  const isCompleted = progress?.completed_at != null;
  const isUrgentMonth = currentLesson?.seasonal_priority;
  
  const handleClick = () => {
    if (currentLesson) {
      if (onLessonClick) {
        onLessonClick(currentLesson.id);
      } else {
        navigate(`/learn/lesson/${currentLesson.id}`);
      }
    }
  };

  if (!currentLesson) {
    return null;
  }

  return (
    <Card className={cn(
      "overflow-hidden border-2 transition-all",
      isUrgentMonth && !isCompleted 
        ? "border-destructive/50 bg-destructive/5" 
        : "border-primary/20 bg-primary/5"
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Main content */}
          <div className="flex-1 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                This Month's Focus
              </span>
              {isUrgentMonth && !isCompleted && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700">
                  Completed
                </Badge>
              )}
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{currentLesson.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {currentLesson.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {currentLesson.duration} min
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {currentLesson.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {monthName}
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleClick}
              className="w-full md:w-auto"
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? "Review Lesson" : "Start Lesson"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Side panel with progress & upcoming */}
          <div className="bg-muted/30 p-4 md:p-6 md:w-64 border-t md:border-t-0 md:border-l border-border/50">
            {/* Yearly progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Seasonal Progress</span>
                <span className="font-medium">{completedSeasonalCount}/{totalSeasonalCount}</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>

            {/* Upcoming preview */}
            {upcomingLesson && (
              <div className="pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground block mb-2">
                  Coming in {upcomingMonthName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{upcomingLesson.emoji}</span>
                  <span className="text-sm font-medium text-foreground line-clamp-2">
                    {upcomingLesson.title}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
