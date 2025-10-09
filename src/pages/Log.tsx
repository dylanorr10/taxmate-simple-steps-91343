import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FilePlus,
  ShoppingCart,
  Tag,
  CheckCircle,
  Trash2,
  Loader2,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useBankTransactions } from "@/hooks/useBankTransactions";
import { formatCurrency, formatDate } from "@/utils/transactionHelpers";
import { toast } from "sonner";

const Log = () => {
  const [cashAmount, setCashAmount] = useState("");
  const [cashDescription, setCashDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [selectedBankTx, setSelectedBankTx] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [customVatRate, setCustomVatRate] = useState<number>(20);
  
  const { transactions: incomeTransactions, isLoading: incomeLoading, addIncome, isAdding: isAddingIncome, deleteIncome } = useIncomeTransactions();
  const { transactions: expenseTransactions, isLoading: expenseLoading, addExpense, isAdding: isAddingExpense, deleteExpense } = useExpenseTransactions();
  const { 
    pendingTransactions, 
    isLoading: bankLoading, 
    categorizeTransaction, 
    isCategorizing,
    confirmCategorization,
    isConfirming 
  } = useBankTransactions();

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

  const handleAICategorize = async (bankTxId: string) => {
    setSelectedBankTx(bankTxId);
    setAiSuggestion(null);
    
    try {
      const result = await new Promise((resolve, reject) => {
        categorizeTransaction(bankTxId, {
          onSuccess: (data: any) => resolve(data),
          onError: (error: Error) => reject(error)
        });
      });
      
      setAiSuggestion(result);
      toast.success("AI categorization complete!");
    } catch (error) {
      toast.error("Failed to categorize. Please try manually.");
      setSelectedBankTx(null);
    }
  };

  const handleConfirmCategorization = (type: 'income' | 'expense' | 'ignored', vatRate?: number) => {
    if (!selectedBankTx) return;
    
    const confidence = aiSuggestion?.confidence || 0.5;
    const finalVatRate = vatRate !== undefined ? vatRate : customVatRate;
    
    confirmCategorization({
      bankTransactionId: selectedBankTx,
      type,
      vatRate: finalVatRate,
      confidence
    });
    
    setSelectedBankTx(null);
    setAiSuggestion(null);
    setCustomVatRate(20);
  };

  const handleIgnore = (bankTxId: string) => {
    confirmCategorization({
      bankTransactionId: bankTxId,
      type: 'ignored',
      confidence: 1
    });
  };

  const allTransactions = [
    ...incomeTransactions.map(t => ({ ...t, type: 'income' as const })),
    ...expenseTransactions.map(t => ({ ...t, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Money Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Review bank transactions or add manual entries
            </p>
          </div>
          {pendingTransactions.length > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {pendingTransactions.length}
            </Badge>
          )}
        </div>

        <Tabs defaultValue={pendingTransactions.length > 0 ? "pending" : "manual"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="relative">
              Bank Transactions
              {pendingTransactions.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                  {pendingTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {bankLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingTransactions.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No pending bank transactions to categorize.
                </p>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {pendingTransactions.map((tx) => (
                    <Card key={tx.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-base">
                              {tx.merchant_name || tx.description || 'Unknown transaction'}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(tx.timestamp).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                            {tx.category && (
                              <Badge variant="outline" className="mt-2">
                                {tx.category}
                              </Badge>
                            )}
                          </div>
                          <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                            {formatCurrency(Math.abs(tx.amount))}
                          </div>
                        </div>

                        {selectedBankTx === tx.id && aiSuggestion ? (
                          <div className="space-y-3 pt-3 border-t">
                            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">AI Suggestion</div>
                                  <div className="text-sm mt-1">
                                    Type: <span className="font-semibold capitalize">{aiSuggestion.type}</span>
                                  </div>
                                  <div className="text-sm">
                                    VAT Rate: <span className="font-semibold">{aiSuggestion.vatRate}%</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Confidence: {Math.round(aiSuggestion.confidence * 100)}%
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleConfirmCategorization(aiSuggestion.type, aiSuggestion.vatRate)}
                                disabled={isConfirming}
                                className="flex-1"
                                size="sm"
                              >
                                {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Accept
                              </Button>
                              <Button
                                onClick={() => setSelectedBankTx(null)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-muted-foreground">
                                Or categorize manually:
                              </div>
                              <div className="flex gap-2">
                                <select
                                  value={customVatRate}
                                  onChange={(e) => setCustomVatRate(Number(e.target.value))}
                                  className="text-sm border rounded px-2 py-1"
                                >
                                  <option value={0}>0% VAT</option>
                                  <option value={5}>5% VAT</option>
                                  <option value={20}>20% VAT</option>
                                </select>
                                <Button
                                  onClick={() => handleConfirmCategorization('income', customVatRate)}
                                  disabled={isConfirming}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  Income
                                </Button>
                                <Button
                                  onClick={() => handleConfirmCategorization('expense', customVatRate)}
                                  disabled={isConfirming}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  Expense
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              onClick={() => handleAICategorize(tx.id)}
                              disabled={isCategorizing || isConfirming}
                              variant="default"
                              size="sm"
                              className="flex-1"
                            >
                              {isCategorizing && selectedBankTx === tx.id ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</>
                              ) : (
                                <><Sparkles className="w-4 h-4 mr-2" /> AI Categorize</>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleIgnore(tx.id)}
                              disabled={isConfirming}
                              variant="outline"
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">

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
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Log;
