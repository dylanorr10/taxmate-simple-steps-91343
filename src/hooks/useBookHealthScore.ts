import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useProfile } from "@/hooks/useProfile";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { computeBookHealth } from "@/lib/bookHealthScore";

const STORAGE_KEY = "book-health-last-week";

interface SnapshotEntry {
  score: number;
  ts: number;
}

export function useBookHealthScore() {
  const { transactions: income, isLoading: incomeLoading } = useIncomeTransactions();
  const { transactions: expenses, isLoading: expenseLoading } = useExpenseTransactions();
  const { profile, isLoading: profileLoading } = useProfile();
  const { periods: taxPeriods } = useTaxPeriods();

  const { data: vatSubmissions = [] } = useQuery({
    queryKey: ["vat-submissions-min"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("vat_submissions")
        .select("submitted_at, created_at")
        .eq("user_id", user.id);
      if (error) return [];
      return data || [];
    },
  });

  const result = useMemo(() => {
    // Annualise: total income over the last 12 months
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const annualTurnover = income
      .filter(t => new Date(t.transaction_date).getTime() >= cutoff)
      .reduce((s, t) => s + Number(t.amount), 0);

    return computeBookHealth({
      income,
      expenses,
      profile,
      taxPeriods: (taxPeriods || []).map(p => ({
        status: p.status,
        deadline_date: p.deadline_date,
      })),
      vatSubmissions,
      annualTurnover,
    });
  }, [income, expenses, profile, taxPeriods, vatSubmissions]);

  // Cache last-week trend in localStorage
  const trend = useMemo(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const week = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      let prev: SnapshotEntry | null = raw ? JSON.parse(raw) : null;
      if (!prev || now - prev.ts > week) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: result.score, ts: now }));
        return 0;
      }
      return result.score - prev.score;
    } catch {
      return 0;
    }
  }, [result.score]);

  return {
    ...result,
    trend,
    isLoading: incomeLoading || expenseLoading || profileLoading,
  };
}
