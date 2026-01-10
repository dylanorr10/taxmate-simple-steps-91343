import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calculator,
  ClipboardCheck,
  Shield,
  Download,
  TrendingUp,
  TrendingDown,
  Building2,
  Banknote,
} from "lucide-react";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useTaxPeriods, getCurrentTaxYear } from "@/hooks/useTaxPeriods";
import { useTaxAdjustments } from "@/hooks/useTaxAdjustments";
import { useEOPS, calculateIncomeTax, calculateNIC4 } from "@/hooks/useEOPS";
import { useProfile } from "@/hooks/useProfile";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { formatCurrency } from "@/utils/transactionHelpers";
import { TaxAdjustmentsManager } from "./TaxAdjustmentsManager";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface EOPSWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 1, label: "Year Summary", icon: FileText },
  { id: 2, label: "Adjustments", icon: Calculator },
  { id: 3, label: "Tax Calculation", icon: Banknote },
  { id: 4, label: "Declarations", icon: ClipboardCheck },
  { id: 5, label: "Submit", icon: Shield },
];

export const EOPSWizard: React.FC<EOPSWizardProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);
  const [declarations, setDeclarations] = useState({
    accounts_finalised: false,
    all_income_declared: false,
    all_expenses_claimed: false,
    adjustments_reviewed: false,
  });

  const currentTaxYear = getCurrentTaxYear();
  const { transactions: incomeTransactions } = useIncomeTransactions();
  const { transactions: expenseTransactions } = useExpenseTransactions();
  const { periods } = useTaxPeriods();
  const { adjustments, netAdjustment, totals } = useTaxAdjustments();
  const { eops, submitEOPS, isSubmitting } = useEOPS();
  const { profile } = useProfile();
  const { isConnected } = useHMRCConnection();

  // Filter transactions for current tax year
  const taxYearStart = new Date(currentTaxYear, 3, 6);
  const taxYearEnd = new Date(currentTaxYear + 1, 3, 5);

  const yearlyIncome = useMemo(() => {
    return incomeTransactions
      .filter(t => {
        const date = new Date(t.transaction_date);
        return date >= taxYearStart && date <= taxYearEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [incomeTransactions, taxYearStart, taxYearEnd]);

  const yearlyExpenses = useMemo(() => {
    return expenseTransactions
      .filter(t => {
        const date = new Date(t.transaction_date);
        return date >= taxYearStart && date <= taxYearEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [expenseTransactions, taxYearStart, taxYearEnd]);

  // Calculate profits and tax
  const accountingProfit = yearlyIncome - yearlyExpenses;
  const taxableProfit = accountingProfit + netAdjustment;
  const { tax: incomeTax, breakdown: taxBreakdown } = calculateIncomeTax(taxableProfit);
  const { nic: nic4, breakdown: nicBreakdown } = calculateNIC4(taxableProfit);
  const totalTaxDue = incomeTax + nic4;

  // Check if all quarters are submitted
  const allQuartersSubmitted = periods?.length === 4 && periods.every(p => p.status === 'submitted');

  // Validation
  const allDeclarationsChecked = Object.values(declarations).every(Boolean);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('End of Period Statement', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tax Year ${currentTaxYear}/${currentTaxYear + 1}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Business Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Details', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Business Name: ${profile?.business_name || 'Not specified'}`, 20, y);
    y += 6;
    doc.text(`VAT: ${profile?.vat_number || 'Not specified'}`, 20, y);
    y += 6;
    doc.text(`Generated: ${format(new Date(), 'dd MMMM yyyy HH:mm')}`, 20, y);
    y += 15;

    // Income Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Summary', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Income: ${formatCurrency(yearlyIncome)}`, 20, y);
    y += 6;
    doc.text(`Total Expenses: ${formatCurrency(yearlyExpenses)}`, 20, y);
    y += 6;
    doc.text(`Accounting Profit: ${formatCurrency(accountingProfit)}`, 20, y);
    y += 12;

    // Tax Adjustments
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Adjustments', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Additions to Profit: ${formatCurrency(totals.additions)}`, 20, y);
    y += 6;
    doc.text(`Deductions from Profit: ${formatCurrency(totals.deductions)}`, 20, y);
    y += 6;
    doc.text(`Net Adjustment: ${formatCurrency(netAdjustment)}`, 20, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Taxable Profit: ${formatCurrency(taxableProfit)}`, 20, y);
    y += 12;

    // Tax Calculation
    doc.setFontSize(14);
    doc.text('Tax Calculation', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    taxBreakdown.forEach(band => {
      doc.text(`${band.band}: ${formatCurrency(band.amount)} @ tax = ${formatCurrency(band.tax)}`, 20, y);
      y += 6;
    });
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Income Tax: ${formatCurrency(incomeTax)}`, 20, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    nicBreakdown.forEach(band => {
      doc.text(`${band.band}: ${formatCurrency(band.amount)} = ${formatCurrency(band.nic)}`, 20, y);
      y += 6;
    });
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Class 4 NIC: ${formatCurrency(nic4)}`, 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`TOTAL TAX DUE: ${formatCurrency(totalTaxDue)}`, 20, y);

    // Save
    doc.save(`EOPS_${currentTaxYear}-${currentTaxYear + 1}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleSubmit = () => {
    submitEOPS({
      total_income: yearlyIncome,
      total_expenses: yearlyExpenses,
      total_adjustments: netAdjustment,
      net_profit: accountingProfit,
      taxable_profit: taxableProfit,
      tax_due: totalTaxDue,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setStep(1);
      },
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <h3 className="text-lg font-semibold">Tax Year {currentTaxYear}/{currentTaxYear + 1} Summary</h3>
              <p className="text-sm text-muted-foreground">
                6 April {currentTaxYear} to 5 April {currentTaxYear + 1}
              </p>
            </div>

            {/* Quarterly Status */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Quarterly Update Status
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(q => {
                    const period = periods?.find(p => p.quarter_number === q);
                    const isSubmitted = period?.status === 'submitted';
                    return (
                      <div key={q} className={`text-center p-3 rounded-lg ${isSubmitted ? 'bg-green-500/10' : 'bg-muted'}`}>
                        <p className="text-sm font-medium">Q{q}</p>
                        {isSubmitted ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-1" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {!allQuartersSubmitted && (
                  <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Some quarterly updates are not yet submitted
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Annual Totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-500/5">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(yearlyIncome)}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/5">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(yearlyExpenses)}</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="p-4 text-center">
                  <Building2 className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Accounting Profit</p>
                  <p className={`text-2xl font-bold ${accountingProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                    {formatCurrency(accountingProfit)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h3 className="text-lg font-semibold">Year-End Tax Adjustments</h3>
              <p className="text-sm text-muted-foreground">
                Add capital allowances, accruals, and other adjustments
              </p>
            </div>
            <TaxAdjustmentsManager />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <h3 className="text-lg font-semibold">Tax Calculation</h3>
              <p className="text-sm text-muted-foreground">
                Based on your income, expenses, and adjustments
              </p>
            </div>

            {/* Profit Calculation */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium">Taxable Profit</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accounting Profit</span>
                    <span>{formatCurrency(accountingProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add: Additions to profit</span>
                    <span className="text-red-600">+{formatCurrency(totals.additions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Less: Deductions from profit</span>
                    <span className="text-green-600">-{formatCurrency(totals.deductions)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Taxable Profit</span>
                    <span className="text-primary">{formatCurrency(taxableProfit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Tax */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium">Income Tax</h4>
                <div className="space-y-2 text-sm">
                  {taxBreakdown.map((band, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {band.band} ({formatCurrency(band.amount)})
                      </span>
                      <span>{formatCurrency(band.tax)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Income Tax</span>
                    <span>{formatCurrency(incomeTax)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* National Insurance */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium">Class 4 National Insurance</h4>
                <div className="space-y-2 text-sm">
                  {nicBreakdown.length > 0 ? (
                    nicBreakdown.map((band, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {band.band} ({formatCurrency(band.amount)})
                        </span>
                        <span>{formatCurrency(band.nic)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No Class 4 NIC due (profit below threshold)</p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Class 4 NIC</span>
                    <span>{formatCurrency(nic4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">Total Tax Due</p>
                    <p className="text-xs text-muted-foreground">Income Tax + Class 4 NIC</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(totalTaxDue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <h3 className="text-lg font-semibold">Declarations</h3>
              <p className="text-sm text-muted-foreground">
                Please confirm the following before submitting
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="accounts"
                    checked={declarations.accounts_finalised}
                    onCheckedChange={(checked) => 
                      setDeclarations(d => ({ ...d, accounts_finalised: !!checked }))
                    }
                  />
                  <label htmlFor="accounts" className="text-sm cursor-pointer">
                    <span className="font-medium">I confirm my accounts are finalised</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      My accounting records for this tax year are complete and accurate
                    </p>
                  </label>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="income"
                    checked={declarations.all_income_declared}
                    onCheckedChange={(checked) => 
                      setDeclarations(d => ({ ...d, all_income_declared: !!checked }))
                    }
                  />
                  <label htmlFor="income" className="text-sm cursor-pointer">
                    <span className="font-medium">I have declared all business income</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      All income from my self-employment has been recorded
                    </p>
                  </label>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="expenses"
                    checked={declarations.all_expenses_claimed}
                    onCheckedChange={(checked) => 
                      setDeclarations(d => ({ ...d, all_expenses_claimed: !!checked }))
                    }
                  />
                  <label htmlFor="expenses" className="text-sm cursor-pointer">
                    <span className="font-medium">All expenses claimed are allowable</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Expenses are wholly and exclusively for business purposes
                    </p>
                  </label>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="adjustments"
                    checked={declarations.adjustments_reviewed}
                    onCheckedChange={(checked) => 
                      setDeclarations(d => ({ ...d, adjustments_reviewed: !!checked }))
                    }
                  />
                  <label htmlFor="adjustments" className="text-sm cursor-pointer">
                    <span className="font-medium">I have reviewed all tax adjustments</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Capital allowances and other adjustments are correct
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {!allDeclarationsChecked && (
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Please confirm all declarations to proceed
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <h3 className="text-lg font-semibold">Submit End of Period Statement</h3>
              <p className="text-sm text-muted-foreground">
                Review and submit your annual summary to HMRC
              </p>
            </div>

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tax Year</p>
                    <p className="font-medium">{currentTaxYear}/{currentTaxYear + 1}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Business</p>
                    <p className="font-medium">{profile?.business_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Income</p>
                    <p className="font-medium text-green-600">{formatCurrency(yearlyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Expenses</p>
                    <p className="font-medium text-red-600">{formatCurrency(yearlyExpenses)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxable Profit</p>
                    <p className="font-medium">{formatCurrency(taxableProfit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Due</p>
                    <p className="font-medium text-primary">{formatCurrency(totalTaxDue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {(!isConnected || !allQuartersSubmitted) && (
              <div className="space-y-2">
                {!isConnected && (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-amber-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      HMRC not connected - submission will be saved locally only
                    </p>
                  </div>
                )}
                {!allQuartersSubmitted && (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-amber-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Not all quarterly updates have been submitted
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || !allDeclarationsChecked}
              >
                <Shield className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit End of Period Statement'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleExportPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF Summary
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By submitting, you confirm all information is accurate and complete.
              {profile?.demo_mode && ' (Demo mode - submission will be simulated)'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            End of Period Statement
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs mt-1 text-center max-w-[60px] hidden sm:block">
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 lg:w-16 h-0.5 mx-1 ${
                      step > s.id ? "bg-green-500" : "bg-muted"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(step / STEPS.length) * 100} className="h-1" />
        </div>

        {/* Content */}
        <div className="py-4">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {step < 5 && (
            <Button
              onClick={() => setStep(s => Math.min(5, s + 1))}
              disabled={step === 4 && !allDeclarationsChecked}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
