import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  FileText,
  PlusCircle,
  Zap,
  CheckCircle,
  FilePlus,
  Home,
  BookOpen,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [expenseExpanded, setExpenseExpanded] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [mtdReadyPct, setMtdReadyPct] = useState(78);

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Money", icon: FileText },
    { path: "/learn", label: "Reports", icon: BookOpen },
    { path: "/records", label: "MTD", icon: Shield },
  ];

  const userData = {
    name: "Alex",
    role: "Electrician",
    incomeThisMonth: 2340,
    expensesThisMonth: 680,
    expenseBreakdown: [
      { cat: "Fuel", amount: 180, color: "bg-teal-100" },
      { cat: "Tools", amount: 120, color: "bg-sky-100" },
      { cat: "Insurance", amount: 45, color: "bg-amber-100" },
      { cat: "Materials", amount: 200, color: "bg-rose-100" },
      { cat: "Subscriptions", amount: 135, color: "bg-indigo-100" },
    ],
    incomeHistory: [2100, 2750, 2340],
    recentActivity: [
      { text: "Added materials – £45.50 (cables & clips)", when: "Yesterday" },
      { text: "Invoice INV-209 sent – £180", when: "3 days ago" },
      { text: "Recorded cash sale – £85.00", when: "Last week" },
    ],
  };

  const profit = userData.incomeThisMonth - userData.expensesThisMonth;
  const taxSavings = Math.round(userData.expensesThisMonth * 0.66);

  const calcTrendPct = (arr: number[]) => {
    if (!arr || arr.length < 2) return 0;
    const prevQuarter = arr.slice(0, arr.length - 1).reduce((s, v) => s + v, 0) / (arr.length - 1);
    const last = arr[arr.length - 1];
    return Math.round(((last - prevQuarter) / prevQuarter) * 100);
  };

  const generateSparklinePoints = (values: number[]) => {
    const svgW = 300, svgH = 48, padding = 6;
    const max = Math.max(...values), min = Math.min(...values);
    const range = (max - min) || 1;
    return values.map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (svgW - padding * 2);
      const y = svgH - padding - ((v - min) / range) * (svgH - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const handleFixMtd = () => {
    setModalContent("mtd-fix");
  };

  const handleAutoFix = () => {
    setMtdReadyPct(Math.min(100, mtdReadyPct + 15));
    setModalContent(null);
    toast({
      title: "✅ Issues Fixed!",
      description: "Your MTD readiness has improved",
    });
  };

  const handleQuickAction = (action: string) => {
    setModalContent(action);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const trendPct = calcTrendPct(userData.incomeHistory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card/60 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 text-success font-bold flex items-center justify-center text-sm">
              TM
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Welcome back</div>
              <div className="font-bold text-base">{userData.name} — {userData.role}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Bank: Last updated <span className="text-foreground">just now</span></div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 pb-28">
        {/* Hero: Current Financial Position */}
        <Card className="p-4 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted-foreground">This Month</div>
              <div className="text-lg font-bold mt-1">
                £{userData.incomeThisMonth.toLocaleString()} in — £{userData.expensesThisMonth.toLocaleString()} out — <span className={profit >= 0 ? "text-success" : "text-destructive"}>£{Math.abs(profit).toLocaleString()} {profit >= 0 ? "profit" : "loss"}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Instant snapshot: are you making money?</div>
            </div>
            <div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${profit >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {profit >= 0 ? "Profit" : "Loss"}
              </div>
            </div>
          </div>

          {/* Income Trend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Income trend (3 months)</div>
            <div className={`text-sm font-semibold ${trendPct >= 0 ? "text-success" : "text-destructive"}`}>
              {trendPct >= 0 ? "Up" : "Down"} {Math.abs(trendPct)}%
            </div>
          </div>
          <div className="mt-3">
            <svg width="100%" height="48" viewBox="0 0 300 48" preserveAspectRatio="none" className="rounded-md">
              <polyline 
                points={generateSparklinePoints(userData.incomeHistory)} 
                className="fill-none stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-3 shadow-lg">
          <div className="flex gap-3 justify-between">
            <button onClick={() => handleQuickAction("invoice")} className="flex-1 bg-background border border-border p-3 rounded-lg hover:bg-muted transition-all active:scale-95">
              <div className="flex flex-col items-center gap-1">
                <FilePlus className="w-5 h-5" />
                <div className="text-xs font-semibold">Produce Invoice</div>
              </div>
            </button>
            <button onClick={() => handleQuickAction("expense")} className="flex-1 bg-background border border-border p-3 rounded-lg hover:bg-muted transition-all active:scale-95">
              <div className="flex flex-col items-center gap-1">
                <PlusCircle className="w-5 h-5" />
                <div className="text-xs font-semibold">Log Expense</div>
              </div>
            </button>
            <button onClick={() => handleQuickAction("receipt")} className="flex-1 bg-background border border-border p-3 rounded-lg hover:bg-muted transition-all active:scale-95">
              <div className="flex flex-col items-center gap-1">
                <Camera className="w-5 h-5" />
                <div className="text-xs font-semibold">Snap Receipt</div>
              </div>
            </button>
          </div>
        </Card>

        {/* MTD Compliance */}
        <Card className="p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">MTD Readiness</div>
              <div className="font-bold text-lg">{mtdReadyPct}% MTD Ready</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Next submission: <span className="font-semibold text-foreground">6w</span></div>
            </div>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-accent to-success transition-all duration-300" style={{ width: `${mtdReadyPct}%` }}></div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={handleFixMtd} className="bg-warning hover:bg-warning/90 text-warning-foreground">
              Fix 3 issues
            </Button>
            <div className="text-sm text-muted-foreground">or <button onClick={() => toast({ title: "Coming soon", description: "MTD guide will help you understand the requirements" })} className="text-primary underline">learn more</button></div>
          </div>
        </Card>

        {/* Expense Breakdown & Tax Savings */}
        <div className="space-y-3">
          <Card className="p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground">Expense breakdown (top 3)</div>
                <div className="font-semibold text-sm mt-1">Fuel £{userData.expenseBreakdown[0].amount} — Tools £{userData.expenseBreakdown[1].amount} — Insurance £{userData.expenseBreakdown[2].amount}</div>
              </div>
              <div>
                <Button onClick={() => setExpenseExpanded(!expenseExpanded)} variant="outline" size="sm">
                  {expenseExpanded ? "Collapse" : "View"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-6 rounded-full bg-teal-100"></div>
              <div className="flex-1 h-6 rounded-full bg-sky-100"></div>
              <div className="flex-1 h-6 rounded-full bg-amber-100"></div>
            </div>
            {expenseExpanded && (
              <div className="mt-3 pt-3 border-t border-border">
                <ul className="space-y-2 text-sm">
                  {userData.expenseBreakdown.map((exp, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded ${exp.color}`}></div>
                        <div>
                          <div className="font-semibold">{exp.cat}</div>
                          <div className="text-xs text-muted-foreground">£{exp.amount}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Tax Savings</div>
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
              <button onClick={() => toast({ title: "Coming soon", description: "View all activity" })} className="text-primary underline">View all</button>
            </div>
          </div>
          <div className="space-y-2">
            {userData.recentActivity.map((activity, idx) => (
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
        </Card>
      </main>

      {/* Floating one-tap fix */}
      <div className="fixed right-6 bottom-24 z-40">
        <button 
          onClick={() => toast({ title: "⚡ Quick Fix", description: "One-tap fixes coming soon!" })} 
          className="bg-card p-3 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-border"
        >
          <Zap className="w-5 h-5 text-warning" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-card w-full max-w-md p-6 rounded-t-xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            {modalContent === "mtd-fix" && (
              <>
                <h3 className="font-bold text-lg mb-2">Fix MTD Issues</h3>
                <p className="text-sm text-muted-foreground mb-4">We found 3 issues: missing VAT category (2), missing invoice date (1).</p>
                <div className="flex gap-2">
                  <Button onClick={handleAutoFix} className="bg-success hover:bg-success/90">
                    Auto-fix
                  </Button>
                  <Button onClick={closeModal} variant="outline">
                    Close
                  </Button>
                </div>
              </>
            )}
            {modalContent === "invoice" && (
              <>
                <h3 className="font-bold text-lg mb-2">Generate Invoice</h3>
                <p className="text-sm text-muted-foreground mb-4">Quick create an invoice for a client.</p>
                <div className="space-y-2">
                  <input className="w-full border border-border p-2 rounded bg-background" placeholder="Amount (e.g. 180)" />
                  <input className="w-full border border-border p-2 rounded bg-background" placeholder="Client name" />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => { closeModal(); toast({ title: "Invoice created!", description: "Demo mode" }); }}>
                      Create
                    </Button>
                    <Button onClick={closeModal} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
            {modalContent === "expense" && (
              <>
                <h3 className="font-bold text-lg mb-2">Log Expense</h3>
                <p className="text-sm text-muted-foreground mb-4">Quick record an expense.</p>
                <div className="space-y-2">
                  <input className="w-full border border-border p-2 rounded bg-background" placeholder="Amount (e.g. 45.5)" />
                  <input className="w-full border border-border p-2 rounded bg-background" placeholder="Category (e.g. Fuel)" />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => { closeModal(); toast({ title: "Expense logged!", description: "Demo mode" }); }} className="bg-success hover:bg-success/90">
                      Save
                    </Button>
                    <Button onClick={closeModal} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
            {modalContent === "receipt" && (
              <>
                <h3 className="font-bold text-lg mb-2">Snap Receipt</h3>
                <p className="text-sm text-muted-foreground mb-4">Upload or snap a receipt (demo).</p>
                <div className="space-y-2">
                  <input type="file" accept="image/*" className="w-full border border-border p-2 rounded bg-background" />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => { closeModal(); toast({ title: "Receipt uploaded!", description: "Demo mode" }); }} className="bg-accent hover:bg-accent/90">
                      Upload
                    </Button>
                    <Button onClick={closeModal} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
