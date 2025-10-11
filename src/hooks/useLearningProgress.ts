import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLearningProgress = () => {
  const [isTracking, setIsTracking] = useState(false);

  const startLesson = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_learning_progress').insert({
        user_id: user.id,
        lesson_id: lessonId,
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const completeLesson = async (lessonId: string, timeSpent: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_learning_progress')
        .update({
          completed_at: new Date().toISOString(),
          time_spent: timeSpent,
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .is('completed_at', null);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const toggleSaveLesson = async (lessonId: string, saved: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if lesson exists in progress
      const { data: existing } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (existing) {
        await supabase
          .from('user_learning_progress')
          .update({ saved })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
      } else {
        await supabase.from('user_learning_progress').insert({
          user_id: user.id,
          lesson_id: lessonId,
          saved,
        });
      }
    } catch (error) {
      console.error('Error toggling save lesson:', error);
    }
  };

  const trackTooltipClick = async (tooltipId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('tooltip_interactions').insert({
        user_id: user.id,
        tooltip_id: tooltipId,
      });
    } catch (error) {
      console.error('Error tracking tooltip click:', error);
    }
  };

  return {
    startLesson,
    completeLesson,
    toggleSaveLesson,
    trackTooltipClick,
    isTracking,
  };
};