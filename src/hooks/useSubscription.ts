import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTierByProductId, SubscriptionTier, hasFeatureAccess, TIER_FEATURES } from '@/config/subscriptionTiers';

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  tier: SubscriptionTier;
}

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return {
          subscribed: false,
          productId: null,
          subscriptionEnd: null,
          tier: 'free'
        };
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Failed to check subscription:', error);
        throw error;
      }

      const tier = getTierByProductId(data.product_id);

      return {
        subscribed: data.subscribed,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
        tier
      };
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  const checkFeatureAccess = (feature: string): boolean => {
    if (!data) return false;
    return hasFeatureAccess(data.tier, feature);
  };

  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
  };

  return {
    isSubscribed: data?.subscribed ?? false,
    productId: data?.productId ?? null,
    subscriptionEnd: data?.subscriptionEnd ?? null,
    tier: data?.tier ?? 'free',
    isLoading,
    error,
    refetch,
    checkFeatureAccess,
    refreshSubscription
  };
};
