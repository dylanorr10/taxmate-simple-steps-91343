import { Card } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useCashFlowForecast } from "@/hooks/useCashFlowForecast";
import { formatCurrency } from "@/utils/transactionHelpers";

export const CashFlowForecast = () => {
  const { forecast, isLoading } = useCashFlowForecast();

  if (isLoading || forecast.length === 0) return null;

  const hasNegativeForecast = forecast.some(f => f.predictedNet < 0);

  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          Next 3 Months Forecast
        </h3>
      </div>

      {hasNegativeForecast && (
        <div className="mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-xs text-destructive">
            Warning: Cash may go negative in <strong>{forecast.find(f => f.predictedNet < 0)?.month}</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {forecast.map((f) => (
          <div 
            key={f.month} 
            className={`p-3 rounded-lg border ${
              f.predictedNet < 0 
                ? 'border-destructive/30 bg-destructive/5' 
                : 'border-success/30 bg-success/5'
            }`}
          >
            <div className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              {f.month}
            </div>
            
            <div className={`text-lg font-bold mb-2 ${
              f.predictedNet < 0 ? 'text-destructive' : 'text-success'
            }`}>
              {formatCurrency(Math.abs(f.predictedNet))}
            </div>

            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">In</span>
                <span className="font-medium">{formatCurrency(f.predictedIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Out</span>
                <span className="font-medium">{formatCurrency(f.predictedExpenses)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Based on last 3 months
      </p>
    </Card>
  );
};
