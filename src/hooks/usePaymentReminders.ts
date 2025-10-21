import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaymentReminder {
  id: string;
  user_id: string;
  income_transaction_id: string;
  sent_at: string;
  reminder_type: 'gentle' | 'firm' | 'final';
  days_overdue: number;
  created_at: string;
}

export const usePaymentReminders = (incomeTransactionId?: string) => {
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["payment-reminders", incomeTransactionId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("payment_reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false });

      if (incomeTransactionId) {
        query = query.eq("income_transaction_id", incomeTransactionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentReminder[];
    },
    enabled: !!incomeTransactionId,
  });

  const sendReminder = useMutation({
    mutationFn: async ({
      incomeTransactionId,
      reminderType,
    }: {
      incomeTransactionId: string;
      reminderType: 'gentle' | 'firm' | 'final';
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-payment-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ incomeTransactionId, reminderType }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reminder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["income-transactions"] });
      toast.success("Payment reminder sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send reminder: ${error.message}`);
    },
  });

  return {
    reminders,
    isLoading,
    sendReminder: sendReminder.mutate,
    isSending: sendReminder.isPending,
  };
};
