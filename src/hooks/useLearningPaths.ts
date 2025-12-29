import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  difficulty: string;
  lesson_ids: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserPathProgress {
  id: string;
  user_id: string;
  path_id: string;
  started_at: string;
  completed_at: string | null;
  current_lesson_index: number;
  created_at: string;
  updated_at: string;
}

export const useLearningPaths = () => {
  return useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as LearningPath[];
    },
  });
};

export const useUserPathProgress = () => {
  return useQuery({
    queryKey: ['user-path-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_path_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserPathProgress[];
    },
  });
};

export const useStartPath = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pathId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_path_progress')
        .upsert({
          user_id: user.id,
          path_id: pathId,
          current_lesson_index: 0,
          started_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,path_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress'] });
    },
  });
};

export const useUpdatePathProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pathId, lessonIndex, completed }: { 
      pathId: string; 
      lessonIndex: number;
      completed?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData: Partial<UserPathProgress> = {
        current_lesson_index: lessonIndex,
      };

      if (completed) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_path_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('path_id', pathId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress'] });
    },
  });
};
