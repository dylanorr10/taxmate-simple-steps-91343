import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

export const useStreak = () => {
  const queryClient = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ["user-streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // If no streak exists, create one
      if (!data) {
        const { data: newStreak, error: insertError } = await supabase
          .from("user_streaks")
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStreak as Streak;
      }

      return data as Streak;
    },
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];
      const lastDate = streak?.last_activity_date;

      let newStreak = streak?.current_streak || 0;
      
      // If last activity was yesterday, increment streak
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        
        if (lastDate === yesterdayStr) {
          newStreak = newStreak + 1;
        } else if (lastDate !== today) {
          // Streak broken, reset to 1
          newStreak = 1;
        } else {
          // Already logged today, no change
          return streak;
        }
      } else {
        // First activity
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streak?.longest_streak || 0);

      const { data, error } = await supabase
        .from("user_streaks")
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Streak;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-streak"], data);
      
      // Show celebration if streak increased
      if (data.current_streak > (streak?.current_streak || 0)) {
        toast.success(`🔥 ${data.current_streak} day streak!`, {
          description: "Keep up the great work!",
        });
      }
    },
  });

  return {
    streak,
    isLoading,
    updateStreak: updateStreak.mutate,
    isUpdating: updateStreak.isPending,
  };
};
