import { Card } from "@/components/ui/card";
import { TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { useCashFlowForecast } from "@/hooks/useCashFlowForecast";
import { formatCurrency } from "@/utils/transactionHelpers";

export const CashFlowForecast = () => {
  const { forecast, isLoading } = useCashFlowForecast();

  if (isLoading || forecast.length === 0) return null;

  const hasNegativeForecast = forecast.some(f => f.predictedNet < 0);
  const avgConfidence = forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length;

  return (
    <Card className="p-6 shadow-card hover-lift overflow-hidden relative">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Cash Flow Forecast</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">{Math.round(avgConfidence * 100)}% confident</span>
          </div>
        </div>

        {/* Warning Alert */}
        {hasNegativeForecast && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">
              Cash may dip negative in <strong>{forecast.find(f => f.predictedNet < 0)?.month}</strong>
            </p>
          </div>
        )}

        {/* Forecast Cards */}
        <div className="grid grid-cols-3 gap-3">
          {forecast.map((f, idx) => (
            <div 
              key={f.month} 
              className="relative group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`p-4 rounded-xl border-2 transition-all ${
                f.predictedNet < 0 
                  ? 'border-destructive/20 bg-destructive/5 hover:border-destructive/40' 
                  : 'border-success/20 bg-success/5 hover:border-success/40'
              }`}>
                {/* Month label */}
                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  {f.month}
                </div>
                
                {/* Net amount - Large and prominent */}
                <div className={`text-2xl font-bold mb-3 ${
                  f.predictedNet < 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {formatCurrency(f.predictedNet)}
                </div>

                {/* Income & Expenses breakdown */}
                <div className="space-y-1.5 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Income</span>
                    <span className="font-medium text-foreground">{formatCurrency(f.predictedIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium text-foreground">{formatCurrency(f.predictedExpenses)}</span>
                  </div>
                </div>

                {/* Confidence indicator */}
                <div className="mt-3 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Confidence</span>
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 w-3 rounded-full transition-all ${
                            i < Math.ceil(f.confidence * 3) 
                              ? 'bg-primary' 
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info footer */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Based on your last 3 months of transactions
        </p>
      </div>
    </Card>
  );
};
