import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FilePlus,
  ShoppingCart,
  Tag,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/utils/transactionHelpers";

const Log = () => {
  const [cashAmount, setCashAmount] = useState("");
  const [cashDescription, setCashDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  
  const { transactions: incomeTransactions, isLoading: incomeLoading, addIncome, isAdding: isAddingIncome, deleteIncome } = useIncomeTransactions();
  const { transactions: expenseTransactions, isLoading: expenseLoading, addExpense, isAdding: isAddingExpense, deleteExpense } = useExpenseTransactions();

  const handleSaveCash = () => {
    if (!cashAmount || parseFloat(cashAmount) <= 0) {
      return;
    }
    addIncome({
      amount: parseFloat(cashAmount),
      description: cashDescription || "Cash sale",
    });
    setCashAmount("");
    setCashDescription("");
  };

  const handleSaveExpense = () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      return;
    }
    addExpense({
      amount: parseFloat(expenseAmount),
      description: expenseDescription || "Expense",
    });
    setExpenseAmount("");
    setExpenseDescription("");
  };

  const allTransactions = [
    ...incomeTransactions.map(t => ({ ...t, type: 'income' as const })),
    ...expenseTransactions.map(t => ({ ...t, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 10);

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

        <Card className="p-6 shadow-card border border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
            <Tag className="w-5 h-5 text-warning" />
            Log Expense
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Amount
              </Label>
              <Input
                type="number"
                placeholder="Enter amount (£)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Description (optional)
              </Label>
              <Input
                type="text"
                placeholder="e.g. Materials, Fuel"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSaveExpense} 
              className="w-full gap-2"
              disabled={isAddingExpense || !expenseAmount || parseFloat(expenseAmount) <= 0}
            >
              {isAddingExpense ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Save Expense</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-card border border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-success" />
            Quick Cash Sale
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Amount
              </Label>
              <Input
                type="number"
                placeholder="Enter amount (£)"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Description (optional)
              </Label>
              <Input
                type="text"
                placeholder="e.g. Job for Paul's Garage"
                value={cashDescription}
                onChange={(e) => setCashDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSaveCash} 
              className="w-full gap-2"
              disabled={isAddingIncome || !cashAmount || parseFloat(cashAmount) <= 0}
            >
              {isAddingIncome ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Save Cash Sale</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-card border border-border">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Recent Transactions</h2>
          {(incomeLoading || expenseLoading) ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : allTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions yet. Add your first income or expense above!
            </p>
          ) : (
            <div className="space-y-3">
              {allTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    transaction.type === 'income' 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-warning/5 border-warning/20'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <ShoppingCart className="w-4 h-4 text-success" />
                      ) : (
                        <Tag className="w-4 h-4 text-warning" />
                      )}
                      {transaction.description || (transaction.type === 'income' ? 'Income' : 'Expense')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(Number(transaction.amount))} • {formatDate(transaction.transaction_date)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => transaction.type === 'income' ? deleteIncome(transaction.id) : deleteExpense(transaction.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Log;
