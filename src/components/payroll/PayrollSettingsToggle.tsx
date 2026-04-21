import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Banknote } from "lucide-react";
import { usePayrollSettings } from "@/hooks/usePayroll";

export const PayrollSettingsToggle = () => {
  const { enabled, update, isLoading } = usePayrollSettings();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Banknote className="w-5 h-5" />
        Payroll Module
      </h2>
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Enable payroll</h3>
            <p className="text-sm text-muted-foreground">
              Track director's salary, contractor payments, and employee pay runs. Off by default — turn on when you start paying yourself or hire someone.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => update({ enabled: v })}
            disabled={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};
