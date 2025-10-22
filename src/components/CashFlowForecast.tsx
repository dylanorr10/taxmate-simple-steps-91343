import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useCashFlowForecast } from "@/hooks/useCashFlowForecast";
import { formatCurrency } from "@/utils/transactionHelpers";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const CashFlowForecast = () => {
  const { forecast, isLoading } = useCashFlowForecast();

  if (isLoading || forecast.length === 0) return null;

  const hasNegativeForecast = forecast.some(f => f.predictedNet < 0);
  const avgConfidence = forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length;

  const chartData = forecast.map(f => ({
    month: f.month,
    Income: f.predictedIncome,
    Expenses: f.predictedExpenses,
    Net: f.predictedNet,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cash Flow Forecast (Next 3 Months)</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {avgConfidence > 0.7 ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-warning" />
            )}
            {Math.round(avgConfidence * 100)}% confidence
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasNegativeForecast && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Warning: Cash flow may dip negative in{" "}
              {forecast.find(f => f.predictedNet < 0)?.month}. Consider reducing expenses or increasing income.
            </AlertDescription>
          </Alert>
        )}

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Income" stroke="hsl(var(--primary))" strokeWidth={2} />
            <Line type="monotone" dataKey="Expenses" stroke="hsl(var(--destructive))" strokeWidth={2} />
            <Line type="monotone" dataKey="Net" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {forecast.map((f) => (
            <div key={f.month} className="text-center p-2 rounded-lg bg-accent/50">
              <p className="text-xs text-muted-foreground">{f.month}</p>
              <p className={`text-lg font-semibold ${f.predictedNet < 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(f.predictedNet)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
