import { useEffect, useState } from "react";

interface MTDGaugeProps {
  score: number;
}

const MTDGauge = ({ score }: MTDGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getMessage = () => {
    if (score >= 80) return "Looking brilliant! 🎉";
    if (score >= 50) return "You're getting there!";
    return "Let's build this together";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color: getColor() }}>
            {animatedScore}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">MTD Ready</div>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground mt-4">{getMessage()}</p>
    </div>
  );
};

export default MTDGauge;
