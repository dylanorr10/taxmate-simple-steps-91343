import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VATBoxes } from "./useVATCalculations";

export interface VATSubmission {
  id: string;
  user_id: string;
  period_key: string;
  vat_due_sales: number;
  vat_due_acquisitions: number;
  total_vat_due: number;
  vat_reclaimed_curr_period: number;
  net_vat_due: number;
  total_value_sales_ex_vat: number;
  total_value_purchases_ex_vat: number;
  total_value_goods_supplied_ex_vat: number;
  total_acquisitions_ex_vat: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useVATSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["vat-submissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("vat_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VATSubmission[];
    },
  });

  const saveSubmission = useMutation({
    mutationFn: async (boxes: VATBoxes) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const periodKey = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const { data, error } = await supabase
        .from("vat_submissions")
        .insert({
          user_id: user.id,
          period_key: periodKey,
          vat_due_sales: boxes.box1,
          vat_due_acquisitions: boxes.box2,
          total_vat_due: boxes.box3,
          vat_reclaimed_curr_period: boxes.box4,
          net_vat_due: boxes.box5,
          total_value_sales_ex_vat: boxes.box6,
          total_value_purchases_ex_vat: boxes.box7,
          total_value_goods_supplied_ex_vat: boxes.box8,
          total_acquisitions_ex_vat: boxes.box9,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vat-submissions"] });
      toast.success("VAT return saved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to save VAT return: ${error.message}`);
    },
  });

  return {
    submissions,
    isLoading,
    saveSubmission: saveSubmission.mutate,
    isSaving: saveSubmission.isPending,
  };
};
