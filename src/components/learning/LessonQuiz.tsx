import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Award, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonContent } from "@/hooks/useLessons";

interface LessonQuizProps {
  quiz: NonNullable<LessonContent["quiz"]>;
  onComplete: (score: number, passed: boolean) => void;
  previousScore?: number | null;
}

export const LessonQuiz = ({ quiz, onComplete, previousScore }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = quiz.questions[currentQuestion];
  const isCorrect = selectedAnswer === question?.correct_answer;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
      const scorePercent = Math.round((finalCorrect / quiz.questions.length) * 100);
      const passed = scorePercent >= quiz.passing_score;
      setIsComplete(true);
      onComplete(scorePercent, passed);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const finalScore = Math.round(((isCorrect ? correctAnswers + 1 : correctAnswers) / quiz.questions.length) * 100);
    const passed = finalScore >= quiz.passing_score;

    return (
      <Card className={cn(
        "p-8 text-center space-y-4",
        passed ? "bg-green-50 dark:bg-green-950/20 border-green-500/30" : "bg-amber-50 dark:bg-amber-950/20 border-amber-500/30"
      )}>
        <Award className={cn("w-16 h-16 mx-auto", passed ? "text-green-500" : "text-amber-500")} />
        <h3 className="text-2xl font-bold text-foreground">Quiz Complete!</h3>
        <p className="text-4xl font-bold text-foreground">{finalScore}%</p>
        <p className="text-lg text-muted-foreground">
          {passed 
            ? "Congratulations! You passed! 🎉"
            : `You need ${quiz.passing_score}% to pass. Keep learning!`
          }
        </p>
        <p className="text-sm text-muted-foreground">
          You got {isCorrect ? correctAnswers + 1 : correctAnswers} out of {quiz.questions.length} questions correct
        </p>
        {!passed && (
          <Button onClick={handleRetake} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retake Quiz
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{correctAnswers} correct</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
              className={cn(
                "w-full p-4 text-left rounded-lg border-2 transition-all",
                "hover:border-primary/50 disabled:cursor-not-allowed",
                selectedAnswer === index && !showExplanation && "border-primary bg-primary/5",
                showExplanation && index === question.correct_answer && "border-green-500 bg-green-50 dark:bg-green-950/30",
                showExplanation && selectedAnswer === index && index !== question.correct_answer && "border-red-500 bg-red-50 dark:bg-red-950/30",
                !showExplanation && selectedAnswer !== index && "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-foreground">{option}</span>
                {showExplanation && index === question.correct_answer && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                {showExplanation && selectedAnswer === index && index !== question.correct_answer && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className={cn(
            "p-4 rounded-lg border-2",
            isCorrect 
              ? "bg-green-50 dark:bg-green-950/30 border-green-500" 
              : "bg-blue-50 dark:bg-blue-950/30 border-blue-500"
          )}>
            <p className="font-semibold mb-2 text-foreground">
              {isCorrect ? "✓ Correct!" : "Learn more:"}
            </p>
            <p className="text-sm text-foreground/80">{question.explanation}</p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {!showExplanation ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="w-full"
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
