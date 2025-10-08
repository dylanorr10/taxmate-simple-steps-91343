import { Transaction } from "@/hooks/useTransactions";

export const getMonthToDateTotal = (transactions: Transaction[]): number => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return transactions
    .filter(t => new Date(t.transaction_date) >= startOfMonth)
    .reduce((sum, t) => sum + Number(t.amount), 0);
};

export const getLastMonthsData = (transactions: Transaction[], months: number = 3): number[] => {
  const now = new Date();
  const monthlyTotals: number[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    const total = transactions
      .filter(t => {
        const date = new Date(t.transaction_date);
        return date >= startOfMonth && date <= endOfMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    monthlyTotals.push(total);
  }
  
  return monthlyTotals;
};

export const formatCurrency = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};
