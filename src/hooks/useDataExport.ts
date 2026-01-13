import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface ExportData {
  incomeTransactions: any[];
  expenseTransactions: any[];
  mileageTrips: any[];
  homeOfficeClaims: any[];
  taxPeriods: any[];
  vatSubmissions: any[];
  periodAmendments: any[];
  profile: any;
}

export const useDataExport = () => {
  const fetchAllData = async (): Promise<ExportData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const [
      { data: income },
      { data: expenses },
      { data: mileage },
      { data: homeOffice },
      { data: periods },
      { data: vatSubs },
      { data: amendments },
      { data: profile },
    ] = await Promise.all([
      supabase.from("income_transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: false }),
      supabase.from("expense_transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: false }),
      supabase.from("mileage_trips").select("*").eq("user_id", user.id).order("trip_date", { ascending: false }),
      supabase.from("home_office_claims").select("*").eq("user_id", user.id).order("claim_month", { ascending: false }),
      supabase.from("tax_periods").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      supabase.from("vat_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("period_amendments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    return {
      incomeTransactions: income || [],
      expenseTransactions: expenses || [],
      mileageTrips: mileage || [],
      homeOfficeClaims: homeOffice || [],
      taxPeriods: periods || [],
      vatSubmissions: vatSubs || [],
      periodAmendments: amendments || [],
      profile: profile || {},
    };
  };

  const exportToCSV = async () => {
    try {
      const data = await fetchAllData();
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
      
      // Create CSV content with multiple sheets as sections
      let csv = "";
      
      // Section 1: Business Profile
      csv += "=== BUSINESS PROFILE ===\n";
      csv += "Business Name,VAT Number,Business Type,Quarter Preference,Accounting Basis\n";
      csv += `"${data.profile.business_name || ''}","${data.profile.vat_number || ''}","${data.profile.business_type || ''}","${data.profile.quarter_preference || ''}","${data.profile.accounting_basis || ''}"\n\n`;

      // Section 2: Income Transactions
      csv += "=== INCOME TRANSACTIONS ===\n";
      csv += "Date,Description,Amount (£),VAT Rate (%),HMRC Category,Client Name,Invoice Number,Payment Status\n";
      data.incomeTransactions.forEach(t => {
        csv += `"${t.transaction_date}","${(t.description || '').replace(/"/g, '""')}","${Number(t.amount).toFixed(2)}","${t.vat_rate || 0}","${t.hmrc_category_id || ''}","${(t.client_name || '').replace(/"/g, '""')}","${t.invoice_number || ''}","${t.payment_status || ''}"\n`;
      });
      csv += `\nTotal Income:,"","£${data.incomeTransactions.reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}"\n\n`;

      // Section 3: Expense Transactions
      csv += "=== EXPENSE TRANSACTIONS ===\n";
      csv += "Date,Description,Amount (£),VAT Rate (%),HMRC Category,Disallowable Amount (£),Disallowable Reason,Receipt URL\n";
      data.expenseTransactions.forEach(t => {
        csv += `"${t.transaction_date}","${(t.description || '').replace(/"/g, '""')}","${Number(t.amount).toFixed(2)}","${t.vat_rate || 0}","${t.hmrc_category_id || ''}","${Number(t.disallowable_amount || 0).toFixed(2)}","${(t.disallowable_reason || '').replace(/"/g, '""')}","${t.receipt_url || ''}"\n`;
      });
      csv += `\nTotal Expenses:,"","£${data.expenseTransactions.reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}"\n\n`;

      // Section 4: Mileage Trips
      csv += "=== MILEAGE LOG ===\n";
      csv += "Date,Origin,Destination,Purpose,Distance (miles),Trip Type,Deduction (£)\n";
      data.mileageTrips.forEach(t => {
        csv += `"${t.trip_date}","${(t.origin || '').replace(/"/g, '""')}","${(t.destination || '').replace(/"/g, '""')}","${(t.purpose || '').replace(/"/g, '""')}","${Number(t.distance_miles).toFixed(1)}","${t.trip_type}","${Number(t.calculated_deduction).toFixed(2)}"\n`;
      });
      const totalMileageDeduction = data.mileageTrips.filter(t => t.trip_type === 'business').reduce((s, t) => s + Number(t.calculated_deduction), 0);
      csv += `\nTotal Business Miles:,"","${data.mileageTrips.filter(t => t.trip_type === 'business').reduce((s, t) => s + Number(t.distance_miles), 0).toFixed(1)}","","",Total Deduction:,"£${totalMileageDeduction.toFixed(2)}"\n\n`;

      // Section 5: Home Office Claims
      csv += "=== HOME OFFICE CLAIMS ===\n";
      csv += "Month,Hours Worked,Method,Flat Rate (£),Actual Costs (£),Business Use %,Deduction (£),Notes\n";
      data.homeOfficeClaims.forEach(c => {
        csv += `"${c.claim_month}","${c.hours_worked}","${c.method}","${c.flat_rate_amount || ''}","${c.actual_costs || ''}","${c.business_use_percent}","${Number(c.calculated_deduction).toFixed(2)}","${(c.notes || '').replace(/"/g, '""')}"\n`;
      });
      csv += `\nTotal Home Office Deduction:,"","","","","","£${data.homeOfficeClaims.reduce((s, c) => s + Number(c.calculated_deduction), 0).toFixed(2)}"\n\n`;

      // Section 6: Tax Periods (Quarterly Submissions)
      csv += "=== TAX PERIODS ===\n";
      csv += "Tax Year,Quarter,Start Date,End Date,Status,Income (£),Expenses (£),Submitted At,HMRC Receipt\n";
      data.taxPeriods.forEach(p => {
        csv += `"${p.tax_year}/${p.tax_year + 1}","Q${p.quarter_number}","${p.start_date}","${p.end_date}","${p.status}","${Number(p.total_income || 0).toFixed(2)}","${Number(p.total_expenses || 0).toFixed(2)}","${p.submitted_at || ''}","${p.hmrc_receipt_id || ''}"\n`;
      });
      csv += "\n";

      // Section 7: VAT Submissions
      csv += "=== VAT SUBMISSIONS (DIGITAL LINK) ===\n";
      csv += "Period Key,VAT Due Sales (£),VAT Due Acquisitions (£),Total VAT Due (£),VAT Reclaimed (£),Net VAT Due (£),Sales Ex VAT (£),Purchases Ex VAT (£),Goods Supplied Ex VAT (£),Acquisitions Ex VAT (£),Submitted At\n";
      data.vatSubmissions.forEach(v => {
        csv += `"${v.period_key}","${Number(v.vat_due_sales).toFixed(2)}","${Number(v.vat_due_acquisitions).toFixed(2)}","${Number(v.total_vat_due).toFixed(2)}","${Number(v.vat_reclaimed_curr_period).toFixed(2)}","${Number(v.net_vat_due).toFixed(2)}","${Number(v.total_value_sales_ex_vat).toFixed(2)}","${Number(v.total_value_purchases_ex_vat).toFixed(2)}","${Number(v.total_value_goods_supplied_ex_vat).toFixed(2)}","${Number(v.total_acquisitions_ex_vat).toFixed(2)}","${v.submitted_at || ''}"\n`;
      });
      csv += "\n";

      // Section 8: Period Amendments (Audit Trail)
      csv += "=== AMENDMENT HISTORY (AUDIT TRAIL) ===\n";
      csv += "Tax Period ID,Amendment Type,Reason,Previous Income (£),New Income (£),Income Difference (£),Previous Expenses (£),New Expenses (£),Expenses Difference (£),Created At,Submitted At\n";
      data.periodAmendments.forEach(a => {
        csv += `"${a.tax_period_id}","${a.amendment_type}","${(a.reason || '').replace(/"/g, '""')}","${Number(a.previous_income || 0).toFixed(2)}","${Number(a.new_income || 0).toFixed(2)}","${Number(a.income_difference || 0).toFixed(2)}","${Number(a.previous_expenses || 0).toFixed(2)}","${Number(a.new_expenses || 0).toFixed(2)}","${Number(a.expenses_difference || 0).toFixed(2)}","${a.created_at}","${a.submitted_at || ''}"\n`;
      });
      csv += "\n";

      // Footer with export metadata
      csv += "=== EXPORT METADATA ===\n";
      csv += `Export Date:,"${format(new Date(), 'PPpp')}"\n`;
      csv += `Records Exported:,"Income: ${data.incomeTransactions.length}, Expenses: ${data.expenseTransactions.length}, Mileage: ${data.mileageTrips.length}, Home Office: ${data.homeOfficeClaims.length}"\n`;
      csv += `HMRC Compliance Note:,"This export contains digital records as required by Making Tax Digital. Retain for minimum 5 years after the 31 January submission deadline."\n`;

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-records-complete-${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Complete tax records exported successfully!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export data. Please try again.");
    }
  };

  const exportToPDF = async () => {
    try {
      const data = await fetchAllData();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      const addPage = () => {
        doc.addPage();
        y = 20;
      };

      const checkPageBreak = (needed: number) => {
        if (y + needed > 270) addPage();
      };

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Complete Tax Records Export', margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, margin, y);
      y += 6;
      if (data.profile.business_name) {
        doc.text(`Business: ${data.profile.business_name}`, margin, y);
        y += 6;
      }
      if (data.profile.vat_number) {
        doc.text(`VAT Number: ${data.profile.vat_number}`, margin, y);
        y += 6;
      }
      y += 10;

      // Compliance notice
      doc.setFillColor(255, 248, 220);
      doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F');
      doc.setFontSize(8);
      doc.text('HMRC COMPLIANCE: These digital records must be retained for a minimum of 5 years after', margin + 2, y + 5);
      doc.text('the 31 January submission deadline as required by Making Tax Digital regulations.', margin + 2, y + 10);
      y += 22;

      // Summary Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', margin, y);
      y += 8;

      const totalIncome = data.incomeTransactions.reduce((s, t) => s + Number(t.amount), 0);
      const totalExpenses = data.expenseTransactions.reduce((s, t) => s + Number(t.amount), 0);
      const totalMileage = data.mileageTrips.filter(t => t.trip_type === 'business').reduce((s, t) => s + Number(t.calculated_deduction), 0);
      const totalHomeOffice = data.homeOfficeClaims.reduce((s, c) => s + Number(c.calculated_deduction), 0);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryItems = [
        [`Total Income:`, `£${totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`],
        [`Total Expenses:`, `£${totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`],
        [`Mileage Deductions:`, `£${totalMileage.toFixed(2)}`],
        [`Home Office Deductions:`, `£${totalHomeOffice.toFixed(2)}`],
        [`Net Profit:`, `£${(totalIncome - totalExpenses - totalMileage - totalHomeOffice).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`],
      ];

      summaryItems.forEach(([label, value]) => {
        doc.text(label, margin, y);
        doc.text(value, pageWidth - margin - 30, y);
        y += 6;
      });
      y += 10;

      // Record Counts
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Record Counts', margin, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Income Transactions: ${data.incomeTransactions.length}`, margin, y);
      y += 5;
      doc.text(`Expense Transactions: ${data.expenseTransactions.length}`, margin, y);
      y += 5;
      doc.text(`Mileage Trips: ${data.mileageTrips.length}`, margin, y);
      y += 5;
      doc.text(`Home Office Claims: ${data.homeOfficeClaims.length}`, margin, y);
      y += 5;
      doc.text(`Tax Period Submissions: ${data.taxPeriods.filter(p => p.status !== 'draft').length}`, margin, y);
      y += 5;
      doc.text(`VAT Submissions: ${data.vatSubmissions.length}`, margin, y);
      y += 5;
      doc.text(`Amendments/Corrections: ${data.periodAmendments.length}`, margin, y);
      y += 15;

      // Tax Periods Summary
      checkPageBreak(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tax Period Submissions', margin, y);
      y += 8;

      if (data.taxPeriods.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Period', margin, y);
        doc.text('Status', margin + 35, y);
        doc.text('Income', margin + 60, y);
        doc.text('Expenses', margin + 85, y);
        doc.text('Submitted', margin + 115, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        data.taxPeriods.slice(0, 20).forEach(p => {
          checkPageBreak(6);
          doc.text(`Q${p.quarter_number} ${p.tax_year}/${(p.tax_year + 1).toString().slice(-2)}`, margin, y);
          doc.text(p.status, margin + 35, y);
          doc.text(`£${Number(p.total_income || 0).toFixed(0)}`, margin + 60, y);
          doc.text(`£${Number(p.total_expenses || 0).toFixed(0)}`, margin + 85, y);
          doc.text(p.submitted_at ? format(new Date(p.submitted_at), 'dd/MM/yy') : '-', margin + 115, y);
          y += 5;
        });
      } else {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('No tax periods recorded', margin, y);
        y += 6;
      }
      y += 10;

      // Amendment History (Audit Trail)
      if (data.periodAmendments.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Amendment History (Audit Trail)', margin, y);
        y += 8;

        doc.setFontSize(8);
        data.periodAmendments.slice(0, 10).forEach(a => {
          checkPageBreak(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${a.amendment_type} - ${format(new Date(a.created_at), 'dd/MM/yyyy')}`, margin, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.text(`Reason: ${a.reason || 'No reason provided'}`, margin + 5, y);
          y += 4;
          doc.text(`Income: £${Number(a.previous_income || 0).toFixed(2)} → £${Number(a.new_income || 0).toFixed(2)} | Expenses: £${Number(a.previous_expenses || 0).toFixed(2)} → £${Number(a.new_expenses || 0).toFixed(2)}`, margin + 5, y);
          y += 6;
        });
      }

      // Footer on last page
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('This document is for tax record keeping purposes. For detailed transaction data, export to CSV format.', margin, 280);

      // Save PDF
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
      doc.save(`tax-records-summary-${timestamp}.pdf`);

      toast.success("PDF summary exported successfully!");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  return {
    exportToCSV,
    exportToPDF,
  };
};
