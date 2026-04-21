import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useIncomeTransactions } from "@/hooks/useTransactions";
import { useMemo } from "react";

const VAT_THRESHOLD = 90000;

export const VATThresholdCard = () => {
  const { transactions } = useIncomeTransactions();

  const rolling12mo = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);
    return (transactions || [])
      .filter((t) => new Date(t.transaction_date) >= cutoff)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const pct = Math.min(100, Math.round((rolling12mo / VAT_THRESHOLD) * 100));
  const remaining = Math.max(0, VAT_THRESHOLD - rolling12mo);
  const isWarning = pct >= 80;
  const isOver = rolling12mo >= VAT_THRESHOLD;

  return (
    <Card className="p-6 shadow-card hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            {isWarning ? (
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            )}
            VAT threshold (rolling 12 months)
          </div>
          <div className="text-2xl font-bold text-foreground">
            £{rolling12mo.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            <span className="text-sm text-muted-foreground font-normal">
              {" "}/ £{VAT_THRESHOLD.toLocaleString("en-GB")}
            </span>
          </div>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            isOver
              ? "bg-destructive/20 text-destructive"
              : isWarning
              ? "bg-warning/20 text-warning"
              : "bg-success/20 text-success"
          }`}
        >
          {pct}%
        </div>
      </div>

      <Progress value={pct} className="h-2 mb-3" />

      <p className="text-xs text-muted-foreground leading-relaxed">
        {isOver ? (
          <>
            You've passed the £90k VAT threshold. You must register for VAT with HMRC within 30 days.
          </>
        ) : isWarning ? (
          <>
            Heads up — you're £{remaining.toLocaleString("en-GB")} from the VAT threshold. Once you cross £90k, you must register within 30 days.
          </>
        ) : (
          <>
            £{remaining.toLocaleString("en-GB")} of headroom before you need to register for VAT.
          </>
        )}
      </p>
    </Card>
  );
};

export default VATThresholdCard;
