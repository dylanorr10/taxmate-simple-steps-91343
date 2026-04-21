import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { usePayrollPeople, usePayrollRuns } from "@/hooks/usePayroll";
import { calculateMonthlyPayroll, formatGBP } from "@/lib/payrollCalculations";
import { Plus, Trash2, Users, AlertTriangle } from "lucide-react";

export const EmployeePayrollRun = () => {
  const { employees, add, remove } = usePayrollPeople();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [salary, setSalary] = useState(30000);
  const [pension, setPension] = useState(true);

  const handleAdd = () => {
    if (!name) return;
    add({
      person_type: "employee",
      name,
      email: null,
      annual_salary: salary,
      monthly_salary: salary / 12,
      ni_category: "A",
      ir35_status: null,
      utr: null,
      start_date: new Date().toISOString().split("T")[0],
      active: true,
      notes: pension ? "auto-enrolled" : null,
    });
    setName(""); setSalary(30000);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>This calculates — it doesn't submit</AlertTitle>
        <AlertDescription>
          Reelin estimates PAYE/NI/pension so you know what to set aside. Real RTI submission to HMRC needs a payroll provider (FreeAgent, Xero Payroll) or your accountant. Export below to hand off.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">Estimate monthly cost per hire.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add employee</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Annual salary (£)</Label>
                <Input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-enrol pension</Label>
                <Switch checked={pension} onCheckedChange={setPension} />
              </div>
            </div>
            <DialogFooter><Button onClick={handleAdd}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No employees yet. Add your first hire to estimate true cost.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {employees.map((e) => <EmployeeCard key={e.id} person={e} onDelete={() => remove(e.id)} />)}
        </div>
      )}
    </div>
  );
};

const EmployeeCard = ({ person, onDelete }: { person: { id: string; name: string; annual_salary: number; notes: string | null }; onDelete: () => void }) => {
  const includePension = person.notes?.includes("auto-enrolled") ?? false;
  const b = calculateMonthlyPayroll(Number(person.annual_salary), includePension);
  const { create } = usePayrollRuns(person.id);

  const handleRun = () => {
    const today = new Date();
    const payMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    create({
      person_id: person.id,
      pay_month: payMonth,
      gross: b.gross,
      income_tax: b.incomeTax,
      employee_ni: b.employeeNI,
      employer_ni: b.employerNI,
      pension_contribution: b.pensionEmployer,
      net_pay: b.netPay,
      status: "draft",
      expense_transaction_id: null,
      notes: null,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{person.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
        <CardDescription>{formatGBP(person.annual_salary)} / year {includePension && <Badge variant="secondary" className="ml-1">+pension</Badge>}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Row label="Gross" value={formatGBP(b.gross)} />
          <Row label="Net to employee" value={formatGBP(b.netPay)} highlight />
          <Row label="PAYE tax" value={formatGBP(b.incomeTax)} />
          <Row label="Employee NI" value={formatGBP(b.employeeNI)} />
          <Row label="Employer NI" value={formatGBP(b.employerNI)} />
          <Row label="Pension (you)" value={formatGBP(b.pensionEmployer)} />
        </div>
        <div className="rounded-md bg-muted p-3 flex justify-between text-sm">
          <span className="text-muted-foreground">True monthly cost to you</span>
          <span className="font-semibold">{formatGBP(b.totalCostToEmployer)}</span>
        </div>
        <Button onClick={handleRun} className="w-full" size="sm">Save this month's run</Button>
      </CardContent>
    </Card>
  );
};

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`font-medium ${highlight ? "text-primary" : ""}`}>{value}</div>
  </div>
);
