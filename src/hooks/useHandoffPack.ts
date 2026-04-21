import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HandoffExport {
  id: string;
  period_label: string;
  period_start: string | null;
  period_end: string | null;
  file_path: string;
  file_size_bytes: number | null;
  transaction_count: number | null;
  receipt_count: number | null;
  health_score: number | null;
  expires_at: string;
  sent_to_email: string | null;
  sent_at: string | null;
  status: string;
  created_at: string;
}

export interface GeneratePackParams {
  periodLabel: string;
  periodStart?: string; // ISO date
  periodEnd?: string;
}

export interface GeneratePackResult {
  exportId: string;
  signedUrl: string;
  filePath: string;
  expiresAt: string;
  stats: {
    transactions: number;
    receipts: number;
    healthScore: number;
  };
}

export const useHandoffHistory = () => {
  return useQuery({
    queryKey: ["handoff-exports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handoff_exports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as HandoffExport[];
    },
  });
};

export const useGenerateHandoffPack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: GeneratePackParams): Promise<GeneratePackResult> => {
      const { data, error } = await supabase.functions.invoke(
        "generate-handoff-pack",
        { body: params },
      );
      if (error) throw error;
      if (!data?.signedUrl) throw new Error("No download URL returned");
      return data as GeneratePackResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handoff-exports"] });
      toast.success("Handoff pack ready", {
        description: "Your accountant bundle has been generated.",
      });
    },
    onError: (err: Error) => {
      toast.error("Couldn't generate pack", { description: err.message });
    },
  });
};

export const useSendHandoffToAccountant = () => {
  return useMutation({
    mutationFn: async (params: { exportId: string; email: string }) => {
      const { data, error } = await supabase.functions.invoke(
        "send-handoff-to-accountant",
        { body: params },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      toast.success("Sent to accountant", {
        description: `Download link emailed to ${vars.email}`,
      });
    },
    onError: (err: Error) => {
      toast.error("Couldn't send email", { description: err.message });
    },
  });
};
