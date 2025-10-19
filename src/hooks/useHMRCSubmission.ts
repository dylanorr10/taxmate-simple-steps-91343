import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VATBoxes } from "./useVATCalculations";

export const useHMRCSubmission = () => {
  const submitToHMRC = useMutation({
    mutationFn: async (boxes: VATBoxes) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate period key (format: #001 for first submission, etc.)
      const periodKey = new Date().toISOString().slice(0, 7).replace("-", "");

      const vatReturn = {
        vatDueSales: boxes.box1,
        vatDueAcquisitions: boxes.box2,
        totalVatDue: boxes.box3,
        vatReclaimedCurrPeriod: boxes.box4,
        netVatDue: boxes.box5,
        totalValueSalesExVAT: Math.round(boxes.box6),
        totalValuePurchasesExVAT: Math.round(boxes.box7),
        totalValueGoodsSuppliedExVAT: Math.round(boxes.box8),
        totalAcquisitionsExVAT: Math.round(boxes.box9),
      };

      const { data, error } = await supabase.functions.invoke("hmrc-submit-vat", {
        body: {
          periodKey: `#${periodKey}`,
          vatReturn,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.demo) {
        toast.success("Demo submission successful! 🎯", {
          description: "In production, this would be submitted to HMRC"
        });
      } else {
        toast.success("Submitted to HMRC successfully");
      }
    },
    onError: (error: Error) => {
      const message = error.message;
      if (message.includes("Token expired")) {
        toast.error("HMRC connection expired", {
          description: "Please reconnect to HMRC in Settings"
        });
      } else if (message.includes("not connected")) {
        toast.error("HMRC not connected", {
          description: "Please connect to HMRC in Settings first"
        });
      } else {
        toast.error(`Failed to submit: ${message}`);
      }
    },
  });

  return {
    submitToHMRC: submitToHMRC.mutate,
    isSubmitting: submitToHMRC.isPending,
  };
};
