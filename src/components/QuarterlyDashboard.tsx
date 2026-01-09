import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { useTaxPeriods, TaxPeriod } from '@/hooks/useTaxPeriods';
import { format, differenceInDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { QuarterlyWizard } from './QuarterlyWizard';

interface QuarterCardProps {
  period: TaxPeriod;
  isCurrent: boolean;
  onReview: () => void;
  onSubmit: () => void;
}

const QuarterCard: React.FC<QuarterCardProps> = ({ period, isCurrent, onReview, onSubmit }) => {
  const deadline = new Date(period.deadline_date);
  const today = new Date();
  const daysUntilDeadline = differenceInDays(deadline, today);
  const isOverdue = isPast(deadline) && period.status !== 'submitted';
  const isApproaching = daysUntilDeadline <= 14 && daysUntilDeadline > 0;
  
  const profit = period.total_income - period.total_expenses;
  const progressToDeadline = Math.max(0, Math.min(100, ((30 - daysUntilDeadline) / 30) * 100));

  const getStatusBadge = () => {
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

        {period.status !== 'submitted' && (
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
          {period.status !== 'submitted' && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onSubmit}
              disabled={period.total_income === 0 && period.total_expenses === 0}
            >
              Quick Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuarterlyDashboard: React.FC = () => {
  const [wizardPeriod, setWizardPeriod] = useState<TaxPeriod | null>(null);
  
  const { 
    periods, 
    isLoading, 
    currentTaxYear,
    initializeQuarters,
    updatePeriodTotals,
    submitPeriod,
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
              {periods?.filter(p => p.status === 'submitted').length || 0}/4 submitted
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
                onReview={() => handleReview(period)}
                onSubmit={() => handleSubmit(period)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Year Summary */}
      {periods && periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-to-Date Summary</CardTitle>
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
    </div>
  );
};
