import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const LessonQuiz = ({ questions, onComplete }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowExplanation(true);
    
    if (isCorrect && !answeredQuestions[currentQuestion]) {
      setScore(score + 1);
      setAnsweredQuestions(prev => {
        const updated = [...prev];
        updated[currentQuestion] = true;
        return updated;
      });
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalScore = isCorrect && !answeredQuestions[currentQuestion] ? score + 1 : score;
      onComplete((finalScore / questions.length) * 100);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  if (currentQuestion >= questions.length) {
    return (
      <Card className="p-6 text-center space-y-4 bg-primary/5">
        <Award className="w-16 h-16 mx-auto text-primary" />
        <h3 className="text-2xl font-bold">Quiz Complete!</h3>
        <p className="text-lg">
          You scored {score} out of {questions.length}
        </p>
        <p className="text-muted-foreground">
          {score === questions.length 
            ? "Perfect score! You've mastered this topic! 🎉"
            : score >= questions.length / 2
            ? "Great job! You're on the right track."
            : "Keep learning - you'll get there!"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{score} correct</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{question.question}</h3>
        
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
                showExplanation && index === question.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-950",
                showExplanation && selectedAnswer === index && index !== question.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-950",
                !showExplanation && selectedAnswer !== index && "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showExplanation && index === question.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                {showExplanation && selectedAnswer === index && index !== question.correctAnswer && (
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
              ? "bg-green-50 dark:bg-green-950 border-green-500" 
              : "bg-blue-50 dark:bg-blue-950 border-blue-500"
          )}>
            <p className="font-semibold mb-2">
              {isCorrect ? "✓ Correct!" : "Learn more:"}
            </p>
            <p className="text-sm">{question.explanation}</p>
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
