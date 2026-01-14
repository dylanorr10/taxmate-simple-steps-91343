import { useMemo } from "react";
import { Transaction } from "./useTransactions";

export interface VATBoxes {
  box1: number; // VAT due on sales
  box2: number; // VAT due on acquisitions
  box3: number; // Total VAT due (box1 + box2)
  box4: number; // VAT reclaimed on purchases
  box5: number; // Net VAT due (box3 - box4)
  box6: number; // Total value of sales (excl VAT)
  box7: number; // Total value of purchases (excl VAT)
  box8: number; // Total value of goods supplied (excl VAT)
  box9: number; // Total value of acquisitions (excl VAT)
}

export interface VATCalculationResult {
  boxes: VATBoxes;
  tasks: string[];
  hasErrors: boolean;
  mtdReadiness: number;
}

export interface MTDComplianceFactors {
  hasMileageTrips: boolean;
  allQuartersSubmittedOnTime: boolean;
  hasYearEndAdjustments: boolean;
}

export const useVATCalculations = (
  incomeTransactions: Transaction[],
  expenseTransactions: Transaction[],
  hasHMRCConnection: boolean,
  hasVATNumber: boolean,
  hasBusinessName: boolean,
  complianceFactors?: MTDComplianceFactors
): VATCalculationResult => {
  return useMemo(() => {
    // Calculate VAT Box 1: VAT due on sales
    const box1 = incomeTransactions.reduce((sum, t) => {
      const vatAmount = (Number(t.amount) * Number(t.vat_rate)) / (100 + Number(t.vat_rate));
      return sum + vatAmount;
    }, 0);

    // Calculate VAT Box 4: VAT reclaimed on purchases
    const box4 = expenseTransactions.reduce((sum, t) => {
      const vatAmount = (Number(t.amount) * Number(t.vat_rate)) / (100 + Number(t.vat_rate));
      return sum + vatAmount;
    }, 0);

    // Box 2: VAT due on acquisitions (typically 0 for most businesses)
    const box2 = 0;

    // Box 3: Total VAT due
    const box3 = box1 + box2;

    // Box 5: Net VAT due
    const box5 = box3 - box4;

    // Box 6: Total value of sales excluding VAT
    const box6 = incomeTransactions.reduce((sum, t) => {
      const netAmount = Number(t.amount) / (1 + Number(t.vat_rate) / 100);
      return sum + netAmount;
    }, 0);

    // Box 7: Total value of purchases excluding VAT
    const box7 = expenseTransactions.reduce((sum, t) => {
      const netAmount = Number(t.amount) / (1 + Number(t.vat_rate) / 100);
      return sum + netAmount;
    }, 0);

    // Box 8: Total value of goods supplied excluding VAT (typically same as box6)
    const box8 = 0;

    // Box 9: Total value of acquisitions excluding VAT
    const box9 = 0;

    const boxes: VATBoxes = {
      box1: Math.round(box1 * 100) / 100,
      box2: Math.round(box2 * 100) / 100,
      box3: Math.round(box3 * 100) / 100,
      box4: Math.round(box4 * 100) / 100,
      box5: Math.round(box5 * 100) / 100,
      box6: Math.round(box6 * 100) / 100,
      box7: Math.round(box7 * 100) / 100,
      box8: Math.round(box8 * 100) / 100,
      box9: Math.round(box9 * 100) / 100,
    };

    // Calculate tasks and errors
    const tasks: string[] = [];
    
    if (!hasBusinessName) {
      tasks.push("Add your business name in Settings");
    }
    
    if (!hasVATNumber) {
      tasks.push("Add your VAT number in Settings");
    }
    
    if (!hasHMRCConnection) {
      tasks.push("Connect to HMRC in Settings");
    }
    
    if (incomeTransactions.length === 0) {
      tasks.push("Add at least one income transaction");
    }

    const hasErrors = !hasBusinessName || !hasVATNumber || !hasHMRCConnection;

    // Calculate enhanced MTD readiness score
    // New scoring breakdown (total 100%):
    // - Business name: 10%
    // - VAT number: 10%
    // - HMRC connection: 15%
    // - HMRC categories assigned to all transactions: 15%
    // - No uncategorized expenses: 10%
    // - Mileage log complete: 5%
    // - Quarterly submissions on time: 10%
    // - Year-end adjustments reviewed: 5%
    // - Has transactions: 10% each (income/expense)
    
    let mtdReadiness = 0;
    
    // Core business setup (35%)
    if (hasBusinessName) mtdReadiness += 10;
    if (hasVATNumber) mtdReadiness += 10;
    if (hasHMRCConnection) mtdReadiness += 15;
    
    // Transaction categorization (25%)
    const allTransactions = [...incomeTransactions, ...expenseTransactions];
    const allHaveHMRCCategories = allTransactions.length > 0 && 
      allTransactions.every(t => t.hmrc_category_id != null);
    if (allHaveHMRCCategories) mtdReadiness += 15;
    
    const noUncategorizedExpenses = expenseTransactions.length === 0 || 
      expenseTransactions.every(t => t.description && t.description.trim() !== '');
    if (noUncategorizedExpenses) mtdReadiness += 10;
    
    // Enhanced compliance factors (20%)
    if (complianceFactors?.hasMileageTrips) mtdReadiness += 5;
    if (complianceFactors?.allQuartersSubmittedOnTime) mtdReadiness += 10;
    if (complianceFactors?.hasYearEndAdjustments) mtdReadiness += 5;
    
    // Has transactions (10%)
    if (incomeTransactions.length > 0) mtdReadiness += 5;
    if (expenseTransactions.length > 0) mtdReadiness += 5;

    return {
      boxes,
      tasks,
      hasErrors,
      mtdReadiness,
    };
  }, [incomeTransactions, expenseTransactions, hasHMRCConnection, hasVATNumber, hasBusinessName, complianceFactors]);
};
