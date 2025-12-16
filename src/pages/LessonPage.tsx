import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Lightbulb, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  Loader2,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  useLesson, 
  useLessonProgress, 
  useStartLesson, 
  useToggleBookmark, 
  useSaveNotes,
  useRecordQuizAttempt,
  useCompleteLesson,
  useLessons
} from "@/hooks/useLessons";
import { useProfile } from "@/hooks/useProfile";
import { LessonQuiz } from "@/components/learning/LessonQuiz";
import BottomNav from "@/components/BottomNav";

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lesson, isLoading: lessonLoading } = useLesson(id);
  const { data: progress, isLoading: progressLoading } = useLessonProgress(id);
  const { data: allLessons } = useLessons();
  const { profile } = useProfile();

  const startLesson = useStartLesson();
  const toggleBookmark = useToggleBookmark();
  const saveNotes = useSaveNotes();
  const recordQuizAttempt = useRecordQuizAttempt();
  const completeLesson = useCompleteLesson();

  const [notes, setNotes] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Start lesson tracking
  useEffect(() => {
    if (id && lesson && !progress) {
      startLesson.mutate(id);
    }
  }, [id, lesson, progress]);

  // Load saved notes
  useEffect(() => {
    if (progress?.notes) {
      setNotes(progress.notes);
    }
  }, [progress?.notes]);

  // Check if quiz already completed
  useEffect(() => {
    if (progress?.quiz_score !== null && progress?.quiz_score !== undefined) {
      setQuizCompleted(true);
    }
  }, [progress?.quiz_score]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      setScrollProgress(Math.min(100, (scrolled / documentHeight) * 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-save notes with debounce
  const debouncedSaveNotes = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (id && value !== progress?.notes) {
            saveNotes.mutate({ lessonId: id, notes: value });
          }
        }, 1000);
      };
    })(),
    [id, progress?.notes]
  );

  const handleNotesChange = (value: string) => {
    setNotes(value);
    debouncedSaveNotes(value);
  };

  const handleBookmarkToggle = () => {
    if (!id) return;
    toggleBookmark.mutate({ 
      lessonId: id, 
      bookmarked: !progress?.bookmarked 
    });
    toast.success(progress?.bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (!id) return;
    recordQuizAttempt.mutate({ lessonId: id, score });
    setQuizCompleted(true);
    
    if (passed) {
      completeLesson.mutate({ lessonId: id, quizScore: score });
      toast.success("Lesson completed! 🎉");
    }
  };

  const getNextLesson = () => {
    if (!allLessons || !lesson) return null;
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    return allLessons[currentIndex + 1] || null;
  };

  const getIndustryExample = () => {
    if (!lesson?.content?.industry_examples) return null;
    const businessType = profile?.business_type || "general";
    return lesson.content.industry_examples[businessType] || lesson.content.industry_examples.general;
  };

  const isLoading = lessonLoading || progressLoading;
  const isCompleted = progress?.completed_at !== null && progress?.completed_at !== undefined;
  const nextLesson = getNextLesson();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Lesson not found</h2>
          <Button onClick={() => navigate("/curriculum")}>Back to Curriculum</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-1 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/curriculum")}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkToggle}
              className={cn(progress?.bookmarked && "text-primary")}
            >
              {progress?.bookmarked ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Lesson Header */}
        <div className="space-y-4">
          <div className="text-5xl">{lesson.emoji}</div>
          <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={difficultyColors[lesson.difficulty]}>
              {lesson.difficulty}
            </Badge>
            <Badge variant="outline">{lesson.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {lesson.duration} min
            </div>
            {isCompleted && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Introduction */}
        <Card className="p-6">
          <p className="text-foreground/90 leading-relaxed">{lesson.content.intro}</p>
        </Card>

        {/* Content Sections */}
        {lesson.content.sections?.map((section, index) => (
          <section key={index} className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{section.content}</p>
          </section>
        ))}

        {/* Industry Example */}
        {getIndustryExample() && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Example for Your Business
            </h3>
            <p className="text-foreground/80">{getIndustryExample()}</p>
          </Card>
        )}

        {/* Pro Tips */}
        {lesson.content.proTips && lesson.content.proTips.length > 0 && (
          <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Pro Tips
            </h3>
            <ul className="space-y-3">
              {lesson.content.proTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground/80">
                  <span className="text-amber-500 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Can Do / Can't Do */}
        {(lesson.content.canDo || lesson.content.cantDo) && (
          <div className="grid md:grid-cols-2 gap-4">
            {lesson.content.canDo && (
              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-500/20">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  You CAN
                </h3>
                <ul className="space-y-2">
                  {lesson.content.canDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {lesson.content.cantDo && (
              <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-500/20">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  You CAN'T
                </h3>
                <ul className="space-y-2">
                  {lesson.content.cantDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground/80 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Action Steps */}
        {lesson.content.actionSteps && lesson.content.actionSteps.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Action Steps</h3>
            <div className="space-y-3">
              {lesson.content.actionSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-foreground/80 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Your Notes</h3>
          <Textarea
            placeholder="Add your personal notes about this lesson..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground mt-2">Notes auto-save as you type</p>
        </Card>

        {/* Quiz Section */}
        {lesson.content.quiz && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Knowledge Check</h3>
            
            {!showQuiz && !quizCompleted && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Test your understanding with a quick quiz. You need {lesson.content.quiz.passing_score}% to pass.
                </p>
                <Button onClick={() => setShowQuiz(true)}>Start Quiz</Button>
              </Card>
            )}

            {showQuiz && !quizCompleted && (
              <LessonQuiz 
                quiz={lesson.content.quiz} 
                onComplete={handleQuizComplete}
                previousScore={progress?.quiz_score}
              />
            )}

            {quizCompleted && progress?.quiz_score !== null && (
              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-500/30">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-foreground">Quiz Completed!</h4>
                    <p className="text-muted-foreground">Your best score: {progress.quiz_score}%</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => {
                      setQuizCompleted(false);
                      setShowQuiz(true);
                    }}
                  >
                    Retake
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Next Lesson */}
        {nextLesson && isCompleted && (
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/lesson/${nextLesson.id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Continue Learning</p>
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span>{nextLesson.emoji}</span>
                  {nextLesson.title}
                </h4>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LessonPage;
