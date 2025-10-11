import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

export const StreakCounter = () => {
  const { streak, isLoading } = useStreak();

  if (isLoading || !streak) return null;

  const currentStreak = streak.current_streak || 0;
  const longestStreak = streak.longest_streak || 0;

  if (currentStreak === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-full">
      <Flame className="w-4 h-4 text-warning" />
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-warning">{currentStreak}</span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
      {longestStreak > currentStreak && (
        <div className="text-xs text-muted-foreground pl-2 border-l border-border">
          Best: {longestStreak}
        </div>
      )}
    </div>
  );
};
