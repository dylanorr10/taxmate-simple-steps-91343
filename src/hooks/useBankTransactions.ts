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
  mapping_type?: string;
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
        .select(`
          *,
          transaction_mappings(mapping_type)
        `)
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      
      // Flatten the mapping_type from the nested join
      return (data as any[]).map(tx => ({
        ...tx,
        mapping_type: tx.transaction_mappings?.[0]?.mapping_type,
        transaction_mappings: undefined
      })) as BankTransaction[];
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

  const bulkCategorize = async (
    transactions: BankTransaction[],
    onProgress?: (current: number, total: number) => void
  ) => {
    const results: {
      high: Array<{ transaction: BankTransaction; suggestion: any }>;
      medium: Array<{ transaction: BankTransaction; suggestion: any }>;
      low: Array<{ transaction: BankTransaction; suggestion: any }>;
      failed: Array<{ transaction: BankTransaction; error: string }>;
    } = { high: [], medium: [], low: [], failed: [] };

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      
      try {
        // Rate limiting: delay between requests (400ms = ~2.5 req/sec)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        const { data, error } = await supabase.functions.invoke("truelayer-categorize-transaction", {
          body: { transactionId: tx.id },
        });

        if (error) throw error;

        const confidence = data.confidence || 0;
        const result = { transaction: tx, suggestion: data };

        if (confidence > 0.8) {
          results.high.push(result);
        } else if (confidence > 0.5) {
          results.medium.push(result);
        } else {
          results.low.push(result);
        }

        onProgress?.(i + 1, transactions.length);
      } catch (error: any) {
        results.failed.push({ 
          transaction: tx, 
          error: error.message || 'Unknown error' 
        });
        onProgress?.(i + 1, transactions.length);
      }
    }

    return results;
  };

  const recategorizeTransaction = useMutation({
    mutationFn: async ({ 
      transactionId, 
      type, 
      vatRate 
    }: { 
      transactionId: string; 
      type: 'income' | 'expense'; 
      vatRate: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the bank transaction details
      const { data: bankTransaction } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!bankTransaction) throw new Error('Transaction not found');

      // Delete existing mapping
      await supabase
        .from('transaction_mappings')
        .delete()
        .eq('bank_transaction_id', transactionId);

      // Create new income/expense transaction
      const transactionData = {
        user_id: user.id,
        amount: Math.abs(bankTransaction.amount),
        transaction_date: new Date(bankTransaction.timestamp).toISOString().split('T')[0],
        description: bankTransaction.description || 'Bank transaction',
        vat_rate: vatRate,
      };

      const table = type === 'income' ? 'income_transactions' : 'expense_transactions';
      const { data: newTransaction, error: insertError } = await supabase
        .from(table)
        .insert(transactionData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Create new mapping
      await supabase.from('transaction_mappings').insert({
        bank_transaction_id: transactionId,
        [`${type}_transaction_id`]: newTransaction.id,
        mapping_type: type,
        user_confirmed: true,
        confidence_score: 100,
      });

      // Update bank transaction status
      await supabase
        .from('bank_transactions')
        .update({ status: 'categorized' })
        .eq('id', transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["income-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-transactions"] });
      toast.success("Transaction re-categorized successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to re-categorize: ${error.message}`);
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
    bulkCategorize,
    recategorizeTransaction: recategorizeTransaction.mutate,
    isRecategorizing: recategorizeTransaction.isPending,
  };
};