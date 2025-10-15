import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistData {
  email: string;
  profession_interest?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  referrer?: string;
}

export const useWaitlistSignup = () => {
  return useMutation({
    mutationFn: async (data: WaitlistData) => {
      // Get UTM parameters from URL if not provided
      const urlParams = new URLSearchParams(window.location.search);
      const signupData = {
        ...data,
        utm_source: data.utm_source || urlParams.get('utm_source') || undefined,
        utm_campaign: data.utm_campaign || urlParams.get('utm_campaign') || undefined,
        utm_medium: data.utm_medium || urlParams.get('utm_medium') || undefined,
        referrer: data.referrer || document.referrer || undefined,
        user_agent: navigator.userAgent,
      };

      const { data: result, error } = await supabase
        .from('waitlist_signups')
        .insert([signupData])
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === '23505') {
          throw new Error('This email is already on the waitlist!');
        }
        throw new Error(error.message || 'Failed to join waitlist');
      }

      return result;
    },
    onSuccess: () => {
      // Track conversion event if analytics is available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_signup', {
          event_category: 'engagement',
          event_label: 'landing_page',
        });
      }
    },
  });
};
