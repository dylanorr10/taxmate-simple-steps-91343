import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Home,
  FileText,
  BookOpen,
  Shield,
  FilePlus,
  ShoppingCart,
  Tag,
  CheckCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Log = () => {
  const location = useLocation();
  const [cashAmount, setCashAmount] = useState("");
  const [logOutput, setLogOutput] = useState("No recent logs in this view.");

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Log", icon: FileText },
    { path: "/learn", label: "Learn", icon: BookOpen },
    { path: "/records", label: "MTD", icon: Shield },
  ];

  const handleQuickCash = () => {
    setLogOutput("Tap Save to record a cash sale.");
  };

  const handleSaveCash = () => {
    if (!cashAmount || parseFloat(cashAmount) <= 0) {
      setLogOutput("Please enter a valid amount");
      return;
    }
    setLogOutput(
      `Saved cash sale £${parseFloat(cashAmount).toFixed(2)} — added to Recent Activity.`
    );
    setCashAmount("");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Log Income & Expenses
          </h1>
          <p className="text-muted-foreground mt-1">
            Quickly record sales, expenses or create invoices
          </p>
        </div>

        <Card className="p-6 shadow-card gradient-accent text-white border-0">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={() => alert("Create invoice flow - coming soon")}
              className="flex-1 min-w-[140px] gap-2 bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-md backdrop-blur-sm"
            >
              <FilePlus className="w-4 h-4" />
              Create Invoice
            </Button>
            <Button
              onClick={handleQuickCash}
              className="flex-1 min-w-[140px] gap-2 bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-md backdrop-blur-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Record Cash
            </Button>
            <Button
              onClick={() => alert("Log expense flow - coming soon")}
              className="flex-1 min-w-[140px] gap-2 bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-md backdrop-blur-sm"
            >
              <Tag className="w-4 h-4" />
              Log Expense
            </Button>
          </div>
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white/90">{logOutput}</p>
          </div>
        </Card>

        <Card className="p-6 shadow-card gradient-success text-white border-0">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Quick Cash Sale
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/90 mb-2 block">
                Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount (£)"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="text-lg bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
              />
            </div>
            <Button onClick={handleSaveCash} className="w-full gap-2 bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-md backdrop-blur-sm">
              <CheckCircle className="w-4 h-4" />
              Save Cash Sale
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-card bg-gradient-to-br from-primary/10 to-success/5 border-success/20">
          <h2 className="font-semibold text-lg mb-4 text-primary">Recent Logs</h2>
          <div className="space-y-3">
            <div className="flex items-start justify-between p-4 bg-white rounded-xl shadow-sm border border-success/20">
              <div className="flex-1">
                <div className="font-semibold text-sm">Invoice INV-209 sent</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Paul's Garage – £180
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center shadow-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-start justify-between p-4 bg-white rounded-xl shadow-sm border border-success/20">
              <div className="flex-1">
                <div className="font-semibold text-sm">Materials logged</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cables & clips – £45.50
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center shadow-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-start justify-between p-4 bg-white rounded-xl shadow-sm border border-success/20">
              <div className="flex-1">
                <div className="font-semibold text-sm">Cash sale recorded</div>
                <div className="text-xs text-muted-foreground mt-1">£85.00</div>
              </div>
              <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center shadow-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
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

export default Log;
