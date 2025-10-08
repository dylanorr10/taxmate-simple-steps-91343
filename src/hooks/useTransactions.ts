import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  vat_rate: number;
  created_at: string;
  updated_at: string;
}

export const useIncomeTransactions = () => {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["income-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("income_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const addIncome = useMutation({
    mutationFn: async (income: { amount: number; description?: string; transaction_date?: string; vat_rate?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("income_transactions")
        .insert({
          user_id: user.id,
          amount: income.amount,
          description: income.description || null,
          transaction_date: income.transaction_date || new Date().toISOString().split('T')[0],
          vat_rate: income.vat_rate || 20,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-transactions"] });
      toast.success("Income recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record income: ${error.message}`);
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("income_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-transactions"] });
      toast.success("Income deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete income: ${error.message}`);
    },
  });

  return {
    transactions,
    isLoading,
    addIncome: addIncome.mutate,
    isAdding: addIncome.isPending,
    deleteIncome: deleteIncome.mutate,
    isDeleting: deleteIncome.isPending,
  };
};

export const useExpenseTransactions = () => {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["expense-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expense_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const addExpense = useMutation({
    mutationFn: async (expense: { amount: number; description?: string; transaction_date?: string; vat_rate?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expense_transactions")
        .insert({
          user_id: user.id,
          amount: expense.amount,
          description: expense.description || null,
          transaction_date: expense.transaction_date || new Date().toISOString().split('T')[0],
          vat_rate: expense.vat_rate || 20,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-transactions"] });
      toast.success("Expense recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record expense: ${error.message}`);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expense_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-transactions"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete expense: ${error.message}`);
    },
  });

  return {
    transactions,
    isLoading,
    addExpense: addExpense.mutate,
    isAdding: addExpense.isPending,
    deleteExpense: deleteExpense.mutate,
    isDeleting: deleteExpense.isPending,
  };
};
