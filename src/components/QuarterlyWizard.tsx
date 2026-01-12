import React, { useState, useMemo, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Receipt,
  Banknote,
  ClipboardCheck,
  Send,
  Sparkles,
  Calendar,
  ShieldCheck,
  XCircle,
  Eye,
  Download,
  Edit3,
  History,
} from 'lucide-react';
import { TaxPeriod, PeriodAmendment } from '@/hooks/useTaxPeriods';
import { useIncomeTransactions, useExpenseTransactions, Transaction } from '@/hooks/useTransactions';
import { EditableTransactionRow } from './EditableTransactionRow';
import { AddTransactionInline } from './AddTransactionInline';
import { useMileageTrips } from '@/hooks/useMileageTrips';
import { useHomeOfficeClaims } from '@/hooks/useHomeOfficeClaims';
import { useProfile } from '@/hooks/useProfile';
import { useHMRCConnection } from '@/hooks/useHMRCConnection';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface QuarterlyWizardProps {
  period: TaxPeriod;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  /** Optional: Pass when this is an amendment to a previously submitted period */
  amendment?: PeriodAmendment;
  /** Optional: Called when submitting an amended period instead of onSubmit */
  onSubmitAmendment?: () => void;
}

interface ValidationItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  status: 'pass' | 'fail' | 'warning' | 'info';
  action?: () => void;
  actionLabel?: string;
}

const WIZARD_STEPS = [
  { id: 1, label: 'Review Income', icon: TrendingUp },
  { id: 2, label: 'Review Expenses', icon: Receipt },
  { id: 3, label: 'Deductions', icon: Banknote },
  { id: 4, label: 'Validation', icon: ClipboardCheck },
  { id: 5, label: 'Submit', icon: Send },
];

export const QuarterlyWizard: React.FC<QuarterlyWizardProps> = ({
  period,
  isOpen,
  onClose,
  onSubmit,
  amendment,
  onSubmitAmendment,
}) => {
  const isAmendment = !!amendment;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [validationChecks, setValidationChecks] = useState<Record<string, boolean>>({});
  const [reviewedIncome, setReviewedIncome] = useState(false);
  const [reviewedExpenses, setReviewedExpenses] = useState(false);
  const [reviewedDeductions, setReviewedDeductions] = useState(false);

  const { transactions: allIncomeTransactions, updateIncome, deleteIncome, addIncome, isUpdating: isUpdatingIncome, isAdding: isAddingIncome } = useIncomeTransactions();
  const { transactions: allExpenseTransactions, updateExpense, deleteExpense, addExpense, isUpdating: isUpdatingExpense, isAdding: isAddingExpense } = useExpenseTransactions();
  const { trips } = useMileageTrips();
  const { claims } = useHomeOfficeClaims();
  const { profile } = useProfile();
  const { isConnected: hasHMRCConnection } = useHMRCConnection();

  // Filter transactions for this period
  const periodIncome = useMemo(() => {
    if (!allIncomeTransactions) return [];
    return allIncomeTransactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= new Date(period.start_date) && date <= new Date(period.end_date);
    });
  }, [allIncomeTransactions, period]);

  const periodExpenses = useMemo(() => {
    if (!allExpenseTransactions) return [];
    return allExpenseTransactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= new Date(period.start_date) && date <= new Date(period.end_date);
    });
  }, [allExpenseTransactions, period]);

  // Filter mileage trips for this period
  const periodMileage = useMemo(() => {
    if (!trips) return [];
    return trips.filter(t => {
      const date = new Date(t.trip_date);
      return date >= new Date(period.start_date) && date <= new Date(period.end_date);
    });
  }, [trips, period]);

  // Filter home office claims for this period
  const periodHomeOffice = useMemo(() => {
    if (!claims) return [];
    return claims.filter(c => {
      const claimDate = new Date(c.claim_month + '-01');
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return claimDate >= startDate && claimDate <= endDate;
    });
  }, [claims, period]);

  // Calculate totals
  const totalIncome = periodIncome.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = periodExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalMileageDeduction = periodMileage.reduce((sum, t) => sum + Number(t.calculated_deduction), 0);
  const totalHomeOfficeDeduction = periodHomeOffice.reduce((sum, c) => sum + Number(c.calculated_deduction), 0);
  const netProfit = totalIncome - totalExpenses - totalMileageDeduction - totalHomeOfficeDeduction;

  // Amendment calculations (cumulative corrections)
  const incomeDifference = isAmendment ? totalIncome - (amendment?.previous_income || 0) : 0;
  const expensesDifference = isAmendment ? totalExpenses - (amendment?.previous_expenses || 0) : 0;
  const netDifference = incomeDifference - expensesDifference;

  // Calculate validation items
  const validationItems = useMemo((): ValidationItem[] => {
    const items: ValidationItem[] = [
      {
        id: 'income_recorded',
        label: 'Income recorded',
        description: periodIncome.length > 0 
          ? `${periodIncome.length} income transactions totalling £${totalIncome.toLocaleString()}`
          : 'No income recorded for this quarter',
        checked: validationChecks['income_recorded'] || false,
        status: periodIncome.length > 0 ? 'pass' : 'warning',
      },
      {
        id: 'expenses_recorded',
        label: 'Expenses recorded',
        description: periodExpenses.length > 0
          ? `${periodExpenses.length} expense transactions totalling £${totalExpenses.toLocaleString()}`
          : 'No expenses recorded for this quarter',
        checked: validationChecks['expenses_recorded'] || false,
        status: periodExpenses.length > 0 ? 'pass' : 'info',
      },
      {
        id: 'expenses_categorised',
        label: 'All expenses categorised',
        description: periodExpenses.every(e => e.hmrc_category_id)
          ? 'All expenses have HMRC categories assigned'
          : `${periodExpenses.filter(e => !e.hmrc_category_id).length} expenses need categorising`,
        checked: validationChecks['expenses_categorised'] || false,
        status: periodExpenses.every(e => e.hmrc_category_id) ? 'pass' : 'warning',
        action: periodExpenses.some(e => !e.hmrc_category_id) ? () => navigate('/log') : undefined,
        actionLabel: 'Categorise',
      },
      {
        id: 'vat_rates_set',
        label: 'VAT rates set correctly',
        description: periodExpenses.every(e => e.vat_rate !== undefined && e.vat_rate !== null)
          ? 'All transactions have VAT rates set'
          : 'Some transactions may need VAT rate review',
        checked: validationChecks['vat_rates_set'] || false,
        status: 'pass',
      },
      {
        id: 'receipts_attached',
        label: 'Receipts attached (recommended)',
        description: `${periodExpenses.filter(e => e.receipt_url).length}/${periodExpenses.length} expenses have receipts`,
        checked: validationChecks['receipts_attached'] || false,
        status: periodExpenses.filter(e => e.receipt_url).length >= periodExpenses.length * 0.8 ? 'pass' : 'info',
      },
      {
        id: 'mileage_reviewed',
        label: 'Mileage deductions reviewed',
        description: periodMileage.length > 0
          ? `${periodMileage.length} trips, £${totalMileageDeduction.toFixed(2)} deduction`
          : 'No mileage logged for this quarter',
        checked: validationChecks['mileage_reviewed'] || false,
        status: 'pass',
      },
      {
        id: 'home_office_reviewed',
        label: 'Home office deductions reviewed',
        description: periodHomeOffice.length > 0
          ? `${periodHomeOffice.length} months claimed, £${totalHomeOfficeDeduction.toFixed(2)} deduction`
          : 'No home office claims for this quarter',
        checked: validationChecks['home_office_reviewed'] || false,
        status: 'pass',
      },
      {
        id: 'business_name',
        label: 'Business name set',
        description: profile?.business_name || 'Business name required',
        checked: validationChecks['business_name'] || false,
        status: profile?.business_name ? 'pass' : 'fail',
        action: !profile?.business_name ? () => navigate('/settings') : undefined,
        actionLabel: 'Add',
      },
      {
        id: 'hmrc_connected',
        label: 'HMRC connection',
        description: hasHMRCConnection ? 'Connected to HMRC MTD' : 'Not connected to HMRC',
        checked: validationChecks['hmrc_connected'] || false,
        status: hasHMRCConnection ? 'pass' : 'warning',
        action: !hasHMRCConnection ? () => navigate('/settings') : undefined,
        actionLabel: 'Connect',
      },
    ];
    return items;
  }, [periodIncome, periodExpenses, periodMileage, periodHomeOffice, totalIncome, totalExpenses, totalMileageDeduction, totalHomeOfficeDeduction, validationChecks, profile, hasHMRCConnection, navigate]);

  const passedChecks = validationItems.filter(v => v.status === 'pass' || v.status === 'info').length;
  const failedChecks = validationItems.filter(v => v.status === 'fail').length;
  const warningChecks = validationItems.filter(v => v.status === 'warning').length;
  const allManualChecked = validationItems.every(v => v.checked);
  const canSubmit = failedChecks === 0 && allManualChecked && reviewedIncome && reviewedExpenses && reviewedDeductions;

  const handleCheckToggle = (id: string) => {
    setValidationChecks(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) setReviewedIncome(true);
    if (currentStep === 2) setReviewedExpenses(true);
    if (currentStep === 3) setReviewedDeductions(true);
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error('Please complete all validation checks before submitting');
      return;
    }
    
    if (isAmendment && onSubmitAmendment) {
      onSubmitAmendment();
    } else {
      onSubmit();
    }
    onClose();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Quarterly Tax Summary', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Q${period.quarter_number} ${period.tax_year}/${period.tax_year + 1}`, margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Period: ${format(new Date(period.start_date), 'd MMM yyyy')} - ${format(new Date(period.end_date), 'd MMM yyyy')}`, margin, y);
    y += 6;
    doc.text(`Generated: ${format(new Date(), 'd MMM yyyy HH:mm')}`, margin, y);
    y += 15;

    // Business info
    if (profile?.business_name) {
      doc.setFont('helvetica', 'bold');
      doc.text('Business:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.business_name, margin + 25, y);
      y += 10;
    }

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Financial Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', margin, y);
    y += 10;

    doc.setFontSize(11);
    const summaryData = [
      ['Gross Income:', `£${totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`],
      ['Total Expenses:', `£${totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`],
      ['Mileage Deductions:', `£${totalMileageDeduction.toFixed(2)}`],
      ['Home Office Deductions:', `£${totalHomeOfficeDeduction.toFixed(2)}`],
      ['Total Deductions:', `£${(totalMileageDeduction + totalHomeOfficeDeduction).toFixed(2)}`],
    ];

    doc.setFont('helvetica', 'normal');
    summaryData.forEach(([label, value]) => {
      doc.text(label, margin, y);
      doc.text(value, pageWidth - margin - 40, y);
      y += 7;
    });

    y += 3;
    doc.setDrawColor(100);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Profit:', margin, y);
    doc.text(`£${Math.abs(netProfit).toLocaleString('en-GB', { minimumFractionDigits: 2 })}${netProfit < 0 ? ' (Loss)' : ''}`, pageWidth - margin - 40, y);
    y += 15;

    // Income Transactions
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Income Transactions (${periodIncome.length})`, margin, y);
    y += 8;

    if (periodIncome.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const incomeToShow = periodIncome.slice(0, 15);
      incomeToShow.forEach(t => {
        const desc = (t.description || 'Untitled').substring(0, 40);
        const date = format(new Date(t.transaction_date), 'dd/MM/yy');
        const amount = `£${Number(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
        doc.text(`${date} - ${desc}`, margin, y);
        doc.text(amount, pageWidth - margin - 25, y);
        y += 5;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      if (periodIncome.length > 15) {
        doc.text(`... and ${periodIncome.length - 15} more transactions`, margin, y);
        y += 5;
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No income recorded', margin, y);
      y += 5;
    }
    y += 10;

    // Expense Transactions
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Expense Transactions (${periodExpenses.length})`, margin, y);
    y += 8;

    if (periodExpenses.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const expensesToShow = periodExpenses.slice(0, 15);
      expensesToShow.forEach(t => {
        const desc = (t.description || 'Untitled').substring(0, 40);
        const date = format(new Date(t.transaction_date), 'dd/MM/yy');
        const amount = `£${Number(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
        doc.text(`${date} - ${desc}`, margin, y);
        doc.text(amount, pageWidth - margin - 25, y);
        y += 5;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      if (periodExpenses.length > 15) {
        doc.text(`... and ${periodExpenses.length - 15} more transactions`, margin, y);
        y += 5;
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No expenses recorded', margin, y);
      y += 5;
    }
    y += 10;

    // Mileage Summary
    if (periodMileage.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Mileage Deductions', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const totalMiles = periodMileage.reduce((sum, t) => sum + Number(t.distance_miles), 0);
      doc.text(`Total trips: ${periodMileage.length}`, margin, y);
      y += 5;
      doc.text(`Total miles: ${totalMiles.toFixed(1)}`, margin, y);
      y += 5;
      doc.text(`Deduction claimed: £${totalMileageDeduction.toFixed(2)}`, margin, y);
      y += 10;
    }

    // Home Office Summary
    if (periodHomeOffice.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Home Office Deductions', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const totalHours = periodHomeOffice.reduce((sum, c) => sum + Number(c.hours_worked), 0);
      doc.text(`Months claimed: ${periodHomeOffice.length}`, margin, y);
      y += 5;
      doc.text(`Total hours: ${totalHours}`, margin, y);
      y += 5;
      doc.text(`Deduction claimed: £${totalHomeOfficeDeduction.toFixed(2)}`, margin, y);
      y += 15;
    }

    // Footer
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128);
    doc.text('This document is for record keeping purposes only and does not constitute an official HMRC submission.', margin, y);

    // Save
    const filename = `quarterly-summary-Q${period.quarter_number}-${period.tax_year}.pdf`;
    doc.save(filename);
    toast.success('PDF downloaded successfully');
  };

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setValidationChecks({});
      setReviewedIncome(false);
      setReviewedExpenses(false);
      setReviewedDeductions(false);
    }
  }, [isOpen]);

  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100;

  const handleUpdateIncome = (id: string, updates: Partial<Transaction>) => {
    updateIncome({ id, ...updates });
  };

  const handleUpdateExpense = (id: string, updates: Partial<Transaction>) => {
    updateExpense({ id, ...updates });
  };

  const renderTransactionList = (transactions: Transaction[], type: 'income' | 'expense') => {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No {type} transactions for this quarter</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => navigate('/log')}
          >
            Add {type}
          </Button>
        </div>
      );
    }

    const handleUpdate = type === 'income' ? handleUpdateIncome : handleUpdateExpense;
    const handleDelete = type === 'income' ? deleteIncome : deleteExpense;
    const isUpdating = type === 'income' ? isUpdatingIncome : isUpdatingExpense;

    return (
      <ScrollArea className="h-[300px] pr-2">
        <div className="space-y-2">
          {transactions.map(t => (
            <EditableTransactionRow
              key={t.id}
              transaction={t}
              type={type}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-success">£{totalIncome.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{periodIncome.length} transactions</p>
              </div>
            </div>
            
            <AddTransactionInline
              type="income"
              defaultDate={period.start_date}
              onAdd={(data) => addIncome(data)}
              isAdding={isAddingIncome}
            />
            
            {renderTransactionList(periodIncome, 'income')}
            {periodIncome.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox 
                  id="confirm-income"
                  checked={reviewedIncome}
                  onCheckedChange={(checked) => setReviewedIncome(!!checked)}
                />
                <label htmlFor="confirm-income" className="cursor-pointer">
                  I confirm all income for this quarter is complete and accurate
                </label>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">£{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{periodExpenses.length} transactions</p>
              </div>
            </div>
            
            <AddTransactionInline
              type="expense"
              defaultDate={period.start_date}
              onAdd={(data) => addExpense(data)}
              isAdding={isAddingExpense}
            />
            
            {renderTransactionList(periodExpenses, 'expense')}
            {periodExpenses.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox 
                  id="confirm-expenses"
                  checked={reviewedExpenses}
                  onCheckedChange={(checked) => setReviewedExpenses(!!checked)}
                />
                <label htmlFor="confirm-expenses" className="cursor-pointer">
                  I confirm all expenses for this quarter are complete and accurate
                </label>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {/* Mileage Summary */}
            <Card className="border-border">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Mileage Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                {periodMileage.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Business trips</span>
                      <span className="font-medium">{periodMileage.filter(t => t.trip_type === 'business').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total miles</span>
                      <span className="font-medium">{periodMileage.reduce((sum, t) => sum + t.distance_miles, 0).toFixed(1)} miles</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span className="text-sm font-medium">Deduction</span>
                      <span className="font-bold">£{totalMileageDeduction.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No mileage logged for this quarter
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Home Office Summary */}
            <Card className="border-border">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Home Office Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                {periodHomeOffice.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Months claimed</span>
                      <span className="font-medium">{periodHomeOffice.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total hours</span>
                      <span className="font-medium">{periodHomeOffice.reduce((sum, c) => sum + c.hours_worked, 0)} hrs</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span className="text-sm font-medium">Deduction</span>
                      <span className="font-bold">£{totalHomeOfficeDeduction.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No home office claims for this quarter
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Deductions */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Deductions</span>
                <span className="text-xl font-bold text-primary">
                  £{(totalMileageDeduction + totalHomeOfficeDeduction).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox 
                id="confirm-deductions"
                checked={reviewedDeductions}
                onCheckedChange={(checked) => setReviewedDeductions(!!checked)}
              />
              <label htmlFor="confirm-deductions" className="cursor-pointer">
                I confirm all deductions are accurate
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">Validation Progress</p>
                <p className="text-xs text-muted-foreground">
                  {Object.values(validationChecks).filter(Boolean).length}/{validationItems.length} items confirmed
                </p>
              </div>
              <div className="flex gap-1">
                {passedChecks > 0 && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {passedChecks} pass
                  </Badge>
                )}
                {warningChecks > 0 && (
                  <Badge variant="secondary" className="bg-warning/20 text-warning">
                    {warningChecks} warning
                  </Badge>
                )}
                {failedChecks > 0 && (
                  <Badge variant="destructive">
                    {failedChecks} fail
                  </Badge>
                )}
              </div>
            </div>

            <ScrollArea className="h-[320px] pr-2">
              <div className="space-y-2">
                {validationItems.map(item => (
                  <div 
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      item.status === 'pass' && "bg-success/5 border-success/20",
                      item.status === 'fail' && "bg-destructive/5 border-destructive/20",
                      item.status === 'warning' && "bg-warning/5 border-warning/20",
                      item.status === 'info' && "bg-muted/30 border-border"
                    )}
                  >
                    <Checkbox 
                      checked={item.checked}
                      onCheckedChange={() => handleCheckToggle(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {item.status === 'fail' && <XCircle className="h-4 w-4 text-destructive" />}
                        {item.status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                        {item.status === 'info' && <Eye className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    {item.action && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={item.action}
                        className="flex-shrink-0"
                      >
                        {item.actionLabel}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            {/* Amendment Notice */}
            {isAmendment && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Edit3 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-amber-700 dark:text-amber-500">Amendment Submission</p>
                    <p className="text-sm text-muted-foreground">
                      This is a correction to a previously submitted quarter. The cumulative differences will be reported to HMRC.
                    </p>
                    {amendment?.reason && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Reason:</span> {amendment.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cumulative Corrections (Amendment only) */}
            {isAmendment && (
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-amber-600" />
                    Cumulative Corrections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-card rounded-lg">
                      <p className="text-[10px] text-muted-foreground">Original Income</p>
                      <p className="text-sm font-semibold">£{(amendment?.previous_income || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-card rounded-lg flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-2 bg-card rounded-lg">
                      <p className="text-[10px] text-muted-foreground">New Income</p>
                      <p className="text-sm font-semibold text-success">£{totalIncome.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-card rounded-lg">
                      <p className="text-[10px] text-muted-foreground">Original Expenses</p>
                      <p className="text-sm font-semibold">£{(amendment?.previous_expenses || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-card rounded-lg flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-2 bg-card rounded-lg">
                      <p className="text-[10px] text-muted-foreground">New Expenses</p>
                      <p className="text-sm font-semibold text-destructive">£{totalExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-amber-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Net Difference</span>
                      <span className={cn(
                        "text-lg font-bold",
                        netDifference >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {netDifference >= 0 ? '+' : '-'}£{Math.abs(netDifference).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className={incomeDifference >= 0 ? "text-success" : "text-destructive"}>
                        Income: {incomeDifference >= 0 ? '+' : ''}£{incomeDifference.toLocaleString()}
                      </span>
                      <span className={expensesDifference <= 0 ? "text-success" : "text-destructive"}>
                        Expenses: {expensesDifference >= 0 ? '+' : ''}£{expensesDifference.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Summary */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  {isAmendment ? 'Corrected Quarterly Summary' : 'Quarterly Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card rounded-lg">
                    <p className="text-xs text-muted-foreground">Gross Income</p>
                    <p className="text-lg font-bold text-success">£{totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Expenses</p>
                    <p className="text-lg font-bold text-destructive">£{totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-xs text-muted-foreground">Simplified Deductions</p>
                  <p className="text-lg font-bold text-primary">
                    £{(totalMileageDeduction + totalHomeOfficeDeduction).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mileage: £{totalMileageDeduction.toFixed(2)} • Home Office: £{totalHomeOfficeDeduction.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-primary/20 rounded-lg border-2 border-primary/30">
                  <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    netProfit >= 0 ? "text-success" : "text-destructive"
                  )}>
                    £{Math.abs(netProfit).toLocaleString()}
                    {netProfit < 0 && ' (Loss)'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submission Status */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              canSubmit 
                ? "bg-success/10 border-success/30" 
                : "bg-warning/10 border-warning/30"
            )}>
              <div className="flex items-start gap-3">
                {canSubmit ? (
                  <ShieldCheck className="h-6 w-6 text-success flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0" />
                )}
                <div>
                  <p className={cn(
                    "font-medium",
                    canSubmit ? "text-success" : "text-warning"
                  )}>
                    {canSubmit ? 'Ready to Submit' : 'Not Ready Yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {canSubmit 
                      ? 'All checks passed. You can now submit this quarterly update to HMRC.'
                      : 'Please complete all validation checks and review steps before submitting.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF Summary
            </Button>

            {/* Declaration */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAmendment 
                  ? 'By submitting this correction, I declare that the amended information provided is complete and correct to the best of my knowledge. I understand that I may be liable to penalties if I give false information.'
                  : 'By submitting this quarterly update, I declare that the information provided is complete and correct to the best of my knowledge. I understand that I may be liable to penalties if I give false information.'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {isAmendment ? (
              <>
                <History className="h-5 w-5 text-amber-600" />
                Q{period.quarter_number} Amendment
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 text-primary" />
                Q{period.quarter_number} {period.tax_year}/{period.tax_year + 1} Update
              </>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(period.start_date), 'd MMM')} - {format(new Date(period.end_date), 'd MMM yyyy')}
            {isAmendment && ' • Correction'}
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex-shrink-0 px-1 py-4">
          <div className="flex items-center justify-between mb-2">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={cn(
                      "flex flex-col items-center cursor-pointer transition-all",
                      (isComplete || isCurrent) ? "opacity-100" : "opacity-40"
                    )}
                    onClick={() => isComplete && setCurrentStep(step.id)}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isComplete && "bg-success text-success-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                      !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-[10px] mt-1 text-center font-medium max-w-[60px]">
                      {step.label}
                    </span>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-1 rounded-full transition-colors mb-5",
                      currentStep > step.id ? "bg-success" : "bg-muted"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <Progress value={progressPercentage} className="h-1" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-1">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex gap-3 pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < WIZARD_STEPS.length ? (
            <Button onClick={handleNext} className="flex-1">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "flex-1",
                isAmendment 
                  ? "bg-amber-600 hover:bg-amber-600/90" 
                  : "bg-success hover:bg-success/90"
              )}
            >
              <Send className="h-4 w-4 mr-2" />
              {isAmendment ? 'Submit Correction' : 'Submit to HMRC'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
