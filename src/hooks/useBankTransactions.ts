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

  const updateVATRate = useMutation({
    mutationFn: async ({ 
      bankTransactionId, 
      newVatRate 
    }: { 
      bankTransactionId: string; 
      newVatRate: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the mapping to find linked income/expense transaction
      const { data: mapping } = await supabase
        .from("transaction_mappings")
        .select("*")
        .eq("bank_transaction_id", bankTransactionId)
        .single();

      if (!mapping) throw new Error("Transaction mapping not found");

      // Update the VAT rate on the linked transaction
      if (mapping.income_transaction_id) {
        await supabase
          .from("income_transactions")
          .update({ vat_rate: newVatRate })
          .eq("id", mapping.income_transaction_id);
      } else if (mapping.expense_transaction_id) {
        await supabase
          .from("expense_transactions")
          .update({ vat_rate: newVatRate })
          .eq("id", mapping.expense_transaction_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["income-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-transactions"] });
      toast.success("VAT rate updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update VAT rate: ${error.message}`);
    },
  });

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
    categorizedTransactions: transactions.filter(t => t.status === 'categorized'),
    updateVATRate: updateVATRate.mutate,
    isUpdatingVAT: updateVATRate.isPending,
    recategorizeTransaction: recategorizeTransaction.mutate,
    isRecategorizing: recategorizeTransaction.isPending,
  };
};