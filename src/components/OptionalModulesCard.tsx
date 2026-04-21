import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Banknote, Car, FileText } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePayrollSettings } from "@/hooks/usePayroll";

export const OptionalModulesCard = () => {
  const { profile, updateProfile, isUpdating } = useProfile();
  const { enabled: payrollEnabled, update: updatePayroll, isLoading: payrollLoading } = usePayrollSettings();

  const Row = ({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
    disabled,
  }: {
    icon: typeof Banknote;
    title: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0 border-b border-border last:border-0">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );

  return (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground mb-4">
        Reelin's core is money in, money out, and tax. Turn these on when you need them.
      </p>
      <div className="divide-y divide-border">
        <Row
          icon={FileText}
          title="Invoicing"
          description="Track unpaid invoices, send payment chasers, and manage clients."
          checked={!!profile?.invoicing_enabled}
          onChange={(v) => updateProfile({ invoicing_enabled: v })}
          disabled={isUpdating}
        />
        <Row
          icon={Car}
          title="Mileage tracking"
          description="Log business trips and claim HMRC simplified expenses."
          checked={!!profile?.mileage_enabled}
          onChange={(v) => updateProfile({ mileage_enabled: v })}
          disabled={isUpdating}
        />
        <Row
          icon={Banknote}
          title="Payroll"
          description="Director's salary, contractors, and employee pay runs."
          checked={payrollEnabled}
          onChange={(v) => updatePayroll({ enabled: v })}
          disabled={payrollLoading}
        />
      </div>
    </Card>
  );
};
