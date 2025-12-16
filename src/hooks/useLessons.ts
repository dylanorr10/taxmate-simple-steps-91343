import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LessonContent {
  intro: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  industry_examples?: {
    general?: string;
    consulting?: string;
    creative?: string;
    trades?: string;
    [key: string]: string | undefined;
  };
  proTips?: string[];
  actionSteps?: string[];
  canDo?: string[];
  cantDo?: string[];
  quiz?: {
    passing_score: number;
    questions: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    }>;
  };
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  emoji: string;
  order_index: number;
  lesson_type: string;
  quiz_required: boolean;
  content: LessonContent;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
  completion_rate: number;
  quiz_score: number | null;
  quiz_attempts: number;
  bookmarked: boolean;
  notes: string | null;
  mastery_level: number;
}

export const useLessons = () => {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as unknown as Lesson[];
    },
  });
};

export const useLesson = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (error) throw error;
      return data as unknown as Lesson;
    },
    enabled: !!lessonId,
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserProgress[];
    },
  });
};

export const useLessonProgress = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ["lesson-progress", lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) throw error;
      return data as UserProgress | null;
    },
    enabled: !!lessonId,
  });
};

export const useStartLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          started_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      updates 
    }: { 
      lessonId: string; 
      updates: Partial<Omit<UserProgress, "id" | "user_id" | "lesson_id">> 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_progress")
        .update(updates)
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
};

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, quizScore }: { lessonId: string; quizScore?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_progress")
        .update({
          completed_at: new Date().toISOString(),
          completion_rate: 100,
          quiz_score: quizScore,
        })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, bookmarked }: { lessonId: string; bookmarked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First ensure progress record exists
      await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          started_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id",
        });

      const { data, error } = await supabase
        .from("user_progress")
        .update({ bookmarked })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
};

export const useSaveNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, notes }: { lessonId: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_progress")
        .update({ notes })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
};

export const useRecordQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, score }: { lessonId: string; score: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current progress
      const { data: current } = await supabase
        .from("user_progress")
        .select("quiz_attempts, quiz_score")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      const newAttempts = (current?.quiz_attempts || 0) + 1;
      const bestScore = Math.max(current?.quiz_score || 0, score);

      const { data, error } = await supabase
        .from("user_progress")
        .update({
          quiz_attempts: newAttempts,
          quiz_score: bestScore,
        })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
};
