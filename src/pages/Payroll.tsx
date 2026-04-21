import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DirectorSalaryCard } from "@/components/payroll/DirectorSalaryCard";
import { ContractorList } from "@/components/payroll/ContractorList";
import { IR35Checker } from "@/components/payroll/IR35Checker";
import { EmployeePayrollRun } from "@/components/payroll/EmployeePayrollRun";
import { usePayrollSettings } from "@/hooks/usePayroll";
import { Banknote } from "lucide-react";

const Payroll = () => {
  const { settings, enabled, isLoading, update } = usePayrollSettings();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-8 text-center text-muted-foreground">Loading…</div>
      </AppLayout>
    );
  }

  if (!enabled) {
    return (
      <AppLayout>
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Payroll</h1>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Payroll is off by default. Enable it when you start paying yourself a director's salary, hire a contractor, or take on your first employee.
              </p>
              <Button onClick={() => update({ enabled: true })}>Enable payroll module</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Payroll</h1>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-exp" className="text-xs">Auto-create expenses</Label>
            <Switch
              id="auto-exp"
              checked={settings?.auto_create_expenses ?? true}
              onCheckedChange={(v) => update({ auto_create_expenses: v })}
            />
          </div>
        </div>

        <Tabs defaultValue="director">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="director">You</TabsTrigger>
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="director" className="mt-4">
            <DirectorSalaryCard />
          </TabsContent>

          <TabsContent value="contractors" className="mt-4 space-y-6">
            <ContractorList />
            <IR35Checker />
          </TabsContent>

          <TabsContent value="employees" className="mt-4">
            <EmployeePayrollRun />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Payroll;
