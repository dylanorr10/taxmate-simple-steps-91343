import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import type { Json } from "@/integrations/supabase/types";

export interface SeasonalLesson {
  id: string;
  title: string;
  emoji: string;
  category: string;
  difficulty: string;
  duration: number;
  seasonal_month: number;
  seasonal_priority: boolean;
  content: Json;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const useSeasonalLessons = () => {
  return useQuery({
    queryKey: ['seasonal-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .not('seasonal_month', 'is', null)
        .order('seasonal_month');
      
      if (error) throw error;
      return data as SeasonalLesson[];
    },
  });
};

export const useCurrentSeasonalLesson = () => {
  const { data: seasonalLessons, isLoading, error } = useSeasonalLessons();
  
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  const { currentLesson, upcomingLesson, monthName, upcomingMonthName } = useMemo(() => {
    if (!seasonalLessons) {
      return { 
        currentLesson: null, 
        upcomingLesson: null, 
        monthName: MONTH_NAMES[currentMonth - 1],
        upcomingMonthName: MONTH_NAMES[currentMonth % 12]
      };
    }
    
    const current = seasonalLessons.find(l => l.seasonal_month === currentMonth);
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const upcoming = seasonalLessons.find(l => l.seasonal_month === nextMonth);
    
    return {
      currentLesson: current || null,
      upcomingLesson: upcoming || null,
      monthName: MONTH_NAMES[currentMonth - 1],
      upcomingMonthName: MONTH_NAMES[nextMonth - 1]
    };
  }, [seasonalLessons, currentMonth]);
  
  return {
    currentLesson,
    upcomingLesson,
    monthName,
    upcomingMonthName,
    allSeasonalLessons: seasonalLessons || [],
    isLoading,
    error
  };
};

export const getMonthName = (month: number): string => {
  return MONTH_NAMES[month - 1] || '';
};
