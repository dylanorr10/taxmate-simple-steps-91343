import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, addMonths, format, isAfter, isBefore, startOfDay } from 'date-fns';

export interface TaxPeriod {
  id: string;
  user_id: string;
  tax_year: number;
  quarter_number: number;
  period_key: string;
  start_date: string;
  end_date: string;
  deadline_date: string;
  status: 'draft' | 'submitted' | 'corrected';
  submitted_at: string | null;
  total_income: number;
  total_expenses: number;
  created_at: string;
  updated_at: string;
}

// Get current UK tax year (starts 6th April)
export const getCurrentTaxYear = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const taxYearStart = new Date(year, 3, 6); // April 6th
  return isBefore(now, taxYearStart) ? year - 1 : year;
};

// Calculate quarter dates based on preference
export const getQuarterDates = (
  taxYear: number,
  quarterNumber: number,
  preference: 'calendar' | 'tax_year'
): { start: Date; end: Date; deadline: Date } => {
  if (preference === 'calendar') {
    // Calendar quarters: Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec
    const quarterMonths = [
      { start: 0, end: 2 },   // Q1: Jan-Mar
      { start: 3, end: 5 },   // Q2: Apr-Jun
      { start: 6, end: 8 },   // Q3: Jul-Sep
      { start: 9, end: 11 },  // Q4: Oct-Dec
    ];
    
    const q = quarterMonths[quarterNumber - 1];
    // For calendar quarters, Q1-Q4 of tax year 2024 means:
    // Q1: Apr-Jun 2024, Q2: Jul-Sep 2024, Q3: Oct-Dec 2024, Q4: Jan-Mar 2025
    const yearOffset = quarterNumber === 4 ? 1 : 0;
    const actualYear = taxYear + yearOffset;
    const monthStart = quarterNumber === 4 ? 0 : (quarterNumber - 1) * 3 + 3;
    
    const start = new Date(actualYear, monthStart, 1);
    const end = new Date(actualYear, monthStart + 2 + 1, 0); // Last day of quarter
    const deadline = addDays(addMonths(end, 1), 2); // 1 month + 2 days after quarter end
    
    return { start, end, deadline };
  } else {
    // Tax year quarters: 6 Apr-5 Jul, 6 Jul-5 Oct, 6 Oct-5 Jan, 6 Jan-5 Apr
    const quarterDates = [
      { startMonth: 3, startDay: 6, endMonth: 6, endDay: 5 },   // Q1: 6 Apr - 5 Jul
      { startMonth: 6, startDay: 6, endMonth: 9, endDay: 5 },   // Q2: 6 Jul - 5 Oct
      { startMonth: 9, startDay: 6, endMonth: 0, endDay: 5 },   // Q3: 6 Oct - 5 Jan
      { startMonth: 0, startDay: 6, endMonth: 3, endDay: 5 },   // Q4: 6 Jan - 5 Apr
    ];
    
    const q = quarterDates[quarterNumber - 1];
    const startYear = quarterNumber >= 3 ? taxYear : taxYear;
    const endYear = quarterNumber === 3 || quarterNumber === 4 ? taxYear + 1 : taxYear;
    
    const start = new Date(quarterNumber <= 2 ? taxYear : (quarterNumber === 3 ? taxYear : taxYear + 1), q.startMonth, q.startDay);
    const end = new Date(quarterNumber <= 2 ? taxYear : taxYear + 1, q.endMonth, q.endDay);
    const deadline = addDays(addMonths(end, 1), 2);
    
    return { start, end, deadline };
  }
};

// Generate period key in HMRC format
export const generatePeriodKey = (taxYear: number, quarterNumber: number): string => {
  return `${taxYear}Q${quarterNumber}`;
};

export const useTaxPeriods = (taxYear?: number) => {
  const queryClient = useQueryClient();
  const currentTaxYear = taxYear ?? getCurrentTaxYear();

  const { data: periods, isLoading } = useQuery({
    queryKey: ['tax-periods', currentTaxYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('tax_periods')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', currentTaxYear)
        .order('quarter_number');

      if (error) throw error;
      return data as TaxPeriod[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile-tax-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('quarter_preference, accounting_basis')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const quarterPreference = (profile?.quarter_preference || 'calendar') as 'calendar' | 'tax_year';
  const accountingBasis = (profile?.accounting_basis || 'cash') as 'cash' | 'accruals';

  // Initialize quarters if they don't exist
  const initializeQuarters = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existingQuarters = periods?.length || 0;
      if (existingQuarters === 4) return periods;

      const newPeriods = [];
      for (let q = 1; q <= 4; q++) {
        const exists = periods?.some(p => p.quarter_number === q);
        if (!exists) {
          const dates = getQuarterDates(currentTaxYear, q, quarterPreference);
          newPeriods.push({
            user_id: user.id,
            tax_year: currentTaxYear,
            quarter_number: q,
            period_key: generatePeriodKey(currentTaxYear, q),
            start_date: format(dates.start, 'yyyy-MM-dd'),
            end_date: format(dates.end, 'yyyy-MM-dd'),
            deadline_date: format(dates.deadline, 'yyyy-MM-dd'),
            status: 'draft',
            total_income: 0,
            total_expenses: 0,
          });
        }
      }

      if (newPeriods.length > 0) {
        const { error } = await supabase
          .from('tax_periods')
          .insert(newPeriods);
        if (error) throw error;
      }

      return newPeriods;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-periods'] });
    },
  });

  // Update period totals from transactions
  const updatePeriodTotals = useMutation({
    mutationFn: async (periodId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const period = periods?.find(p => p.id === periodId);
      if (!period) throw new Error('Period not found');

      // Get income for this period
      const { data: income } = await supabase
        .from('income_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('transaction_date', period.start_date)
        .lte('transaction_date', period.end_date);

      // Get expenses for this period
      const { data: expenses } = await supabase
        .from('expense_transactions')
        .select('amount, disallowable_amount')
        .eq('user_id', user.id)
        .gte('transaction_date', period.start_date)
        .lte('transaction_date', period.end_date);

      const totalIncome = income?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, t) => sum + Number(t.amount) - Number(t.disallowable_amount || 0), 0) || 0;

      const { error } = await supabase
        .from('tax_periods')
        .update({ total_income: totalIncome, total_expenses: totalExpenses })
        .eq('id', periodId);

      if (error) throw error;
      return { totalIncome, totalExpenses };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-periods'] });
    },
  });

  // Submit a quarter
  const submitPeriod = useMutation({
    mutationFn: async (periodId: string) => {
      const { error } = await supabase
        .from('tax_periods')
        .update({ 
          status: 'submitted', 
          submitted_at: new Date().toISOString() 
        })
        .eq('id', periodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-periods'] });
    },
  });

  // Get current quarter
  const getCurrentQuarter = (): TaxPeriod | undefined => {
    if (!periods) return undefined;
    const today = startOfDay(new Date());
    return periods.find(p => {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      return !isBefore(today, start) && !isAfter(today, end);
    });
  };

  // Check if any deadlines are approaching (within 14 days)
  const getUpcomingDeadlines = (): TaxPeriod[] => {
    if (!periods) return [];
    const today = startOfDay(new Date());
    const twoWeeksFromNow = addDays(today, 14);
    
    return periods.filter(p => {
      if (p.status === 'submitted') return false;
      const deadline = new Date(p.deadline_date);
      return !isBefore(deadline, today) && !isAfter(deadline, twoWeeksFromNow);
    });
  };

  // Check for overdue periods
  const getOverduePeriods = (): TaxPeriod[] => {
    if (!periods) return [];
    const today = startOfDay(new Date());
    
    return periods.filter(p => {
      if (p.status === 'submitted') return false;
      const deadline = new Date(p.deadline_date);
      return isBefore(deadline, today);
    });
  };

  return {
    periods,
    isLoading,
    quarterPreference,
    accountingBasis,
    currentTaxYear,
    initializeQuarters: initializeQuarters.mutate,
    updatePeriodTotals: updatePeriodTotals.mutate,
    submitPeriod: submitPeriod.mutate,
    getCurrentQuarter,
    getUpcomingDeadlines,
    getOverduePeriods,
  };
};
