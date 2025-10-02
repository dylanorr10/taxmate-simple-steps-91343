import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MTDGauge from "@/components/MTDGauge";
import {
  Coins,
  Receipt,
  Camera,
  TrendingUp,
  Home,
  FileText,
  Settings,
  Sparkles,
  BookOpen,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { HelpTooltip } from "@/components/HelpTooltip";

const Dashboard = () => {
  const location = useLocation();

  const quickActions = [
    {
      id: "income",
      label: "Money In",
      emoji: "💰",
      icon: Coins,
      color: "text-success",
    },
    {
      id: "expense",
      label: "Money Out",
      emoji: "💸",
      icon: Receipt,
      color: "text-destructive",
    },
    {
      id: "receipt",
      label: "Photo Receipt",
      emoji: "📸",
      icon: Camera,
      color: "text-info",
    },
    {
      id: "reports",
      label: "How Am I Doing?",
      emoji: "📊",
      icon: TrendingUp,
      color: "text-warning",
    },
  ];

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Log", icon: FileText },
    { path: "/learn", label: "Learn", icon: BookOpen },
    { path: "/records", label: "MTD", icon: Shield },
  ];

  const outstandingInvoices = [
    {
      id: "INV-210",
      client: "Acme Repairs",
      amount: 320,
      dueInDays: -3,
    },
    {
      id: "INV-211",
      client: "HomeFix Ltd",
      amount: 420,
      dueInDays: 6,
    },
  ];

  const recentActivity = [
    { text: "Added materials – £45.50 (cables & clips)", when: "Yesterday" },
    { text: "Invoice INV-209 sent to Paul's Garage – £180", when: "3 days ago" },
    { text: "Recorded cash sale – £85.00", when: "Last week" },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Morning, Dave! ☀️
            </h1>
            <p className="text-muted-foreground">Let's see how things are going</p>
          </div>
          <Link to="/onboarding">
            <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              Review Features
            </Button>
          </Link>
        </div>

        <Card className="p-6 shadow-primary gradient-primary text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/80 mb-1">Dashboard</div>
              <h2 className="text-xl font-bold">
                Business Snapshot
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Quick view of your business health
              </p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <MTDGauge score={73} />
              <div className="text-xs text-white/90 mt-2 font-medium">MTD Ready</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-4 bg-white/95 rounded-xl shadow-md backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Jobs this week</div>
              <div className="font-bold text-2xl gradient-success bg-clip-text text-transparent">5</div>
            </div>
            <div className="p-4 bg-white/95 rounded-xl shadow-md backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Est. invoiced</div>
              <div className="font-bold text-2xl text-primary">£3.2k</div>
            </div>
            <div className="p-4 bg-white/95 rounded-xl shadow-md backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
              <div className="font-bold text-xl text-warning">£740</div>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                className={`h-auto py-6 shadow-md hover:shadow-lg transition-all border-0 ${
                  action.id === 'income' ? 'gradient-success text-white' :
                  action.id === 'expense' ? 'gradient-secondary text-white' :
                  action.id === 'receipt' ? 'gradient-accent text-white' :
                  'gradient-primary text-white'
                }`}
              >
                <div className="text-3xl mb-1">{action.emoji}</div>
                <span className="text-sm font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Card className="p-6 shadow-card border-success/30 bg-gradient-to-br from-success/5 to-success/10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            This Week
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-success/20">
              <div className="flex-1">
                <HelpTooltip 
                  term="Revenue"
                  explanation="The total money customers paid you this week, before taking off any business costs"
                  icon="💵"
                />
                <div className="text-2xl font-bold text-success mt-1">£542</div>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center shadow-primary">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-warning/20">
              <div className="flex-1">
                <HelpTooltip 
                  term="Expenses"
                  explanation="Money you spent on business costs this week - fuel, materials, tools, etc. These reduce your tax bill!"
                  icon="💸"
                />
                <div className="text-2xl font-bold text-warning mt-1">£78</div>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center shadow-accent">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-2 border-accent/30">
              <div className="flex-1">
                <HelpTooltip 
                  term="Profit"
                  explanation="What's left after business costs - this is the money you actually keep. This is what you pay tax on, not your total income."
                  icon="💰"
                />
                <div className="text-2xl font-bold text-accent mt-1">£464</div>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-accent">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h2>
            <button className="text-xs text-accent font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <Card key={index} className="p-4 shadow-card bg-gradient-to-r from-white to-success/5 border-success/20 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm">{activity.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {activity.when}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-success" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Outstanding Invoices
            </h2>
            <div className="text-xs px-3 py-1 rounded-full bg-warning/10 text-warning font-medium">
              {outstandingInvoices.length} unpaid
            </div>
          </div>
          <div className="space-y-2">
            {outstandingInvoices.map((invoice) => (
              <Card
                key={invoice.id}
                className={`p-4 shadow-card hover:shadow-md transition-all border-l-4 ${
                  invoice.dueInDays < 0 
                    ? 'border-l-destructive bg-gradient-to-r from-destructive/5 to-white' 
                    : 'border-l-accent bg-gradient-to-r from-accent/5 to-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {invoice.client}{" "}
                      <span className="text-xs text-muted-foreground">
                        • {invoice.id}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {invoice.dueInDays < 0
                        ? `Overdue by ${Math.abs(invoice.dueInDays)} days`
                        : `Due in ${invoice.dueInDays} days`}
                    </div>
                  </div>
                  <div
                    className={`font-bold text-lg ${
                      invoice.dueInDays < 0 ? "text-destructive" : "text-accent"
                    }`}
                  >
                    £{invoice.amount}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-5 shadow-card gradient-secondary text-white border-0">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Quick Tip</h3>
              <p className="text-sm text-white/90">
                Remember to log those fuel receipts! They add up quickly and can
                save you a lot on taxes.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
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
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
