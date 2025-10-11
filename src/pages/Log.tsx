import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Tag,
  CheckCircle,
  Trash2,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useBankTransactions } from "@/hooks/useBankTransactions";
import { formatCurrency, formatDate } from "@/utils/transactionHelpers";
import { toast } from "sonner";
import { HelpTooltip } from "@/components/HelpTooltip";

const Log = () => {
  const [cashAmount, setCashAmount] = useState("");
  const [cashDescription, setCashDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [editingVatFor, setEditingVatFor] = useState<string | null>(null);
  
  const { transactions: incomeTransactions, isLoading: incomeLoading, addIncome, isAdding: isAddingIncome, deleteIncome } = useIncomeTransactions();
  const { transactions: expenseTransactions, isLoading: expenseLoading, addExpense, isAdding: isAddingExpense, deleteExpense } = useExpenseTransactions();
  const { 
    transactions,
    isLoading: bankLoading,
    categorizedTransactions,
    updateVATRate,
    isUpdatingVAT,
    recategorizeTransaction,
    isRecategorizing,
  } = useBankTransactions();

  const [showIgnored, setShowIgnored] = useState(false);

  const ignoredTransactions = categorizedTransactions.filter(t => t.mapping_type === 'ignored');

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

  const handleRecategorize = async (transaction: any, type: 'income' | 'expense') => {
    const vatRate = 20;
    recategorizeTransaction({
      transactionId: transaction.id,
      type,
      vatRate,
    });
  };

  const handleUpdateVAT = (bankTxId: string, newVatRate: number) => {
    updateVATRate({
      bankTransactionId: bankTxId,
      newVatRate,
    });
    setEditingVatFor(null);
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
            Money Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review bank transactions or add manual entries
          </p>
        </div>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank">Bank Transactions</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4 mt-4">
            {bankLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : showIgnored ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ignored Transactions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIgnored(false)}
                  >
                    Back to Pending
                  </Button>
                </div>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    {ignoredTransactions.map((transaction) => (
                      <Card key={transaction.id} className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{transaction.description || transaction.merchant_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="text-sm text-amber-700 dark:text-amber-500 mt-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              This transaction was skipped and won't appear on your dashboard
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                              {formatCurrency(Math.abs(transaction.amount))}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRecategorize(transaction, 'income')}
                                disabled={isRecategorizing}
                              >
                                ✓ Income
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRecategorize(transaction, 'expense')}
                                disabled={isRecategorizing}
                              >
                                ✓ Expense
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="p-8 text-center border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Bank Transactions Auto-Categorized!</h3>
                  <p className="text-muted-foreground">
                    All your bank transactions are automatically categorized based on amount:
                    Money in = Income (20% VAT) • Money out = Expense (20% VAT)
                  </p>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-success" />
                      Recent Income
                    </h4>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2 pr-4">
                        {categorizedTransactions
                          .filter(t => t.mapping_type === 'income' && t.amount > 0)
                          .slice(0, 10)
                          .map(tx => (
                            <div key={tx.id} className="p-3 bg-success/5 border border-success/20 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{tx.merchant_name || tx.description}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(tx.timestamp)}
                                  </div>
                                </div>
                                <div className="text-success font-semibold">{formatCurrency(Math.abs(tx.amount))}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="text-xs text-muted-foreground">
                                   <HelpTooltip
                                     term="VAT Rate"
                                     explanation="VAT comes in three rates: Standard (20% - most goods/services), Reduced (5% - energy saving), and Zero (0% - books, most food)."
                                     icon="📋"
                                     tooltipId="vat-rate"
                                   />
                                 </div>
                                 {editingVatFor === tx.id ? (
                                   <Select
                                     defaultValue="20"
                                     onValueChange={(value) => handleUpdateVAT(tx.id, Number(value))}
                                   >
                                     <SelectTrigger className="h-7 text-xs">
                                       <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="0">0% VAT</SelectItem>
                                       <SelectItem value="5">5% VAT</SelectItem>
                                       <SelectItem value="20">20% VAT</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 ) : (
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-7 text-xs"
                                     onClick={() => setEditingVatFor(tx.id)}
                                     disabled={isUpdatingVAT}
                                   >
                                     <Edit className="w-3 h-3 mr-1" /> 20% VAT
                                   </Button>
                                 )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-warning" />
                      Recent Expenses
                    </h4>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2 pr-4">
                        {categorizedTransactions
                          .filter(t => t.mapping_type === 'expense' && t.amount < 0)
                          .slice(0, 10)
                          .map(tx => (
                            <div key={tx.id} className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{tx.merchant_name || tx.description}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(tx.timestamp)}
                                  </div>
                                </div>
                                <div className="font-semibold">{formatCurrency(Math.abs(tx.amount))}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {editingVatFor === tx.id ? (
                                  <Select
                                    defaultValue="20"
                                    onValueChange={(value) => handleUpdateVAT(tx.id, Number(value))}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0% VAT</SelectItem>
                                      <SelectItem value="5">5% VAT</SelectItem>
                                      <SelectItem value="20">20% VAT</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setEditingVatFor(tx.id)}
                                    disabled={isUpdatingVAT}
                                  >
                                    <Edit className="w-3 h-3 mr-1" /> 20% VAT
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                {ignoredTransactions.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowIgnored(!showIgnored)}
                    className="w-full"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    View {ignoredTransactions.length} Ignored Transactions
                  </Button>
                )}
              </div>
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
                        <div className="flex items-center gap-2 mb-1">
                          {transaction.type === 'income' ? (
                            <ShoppingCart className="w-4 h-4 text-success" />
                          ) : (
                            <Tag className="w-4 h-4 text-warning" />
                          )}
                          <span className="font-medium text-foreground">
                            {transaction.description}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.transaction_date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.type === 'income' ? 'text-success' : 'text-foreground'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.vat_rate}% VAT
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (transaction.type === 'income') {
                              deleteIncome(transaction.id);
                            } else {
                              deleteExpense(transaction.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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
