import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIncomeTransactions, useExpenseTransactions } from "./useTransactions";
import { addMonths, startOfMonth, format } from "date-fns";

interface ForecastData {
  month: string;
  predictedIncome: number;
  predictedExpenses: number;
  predictedNet: number;
  confidence: number;
}

export const useCashFlowForecast = () => {
  const { transactions: income } = useIncomeTransactions();
  const { transactions: expenses } = useExpenseTransactions();
  const queryClient = useQueryClient();

  const calculateForecast = (): ForecastData[] => {
    if (!income.length && !expenses.length) return [];

    // Calculate 3-month historical averages
    const now = new Date();
    const threeMonthsAgo = addMonths(now, -3);
    
    const recentIncome = income.filter(t => new Date(t.transaction_date) >= threeMonthsAgo);
    const recentExpenses = expenses.filter(t => new Date(t.transaction_date) >= threeMonthsAgo);
    
    const avgIncome = recentIncome.reduce((sum, t) => sum + Number(t.amount), 0) / 3;
    const avgExpenses = recentExpenses.reduce((sum, t) => sum + Number(t.amount), 0) / 3;
    
    // Calculate confidence based on data availability
    const dataPoints = recentIncome.length + recentExpenses.length;
    const confidence = Math.min(dataPoints / 20, 1); // Max confidence at 20+ transactions

    // Generate 3-month forecast
    const forecasts: ForecastData[] = [];
    for (let i = 1; i <= 3; i++) {
      const forecastDate = addMonths(startOfMonth(now), i);
      forecasts.push({
        month: format(forecastDate, 'MMM yyyy'),
        predictedIncome: avgIncome,
        predictedExpenses: avgExpenses,
        predictedNet: avgIncome - avgExpenses,
        confidence,
      });
    }

    return forecasts;
  };

  const { data: forecast = [], isLoading } = useQuery({
    queryKey: ["cashFlowForecast", income.length, expenses.length],
    queryFn: () => calculateForecast(),
    enabled: income.length > 0 || expenses.length > 0,
  });

  const saveForecast = useMutation({
    mutationFn: async (forecastData: ForecastData[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = forecastData.map(f => ({
        user_id: user.id,
        forecast_month: f.month,
        predicted_income: f.predictedIncome,
        predicted_expenses: f.predictedExpenses,
        predicted_net: f.predictedNet,
        confidence_score: f.confidence,
      }));

      const { error } = await supabase
        .from("cash_flow_forecasts")
        .upsert(records, { onConflict: 'user_id,forecast_month' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashFlowForecast"] });
    },
  });

  return {
    forecast,
    isLoading,
    saveForecast: saveForecast.mutate,
  };
};
