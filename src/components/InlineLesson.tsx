import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getExamples } from "@/data/businessTypeConfig";
import { LessonQuiz, QuizQuestion } from "@/components/LessonQuiz";
import { useState } from "react";

interface InlineLessonProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  emoji?: string;
  lessonId?: string;
  quiz?: QuizQuestion[];
}

export const InlineLesson = ({ isOpen, onClose, title, content, emoji, lessonId, quiz }: InlineLessonProps) => {
  const { data: profile } = useBusinessProfile();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  let displayContent = content;
  if (lessonId && profile?.businessType) {
    const examples = getExamples(lessonId, profile.businessType);
    if (examples.length > 0) {
      const examplesList = examples.map(ex => `✅ ${ex}`).join('\n');
      displayContent = content.replace('{{CUSTOM_EXAMPLES}}', examplesList);
    }
  }

  const handleQuizComplete = (score: number) => {
    setQuizCompleted(true);
    setQuizScore(score);
  };

  const handleClose = () => {
    setShowQuiz(false);
    setQuizCompleted(false);
    setQuizScore(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            {title}
          </DialogTitle>
          <DialogDescription>
            {showQuiz ? "Test your knowledge" : "Quick learning moment"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {!showQuiz ? (
            <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
              {displayContent}
            </div>
          ) : (
            <LessonQuiz 
              questions={quiz || []} 
              onComplete={handleQuizComplete}
            />
          )}
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4">
          {!showQuiz && quiz && quiz.length > 0 && (
            <Button variant="outline" onClick={() => setShowQuiz(true)}>
              Take Quiz
            </Button>
          )}
          {quizCompleted && (
            <span className="text-sm text-muted-foreground mr-auto">
              Score: {Math.round(quizScore)}%
            </span>
          )}
          <Button onClick={handleClose}>
            {quizCompleted ? "Close" : "Got it!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};