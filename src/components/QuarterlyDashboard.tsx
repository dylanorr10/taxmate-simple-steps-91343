import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  FileText,
  Edit3,
  History
} from 'lucide-react';
import { useTaxPeriods, TaxPeriod } from '@/hooks/useTaxPeriods';
import { format, differenceInDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { QuarterlyWizard } from './QuarterlyWizard';
import { EOPSWizard } from './EOPSWizard';
import { AmendmentHistoryCard } from './AmendmentHistoryCard';

interface QuarterCardProps {
  period: TaxPeriod;
  isCurrent: boolean;
  hasAmendments: boolean;
  onReview: () => void;
  onSubmit: () => void;
  onAmend: () => void;
}

const QuarterCard: React.FC<QuarterCardProps> = ({ period, isCurrent, hasAmendments, onReview, onSubmit, onAmend }) => {
  const deadline = new Date(period.deadline_date);
  const today = new Date();
  const daysUntilDeadline = differenceInDays(deadline, today);
  const isOverdue = isPast(deadline) && period.status === 'draft';
  const isApproaching = daysUntilDeadline <= 14 && daysUntilDeadline > 0 && period.status === 'draft';
  
  const profit = period.total_income - period.total_expenses;
  const progressToDeadline = Math.max(0, Math.min(100, ((30 - daysUntilDeadline) / 30) * 100));

  const getStatusBadge = () => {
    if (period.status === 'corrected') {
      return (
        <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 flex items-center gap-1">
          <History className="h-3 w-3" />
          Corrected
        </Badge>
      );
    }
    if (period.status === 'submitted') {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Submitted</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isApproaching) {
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Due Soon</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <Card className={cn(
      "transition-all",
      isCurrent && "ring-2 ring-primary",
      isOverdue && "border-destructive"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Q{period.quarter_number} {period.tax_year}/{period.tax_year + 1}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(period.start_date), 'd MMM')} - {format(new Date(period.end_date), 'd MMM yyyy')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Income
            </p>
            <p className="text-lg font-semibold text-green-600">
              £{period.total_income.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              Expenses
            </p>
            <p className="text-lg font-semibold text-red-600">
              £{period.total_expenses.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Net Profit</span>
            <span className={cn(
              "font-semibold",
              profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              £{Math.abs(profit).toLocaleString()}
            </span>
          </div>
        </div>

        {period.status === 'draft' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Deadline
              </span>
              <span className={cn(
                "font-medium",
                isOverdue && "text-destructive",
                isApproaching && "text-amber-600"
              )}>
                {format(deadline, 'd MMM yyyy')}
                {isOverdue && " (Overdue!)"}
                {!isOverdue && daysUntilDeadline <= 30 && ` (${daysUntilDeadline} days)`}
              </span>
            </div>
            {daysUntilDeadline <= 30 && !isOverdue && (
              <Progress 
                value={progressToDeadline} 
                className={cn(
                  "h-1.5",
                  isApproaching && "[&>div]:bg-amber-500"
                )} 
              />
            )}
          </div>
        )}

        {hasAmendments && (period.status === 'submitted' || period.status === 'corrected') && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <History className="h-3 w-3" />
            <span>Has amendment history</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 group"
            onClick={onReview}
          >
            <Sparkles className="h-3 w-3 mr-1 group-hover:text-primary transition-colors" />
            Review
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          {period.status === 'draft' && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onSubmit}
              disabled={period.total_income === 0 && period.total_expenses === 0}
            >
              Quick Submit
            </Button>
          )}
          {(period.status === 'submitted' || period.status === 'corrected') && (
            <Button 
              variant="outline"
              size="sm" 
              className="flex-1"
              onClick={onAmend}
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Amend
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuarterlyDashboard: React.FC = () => {
  const [wizardPeriod, setWizardPeriod] = useState<TaxPeriod | null>(null);
  const [showEOPSWizard, setShowEOPSWizard] = useState(false);
  const [amendPeriod, setAmendPeriod] = useState<TaxPeriod | null>(null);
  const [amendReason, setAmendReason] = useState('');
  
  const { 
    periods, 
    isLoading, 
    currentTaxYear,
    initializeQuarters,
    updatePeriodTotals,
    submitPeriod,
    reopenPeriodForAmendment,
    isReopening,
    getAmendmentsForPeriod,
    hasAmendments,
    getCurrentQuarter,
    getUpcomingDeadlines,
    getOverduePeriods
  } = useTaxPeriods();

  useEffect(() => {
    if (!isLoading && (!periods || periods.length < 4)) {
      initializeQuarters();
    }
  }, [isLoading, periods, initializeQuarters]);

  useEffect(() => {
    if (periods && periods.length > 0) {
      periods.forEach(p => {
        if (p.status === 'draft') {
          updatePeriodTotals(p.id);
        }
      });
    }
  }, [periods?.length]);

  const currentQuarter = getCurrentQuarter();
  const upcomingDeadlines = getUpcomingDeadlines();
  const overduePeriods = getOverduePeriods();

  const handleReview = (period: TaxPeriod) => {
    setWizardPeriod(period);
  };

  const handleSubmit = (period: TaxPeriod) => {
    submitPeriod(period.id);
    toast.success(`Q${period.quarter_number} marked as submitted`);
  };

  const handleWizardSubmit = () => {
    if (wizardPeriod) {
      submitPeriod(wizardPeriod.id);
      toast.success(`Q${wizardPeriod.quarter_number} submitted successfully!`);
    }
  };

  const handleAmendClick = (period: TaxPeriod) => {
    setAmendPeriod(period);
    setAmendReason('');
  };

  const handleAmendConfirm = () => {
    if (amendPeriod && amendReason.trim()) {
      reopenPeriodForAmendment({ periodId: amendPeriod.id, reason: amendReason.trim() });
      setAmendPeriod(null);
      setAmendReason('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Quarterly Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-40 bg-muted rounded" />
              <div className="h-40 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {(overduePeriods.length > 0 || upcomingDeadlines.length > 0) && (
        <div className="space-y-2">
          {overduePeriods.map(period => (
            <div 
              key={period.id}
              className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
            >
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Q{period.quarter_number} submission is overdue!
                </p>
                <p className="text-xs text-muted-foreground">
                  Deadline was {format(new Date(period.deadline_date), 'd MMMM yyyy')}
                </p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleSubmit(period)}>
                Submit Now
              </Button>
            </div>
          ))}
          
          {upcomingDeadlines.map(period => (
            <div 
              key={period.id}
              className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                  Q{period.quarter_number} deadline approaching
                </p>
                <p className="text-xs text-muted-foreground">
                  Due {format(new Date(period.deadline_date), 'd MMMM yyyy')} 
                  ({differenceInDays(new Date(period.deadline_date), new Date())} days left)
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleReview(period)}>
                Review
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Tax Year {currentTaxYear}/{currentTaxYear + 1}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {periods?.filter(p => p.status === 'submitted' || p.status === 'corrected').length || 0}/4 submitted
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {periods?.map(period => (
              <QuarterCard
                key={period.id}
                period={period}
                isCurrent={currentQuarter?.id === period.id}
                hasAmendments={hasAmendments(period.id)}
                onReview={() => handleReview(period)}
                onSubmit={() => handleSubmit(period)}
                onAmend={() => handleAmendClick(period)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amendment History Section */}
      {periods && periods.some(p => hasAmendments(p.id)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Amendment History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {periods.filter(p => hasAmendments(p.id)).map(period => (
              <AmendmentHistoryCard
                key={period.id}
                amendments={getAmendmentsForPeriod(period.id)}
                quarterNumber={period.quarter_number}
              />
            ))}
          </div>
        </div>
      )}

      {/* Year Summary */}
      {periods && periods.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Year-to-Date Summary</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowEOPSWizard(true)}
            >
              <FileText className="h-4 w-4" />
              Year-End Review
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Income</p>
                <p className="text-xl font-bold text-green-600">
                  £{periods.reduce((sum, p) => sum + p.total_income, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">
                  £{periods.reduce((sum, p) => sum + p.total_expenses, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                <p className="text-xl font-bold text-primary">
                  £{(periods.reduce((sum, p) => sum + p.total_income - p.total_expenses, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quarterly Wizard Modal */}
      {wizardPeriod && (
        <QuarterlyWizard
          period={wizardPeriod}
          isOpen={!!wizardPeriod}
          onClose={() => setWizardPeriod(null)}
          onSubmit={handleWizardSubmit}
        />
      )}

      {/* EOPS Year-End Wizard Modal */}
      <EOPSWizard
        open={showEOPSWizard}
        onOpenChange={setShowEOPSWizard}
      />

      {/* Amendment Confirmation Dialog */}
      <Dialog open={!!amendPeriod} onOpenChange={(open) => !open && setAmendPeriod(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Amend Q{amendPeriod?.quarter_number} Submission
            </DialogTitle>
            <DialogDescription>
              You are about to reopen a submitted quarter for amendment. HMRC requires a reason for any corrections made after initial submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amendment-reason">Reason for Amendment</Label>
              <Input
                id="amendment-reason"
                placeholder="e.g., Missing invoice discovered, Expense incorrectly categorised..."
                value={amendReason}
                onChange={(e) => setAmendReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded for your audit trail.
              </p>
            </div>

            {amendPeriod && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">Current figures for Q{amendPeriod.quarter_number}:</p>
                <div className="flex gap-4">
                  <span className="text-green-600">Income: £{amendPeriod.total_income.toLocaleString()}</span>
                  <span className="text-red-600">Expenses: £{amendPeriod.total_expenses.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAmendPeriod(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAmendConfirm}
              disabled={!amendReason.trim() || isReopening}
            >
              {isReopening ? 'Opening...' : 'Reopen for Amendment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
