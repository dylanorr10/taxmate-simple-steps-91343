import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { ExpandableSection } from "./ExpandableSection";
import { Progress } from "@/components/ui/progress";

interface ComplianceItem {
  id: string;
  label: string;
  completed: boolean;
  weight: string;
  guidance: string;
  actionLink?: string;
  actionLabel?: string;
}

interface CategoryGroup {
  title: string;
  emoji: string;
  items: ComplianceItem[];
}

interface MtdComplianceChecklistProps {
  hasBusinessName: boolean;
  hasVATNumber: boolean;
  hasHMRCConnection: boolean;
  allHaveHMRCCategories: boolean;
  noUncategorizedExpenses: boolean;
  hasMileageTrips: boolean;
  allQuartersSubmittedOnTime: boolean;
  hasYearEndAdjustments: boolean;
  hasIncomeTransactions: boolean;
  hasExpenseTransactions: boolean;
}

export const MtdComplianceChecklist = ({
  hasBusinessName,
  hasVATNumber,
  hasHMRCConnection,
  allHaveHMRCCategories,
  noUncategorizedExpenses,
  hasMileageTrips,
  allQuartersSubmittedOnTime,
  hasYearEndAdjustments,
  hasIncomeTransactions,
  hasExpenseTransactions,
}: MtdComplianceChecklistProps) => {
  const categories: CategoryGroup[] = [
    {
      title: "Setup",
      emoji: "⚙️",
      items: [
        {
          id: "business-name",
          label: "Business name added",
          completed: hasBusinessName,
          weight: "+10%",
          guidance: "Add your business name in Settings to identify your self-assessment.",
          actionLink: "/settings",
          actionLabel: "Go to Settings",
        },
        {
          id: "vat-number",
          label: "VAT number registered",
          completed: hasVATNumber,
          weight: "+10%",
          guidance: "If VAT registered, add your VAT number in Settings for MTD compliance.",
          actionLink: "/settings",
          actionLabel: "Go to Settings",
        },
        {
          id: "hmrc-connection",
          label: "Connected to HMRC",
          completed: hasHMRCConnection,
          weight: "+15%",
          guidance: "Connect your HMRC account in Settings to enable direct submissions.",
          actionLink: "/settings",
          actionLabel: "Connect HMRC",
        },
      ],
    },
    {
      title: "Transactions",
      emoji: "💷",
      items: [
        {
          id: "income-transactions",
          label: "Income recorded",
          completed: hasIncomeTransactions,
          weight: "+5%",
          guidance: "Record at least one income transaction to start tracking earnings.",
          actionLink: "/log",
          actionLabel: "Add Income",
        },
        {
          id: "expense-transactions",
          label: "Expenses recorded",
          completed: hasExpenseTransactions,
          weight: "+5%",
          guidance: "Record business expenses to maximise your tax deductions.",
          actionLink: "/log",
          actionLabel: "Add Expense",
        },
        {
          id: "hmrc-categories",
          label: "All transactions categorised",
          completed: allHaveHMRCCategories,
          weight: "+15%",
          guidance: "Assign HMRC categories to all your income and expense transactions.",
          actionLink: "/log",
          actionLabel: "View Transactions",
        },
        {
          id: "no-uncategorized",
          label: "No uncategorised expenses",
          completed: noUncategorizedExpenses,
          weight: "+10%",
          guidance: "Add descriptions to all expense transactions for better record-keeping.",
          actionLink: "/log",
          actionLabel: "Review Expenses",
        },
        {
          id: "mileage-log",
          label: "Mileage log started",
          completed: hasMileageTrips,
          weight: "+5%",
          guidance: "Log at least one business trip to track mileage deductions.",
          actionLink: "/mileage",
          actionLabel: "Add Trip",
        },
      ],
    },
    {
      title: "Compliance",
      emoji: "✅",
      items: [
        {
          id: "quarterly-submissions",
          label: "Quarterly submissions on time",
          completed: allQuartersSubmittedOnTime,
          weight: "+10%",
          guidance: "Submit all quarterly updates before their deadlines.",
          actionLink: "/tax",
          actionLabel: "View Quarters",
        },
        {
          id: "year-end-adjustments",
          label: "Year-end adjustments reviewed",
          completed: hasYearEndAdjustments,
          weight: "+5%",
          guidance: "Review and add any year-end tax adjustments like capital allowances.",
          actionLink: "/tax",
          actionLabel: "Add Adjustments",
        },
      ],
    },
  ];

  const allItems = categories.flatMap(cat => cat.items);

  const completedCount = allItems.filter(item => item.completed).length;
  const totalCount = allItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="shadow-card hover-lift animate-fade-in overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">MTD Compliance</div>
            <div className="text-base font-bold">Readiness Checklist</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{progressPercent}%</div>
            <div className="text-xs text-muted-foreground">{completedCount}/{totalCount}</div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`} 
          />
        </div>
      </button>

      {!isExpanded && (
        <div className="px-4 pb-4">
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <Progress value={progressPercent} className="h-2 mb-4" />
          
          <div className="space-y-5">
            {categories.map((category) => {
              const categoryCompleted = category.items.filter(i => i.completed).length;
              return (
                <div key={category.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{category.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{category.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {categoryCompleted}/{category.items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          item.completed 
                            ? "bg-success/5 border-success/20" 
                            : "bg-muted/30 border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`font-medium text-sm ${item.completed ? "text-success" : "text-foreground"}`}>
                                {item.label}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {item.weight}
                              </span>
                            </div>
                            {!item.completed && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                  {item.guidance}
                                </p>
                                {item.actionLink && (
                                  <Link
                                    to={item.actionLink}
                                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                                  >
                                    {item.actionLabel}
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <ExpandableSection title="What is MTD?">
            <p className="leading-relaxed">
              Making Tax Digital (MTD) is the UK government's initiative to digitise the tax system. 
              Complete all items above to ensure you're fully compliant and ready for quarterly submissions.
            </p>
          </ExpandableSection>
        </div>
      )}
    </Card>
  );
};
