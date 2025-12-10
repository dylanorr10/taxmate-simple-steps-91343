import { useIncomeTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, CheckCircle, Search, X, Mail, ArrowUpDown, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/transactionHelpers";
import { usePaymentReminders } from "@/hooks/usePaymentReminders";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

type FilterTab = "all" | "pending" | "overdue";
type SortOption = "due_date" | "amount" | "days_overdue";

export const InvoiceTracker = () => {
  const { transactions, isLoading, updatePaymentStatus, isUpdatingStatus } = useIncomeTransactions();
  const { reminders, sendReminder, isSending, getLastReminderForInvoice } = usePaymentReminders();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("due_date");

  // Filter for pending/overdue invoices
  const pendingInvoices = transactions.filter(
    (t) => t.payment_status === "pending" || t.payment_status === "overdue"
  );

  // Calculate overdue invoices
  const overdueInvoices = pendingInvoices.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });

  const pendingOnlyInvoices = pendingInvoices.filter((t) => {
    if (!t.due_date) return true;
    return new Date(t.due_date) >= new Date();
  });

  const totalOverdue = overdueInvoices.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPending = pendingOnlyInvoices.reduce((sum, t) => sum + Number(t.amount), 0);

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getReminderType = (daysOverdue: number): "gentle" | "firm" | "final" => {
    if (daysOverdue < 7) return "gentle";
    if (daysOverdue < 30) return "firm";
    return "final";
  };

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = pendingInvoices;

    // Apply tab filter
    if (filterTab === "overdue") {
      filtered = overdueInvoices;
    } else if (filterTab === "pending") {
      filtered = pendingOnlyInvoices;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.client_name?.toLowerCase().includes(query) ||
          invoice.invoice_number?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return Number(b.amount) - Number(a.amount);
        case "days_overdue":
          const daysA = a.due_date ? getDaysOverdue(a.due_date) : -9999;
          const daysB = b.due_date ? getDaysOverdue(b.due_date) : -9999;
          return daysB - daysA;
        case "due_date":
        default:
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
    });

    return filtered;
  }, [pendingInvoices, overdueInvoices, pendingOnlyInvoices, filterTab, searchQuery, sortBy]);

  const handleSendReminder = (incomeTransactionId: string, daysOverdue: number) => {
    setSelectedInvoice(incomeTransactionId);
    const reminderType = getReminderType(daysOverdue);
    sendReminder({ incomeTransactionId, reminderType });
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    updatePaymentStatus({ id: invoiceId, status: "paid" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (pendingInvoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            All Invoices Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              You have no pending or overdue invoices. Great work!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            {overdueInvoices.length > 0 ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Clock className="h-5 w-5 text-warning" />
            )}
            Invoice Tracker
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {overdueInvoices.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {formatCurrency(totalOverdue)} overdue
              </Badge>
            )}
            {pendingOnlyInvoices.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {formatCurrency(totalPending)} pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as FilterTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({pendingInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending ({pendingOnlyInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm">
              Overdue ({overdueInvoices.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client or invoice..."
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
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="days_overdue">Days Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Info */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredInvoices.length} of {pendingInvoices.length} invoices
          </p>
        )}

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No invoices found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => {
              const daysOverdue = invoice.due_date ? getDaysOverdue(invoice.due_date) : 0;
              const isOverdue = daysOverdue > 0;
              const lastReminder = getLastReminderForInvoice(invoice.id);

              return (
                <div
                  key={invoice.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    isOverdue
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-warning/30 bg-warning/5"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium truncate">
                          {invoice.client_name || "Unnamed Client"}
                        </span>
                        {invoice.invoice_number && (
                          <Badge variant="outline" className="text-xs">
                            #{invoice.invoice_number}
                          </Badge>
                        )}
                        <Badge
                          variant={isOverdue ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {isOverdue ? "overdue" : "pending"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>
                          <span className="font-medium text-foreground">
                            {formatCurrency(Number(invoice.amount))}
                          </span>
                          {" · Due: "}
                          {invoice.due_date ? formatDate(invoice.due_date) : "No date"}
                          {isOverdue && (
                            <span className="text-destructive font-medium ml-1">
                              ({daysOverdue}d overdue)
                            </span>
                          )}
                        </p>
                        {lastReminder && (
                          <p className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            Last chased {formatDistanceToNow(new Date(lastReminder.sent_at), { addSuffix: true })}
                            <Badge variant="outline" className="text-xs ml-1">
                              {lastReminder.reminder_type}
                            </Badge>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        disabled={isUpdatingStatus}
                        className="h-8 px-2 text-success hover:text-success hover:bg-success/10"
                      >
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Paid</span>
                      </Button>
                      {invoice.client_email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendReminder(invoice.id, daysOverdue)}
                          disabled={isSending && selectedInvoice === invoice.id}
                          className={`h-8 px-2 ${isOverdue ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Mail className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">
                            {isSending && selectedInvoice === invoice.id ? "..." : "Chase"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
