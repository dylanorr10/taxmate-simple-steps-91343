import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCurrentTaxYear } from './useTaxPeriods';

export interface EOPSSubmission {
  id: string;
  user_id: string;
  tax_year: number;
  status: 'draft' | 'submitted' | 'amended';
  total_income: number;
  total_expenses: number;
  total_adjustments: number;
  net_profit: number;
  personal_allowance: number;
  taxable_profit: number;
  tax_due: number;
  accounts_finalised: boolean;
  all_income_declared: boolean;
  all_expenses_claimed: boolean;
  adjustments_reviewed: boolean;
  submitted_at?: string;
  hmrc_submission_id?: string;
  submission_receipt?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// UK Tax Rates 2024/25
const TAX_BANDS = [
  { threshold: 0, rate: 0, name: 'Personal Allowance' },
  { threshold: 12570, rate: 0.20, name: 'Basic Rate (20%)' },
  { threshold: 50270, rate: 0.40, name: 'Higher Rate (40%)' },
  { threshold: 125140, rate: 0.45, name: 'Additional Rate (45%)' },
];

const PERSONAL_ALLOWANCE = 12570;
const PA_TAPER_THRESHOLD = 100000;

export const calculateIncomeTax = (profit: number): { tax: number; breakdown: { band: string; amount: number; tax: number }[] } => {
  // Reduce personal allowance for income over £100k
  let personalAllowance = PERSONAL_ALLOWANCE;
  if (profit > PA_TAPER_THRESHOLD) {
    const reduction = Math.floor((profit - PA_TAPER_THRESHOLD) / 2);
    personalAllowance = Math.max(0, PERSONAL_ALLOWANCE - reduction);
  }

  let taxableIncome = Math.max(0, profit - personalAllowance);
  let totalTax = 0;
  const breakdown: { band: string; amount: number; tax: number }[] = [];

  if (personalAllowance > 0) {
    breakdown.push({
      band: 'Personal Allowance',
      amount: Math.min(profit, personalAllowance),
      tax: 0,
    });
  }

  // Basic rate: £12,571 to £50,270
  const basicRateLimit = 50270 - PERSONAL_ALLOWANCE;
  if (taxableIncome > 0) {
    const basicRateAmount = Math.min(taxableIncome, basicRateLimit);
    const basicRateTax = basicRateAmount * 0.20;
    totalTax += basicRateTax;
    if (basicRateAmount > 0) {
      breakdown.push({
        band: 'Basic Rate (20%)',
        amount: basicRateAmount,
        tax: basicRateTax,
      });
    }
    taxableIncome -= basicRateAmount;
  }

  // Higher rate: £50,271 to £125,140
  const higherRateLimit = 125140 - 50270;
  if (taxableIncome > 0) {
    const higherRateAmount = Math.min(taxableIncome, higherRateLimit);
    const higherRateTax = higherRateAmount * 0.40;
    totalTax += higherRateTax;
    if (higherRateAmount > 0) {
      breakdown.push({
        band: 'Higher Rate (40%)',
        amount: higherRateAmount,
        tax: higherRateTax,
      });
    }
    taxableIncome -= higherRateAmount;
  }

  // Additional rate: over £125,140
  if (taxableIncome > 0) {
    const additionalRateTax = taxableIncome * 0.45;
    totalTax += additionalRateTax;
    breakdown.push({
      band: 'Additional Rate (45%)',
      amount: taxableIncome,
      tax: additionalRateTax,
    });
  }

  return { tax: totalTax, breakdown };
};

// National Insurance Class 4 (2024/25)
export const calculateNIC4 = (profit: number): { nic: number; breakdown: { band: string; amount: number; nic: number }[] } => {
  const lowerProfitLimit = 12570;
  const upperProfitLimit = 50270;
  
  let totalNIC = 0;
  const breakdown: { band: string; amount: number; nic: number }[] = [];

  if (profit <= lowerProfitLimit) {
    return { nic: 0, breakdown: [] };
  }

  // 6% on profits between £12,570 and £50,270
  const lowerBandProfit = Math.min(profit, upperProfitLimit) - lowerProfitLimit;
  if (lowerBandProfit > 0) {
    const lowerBandNIC = lowerBandProfit * 0.06;
    totalNIC += lowerBandNIC;
    breakdown.push({
      band: 'Class 4 NIC (6%)',
      amount: lowerBandProfit,
      nic: lowerBandNIC,
    });
  }

  // 2% on profits above £50,270
  if (profit > upperProfitLimit) {
    const upperBandProfit = profit - upperProfitLimit;
    const upperBandNIC = upperBandProfit * 0.02;
    totalNIC += upperBandNIC;
    breakdown.push({
      band: 'Class 4 NIC (2%)',
      amount: upperBandProfit,
      nic: upperBandNIC,
    });
  }

  return { nic: totalNIC, breakdown };
};

export const useEOPS = (taxYear?: number) => {
  const queryClient = useQueryClient();
  const currentTaxYear = taxYear ?? getCurrentTaxYear();

  const { data: eops, isLoading } = useQuery({
    queryKey: ['eops', currentTaxYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('eops_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', currentTaxYear)
        .maybeSingle();

      if (error) throw error;
      return data as EOPSSubmission | null;
    },
  });

  const createOrUpdateEOPS = useMutation({
    mutationFn: async (input: Partial<EOPSSubmission>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if EOPS exists
      const { data: existing } = await supabase
        .from('eops_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('tax_year', currentTaxYear)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('eops_submissions')
          .update(input)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('eops_submissions')
          .insert({
            user_id: user.id,
            tax_year: currentTaxYear,
            ...input,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eops', currentTaxYear] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save EOPS: ${error.message}`);
    },
  });

  const submitEOPS = useMutation({
    mutationFn: async (finalData: {
      total_income: number;
      total_expenses: number;
      total_adjustments: number;
      net_profit: number;
      taxable_profit: number;
      tax_due: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const submissionData = {
        ...finalData,
        status: 'submitted' as const,
        submitted_at: new Date().toISOString(),
        accounts_finalised: true,
        all_income_declared: true,
        all_expenses_claimed: true,
        adjustments_reviewed: true,
        hmrc_submission_id: `EOPS-${currentTaxYear}-${Date.now()}`,
      };

      // Check if EOPS exists
      const { data: existing } = await supabase
        .from('eops_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('tax_year', currentTaxYear)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('eops_submissions')
          .update(submissionData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('eops_submissions')
          .insert({
            user_id: user.id,
            tax_year: currentTaxYear,
            ...submissionData,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eops', currentTaxYear] });
      toast.success('End of Period Statement submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit EOPS: ${error.message}`);
    },
  });

  return {
    eops,
    isLoading,
    createOrUpdateEOPS: createOrUpdateEOPS.mutate,
    isSaving: createOrUpdateEOPS.isPending,
    submitEOPS: submitEOPS.mutate,
    isSubmitting: submitEOPS.isPending,
    currentTaxYear,
  };
};
