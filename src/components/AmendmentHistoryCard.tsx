import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileEdit,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { PeriodAmendment } from '@/hooks/useTaxPeriods';
import { cn } from '@/lib/utils';

interface AmendmentHistoryCardProps {
  amendments: PeriodAmendment[];
  quarterNumber: number;
}

export const AmendmentHistoryCard: React.FC<AmendmentHistoryCardProps> = ({
  amendments,
  quarterNumber,
}) => {
  if (amendments.length === 0) {
    return null;
  }

  const getAmendmentTypeBadge = (type: string) => {
    switch (type) {
      case 'correction':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Correction</Badge>;
      case 'late_submission':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Late Submission</Badge>;
      case 'data_update':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">Data Update</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return `£${Math.abs(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDifferenceDisplay = (diff: number, label: string) => {
    if (diff === 0) return null;
    const isPositive = diff > 0;
    return (
      <div className={cn(
        "flex items-center gap-1 text-xs",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{isPositive ? '+' : '-'}{formatCurrency(diff)} {label}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Q{quarterNumber} Amendment History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {amendments.map((amendment, index) => (
          <div 
            key={amendment.id}
            className={cn(
              "relative pl-6 pb-4",
              index !== amendments.length - 1 && "border-l-2 border-dashed border-muted-foreground/20 ml-2"
            )}
          >
            {/* Timeline dot */}
            <div className={cn(
              "absolute left-0 top-0 w-4 h-4 rounded-full flex items-center justify-center",
              amendment.submitted_at 
                ? "bg-green-500/20 text-green-600" 
                : "bg-amber-500/20 text-amber-600"
            )}>
              {amendment.submitted_at ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <FileEdit className="h-3 w-3" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getAmendmentTypeBadge(amendment.amendment_type)}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(amendment.created_at), 'd MMM yyyy HH:mm')}
                </span>
              </div>

              {amendment.reason && (
                <p className="text-sm text-muted-foreground">
                  {amendment.reason}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Original:</span>
                  <div className="flex gap-2">
                    <span className="text-green-600">+{formatCurrency(amendment.previous_income)}</span>
                    <span className="text-red-600">-{formatCurrency(amendment.previous_expenses)}</span>
                  </div>
                </div>
                {amendment.submitted_at && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Corrected:</span>
                    <div className="flex gap-2">
                      <span className="text-green-600">+{formatCurrency(amendment.new_income)}</span>
                      <span className="text-red-600">-{formatCurrency(amendment.new_expenses)}</span>
                    </div>
                  </div>
                )}
              </div>

              {amendment.submitted_at && (amendment.income_difference !== 0 || amendment.expenses_difference !== 0) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {getDifferenceDisplay(amendment.income_difference, 'income')}
                  {getDifferenceDisplay(-amendment.expenses_difference, 'expenses')}
                </div>
              )}

              {amendment.submitted_at && (
                <div className="text-xs text-muted-foreground">
                  Submitted: {format(new Date(amendment.submitted_at), 'd MMM yyyy HH:mm')}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
