import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface ConfidenceRatingProps {
  question: string;
  onRate: (level: number) => void;
  onSkip?: () => void;
}

export const ConfidenceRating = ({ question, onRate, onSkip }: ConfidenceRatingProps) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const levels = [
    { value: 1, emoji: "😰", label: "Not sure" },
    { value: 2, emoji: "🤔", label: "Uncertain" },
    { value: 3, emoji: "😐", label: "Maybe" },
    { value: 4, emoji: "😊", label: "Pretty sure" },
    { value: 5, emoji: "😎", label: "Very confident" },
  ];

  const handleSelect = (level: number) => {
    setSelectedLevel(level);
    setTimeout(() => {
      onRate(level);
    }, 300);
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 p-5 shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3 mb-4">
        <Brain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="text-xs font-bold text-primary mb-1 tracking-wide uppercase">
            🤔 Quick Check
          </div>
          <p className="text-sm text-foreground font-medium leading-relaxed">
            {question}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => handleSelect(level.value)}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3 ${
              selectedLevel === level.value
                ? "border-primary bg-primary/10 scale-105"
                : "border-border hover:border-primary/50 hover:bg-muted"
            }`}
          >
            <span className="text-2xl">{level.emoji}</span>
            <span className="text-sm font-medium">{level.label}</span>
          </button>
        ))}
      </div>

      {onSkip && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="w-full mt-3 text-xs"
        >
          Skip this time
        </Button>
      )}
    </Card>
  );
};
