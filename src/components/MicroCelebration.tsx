import { useEffect, useState } from "react";

interface MicroCelebrationProps {
  message: string;
  amount?: number;
  onComplete?: () => void;
}

export const MicroCelebration = ({ message, amount, onComplete }: MicroCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-success to-success/80 text-success-foreground px-6 py-3 rounded-full shadow-lg shadow-success/20 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <div>
          <div className="font-semibold">{message}</div>
          {amount && (
            <div className="text-sm opacity-90">
              Tax savings: +£{Math.round(amount * 0.2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
