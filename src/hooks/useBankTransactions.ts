import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BankTransaction {
  id: string;
  user_id: string;
  connection_id: string;
  transaction_id: string;
  amount: number;
  description: string | null;
  timestamp: string;
  merchant_name: string | null;
  category: string | null;
  status: string;
  synced_at: string;
  created_at: string;
}

export const useBankTransactions = () => {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["bank-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data as BankTransaction[];
    },
  });

  const categorizeTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke("truelayer-categorize-transaction", {
        body: { transactionId },
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast.error(`Categorization failed: ${error.message}`);
    },
  });

  const confirmCategorization = useMutation({
    mutationFn: async ({ 
      bankTransactionId, 
      type, 
      vatRate,
      confidence 
    }: { 
      bankTransactionId: string; 
      type: 'income' | 'expense' | 'ignored';
      vatRate?: number;
      confidence: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get bank transaction
      const { data: bankTx, error: bankError } = await supabase
        .from("bank_transactions")
        .select("*")
        .eq("id", bankTransactionId)
        .single();

      if (bankError || !bankTx) throw new Error("Bank transaction not found");

      let incomeId = null;
      let expenseId = null;

      if (type === 'income') {
        // Create income transaction
        const { data: income, error: incomeError } = await supabase
          .from("income_transactions")
          .insert({
            user_id: user.id,
            amount: Math.abs(bankTx.amount),
            description: bankTx.description || bankTx.merchant_name || 'Bank import',
            transaction_date: new Date(bankTx.timestamp).toISOString().split('T')[0],
            vat_rate: vatRate || 20,
          })
          .select()
          .single();

        if (incomeError) throw incomeError;
        incomeId = income.id;
      } else if (type === 'expense') {
        // Create expense transaction
        const { data: expense, error: expenseError } = await supabase
          .from("expense_transactions")
          .insert({
            user_id: user.id,
            amount: Math.abs(bankTx.amount),
            description: bankTx.description || bankTx.merchant_name || 'Bank import',
            transaction_date: new Date(bankTx.timestamp).toISOString().split('T')[0],
            vat_rate: vatRate || 20,
          })
          .select()
          .single();

        if (expenseError) throw expenseError;
        expenseId = expense.id;
      }

      // Create mapping
      const { error: mappingError } = await supabase
        .from("transaction_mappings")
        .insert({
          bank_transaction_id: bankTransactionId,
          income_transaction_id: incomeId,
          expense_transaction_id: expenseId,
          mapping_type: type,
          confidence_score: confidence,
          user_confirmed: true,
        });

      if (mappingError) throw mappingError;

      // Update bank transaction status
      await supabase
        .from("bank_transactions")
        .update({ status: 'categorized' })
        .eq("id", bankTransactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["income-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-transactions"] });
      toast.success("Transaction categorized successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to categorize: ${error.message}`);
    },
  });

  return {
    transactions,
    isLoading,
    pendingTransactions: transactions.filter(t => t.status === 'pending'),
    categorizeTransaction: categorizeTransaction.mutate,
    isCategorizing: categorizeTransaction.isPending,
    confirmCategorization: confirmCategorization.mutate,
    isConfirming: confirmCategorization.isPending,
  };
};