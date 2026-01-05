import { useState, useMemo } from "react";
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
  Search,
  X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useIncomeTransactions, useExpenseTransactions } from "@/hooks/useTransactions";
import { useBankTransactions } from "@/hooks/useBankTransactions";
import { formatCurrency, formatDate } from "@/utils/transactionHelpers";
import { toast } from "sonner";
import { HelpTooltip } from "@/components/HelpTooltip";
import { MicroCelebration } from "@/components/MicroCelebration";
import { useStreak } from "@/hooks/useStreak";
import { InvoiceTracker } from "@/components/InvoiceTracker";
import { ReceiptCapture } from "@/components/ReceiptCapture";
import { BulkActions } from "@/components/BulkActions";
import { CashFlowForecast } from "@/components/CashFlowForecast";
import { HMRCCategoryPicker } from "@/components/HMRCCategoryPicker";
import { BusinessUseSlider } from "@/components/BusinessUseSlider";
import { Badge } from "@/components/ui/badge";
import { useHMRCCategories, HMRCCategory } from "@/hooks/useHMRCCategories";

const Log = () => {
  const [cashAmount, setCashAmount] = useState("");
  const [cashDescription, setCashDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'overdue'>('paid');
  const [incomeCategoryId, setIncomeCategoryId] = useState<string | null>(null);
  
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState<string | null>(null);
  const [expenseCategoryId, setExpenseCategoryId] = useState<string | null>(null);
  const [businessUsePercent, setBusinessUsePercent] = useState(100);
  const [disallowableAmount, setDisallowableAmount] = useState(0);
  
  const [editingVatFor, setEditingVatFor] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ message: string; amount?: number } | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
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
  const { getCategoryById } = useHMRCCategories();
  
  const { updateStreak } = useStreak();

  const [showIgnored, setShowIgnored] = useState(false);

  const ignoredTransactions = categorizedTransactions.filter(t => t.mapping_type === 'ignored');

  const handleSaveCash = () => {
    if (!cashAmount || parseFloat(cashAmount) <= 0) {
      return;
    }
    const amount = parseFloat(cashAmount);
    addIncome({
      amount,
      description: cashDescription || "Cash sale",
      client_name: clientName || null,
      client_email: clientEmail || null,
      invoice_number: invoiceNumber || null,
      due_date: dueDate || null,
      payment_status: paymentStatus,
      hmrc_category_id: incomeCategoryId || undefined,
    });
    setCelebration({ 
      message: "Income logged!", 
      amount 
    });
    updateStreak();
    setCashAmount("");
    setCashDescription("");
    setClientName("");
    setClientEmail("");
    setInvoiceNumber("");
    setDueDate("");
    setPaymentStatus('paid');
    setIncomeCategoryId(null);
  };

  const handleSaveExpense = () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      return;
    }
    const amount = parseFloat(expenseAmount);
    const disallowableReason = businessUsePercent < 100 
      ? `Personal use portion (${100 - businessUsePercent}%)`
      : undefined;
    
    addExpense({
      amount,
      description: expenseDescription || "Expense",
      receipt_url: expenseReceiptUrl,
      hmrc_category_id: expenseCategoryId || undefined,
      disallowable_amount: disallowableAmount,
      disallowable_reason: disallowableReason,
    });
    setCelebration({ 
      message: "Expense saved!", 
      amount 
    });
    updateStreak();
    setExpenseAmount("");
    setExpenseDescription("");
    setExpenseReceiptUrl(null);
    setExpenseCategoryId(null);
    setBusinessUsePercent(100);
    setDisallowableAmount(0);
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

  const handleBulkCategorize = (category: string) => {
    if (selectedTransactions.length === 0) return;
    
    selectedTransactions.forEach(txId => {
      const transaction = transactions.find(t => t.id === txId);
      if (transaction && category !== 'ignore') {
        handleRecategorize(transaction, category as 'income' | 'expense');
      }
    });
    
    setSelectedTransactions([]);
    toast.success(`${selectedTransactions.length} transactions categorized as ${category}`);
  };

  const handleBulkSetVAT = (rate: number) => {
    if (selectedTransactions.length === 0) return;
    
    selectedTransactions.forEach(txId => {
      handleUpdateVAT(txId, rate);
    });
    
    setSelectedTransactions([]);
    toast.success(`VAT rate set to ${rate}% for ${selectedTransactions.length} transactions`);
  };

  const toggleTransactionSelection = (txId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(txId) 
        ? prev.filter(id => id !== txId)
        : [...prev, txId]
    );
  };

  const allTransactions = [
    ...incomeTransactions.map(t => ({ ...t, type: 'income' as const })),
    ...expenseTransactions.map(t => ({ ...t, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 10);

  // Filter bank transactions based on search
  const filteredIncomeTransactions = useMemo(() => {
    return categorizedTransactions
      .filter(t => t.mapping_type === 'income' && t.amount > 0)
      .filter(t => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          t.merchant_name?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
        );
      });
  }, [categorizedTransactions, searchQuery]);

  const filteredExpenseTransactions = useMemo(() => {
    return categorizedTransactions
      .filter(t => t.mapping_type === 'expense' && t.amount < 0)
      .filter(t => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          t.merchant_name?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
        );
      });
  }, [categorizedTransactions, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24 lg:pb-8">
      {celebration && (
        <MicroCelebration
          message={celebration.message}
          amount={celebration.amount}
          onComplete={() => setCelebration(null)}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Money Management
          </h1>
          <p className="text-muted-foreground mt-1 lg:text-lg">
            Review bank transactions or add manual entries
          </p>
        </div>

        {/* Cash Flow Forecast */}
        <CashFlowForecast />

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bank">Bank</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
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
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 Tip: Select multiple transactions to categorize or update VAT rates in bulk
                  </p>
                </Card>
                
                <BulkActions
                  selectedCount={selectedTransactions.length}
                  onCategorize={handleBulkCategorize}
                  onSetVAT={handleBulkSetVAT}
                  onClearSelection={() => setSelectedTransactions([])}
                />

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredIncomeTransactions.length + filteredExpenseTransactions.length} of {categorizedTransactions.filter(t => t.mapping_type === 'income' || t.mapping_type === 'expense').length} transactions
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-success" />
                      Recent Income
                    </h4>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2 pr-4">
                        {filteredIncomeTransactions
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
                        {filteredExpenseTransactions
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Amount *
                    </Label>
                    <Input
                      type="number"
                      placeholder="£0.00"
                      value={expenseAmount}
                      onChange={(e) => {
                        setExpenseAmount(e.target.value);
                        // Recalculate disallowable when amount changes
                        const amt = parseFloat(e.target.value) || 0;
                        setDisallowableAmount(amt * ((100 - businessUsePercent) / 100));
                      }}
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                      Category
                      <HelpTooltip
                        term="HMRC Category"
                        explanation="Choose the HMRC-compliant category for this expense. This maps to the SA103F form for your Self Assessment."
                        icon="📋"
                        tooltipId="hmrc-expense-category"
                      />
                    </Label>
                    <HMRCCategoryPicker
                      type="expense"
                      value={expenseCategoryId}
                      onChange={(id) => setExpenseCategoryId(id)}
                      placeholder="Select category..."
                    />
                  </div>
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

                {/* Business Use Slider - only show if amount entered */}
                {expenseAmount && parseFloat(expenseAmount) > 0 && (
                  <div className="border-t pt-4">
                    <BusinessUseSlider
                      amount={parseFloat(expenseAmount) || 0}
                      businessUsePercent={businessUsePercent}
                      onChange={(percent, disallowable) => {
                        setBusinessUsePercent(percent);
                        setDisallowableAmount(disallowable);
                      }}
                    />
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Receipt (optional)
                  </Label>
                  <ReceiptCapture onReceiptUploaded={setExpenseReceiptUrl} />
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
                Log Income / Invoice
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Amount *
                    </Label>
                    <Input
                      type="number"
                      placeholder="£0.00"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Payment Status
                    </Label>
                    <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Description
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Job for Paul's Garage"
                      value={cashDescription}
                      onChange={(e) => setCashDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                      Category
                      <HelpTooltip
                        term="HMRC Category"
                        explanation="Choose the HMRC-compliant category for this income. This maps to the SA103F form for your Self Assessment."
                        icon="📋"
                        tooltipId="hmrc-income-category"
                      />
                    </Label>
                    <HMRCCategoryPicker
                      type="income"
                      value={incomeCategoryId}
                      onChange={(id) => setIncomeCategoryId(id)}
                      placeholder="Select category..."
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Invoice Details (optional)</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Client Name
                      </Label>
                      <Input
                        type="text"
                        placeholder="Client name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Invoice #
                      </Label>
                      <Input
                        type="text"
                        placeholder="INV-001"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Client Email
                      </Label>
                      <Input
                        type="email"
                        placeholder="client@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Due Date
                      </Label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
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
                          {transaction.hmrc_category_id && (
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryById(transaction.hmrc_category_id)?.display_name || 'Categorized'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(transaction.transaction_date)}</span>
                          {transaction.type === 'expense' && (transaction.disallowable_amount ?? 0) > 0 && (
                            <Badge variant="outline" className="text-xs text-warning border-warning/30">
                              £{(transaction.disallowable_amount ?? 0).toFixed(2)} personal use
                            </Badge>
                          )}
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

          <TabsContent value="invoices" className="space-y-4 mt-4">
            <InvoiceTracker />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Log;
