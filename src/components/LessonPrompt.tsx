import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";
import { useState } from "react";

interface LessonPromptProps {
  headline: string;
  body: string;
  lessonId: string;
  onOpenLesson: () => void;
  onDismiss: () => void;
}

export const LessonPrompt = ({ headline, body, onOpenLesson, onDismiss }: LessonPromptProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{headline}</h3>
          <p className="text-xs text-muted-foreground mb-3">{body}</p>
          <Button size="sm" onClick={onOpenLesson} className="text-xs h-8">
            Learn in 3 mins
          </Button>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
