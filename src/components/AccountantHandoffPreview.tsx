import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Download, Mail, CheckCircle2, FileText } from "lucide-react";
import { useHandoffPack, type HandoffResult } from "@/hooks/useHandoffPack";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useBookHealthScore } from "@/hooks/useBookHealthScore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PeriodKey = "this-tax-year" | "last-tax-year" | "all-time";

function getTaxYearBounds(yearOffset = 0): { start: string; end: string; label: string } {
  // UK tax year: 6 April → 5 April
  const now = new Date();
  const currentYearStart = new Date(now.getFullYear(), 3, 6); // Apr 6
  let yStart = currentYearStart;
  if (now < currentYearStart) yStart = new Date(now.getFullYear() - 1, 3, 6);
  yStart = new Date(yStart.getFullYear() - yearOffset, 3, 6);
  const yEnd = new Date(yStart.getFullYear() + 1, 3, 5);
  const label = `Tax Year ${yStart.getFullYear()}/${String(yStart.getFullYear() + 1).slice(2)}`;
  return { start: yStart.toISOString().slice(0, 10), end: yEnd.toISOString().slice(0, 10), label };
}

export function AccountantHandoffPreview({ open, onOpenChange }: Props) {
  const [period, setPeriod] = useState<PeriodKey>("this-tax-year");
  const [accountantEmail, setAccountantEmail] = useState("");
  const [accountantName, setAccountantName] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<HandoffResult | null>(null);

  const { generate, sendToAccountant, isGenerating, isSending } = useHandoffPack();
  const { transactions: income } = useIncomeTransactions();
  const { transactions: expenses } = useExpenseTransactions();
  const { score } = useBookHealthScore();

  const periodBounds = useMemo(() => {
    if (period === "this-tax-year") return getTaxYearBounds(0);
    if (period === "last-tax-year") return getTaxYearBounds(1);
    return { start: undefined, end: undefined, label: "All time" };
  }, [period]);

  const preview = useMemo(() => {
    const within = (d: string) =>
      (!periodBounds.start || d >= periodBounds.start) &&
      (!periodBounds.end || d <= periodBounds.end);
    const i = (income || []).filter((t) => within(t.transaction_date));
    const e = (expenses || []).filter((t) => within(t.transaction_date));
    return {
      total: i.length + e.length,
      receipts: e.filter((t: any) => t.receipt_url).length,
    };
  }, [income, expenses, periodBounds]);

  async function handleGenerate() {
    const r = await generate({
      label: periodBounds.label,
      start: periodBounds.start,
      end: periodBounds.end,
    });
    if (r) setResult(r);
  }

  async function handleSend() {
    if (!result) return;
    const ok = await sendToAccountant({
      exportId: result.exportId,
      accountantEmail,
      accountantName: accountantName || undefined,
      message: message || undefined,
    });
    if (ok) {
      setAccountantEmail("");
      setAccountantName("");
      setMessage("");
    }
  }

  function reset() {
    setResult(null);
    setAccountantEmail("");
    setAccountantName("");
    setMessage("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Accountant Handoff Pack
          </DialogTitle>
          <DialogDescription>
            {result
              ? "Your bundle is ready. Download or send it directly to your accountant."
              : "A clean, accountant-ready bundle in one click."}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Period</Label>
              <RadioGroup value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="this-tax-year" id="this" />
                  <Label htmlFor="this" className="flex-1 cursor-pointer text-sm">
                    This tax year ({getTaxYearBounds(0).label})
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="last-tax-year" id="last" />
                  <Label htmlFor="last" className="flex-1 cursor-pointer text-sm">
                    Last tax year ({getTaxYearBounds(1).label})
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="all-time" id="all" />
                  <Label htmlFor="all" className="flex-1 cursor-pointer text-sm">
                    All time
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted/40 rounded-lg p-4 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase">Bundle preview</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold">{preview.total}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{preview.receipts}</div>
                  <div className="text-xs text-muted-foreground">Receipts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{score}</div>
                  <div className="text-xs text-muted-foreground">Health score</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Summary PDF + confidence report</div>
              <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Xero/QuickBooks-ready CSV</div>
              <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Receipts bundled into one folder</div>
              <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> AI-generated founder profile</div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Building bundle…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate pack</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Bundle ready</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div>
                  <div className="text-lg font-bold">{result.stats.transactions}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{result.stats.receipts}</div>
                  <div className="text-xs text-muted-foreground">Receipts</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{result.stats.healthScore}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="w-full">
              <a href={result.downloadUrl} download={result.filename}>
                <Download className="w-4 h-4" /> Download ZIP
              </a>
            </Button>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="text-xs font-medium text-muted-foreground uppercase">Founder profile preview</div>
              <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">
                {result.founderProfile}
              </p>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Send directly to your accountant</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="accountant@firm.co.uk"
                  type="email"
                  value={accountantEmail}
                  onChange={(e) => setAccountantEmail(e.target.value)}
                />
                <Input
                  placeholder="Name (optional)"
                  value={accountantName}
                  onChange={(e) => setAccountantName(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Optional message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={isSending || !accountantEmail}
                variant="outline"
                className="w-full"
              >
                {isSending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><Mail className="w-4 h-4" /> Email handoff link</>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Download link expires in 24 hours. You can re-generate any time.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
