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
    { path: "/records", label: "Records", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Morning, Dave! ☀️
            </h1>
            <p className="text-muted-foreground">Let's see how things are going</p>
          </div>
          <Link to="/onboarding">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Review Features
            </Button>
          </Link>
        </div>

        <Card className="p-6 shadow-lg">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Your MTD Readiness
            </h2>
            <MTDGauge score={73} />
          </div>
          <div className="mt-6 p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-center text-success font-medium">
              You're 73% ready for MTD - well done! 🎉
            </p>
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
                variant="action"
                className="h-auto py-6"
              >
                <div className="text-3xl mb-1">{action.emoji}</div>
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Card className="p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            This Week
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
              <div className="flex-1">
                <HelpTooltip 
                  term="Revenue"
                  explanation="The total money customers paid you this week, before taking off any business costs"
                  icon="💵"
                />
                <div className="text-2xl font-bold text-success mt-1">£542</div>
              </div>
              <Coins className="w-8 h-8 text-success" />
            </div>
            <div className="flex justify-between items-center p-3 bg-destructive/5 rounded-lg">
              <div className="flex-1">
                <HelpTooltip 
                  term="Expenses"
                  explanation="Money you spent on business costs this week - fuel, materials, tools, etc. These reduce your tax bill!"
                  icon="💸"
                />
                <div className="text-2xl font-bold text-destructive mt-1">£78</div>
              </div>
              <Receipt className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex-1">
                <HelpTooltip 
                  term="Profit"
                  explanation="What's left after business costs - this is the money you actually keep. This is what you pay tax on, not your total income."
                  icon="💰"
                />
                <div className="text-2xl font-bold text-primary mt-1">£464</div>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-warning/10 border-warning/20">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Quick Tip</h3>
              <p className="text-sm text-muted-foreground">
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
