import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FilePlus,
  ShoppingCart,
  Tag,
  CheckCircle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Log = () => {
  const [cashAmount, setCashAmount] = useState("");
  const [logOutput, setLogOutput] = useState("No recent logs in this view.");

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Log Income & Expenses
          </h1>
          <p className="text-muted-foreground mt-1">
            Quickly record sales, expenses or create invoices
          </p>
        </div>

        <Card className="p-6 shadow-card border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={() => alert("Create invoice flow - coming soon")}
              className="flex-1 min-w-[140px] gap-2"
            >
              <FilePlus className="w-4 h-4" />
              Create Invoice
            </Button>
            <Button
              variant="outline"
              onClick={handleQuickCash}
              className="flex-1 min-w-[140px] gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Record Cash
            </Button>
            <Button
              variant="outline"
              onClick={() => alert("Log expense flow - coming soon")}
              className="flex-1 min-w-[140px] gap-2"
            >
              <Tag className="w-4 h-4" />
              Log Expense
            </Button>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{logOutput}</p>
          </div>
        </Card>

        <Card className="p-6 shadow-card border border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-success" />
            Quick Cash Sale
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount (£)"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button onClick={handleSaveCash} className="w-full gap-2">
              <CheckCircle className="w-4 h-4" />
              Save Cash Sale
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-card border border-border">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Recent Logs</h2>
          <div className="space-y-3">
            <div className="flex items-start justify-between p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex-1">
                <div className="font-semibold text-sm">Invoice INV-209 sent</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Paul's Garage – £180
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-start justify-between p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex-1">
                <div className="font-semibold text-sm">Materials logged</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cables & clips – £45.50
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-start justify-between p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex-1">
                <div className="font-semibold text-sm">Cash sale recorded</div>
                <div className="text-xs text-muted-foreground mt-1">£85.00</div>
              </div>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Log;
