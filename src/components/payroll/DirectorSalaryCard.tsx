import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePayrollPeople, usePayrollRuns, type PayrollPerson } from "@/hooks/usePayroll";
import {
  calculateMonthlyPayroll,
  calculateDividendTax,
  formatGBP,
  DIRECTOR_DEFAULT_MONTHLY,
  PERSONAL_ALLOWANCE,
} from "@/lib/payrollCalculations";
import { Crown, Sparkles, AlertCircle } from "lucide-react";

export const DirectorSalaryCard = () => {
  const { directors, add, update } = usePayrollPeople();
  const director = directors[0];
  const { create: createRun } = usePayrollRuns(director?.id);

  const [monthlySalary, setMonthlySalary] = useState(DIRECTOR_DEFAULT_MONTHLY);
  const [dividendAmount, setDividendAmount] = useState(0);

  useEffect(() => {
    if (director) setMonthlySalary(Number(director.monthly_salary) || DIRECTOR_DEFAULT_MONTHLY);
  }, [director]);

  const annual = monthlySalary * 12;
  const breakdown = calculateMonthlyPayroll(annual, false);
  const dividendCalc = calculateDividendTax(annual, dividendAmount);

  const handleSaveDirector = () => {
    if (director) {
      update({ id: director.id, monthly_salary: monthlySalary, annual_salary: annual });
    } else {
      add({
        person_type: "director",
        name: "You (Director)",
        email: null,
        annual_salary: annual,
        monthly_salary: monthlySalary,
        ni_category: "A",
        ir35_status: null,
        utr: null,
        start_date: new Date().toISOString().split("T")[0],
        active: true,
        notes: null,
      });
    }
  };

  const handleRunMonth = () => {
    if (!director) return;
    const today = new Date();
    const payMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    createRun({
      person_id: director.id,
      pay_month: payMonth,
      gross: breakdown.gross,
      income_tax: breakdown.incomeTax,
      employee_ni: breakdown.employeeNI,
      employer_ni: breakdown.employerNI,
      pension_contribution: 0,
      net_pay: breakdown.netPay,
      status: "paid",
      expense_transaction_id: null,
      notes: null,
    });
  };

  const isOptimal = Math.abs(annual - PERSONAL_ALLOWANCE) < 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Director's salary</CardTitle>
          </div>
          <CardDescription>
            Set the monthly salary you pay yourself from your Ltd company.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="director-monthly">Monthly salary (£)</Label>
            <Input
              id="director-monthly"
              type="number"
              step="0.01"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
            />
            {isOptimal && (
              <p className="text-xs text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Sweet spot: matches the £12,570 personal allowance.
              </p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Gross / month" value={formatGBP(breakdown.gross)} />
            <Stat label="Net / month" value={formatGBP(breakdown.netPay)} highlight />
            <Stat label="Income tax" value={formatGBP(breakdown.incomeTax)} muted={breakdown.incomeTax === 0} />
            <Stat label="Employee NI" value={formatGBP(breakdown.employeeNI)} muted={breakdown.employeeNI === 0} />
            <Stat label="Employer NI" value={formatGBP(breakdown.employerNI)} muted={breakdown.employerNI === 0} />
            <Stat label="Annual gross" value={formatGBP(annual)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveDirector} variant="outline" className="flex-1">
              {director ? "Update salary" : "Save director"}
            </Button>
            <Button onClick={handleRunMonth} disabled={!director} className="flex-1">
              Run this month
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dividend tracker</CardTitle>
          <CardDescription>Record dividend payments to see tax implications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="div-amount">Dividend this year (£)</Label>
            <Input
              id="div-amount"
              type="number"
              value={dividendAmount}
              onChange={(e) => setDividendAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Dividend tax" value={formatGBP(dividendCalc.tax)} />
            <Stat
              label="Tax band"
              value={
                <Badge variant={dividendCalc.band === "basic" || dividendCalc.band === "allowance" ? "secondary" : "destructive"}>
                  {dividendCalc.band}
                </Badge>
              }
            />
          </div>

          {dividendCalc.band === "higher" && (
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              You've crossed into the higher dividend rate (33.75%). Consider timing larger payments across tax years.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value, highlight, muted }: { label: string; value: React.ReactNode; highlight?: boolean; muted?: boolean }) => (
  <div className="space-y-0.5">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`font-semibold ${highlight ? "text-primary" : ""} ${muted ? "text-muted-foreground" : ""}`}>{value}</div>
  </div>
);
