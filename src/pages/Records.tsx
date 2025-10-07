import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Shield,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";

const Records = () => {
  const [showCalculation, setShowCalculation] = useState(false);
  const [expandedBox, setExpandedBox] = useState<number | null>(null);

  const steps = [
    { id: 1, label: "Record Income", completed: true },
    { id: 2, label: "Record Expenses", completed: true },
    { id: 3, label: "Reconcile Bank", completed: true },
    { id: 4, label: "Review Return", completed: false, current: true },
    { id: 5, label: "Submit", completed: false },
  ];

  const tasks = [
    {
      id: 1,
      message: "3 expenses missing VAT category",
      type: "warning",
      action: "Fix Now",
    },
    {
      id: 2,
      message: "2 invoices missing issue date",
      type: "warning",
      action: "Review",
    },
  ];

  const vatBoxes = [
    { box: 1, label: "VAT due on sales", amount: 2450.5, type: "output" },
    { box: 2, label: "VAT due on acquisitions", amount: 0, type: "output" },
    { box: 3, label: "Total VAT due", amount: 2450.5, type: "total" },
    { box: 4, label: "VAT reclaimed", amount: 820.25, type: "input" },
    { box: 5, label: "Net VAT to pay", amount: 1630.25, type: "net" },
    { box: 6, label: "Total sales (excl. VAT)", amount: 14703.0, type: "turnover" },
    { box: 7, label: "Total purchases (excl. VAT)", amount: 4921.5, type: "turnover" },
    { box: 8, label: "Total supplies (incl. VAT)", amount: 17153.5, type: "turnover" },
    { box: 9, label: "Total acquisitions (incl. VAT)", amount: 5741.75, type: "turnover" },
  ];

  const pastReturns = [
    { period: "Apr–Jun 2024", status: "Submitted", ref: "XJ8Y34", amount: 2450, type: "paid" },
    { period: "Jan–Mar 2024", status: "Submitted", ref: "AJ2K89", amount: 430, type: "refund" },
    { period: "Oct–Dec 2023", status: "Submitted", ref: "PL9W23", amount: 1820, type: "paid" },
  ];

  const hasErrors = tasks.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Making Tax Digital
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        MTD is HMRC's digital VAT submission system
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Apr–Jun 2025 • Due <span className="font-semibold text-warning">7 Aug 2025</span>
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              In Progress
            </Badge>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Progress Tracker */}
          <Card className="p-5 shadow-card border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">YOUR PROGRESS</h2>
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        step.completed
                          ? "bg-success text-white"
                          : step.current
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{step.id}</span>
                      )}
                    </div>
                    <p className="text-xs text-center mt-2 max-w-[60px] font-medium">
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mb-6 ${
                        step.completed ? "bg-success" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Tasks/Errors Section */}
          {hasErrors && (
            <Card className="p-5 shadow-card border-l-4 border-l-warning bg-warning/5">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                To Do Before You Submit
              </h2>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-warning/20 cursor-pointer hover:bg-warning/5 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{task.message}</span>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2 text-xs">
                      {task.action}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Summary Card */}
          <Card className="p-5 shadow-card border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">SUMMARY</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                  <p className="text-sm font-medium text-foreground">£14,703.00 + £2,450.50 VAT</p>
                </div>
                <p className="text-lg font-bold text-success">£17,153.50</p>
              </div>

              <div className="flex justify-between items-center p-3 bg-destructive/5 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                  <p className="text-sm font-medium text-foreground">£4,921.50 + £820.25 VAT</p>
                </div>
                <p className="text-lg font-bold text-destructive">£5,741.75</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border-2 border-primary/30">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">VAT Due to HMRC</p>
                </div>
                <p className="text-2xl font-bold text-primary">£1,630.25</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalculation(!showCalculation)}
              className="w-full justify-between"
            >
              <span className="text-sm">View Calculation</span>
              {showCalculation ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>

            {showCalculation && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm animate-fade-in">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT on Sales (Box 1)</span>
                  <span className="font-medium">£2,450.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT on Acquisitions (Box 2)</span>
                  <span className="font-medium">£0.00</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total VAT Due (Box 3)</span>
                  <span>£2,450.50</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Less: VAT Reclaimed (Box 4)</span>
                  <span>-£820.25</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Net VAT Due (Box 5)</span>
                  <span className="text-primary">£1,630.25</span>
                </div>
              </div>
            )}
          </Card>

          {/* VAT Return Preview */}
          <Card className="p-5 shadow-card border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">
              VAT RETURN PREVIEW (BOXES 1–9)
            </h2>
            <div className="space-y-2">
              {vatBoxes.map((box) => (
                <div key={box.box}>
                  <button
                    onClick={() => setExpandedBox(expandedBox === box.box ? null : box.box)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors border border-border"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Badge variant="outline" className="font-mono text-xs">
                        Box {box.box}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-foreground">{box.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          box.type === "net" || box.type === "total"
                            ? "text-primary text-base"
                            : "text-foreground"
                        }`}
                      >
                        £{box.amount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedBox === box.box ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>
                  
                  {expandedBox === box.box && (
                    <div className="mt-2 ml-4 p-3 bg-card rounded-lg border border-border animate-fade-in">
                      <p className="text-xs text-muted-foreground mb-2">
                        Tap to view detailed breakdown of transactions
                      </p>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Transactions
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submission Section */}
          <Card className="p-5 shadow-card border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">SUBMISSION</h2>
            
            <Button
              size="lg"
              disabled={hasErrors}
              className="w-full mb-3 h-12 text-base font-semibold"
            >
              <Shield className="w-5 h-5 mr-2" />
              Submit VAT Return to HMRC
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Submission via HMRC MTD API. By tapping submit, you confirm this return is accurate
              and complete.
            </p>

            {hasErrors && (
              <div className="mt-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-xs text-warning text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Please resolve all errors before submitting
                </p>
              </div>
            )}
          </Card>

          {/* Past Returns */}
          <Card className="p-5 shadow-card border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">
              SUBMISSION HISTORY
            </h2>
            <div className="space-y-3">
              {pastReturns.map((return_item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {return_item.period}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Ref: {return_item.ref}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {return_item.status} ✅
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        return_item.type === "paid" ? "text-primary" : "text-success"
                      }`}
                    >
                      {return_item.type === "paid" ? "£" : "+£"}
                      {return_item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {return_item.type === "paid" ? "paid" : "refund"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
              <Download className="w-4 h-4" />
              Export History
            </Button>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Records;
