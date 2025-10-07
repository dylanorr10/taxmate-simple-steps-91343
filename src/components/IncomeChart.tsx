import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface IncomeChartProps {
  data: Array<{ month: string; income: number }>;
  trendPct: number;
}

const IncomeChart = ({ data, trendPct }: IncomeChartProps) => {
  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--primary))",
    },
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `£${(value / 1000).toFixed(1)}k`;
    }
    return `£${value}`;
  };

  const maxIncome = Math.max(...data.map(d => d.income));
  const minIncome = Math.min(...data.map(d => d.income));
  const avgIncome = Math.round(data.reduce((sum, d) => sum + d.income, 0) / data.length);
  const peakMonth = data.find(d => d.income === maxIncome);
  const currentIncome = data[data.length - 1].income;
  const vsAvg = Math.round(((currentIncome - avgIncome) / avgIncome) * 100);

  return (
    <div className="space-y-3">
      <div className="h-[120px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-sm font-semibold">
                          {formatCurrency(payload[0].value as number)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload.month}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
                animationDuration={800}
                animationEasing="ease-out"
                dot={{
                  fill: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: 4,
                  stroke: "hsl(var(--card))",
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Mini Stats */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Peak</p>
          <p className="text-xs font-semibold">{formatCurrency(maxIncome)}</p>
          <p className="text-[10px] text-muted-foreground">{peakMonth?.month}</p>
        </div>
        <div className="flex-1 text-center border-x border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Average</p>
          <p className="text-xs font-semibold">{formatCurrency(avgIncome)}</p>
          <p className="text-[10px] text-muted-foreground">per month</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">vs Avg</p>
          <p className={`text-xs font-semibold ${vsAvg >= 0 ? 'text-success' : 'text-destructive'}`}>
            {vsAvg >= 0 ? '+' : ''}{vsAvg}%
          </p>
          <p className="text-[10px] text-muted-foreground">this month</p>
        </div>
      </div>
    </div>
  );
};

export default IncomeChart;
