import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, subMonths } from "date-fns";

export interface HomeOfficeClaim {
  id: string;
  user_id: string;
  claim_month: string;
  hours_worked: number;
  method: 'simplified' | 'actual';
  flat_rate_amount: number | null;
  actual_costs: number | null;
  business_use_percent: number;
  calculated_deduction: number;
  notes: string | null;
  tax_period_id: string | null;
  created_at: string;
  updated_at: string;
}

// HMRC Simplified Flat Rates for working from home
export const HMRC_HOME_OFFICE_RATES = {
  tier1: { minHours: 25, maxHours: 50, rate: 10 },
  tier2: { minHours: 51, maxHours: 100, rate: 18 },
  tier3: { minHours: 101, maxHours: Infinity, rate: 26 },
} as const;

export const calculateFlatRate = (hoursWorked: number): number => {
  if (hoursWorked < 25) return 0;
  if (hoursWorked <= 50) return HMRC_HOME_OFFICE_RATES.tier1.rate;
  if (hoursWorked <= 100) return HMRC_HOME_OFFICE_RATES.tier2.rate;
  return HMRC_HOME_OFFICE_RATES.tier3.rate;
};

export const useHomeOfficeClaims = () => {
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["home-office-claims"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("home_office_claims")
        .select("*")
        .eq("user_id", user.id)
        .order("claim_month", { ascending: false });

      if (error) throw error;
      return (data || []) as HomeOfficeClaim[];
    },
  });

  const addClaim = useMutation({
    mutationFn: async (claim: {
      claim_month: Date;
      hours_worked: number;
      method?: 'simplified' | 'actual';
      actual_costs?: number;
      business_use_percent?: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const method = claim.method || 'simplified';
      const flatRateAmount = method === 'simplified' ? calculateFlatRate(claim.hours_worked) : null;
      const calculatedDeduction = method === 'simplified' 
        ? (flatRateAmount || 0)
        : (claim.actual_costs || 0) * ((claim.business_use_percent || 100) / 100);

      const { data, error } = await supabase
        .from("home_office_claims")
        .upsert({
          user_id: user.id,
          claim_month: format(startOfMonth(claim.claim_month), 'yyyy-MM-dd'),
          hours_worked: claim.hours_worked,
          method,
          flat_rate_amount: flatRateAmount,
          actual_costs: claim.actual_costs || null,
          business_use_percent: claim.business_use_percent || 100,
          calculated_deduction: calculatedDeduction,
          notes: claim.notes || null,
        }, {
          onConflict: 'user_id,claim_month',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-office-claims"] });
      toast.success("Home office claim saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save claim: ${error.message}`);
    },
  });

  const deleteClaim = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("home_office_claims")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-office-claims"] });
      toast.success("Claim deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete claim: ${error.message}`);
    },
  });

  // Calculate tax year totals
  const taxYearTotals = claims.reduce((acc, claim) => {
    const claimDate = new Date(claim.claim_month);
    const taxYear = claimDate.getMonth() >= 3 
      ? claimDate.getFullYear() 
      : claimDate.getFullYear() - 1;
    
    if (!acc[taxYear]) {
      acc[taxYear] = { totalDeduction: 0, monthsClaimed: 0 };
    }
    acc[taxYear].totalDeduction += claim.calculated_deduction;
    acc[taxYear].monthsClaimed += 1;
    return acc;
  }, {} as Record<number, { totalDeduction: number; monthsClaimed: number }>);

  // Get last 12 months template for quick entry
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(new Date(), i);
    return startOfMonth(month);
  }).reverse();

  return {
    claims,
    isLoading,
    addClaim: addClaim.mutate,
    isAdding: addClaim.isPending,
    deleteClaim: deleteClaim.mutate,
    isDeleting: deleteClaim.isPending,
    taxYearTotals,
    last12Months,
    calculateFlatRate,
  };
};
