import { useEffect, useState } from "react";

interface MTDGaugeProps {
  score: number;
}

const MTDGauge = ({ score }: MTDGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [showChange, setShowChange] = useState(false);

  useEffect(() => {
    if (animatedScore !== 0 && score !== animatedScore) {
      setPreviousScore(animatedScore);
      setShowChange(true);
      
      const changeTimer = setTimeout(() => {
        setShowChange(false);
      }, 2000);
      
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(changeTimer);
      };
    } else if (animatedScore === 0) {
      setAnimatedScore(score);
      setPreviousScore(score);
    }
  }, [score, animatedScore]);

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
          {showChange && previousScore !== animatedScore && (
            <div className={`text-xs font-semibold mt-1 animate-in fade-in slide-in-from-bottom-2 ${
              animatedScore > previousScore ? 'text-success' : 'text-warning'
            }`}>
              {animatedScore > previousScore ? '↗' : '↘'} {Math.abs(animatedScore - previousScore)}%
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">MTD Ready</div>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground mt-4">{getMessage()}</p>
    </div>
  );
};

export default MTDGauge;
