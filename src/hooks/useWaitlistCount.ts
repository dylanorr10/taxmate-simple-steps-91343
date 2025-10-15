import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWaitlistCount = () => {
  return useQuery({
    queryKey: ['waitlist-count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_waitlist_count');
      
      if (error) {
        console.error('Error fetching waitlist count:', error);
        return 0;
      }
      
      return data as number;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
