import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HandoffStats {
  transactions: number;
  receipts: number;
  healthScore: number;
  sizeBytes: number;
  edgeCases: number;
}

export interface HandoffResult {
  success: boolean;
  exportId: string;
  downloadUrl: string;
  expiresAt: string;
  filename: string;
  stats: HandoffStats;
  founderProfile: string;
}

export interface HandoffPeriod {
  label: string;
  start?: string;
  end?: string;
}

export function useHandoffPack() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<HandoffResult | null>(null);
  const qc = useQueryClient();

  const history = useQuery({
    queryKey: ["handoff-exports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handoff_exports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  async function generate(period: HandoffPeriod): Promise<HandoffResult | null> {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-handoff-pack", {
        body: {
          periodStart: period.start,
          periodEnd: period.end,
          periodLabel: period.label,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Generation failed");
      setLastResult(data);
      qc.invalidateQueries({ queryKey: ["handoff-exports"] });
      toast.success("Handoff pack ready", {
        description: `${data.stats.transactions} transactions • ${data.stats.receipts} receipts`,
      });
      return data;
    } catch (e: any) {
      toast.error("Could not generate handoff pack", { description: e.message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendToAccountant(opts: {
    exportId: string;
    accountantEmail: string;
    accountantName?: string;
    message?: string;
  }): Promise<boolean> {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-handoff-to-accountant", {
        body: opts,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Send failed");
      qc.invalidateQueries({ queryKey: ["handoff-exports"] });
      toast.success("Sent to your accountant", {
        description: opts.accountantEmail,
      });
      return true;
    } catch (e: any) {
      toast.error("Could not send email", { description: e.message });
      return false;
    } finally {
      setIsSending(false);
    }
  }

  return {
    generate,
    sendToAccountant,
    isGenerating,
    isSending,
    lastResult,
    history: history.data || [],
    isLoadingHistory: history.isLoading,
  };
}
