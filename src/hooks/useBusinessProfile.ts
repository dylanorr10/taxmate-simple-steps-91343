import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessType } from '@/data/businessTypeConfig';

export const useBusinessProfile = () => {
  return useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('business_type, vat_registered, experience_level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      return {
        businessType: (data?.business_type || 'other') as BusinessType,
        vatRegistered: data?.vat_registered || false,
        experienceLevel: data?.experience_level || 'beginner'
      };
    }
  });
};
