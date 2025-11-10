import { useIncomeTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Clock, CheckCircle, Search, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/transactionHelpers";
import { usePaymentReminders } from "@/hooks/usePaymentReminders";
import { useState, useMemo } from "react";

export const InvoiceTracker = () => {
  const { transactions } = useIncomeTransactions();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { sendReminder, isSending } = usePaymentReminders(selectedInvoice || undefined);

  // Filter for pending/overdue invoices
  const pendingInvoices = transactions.filter(
    (t) => t.payment_status === "pending" || t.payment_status === "overdue"
  );

  // Calculate overdue invoices
  const overdueInvoices = pendingInvoices.filter((t) => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    const today = new Date();
    return dueDate < today;
  });

  const totalOverdue = overdueInvoices.reduce((sum, t) => sum + Number(t.amount), 0);

  // Filter invoices based on search
  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return pendingInvoices;
    const query = searchQuery.toLowerCase();
    return pendingInvoices.filter(invoice => 
      invoice.client_name?.toLowerCase().includes(query) ||
      invoice.invoice_number?.toLowerCase().includes(query)
    );
  }, [pendingInvoices, searchQuery]);

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getReminderType = (daysOverdue: number): 'gentle' | 'firm' | 'final' => {
    if (daysOverdue < 7) return 'gentle';
    if (daysOverdue < 30) return 'firm';
    return 'final';
  };

  const handleSendReminder = (incomeTransactionId: string, daysOverdue: number) => {
    setSelectedInvoice(incomeTransactionId);
    const reminderType = getReminderType(daysOverdue);
    sendReminder({ incomeTransactionId, reminderType });
  };

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
          <p className="text-sm text-muted-foreground">
            You have no pending or overdue invoices. Great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {overdueInvoices.length > 0 ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Clock className="h-5 w-5 text-warning" />
            )}
            Invoice Tracker
          </span>
          {overdueInvoices.length > 0 && (
            <Badge variant="destructive">
              {formatCurrency(totalOverdue)} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or invoice number..."
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
            Showing {filteredInvoices.length} of {pendingInvoices.length} invoices
          </p>
        )}

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No invoices found</p>
            <p className="text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
          const daysOverdue = invoice.due_date ? getDaysOverdue(invoice.due_date) : 0;
          const isOverdue = daysOverdue > 0;

          return (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {invoice.client_name || "Unnamed Client"}
                  </span>
                  {invoice.invoice_number && (
                    <Badge variant="outline">#{invoice.invoice_number}</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Number(invoice.amount))} • Due:{" "}
                  {invoice.due_date ? formatDate(invoice.due_date) : "No due date"}
                  {isOverdue && (
                    <span className="text-destructive font-medium ml-2">
                      ({daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOverdue ? "destructive" : "secondary"}>
                  {invoice.payment_status}
                </Badge>
                {invoice.client_email && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendReminder(invoice.id, daysOverdue)}
                    disabled={isSending && selectedInvoice === invoice.id}
                  >
                    {isSending && selectedInvoice === invoice.id
                      ? "Sending..."
                      : "Send Reminder"}
                  </Button>
                )}
              </div>
            </div>
          );
          })
        )}
      </CardContent>
    </Card>
  );
};
