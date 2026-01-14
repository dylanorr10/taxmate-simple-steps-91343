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
import { useMileageTrips } from "@/hooks/useMileageTrips";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { useTaxAdjustments } from "@/hooks/useTaxAdjustments";
import { HelpTooltip } from "@/components/HelpTooltip";
import { LessonQuickLink } from "@/components/LessonQuickLink";
import { DailyTipToast } from "@/components/DailyTipToast";
import { useDailyTip } from "@/hooks/useDailyTip";
import { InlineLesson } from "@/components/InlineLesson";
import { lessons } from "@/data/learningContent";
import { StreakCounter } from "@/components/StreakCounter";
import { SurpriseTip } from "@/components/SurpriseTip";
import { QuickAddFab } from "@/components/QuickAddFab";
import { ExpandableSection } from "@/components/ExpandableSection";
import { InvoiceTracker } from "@/components/InvoiceTracker";
import { ExpenseAlert } from "@/components/ExpenseAlert";
import MTDGauge from "@/components/MTDGauge";

const Dashboard = () => {
  const { toast } = useToast();
  const [expenseExpanded, setExpenseExpanded] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  
  const { todaysTip, shouldShow, dismissTip, markLessonOpened } = useDailyTip();
  
  const { transactions: incomeTransactions, isLoading: incomeLoading } = useIncomeTransactions();
  const { transactions: expenseTransactions, isLoading: expenseLoading } = useExpenseTransactions();
  const { profile } = useProfile();
  const { isConnected } = useHMRCConnection();
  const { trips: mileageTrips } = useMileageTrips();
  const { periods: taxPeriods } = useTaxPeriods();
  const { adjustments: taxAdjustments } = useTaxAdjustments();
  
  // Calculate compliance factors for enhanced MTD readiness
  const complianceFactors = useMemo(() => {
    const hasMileageTrips = mileageTrips.filter(t => t.trip_type === 'business').length > 0;
    
    // Check if all past quarters are submitted on time
    const now = new Date();
    const pastPeriods = taxPeriods.filter(p => new Date(p.deadline_date) < now);
    const allQuartersSubmittedOnTime = pastPeriods.length === 0 || 
      pastPeriods.every(p => p.status === 'submitted' || p.status === 'corrected');
    
    const hasYearEndAdjustments = taxAdjustments.length > 0;
    
    return {
      hasMileageTrips,
      allQuartersSubmittedOnTime,
      hasYearEndAdjustments,
    };
  }, [mileageTrips, taxPeriods, taxAdjustments]);
  
  const { mtdReadiness } = useVATCalculations(
    incomeTransactions,
    expenseTransactions,
    isConnected,
    !!profile?.vat_number,
    !!profile?.business_name,
    complianceFactors
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-success/10 text-success font-bold flex items-center justify-center text-sm lg:text-base">
              RL
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground">Welcome back</div>
              <div className="font-bold text-base lg:text-lg">Reelin Dashboard</div>
              <StreakCounter />
            </div>
          </div>
          <div className="text-right">
            <Link to="/settings" className="text-xs lg:text-sm text-primary hover:underline">Settings</Link>
          </div>
        </div>
      </header>

      <ExpenseAlert />
      
      <main className="max-w-6xl mx-auto p-4 lg:p-6 pb-28 lg:pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="shimmer-loading w-full h-64 rounded-lg"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop: Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column - Financial Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hero: Financial Summary */}
                <Card className="p-6 lg:p-8 shadow-card hover-lift animate-fade-in">
                  {/* Hero Profit Display */}
                  <div className="text-center pb-6 border-b border-border">
                    <div className="text-sm lg:text-base text-muted-foreground mb-3 flex items-center justify-center gap-2 font-medium">
                      Your Profit This Month
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${profit >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                        {trendPct >= 0 ? "↗" : "↘"} {Math.abs(trendPct)}%
                      </div>
                    </div>
                    <div className={`text-6xl lg:text-8xl font-bold mb-6 ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                      £{Math.abs(profit).toFixed(0)}
                    </div>
                    
                    {/* Secondary: Income & Expenses */}
                    <div className="flex items-center justify-center gap-8 lg:gap-16 text-base">
                      <div className="text-center">
                        <div className="text-sm lg:text-base text-muted-foreground mb-2 font-medium">Income</div>
                        <div className="text-xl lg:text-2xl font-bold text-foreground">£{incomeThisMonth.toFixed(0)}</div>
                      </div>
                      <div className="h-12 w-px bg-border" />
                      <div className="text-center">
                        <div className="text-sm lg:text-base text-muted-foreground mb-2 font-medium">Expenses</div>
                        <div className="text-xl lg:text-2xl font-bold text-foreground">£{expensesThisMonth.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Chart with integrated tax reserve */}
                  <div className="mt-6 pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground font-medium">3-month trend</div>
                      <LessonQuickLink lessonId="understanding-profit" linkText="Learn more" />
                    </div>
                    <IncomeChart data={incomeChartData} trendPct={trendPct} suggestedTaxReserve={suggestedTaxReserve} />
                    
                    <ExpandableSection title="Understanding your trend">
                      <p className="leading-relaxed">
                        This chart shows your income over the last 3 months. The trend percentage compares 
                        your current month to your average income from previous months. A positive trend 
                        means your business is growing!
                      </p>
                    </ExpandableSection>
                  </div>
                </Card>

                {/* Tax Savings Card - Desktop: inline with main */}
                <Card className="p-6 shadow-card hover-lift animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">
                        <HelpTooltip
                          term="Tax Savings"
                          explanation="Business expenses reduce your taxable profit. By claiming legitimate expenses, you pay less Income Tax and National Insurance."
                          icon="💡"
                          tooltipId="tax-savings"
                        />
                      </div>
                      <div className="text-3xl lg:text-4xl font-bold text-success mb-1">£{taxSavings}</div>
                      <div className="text-sm text-muted-foreground">saved this month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Est. tax reduction</div>
                      <div className="text-2xl lg:text-3xl font-bold text-foreground">£{Math.round(taxSavings * 0.2)}</div>
                    </div>
                  </div>
                  
                  <ExpandableSection title="How tax savings work">
                    <p className="leading-relaxed mb-3">
                      Every pound you spend on legitimate business expenses reduces your taxable profit. 
                      This means you pay less tax overall.
                    </p>
                    <p className="leading-relaxed">
                      For example, if you're in the 20% tax bracket and claim £1,000 in expenses, 
                      you'll save approximately £200 in Income Tax and National Insurance.
                    </p>
                  </ExpandableSection>
                </Card>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Invoice Tracker - Overdue Payments */}
                <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
                  <InvoiceTracker />
                </div>

                {/* MTD Compliance */}
                <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <MTDGauge score={mtdReadiness} />
                </div>

                {/* Recent Activity */}
                <Card className="p-6 shadow-card hover-lift animate-fade-in" style={{ animationDelay: "300ms" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Recent activity</div>
                      <div className="text-lg font-bold">Latest updates</div>
                    </div>
                    <Link to="/log" className="text-sm text-primary font-medium hover:underline tap-feedback">
                      View all
                    </Link>
                  </div>
                  {recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      No activity yet. Start by adding income or expenses!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((activity, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors tap-feedback"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-foreground">{activity.text}</div>
                            <div className="text-xs text-muted-foreground mt-1">{activity.when}</div>
                          </div>
                          <div className="text-success ml-3">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
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

      <QuickAddFab />

      <BottomNav />
    </div>
  );
};

export default Dashboard;
