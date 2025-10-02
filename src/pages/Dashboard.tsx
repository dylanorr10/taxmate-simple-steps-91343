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
  const mtdReadiness = 78;

  const quickActions = [
    {
      id: "receipt",
      label: "Photo Receipt",
      subtitle: "Snap & Save",
      emoji: "📸",
      icon: Camera,
    },
    {
      id: "income",
      label: "Money In",
      subtitle: "Got Paid",
      emoji: "💰",
      icon: Coins,
    },
    {
      id: "expense",
      label: "Money Out",
      subtitle: "Spent Cash",
      emoji: "💸",
      icon: Receipt,
    },
    {
      id: "reports",
      label: "Check Progress",
      subtitle: "How Am I?",
      emoji: "📊",
      icon: TrendingUp,
    },
  ];

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Money", icon: FileText },
    { path: "/learn", label: "Reports", icon: BookOpen },
    { path: "/records", label: "MTD", icon: Shield },
  ];

  const achievements = [
    { id: 1, title: "Receipt Master", emoji: "📸", status: "unlocked" },
    { id: 2, title: "Banking Expert", emoji: "🏦", status: "progress" },
    { id: 3, title: "Reports Wizard", emoji: "📊", status: "locked" },
  ];

  const recentActivity = [
    { text: "£45 fuel at Shell", when: "Today", checked: true },
    { text: "£127 tools at Screwfix", when: "Yesterday", checked: true },
    { text: "£340 job payment received", when: "Monday", checked: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* HERO SECTION */}
        <Card className="p-6 shadow-primary bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/30">
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                🏠 Hi Dave! Here's how your business is doing
              </h1>
            </div>

            {/* MTD Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{mtdReadiness}% MTD Ready</span>
                  <HelpTooltip 
                    term="MTD Ready"
                    explanation="This shows how ready you are for your next Making Tax Digital submission to HMRC"
                    icon="ℹ️"
                  />
                </div>
              </div>
              <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                  style={{ width: `${mtdReadiness}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Next submission: <span className="font-semibold text-foreground">6 weeks away</span>
              </p>
            </div>

            {/* This Month Summary */}
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-border/50">
              <span className="text-muted-foreground">This Month:</span>
              <span className="font-semibold text-success">£2,340 in</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-destructive">£680 out</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-primary">£1,660 profit ✨</span>
            </div>
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Get Stuff Done Fast
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="p-5 shadow-card hover:shadow-primary transition-all cursor-pointer bg-primary text-primary-foreground hover:scale-105 active:scale-95"
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl">{action.emoji}</div>
                  <div>
                    <div className="font-bold text-sm">{action.label}</div>
                    <div className="text-xs opacity-90">"{action.subtitle}"</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FINANCIAL OVERVIEW */}
        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Numbers Made Simple
          </h2>
          <div className="space-y-3">
            {/* Money In */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">📈 Money In</span>
                <span className="font-bold text-success">£8,450</span>
              </div>
              <div className="relative w-full h-6 bg-muted rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-success rounded-lg"
                  style={{ width: "85%" }}
                />
              </div>
            </div>

            {/* Money Out */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">📉 Money Out</span>
                <span className="font-bold text-warning">£3,200</span>
              </div>
              <div className="relative w-full h-6 bg-muted rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-warning to-destructive/70 rounded-lg"
                  style={{ width: "48%" }}
                />
              </div>
            </div>

            {/* You Made */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">💰 You Made</span>
                <span className="font-bold text-primary">£5,250 ✨</span>
              </div>
              <div className="relative w-full h-6 bg-muted rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-success rounded-lg"
                  style={{ width: "70%" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-sm">
              <span className="text-success">↗️</span>
              <span className="text-muted-foreground">
                Up <span className="font-semibold text-success">12%</span> from last quarter - nice work! 🎉
              </span>
            </div>
          </div>
        </Card>

        {/* UPCOMING & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What's Coming Up */}
          <Card className="p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-3">What's Coming Up</h3>
            <div className="space-y-3">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm font-medium text-muted-foreground mb-1">⏰ Next MTD Update</div>
                <div className="text-lg font-bold text-foreground">Jan 31, 2026</div>
                <div className="text-sm text-muted-foreground mb-3">6 weeks away</div>
                <Button size="sm" className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                  Set Reminder
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-3">📝 Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{activity.text}</div>
                    <div className="text-xs text-muted-foreground">{activity.when}</div>
                  </div>
                  <div className="text-success text-lg">✅</div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-3">
                See All Activity →
              </Button>
            </div>
          </Card>
        </div>

        {/* ACHIEVEMENTS */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-warning/5 to-success/5 border-warning/30">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            🚀 Your Tax Hero Journey
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg text-center ${
                  achievement.status === "unlocked"
                    ? "bg-warning/20 border-2 border-warning"
                    : achievement.status === "progress"
                    ? "bg-accent/10 border-2 border-accent"
                    : "bg-muted border-2 border-border opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{achievement.emoji}</div>
                <div className="text-xs font-semibold text-foreground mb-1">
                  {achievement.title}
                </div>
                <div className="text-xs">
                  {achievement.status === "unlocked" && "✨"}
                  {achievement.status === "progress" && "🔄"}
                  {achievement.status === "locked" && "🔒"}
                </div>
                <div className="text-xs font-medium mt-1 text-muted-foreground">
                  {achievement.status === "unlocked" && "Unlocked!"}
                  {achievement.status === "progress" && "In Progress"}
                  {achievement.status === "locked" && "Locked"}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Next: <span className="font-semibold text-foreground">Link your bank to unlock Banking Expert!</span> →
          </p>
        </Card>

        {/* PRO TIP */}
        <Card className="p-5 shadow-card bg-warning/10 border-warning/40">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Pro Tip: You're spending more on fuel lately</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your fuel costs are up 23% this month. Want to track business vs personal trips better?
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  Set up mileage tracking
                </Button>
                <Button size="sm" variant="outline">
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
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
                {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
