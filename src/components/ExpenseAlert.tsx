import { useEffect } from "react";
import { useExpenseAnalytics } from "@/hooks/useExpenseAnalytics";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";
import { formatCurrency } from "@/utils/transactionHelpers";

export const ExpenseAlert = () => {
  const { alerts } = useExpenseAnalytics();

  useEffect(() => {
    alerts.forEach((alert) => {
      const icon = alert.severity === "warning" ? AlertCircle : Info;
      const ToastIcon = icon;

      toast(alert.message, {
        description: alert.details,
        icon: <ToastIcon className="h-4 w-4" />,
        duration: 8000,
        action: alert.amount ? {
          label: `+${formatCurrency(alert.amount)}`,
          onClick: () => {},
        } : undefined,
      });
    });
  }, [alerts]);

  return null; // This component only triggers toasts
};
