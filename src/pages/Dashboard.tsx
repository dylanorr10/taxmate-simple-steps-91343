import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  FileText,
  PlusCircle,
  Zap,
  CheckCircle,
  FilePlus,
  Car,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import IncomeChart from "@/components/IncomeChart";
import BottomNav from "@/components/BottomNav";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { getMonthToDateTotal, getLastMonthsData, formatCurrency } from "@/utils/transactionHelpers";
import { useVATCalculations } from "@/hooks/useVATCalculations";
import { useProfile } from "@/hooks/useProfile";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { HelpTooltip } from "@/components/HelpTooltip";
import { LessonQuickLink } from "@/components/LessonQuickLink";
import { DailyTipToast } from "@/components/DailyTipToast";
import { useDailyTip } from "@/hooks/useDailyTip";
import { InlineLesson } from "@/components/InlineLesson";
import { lessons } from "@/data/learningContent";
import { StreakCounter } from "@/components/StreakCounter";
import { SurpriseTip } from "@/components/SurpriseTip";

const Dashboard = () => {
  const { toast } = useToast();
  const [expenseExpanded, setExpenseExpanded] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [mtdReadyPct, setMtdReadyPct] = useState(78);
  const [mtdIssuesCount, setMtdIssuesCount] = useState(3);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  
  const { todaysTip, shouldShow, dismissTip, markLessonOpened } = useDailyTip();
  
  const { transactions: incomeTransactions, isLoading: incomeLoading } = useIncomeTransactions();
  const { transactions: expenseTransactions, isLoading: expenseLoading } = useExpenseTransactions();
  const { profile } = useProfile();
  const { isConnected } = useHMRCConnection();
  
  const { mtdReadiness } = useVATCalculations(
    incomeTransactions,
    expenseTransactions,
    isConnected,
    !!profile?.vat_number,
    !!profile?.business_name
  );

  const incomeThisMonth = useMemo(() => getMonthToDateTotal(incomeTransactions), [incomeTransactions]);
  const expensesThisMonth = useMemo(() => getMonthToDateTotal(expenseTransactions), [expenseTransactions]);
  const profit = incomeThisMonth - expensesThisMonth;
  const taxSavings = Math.round(expensesThisMonth * 0.66);
  
  // Suggested tax to set aside (30% of profit for Income Tax + Class 4 NIC)
  const suggestedTaxReserve = profit > 0 ? Math.round(profit * 0.30) : 0;

  const incomeHistory = useMemo(() => getLastMonthsData(incomeTransactions, 3), [incomeTransactions]);
  
  const recentActivity = useMemo(() => {
    const all = [
      ...incomeTransactions.map(t => ({ text: `${t.description || 'Income'} – ${formatCurrency(Number(t.amount))}`, when: t.transaction_date, date: new Date(t.transaction_date) })),
      ...expenseTransactions.map(t => ({ text: `${t.description || 'Expense'} – ${formatCurrency(Number(t.amount))}`, when: t.transaction_date, date: new Date(t.transaction_date) })),
    ];
    return all.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [incomeTransactions, expenseTransactions]);

  const calcTrendPct = (arr: number[]) => {
    if (!arr || arr.length < 2) return 0;
    const prevMonths = arr.slice(0, arr.length - 1);
    const avg = prevMonths.reduce((s, v) => s + v, 0) / prevMonths.length;
    const last = arr[arr.length - 1];
    if (avg === 0) return 0;
    return Math.round(((last - avg) / avg) * 100);
  };

  const handleFixMtd = () => {
    setModalContent("mtd-fix");
  };

  const handleAutoFix = () => {
    const improvement = Math.min(22, 100 - mtdReadyPct);
    setMtdReadyPct(Math.min(100, mtdReadyPct + improvement));
    setMtdIssuesCount(0);
    setModalContent(null);
    
    toast({
      title: "✅ All Issues Fixed!",
      description: `Fixed ${mtdIssuesCount} issues - MTD readiness now at ${Math.min(100, mtdReadyPct + improvement)}%`,
    });
  };

  const handleQuickAction = (action: string) => {
    setModalContent(action);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const trendPct = calcTrendPct(incomeHistory);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const incomeChartData = incomeHistory.map((income, idx) => {
    const monthIndex = (now.getMonth() - (incomeHistory.length - 1 - idx) + 12) % 12;
    return { month: monthNames[monthIndex], income };
  });

  const isLoading = incomeLoading || expenseLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card/60 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 text-success font-bold flex items-center justify-center text-sm">
              TM
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground">Welcome back</div>
              <div className="font-bold text-base">TaxMate Dashboard</div>
              <StreakCounter />
            </div>
          </div>
          <div className="text-right">
            <Link to="/settings" className="text-xs text-primary hover:underline">Settings</Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Hero: Financial Summary */}
            <Card className="p-4 shadow-lg">
              {/* Hero Profit Display */}
              <div className="text-center pb-4 border-b border-border">
                <div className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-2">
                  Your Profit This Month
                  <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${profit >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {trendPct >= 0 ? "↗" : "↘"} {Math.abs(trendPct)}%
                  </div>
                </div>
                <div className={`text-6xl font-bold mb-4 ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                  £{Math.abs(profit).toFixed(0)}
                </div>
                
                {/* Secondary: Income & Expenses */}
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Income</div>
                    <div className="font-semibold text-foreground">£{incomeThisMonth.toFixed(0)}</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Expenses</div>
                    <div className="font-semibold text-foreground">£{expensesThisMonth.toFixed(0)}</div>
                  </div>
                </div>
              </div>

              {/* Chart with integrated tax reserve */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">
                  3-month trend <LessonQuickLink lessonId="understanding-profit" linkText="Learn more" />
                </div>
                <IncomeChart data={incomeChartData} trendPct={trendPct} suggestedTaxReserve={suggestedTaxReserve} />
              </div>

              {/* Quick Actions - Below Chart */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
                <Link to="/log" className="flex-1 bg-background border border-border p-2 rounded-lg hover:bg-muted transition-all active:scale-95">
                  <div className="flex flex-col items-center gap-1">
                    <FilePlus className="w-5 h-5" />
                    <div className="text-xs font-semibold">Invoice</div>
                  </div>
                </Link>
                <Link to="/log" className="flex-1 bg-background border border-border p-2 rounded-lg hover:bg-muted transition-all active:scale-95">
                  <div className="flex flex-col items-center gap-1">
                    <PlusCircle className="w-5 h-5" />
                    <div className="text-xs font-semibold">Expense</div>
                  </div>
                </Link>
                <button onClick={() => toast({ title: "Coming soon", description: "Receipt scanning coming soon!" })} className="flex-1 bg-background border border-border p-2 rounded-lg hover:bg-muted transition-all active:scale-95">
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-5 h-5" />
                    <div className="text-xs font-semibold">Receipt</div>
                  </div>
                </button>
                <Link to="/mileage" className="flex-1 bg-background border border-border p-2 rounded-lg hover:bg-muted transition-all active:scale-95">
                  <div className="flex flex-col items-center gap-1">
                    <Car className="w-5 h-5" />
                    <div className="text-xs font-semibold">Mileage</div>
                  </div>
                </Link>
              </div>
            </Card>

        {/* MTD Compliance */}
        <Card className="p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">
                <HelpTooltip
                  term="MTD Readiness"
                  explanation="Making Tax Digital (MTD) is HMRC's requirement to keep digital tax records and submit VAT returns using compatible software. Your readiness score shows how well your records meet these requirements."
                  icon="📊"
                  tooltipId="mtd"
                />
              </div>
              <div className="font-bold text-lg">{mtdReadiness}% MTD Ready</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Next submission: <span className="font-semibold text-foreground">6w</span></div>
            </div>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-accent to-success transition-all duration-300" style={{ width: `${mtdReadiness}%` }}></div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {mtdIssuesCount > 0 ? (
              <Button onClick={handleFixMtd} className="bg-warning hover:bg-warning/90 text-warning-foreground">
                Fix {mtdIssuesCount} issues
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">All issues resolved!</span>
              </div>
            )}
            <div className="text-sm text-muted-foreground">or <button onClick={() => toast({ title: "Coming soon", description: "MTD guide will help you understand the requirements" })} className="text-primary underline">learn more</button></div>
          </div>
        </Card>

        {/* Expense Breakdown & Tax Savings */}
        <div className="space-y-3">
          <Card className="p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground">This month's expenses</div>
                <div className="font-semibold text-sm mt-1">{formatCurrency(expensesThisMonth)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  <HelpTooltip
                    term="Tax Savings"
                    explanation="Business expenses reduce your taxable profit. By claiming legitimate expenses, you pay less Income Tax and National Insurance."
                    icon="💡"
                    tooltipId="tax-savings"
                  />
                </div>
                <div className="font-semibold mt-1">You've saved £{taxSavings} this month</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Est tax reduction</div>
                <div className="font-bold">£{Math.round(taxSavings * 0.2)} less tax</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Recent activity</div>
              <div className="font-semibold">Latest updates</div>
            </div>
            <div className="text-sm">
              <Link to="/log" className="text-primary underline">View all</Link>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">
              No activity yet. Start by adding income or expenses!
            </p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm">{activity.text}</div>
                    <div className="text-xs text-muted-foreground">{activity.when}</div>
                  </div>
                  <div className="text-success">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
          </>
        )}
      </main>

      {/* Daily Tip Toast - Use SurpriseTip for special tips */}
      {shouldShow && todaysTip && (
        <>
          {(todaysTip.isBonus || todaysTip.isEasterEgg || todaysTip.isPro) ? (
            <SurpriseTip
              tip={todaysTip}
              onDismiss={dismissTip}
            />
          ) : (
            <DailyTipToast
              tip={todaysTip}
              onDismiss={dismissTip}
              onReadMore={() => {
                if (todaysTip.relatedLessonId) {
                  setSelectedLesson(todaysTip.relatedLessonId);
                  setShowLessonModal(true);
                  markLessonOpened();
                }
              }}
            />
          )}
        </>
      )}

      {/* Lesson Modal */}
      {selectedLesson && (
        <InlineLesson
          isOpen={showLessonModal}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedLesson(null);
          }}
          title={lessons.find(l => l.id === selectedLesson)?.title || ''}
          content={lessons.find(l => l.id === selectedLesson)?.content || ''}
          emoji={lessons.find(l => l.id === selectedLesson)?.icon}
        />
      )}

      {/* Floating one-tap fix */}
      <div className="fixed right-6 bottom-24 z-40">
        <Link to="/log">
          <button 
            className="bg-card p-3 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-border"
          >
            <Zap className="w-5 h-5 text-warning" />
          </button>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
