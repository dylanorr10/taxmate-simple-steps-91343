import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TransactionRule {
  id: string;
  user_id: string;
  merchant_pattern: string;
  description_pattern: string | null;
  action: 'income' | 'expense' | 'ignore';
  vat_rate: number;
  confidence_level: string;
  times_applied: number;
  last_applied_at: string | null;
  created_at: string;
  enabled: boolean;
}

export const useTransactionRules = () => {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['transaction-rules'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transaction_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TransactionRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<TransactionRule, 'id' | 'user_id' | 'created_at' | 'times_applied' | 'last_applied_at' | 'confidence_level'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transaction_rules')
        .insert({
          ...rule,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-rules'] });
      toast.success('Rule created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create rule: ${error.message}`);
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransactionRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('transaction_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-rules'] });
      toast.success('Rule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update rule: ${error.message}`);
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transaction_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-rules'] });
      toast.success('Rule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete rule: ${error.message}`);
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('transaction_rules')
        .update({ enabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-rules'] });
      toast.success('Rule status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle rule: ${error.message}`);
    },
  });

  return {
    rules,
    isLoading,
    createRule: createRule.mutate,
    isCreating: createRule.isPending,
    updateRule: updateRule.mutate,
    isUpdating: updateRule.isPending,
    deleteRule: deleteRule.mutate,
    isDeleting: deleteRule.isPending,
    toggleRule: toggleRule.mutate,
    isToggling: toggleRule.isPending,
  };
};