import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, FileText, Receipt, Activity, ExternalLink, Mail } from "lucide-react";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useBookHealthScore } from "@/hooks/useBookHealthScore";
import {
  useGenerateHandoffPack,
  useSendHandoffToAccountant,
  type GeneratePackResult,
} from "@/hooks/useHandoffPack";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PeriodKey = "this-tax-year" | "last-tax-year" | "all-time";

function ukTaxYearRange(offset: 0 | -1) {
  // UK tax year: 6 Apr → 5 Apr
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-indexed
  const d = today.getDate();
  const beforeApril6 = m < 3 || (m === 3 && d < 6);
  const startYear = beforeApril6 ? y - 1 + offset : y + offset;
  const start = new Date(startYear, 3, 6); // 6 Apr
  const end = new Date(startYear + 1, 3, 5); // 5 Apr next year
  const iso = (dt: Date) => dt.toISOString().slice(0, 10);
  return {
    label: `Tax year ${startYear}/${(startYear + 1).toString().slice(2)}`,
    start: iso(start),
    end: iso(end),
  };
}

const AccountantHandoffPreview = ({ open, onOpenChange }: Props) => {
  const [periodKey, setPeriodKey] = useState<PeriodKey>("this-tax-year");
  const [accountantEmail, setAccountantEmail] = useState("");
  const [generated, setGenerated] = useState<GeneratePackResult | null>(null);

  const { transactions: income = [] } = useIncomeTransactions();
  const { transactions: expenses = [] } = useExpenseTransactions();
  const { score } = useBookHealthScore();

  const generate = useGenerateHandoffPack();
  const sendEmail = useSendHandoffToAccountant();

  const period = useMemo(() => {
    if (periodKey === "this-tax-year") return ukTaxYearRange(0);
    if (periodKey === "last-tax-year") return ukTaxYearRange(-1);
    return { label: "All time", start: undefined as string | undefined, end: undefined as string | undefined };
  }, [periodKey]);

  const stats = useMemo(() => {
    const inRange = (date: string) => {
      if (!period.start || !period.end) return true;
      return date >= period.start && date <= period.end;
    };
    const incomeInRange = income.filter((t) => inRange(t.transaction_date));
    const expensesInRange = expenses.filter((t) => inRange(t.transaction_date));
    const receipts = expensesInRange.filter((e) => !!e.receipt_url).length;
    return {
      transactions: incomeInRange.length + expensesInRange.length,
      receipts,
    };
  }, [income, expenses, period]);

  const handleGenerate = async () => {
    const result = await generate.mutateAsync({
      periodLabel: period.label,
      periodStart: period.start,
      periodEnd: period.end,
    });
    setGenerated(result);
  };

  const handleSendEmail = async () => {
    if (!generated || !accountantEmail) return;
    await sendEmail.mutateAsync({
      exportId: generated.exportId,
      email: accountantEmail,
    });
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setGenerated(null);
      setAccountantEmail("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Accountant Handoff Pack
          </DialogTitle>
          <DialogDescription>
            A clean ZIP your accountant can import in minutes.
          </DialogDescription>
        </DialogHeader>

        {!generated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={periodKey} onValueChange={(v) => setPeriodKey(v as PeriodKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-tax-year">This tax year</SelectItem>
                  <SelectItem value="last-tax-year">Last tax year</SelectItem>
                  <SelectItem value="all-time">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bundle preview
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center">
                  <FileText className="w-5 h-5 text-primary mb-1" />
                  <p className="text-lg font-semibold">{stats.transactions}</p>
                  <p className="text-xs text-muted-foreground">transactions</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Receipt className="w-5 h-5 text-success mb-1" />
                  <p className="text-lg font-semibold">{stats.receipts}</p>
                  <p className="text-xs text-muted-foreground">receipts</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Activity className="w-5 h-5 text-warning mb-1" />
                  <p className="text-lg font-semibold">{score}</p>
                  <p className="text-xs text-muted-foreground">health</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes summary PDF, transactions CSV (Xero/QB ready), chart of accounts,
                confidence report, founder profile and source receipts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-2">
              <p className="font-medium text-success">Pack ready</p>
              <p className="text-sm text-muted-foreground">
                Link expires {new Date(generated.expiresAt).toLocaleString()}
              </p>
              <Button asChild size="sm" className="mt-2">
                <a href={generated.signedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Download ZIP
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountant-email">Email to accountant (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="accountant-email"
                  type="email"
                  placeholder="accountant@example.com"
                  value={accountantEmail}
                  onChange={(e) => setAccountantEmail(e.target.value)}
                />
                <Button
                  onClick={handleSendEmail}
                  disabled={!accountantEmail || sendEmail.isPending}
                  variant="outline"
                >
                  {sendEmail.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-1" /> Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generated ? (
            <>
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generate.isPending}>
                {generate.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate pack
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountantHandoffPreview;
