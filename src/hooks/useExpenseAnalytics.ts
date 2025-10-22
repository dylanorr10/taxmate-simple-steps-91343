import { useMemo } from "react";
import { useExpenseTransactions } from "./useTransactions";
import { startOfMonth, subMonths } from "date-fns";

interface ExpenseAlert {
  type: "total_increase" | "category_spike";
  severity: "warning" | "info";
  message: string;
  details: string;
  amount?: number;
  category?: string;
}

export const useExpenseAnalytics = () => {
  const { transactions: expenses } = useExpenseTransactions();

  const alerts = useMemo((): ExpenseAlert[] => {
    if (expenses.length < 4) return [];

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const threeMonthsAgoStart = startOfMonth(subMonths(now, 3));

    // Current month expenses
    const currentMonth = expenses.filter(
      t => new Date(t.transaction_date) >= currentMonthStart
    );
    const currentTotal = currentMonth.reduce((sum, t) => sum + Number(t.amount), 0);

    // Previous 3 months average
    const previous3Months = expenses.filter(
      t => new Date(t.transaction_date) >= threeMonthsAgoStart && 
           new Date(t.transaction_date) < currentMonthStart
    );
    const avgPrevious = previous3Months.reduce((sum, t) => sum + Number(t.amount), 0) / 3;

    const detectedAlerts: ExpenseAlert[] = [];

    // Alert if total expenses increased by >20%
    if (currentTotal > avgPrevious * 1.2 && avgPrevious > 0) {
      const increase = ((currentTotal - avgPrevious) / avgPrevious) * 100;
      detectedAlerts.push({
        type: "total_increase",
        severity: "warning",
        message: "Your expenses are unusually high this month",
        details: `${increase.toFixed(0)}% higher than your 3-month average (£${avgPrevious.toFixed(2)})`,
        amount: currentTotal - avgPrevious,
      });
    }

    // Check for category spikes
    const categoryTotals = new Map<string, number>();
    const prevCategoryTotals = new Map<string, number>();

    currentMonth.forEach(t => {
      const desc = t.description?.toLowerCase() || 'uncategorized';
      categoryTotals.set(desc, (categoryTotals.get(desc) || 0) + Number(t.amount));
    });

    previous3Months.forEach(t => {
      const desc = t.description?.toLowerCase() || 'uncategorized';
      prevCategoryTotals.set(desc, (prevCategoryTotals.get(desc) || 0) + Number(t.amount) / 3);
    });

    categoryTotals.forEach((currentAmount, category) => {
      const prevAmount = prevCategoryTotals.get(category) || 0;
      if (currentAmount > prevAmount * 1.3 && prevAmount > 50) {
        const increase = ((currentAmount - prevAmount) / prevAmount) * 100;
        detectedAlerts.push({
          type: "category_spike",
          severity: "info",
          message: `${category.charAt(0).toUpperCase() + category.slice(1)} expenses increased`,
          details: `${increase.toFixed(0)}% higher than usual (£${currentAmount.toFixed(2)} vs £${prevAmount.toFixed(2)} avg)`,
          category,
          amount: currentAmount - prevAmount,
        });
      }
    });

    return detectedAlerts;
  }, [expenses]);

  return { alerts };
};
