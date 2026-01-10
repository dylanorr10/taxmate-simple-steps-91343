import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCurrentTaxYear } from './useTaxPeriods';

export interface TaxAdjustment {
  id: string;
  user_id: string;
  tax_year: number;
  adjustment_type: 'capital_allowance' | 'accrual' | 'prepayment' | 'depreciation' | 'private_use' | 'disallowable' | 'other';
  category: string;
  description: string;
  amount: number;
  is_addition: boolean;
  asset_name?: string;
  asset_value?: number;
  asset_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AddAdjustmentInput {
  adjustment_type: TaxAdjustment['adjustment_type'];
  category: string;
  description: string;
  amount: number;
  is_addition: boolean;
  asset_name?: string;
  asset_value?: number;
  asset_date?: string;
  notes?: string;
}

export const ADJUSTMENT_CATEGORIES = {
  capital_allowance: [
    { value: 'aia', label: 'Annual Investment Allowance (AIA)', description: 'Up to £1m per year for qualifying equipment' },
    { value: 'wda', label: 'Writing Down Allowance', description: '18% or 6% of remaining value' },
    { value: 'fya', label: 'First Year Allowance', description: '100% for qualifying energy-efficient assets' },
    { value: 'sba', label: 'Structures & Buildings Allowance', description: '3% on qualifying commercial structures' },
  ],
  accrual: [
    { value: 'income_accrual', label: 'Accrued Income', description: 'Income earned but not yet received' },
    { value: 'expense_accrual', label: 'Accrued Expenses', description: 'Expenses incurred but not yet paid' },
  ],
  prepayment: [
    { value: 'prepaid_income', label: 'Prepaid Income', description: 'Income received in advance' },
    { value: 'prepaid_expense', label: 'Prepaid Expenses', description: 'Expenses paid in advance' },
  ],
  depreciation: [
    { value: 'equipment', label: 'Equipment Depreciation', description: 'Accounting depreciation (add back)' },
    { value: 'vehicles', label: 'Vehicle Depreciation', description: 'Accounting depreciation (add back)' },
    { value: 'property', label: 'Property Depreciation', description: 'Accounting depreciation (add back)' },
  ],
  private_use: [
    { value: 'vehicle', label: 'Vehicle Private Use', description: 'Private portion of vehicle costs' },
    { value: 'home_office', label: 'Home Office Private Use', description: 'Private portion of home costs' },
    { value: 'phone', label: 'Phone/Internet Private Use', description: 'Private portion of communications' },
  ],
  disallowable: [
    { value: 'entertainment', label: 'Client Entertainment', description: 'Not allowable for tax' },
    { value: 'fines', label: 'Fines & Penalties', description: 'Not allowable for tax' },
    { value: 'personal', label: 'Personal Expenses', description: 'Non-business expenditure' },
  ],
  other: [
    { value: 'other', label: 'Other Adjustment', description: 'Any other tax adjustment' },
  ],
};

export const useTaxAdjustments = (taxYear?: number) => {
  const queryClient = useQueryClient();
  const currentTaxYear = taxYear ?? getCurrentTaxYear();

  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ['tax-adjustments', currentTaxYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('tax_adjustments')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', currentTaxYear)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaxAdjustment[];
    },
  });

  const addAdjustment = useMutation({
    mutationFn: async (input: AddAdjustmentInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tax_adjustments')
        .insert({
          user_id: user.id,
          tax_year: currentTaxYear,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-adjustments', currentTaxYear] });
      toast.success('Tax adjustment added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add adjustment: ${error.message}`);
    },
  });

  const updateAdjustment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxAdjustment> & { id: string }) => {
      const { data, error } = await supabase
        .from('tax_adjustments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-adjustments', currentTaxYear] });
      toast.success('Tax adjustment updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update adjustment: ${error.message}`);
    },
  });

  const deleteAdjustment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tax_adjustments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-adjustments', currentTaxYear] });
      toast.success('Tax adjustment deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete adjustment: ${error.message}`);
    },
  });

  // Calculate totals
  const totals = adjustments.reduce(
    (acc, adj) => {
      if (adj.is_addition) {
        acc.additions += adj.amount;
      } else {
        acc.deductions += adj.amount;
      }
      return acc;
    },
    { additions: 0, deductions: 0 }
  );

  const netAdjustment = totals.additions - totals.deductions;

  return {
    adjustments,
    isLoading,
    addAdjustment: addAdjustment.mutate,
    isAdding: addAdjustment.isPending,
    updateAdjustment: updateAdjustment.mutate,
    isUpdating: updateAdjustment.isPending,
    deleteAdjustment: deleteAdjustment.mutate,
    isDeleting: deleteAdjustment.isPending,
    totals,
    netAdjustment,
    currentTaxYear,
  };
};
