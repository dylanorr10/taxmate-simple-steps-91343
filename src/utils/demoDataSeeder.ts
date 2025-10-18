import { supabase } from "@/integrations/supabase/client";
import { addMonths, subMonths, startOfMonth, addDays } from "date-fns";

export const generateDemoData = async (userId: string, businessType: string) => {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  
  // Generate income transactions (2-4 per month, realistic amounts)
  const incomeTransactions = [];
  for (let i = 0; i < 3; i++) {
    const monthStart = addMonths(threeMonthsAgo, i);
    const transactionsThisMonth = 2 + Math.floor(Math.random() * 3); // 2-4 transactions
    
    for (let j = 0; j < transactionsThisMonth; j++) {
      const amount = businessType === 'trades' 
        ? 800 + Math.random() * 2200 // £800-£3000 for trades
        : businessType === 'transport'
        ? 400 + Math.random() * 800 // £400-£1200 for transport
        : 1000 + Math.random() * 4000; // £1000-£5000 for others
      
      incomeTransactions.push({
        user_id: userId,
        amount: Math.round(amount * 100) / 100,
        description: getIncomeDescription(businessType, j),
        transaction_date: addDays(monthStart, 5 + j * 7).toISOString().split('T')[0],
        vat_rate: 20.00
      });
    }
  }
  
  // Generate expense transactions (5-8 per month, varied categories)
  const expenseTransactions = [];
  for (let i = 0; i < 3; i++) {
    const monthStart = addMonths(threeMonthsAgo, i);
    const transactionsThisMonth = 5 + Math.floor(Math.random() * 4); // 5-8 transactions
    
    for (let j = 0; j < transactionsThisMonth; j++) {
      const { amount, description, vatRate } = getExpenseData(businessType, j);
      
      expenseTransactions.push({
        user_id: userId,
        amount: Math.round(amount * 100) / 100,
        description,
        transaction_date: addDays(monthStart, 2 + j * 3).toISOString().split('T')[0],
        vat_rate: vatRate
      });
    }
  }
  
  // Insert all transactions
  try {
    const { error: incomeError } = await supabase
      .from('income_transactions')
      .insert(incomeTransactions);
    
    if (incomeError) throw incomeError;
    
    const { error: expenseError } = await supabase
      .from('expense_transactions')
      .insert(expenseTransactions);
    
    if (expenseError) throw expenseError;
    
    return { success: true };
  } catch (error) {
    console.error('Error generating demo data:', error);
    return { success: false, error };
  }
};

const getIncomeDescription = (businessType: string, index: number): string => {
  const descriptions = {
    trades: ['Bathroom renovation - Client A', 'Kitchen fitting - Client B', 'Emergency callout - Residential', 'Commercial maintenance contract'],
    creative: ['Website design project', 'Brand identity package', 'Photography session', 'Video editing project'],
    professional: ['Consulting services - Month', 'Training workshop delivery', 'Project management services', 'Advisory services'],
    health: ['Personal training sessions', 'Massage therapy sessions', 'Nutrition consultation', 'Group fitness classes'],
    transport: ['Weekly deliveries', 'Airport transfers', 'Courier services', 'Multiple trips'],
    other: ['Services rendered', 'Project work', 'Contract work', 'Freelance services']
  };
  
  const options = descriptions[businessType as keyof typeof descriptions] || descriptions.other;
  return options[index % options.length];
};

const getExpenseData = (businessType: string, index: number): { amount: number; description: string; vatRate: number } => {
  const expenseTypes = [
    { amount: 45 + Math.random() * 35, description: 'Fuel', vatRate: 20.00 },
    { amount: 15 + Math.random() * 25, description: 'Office supplies', vatRate: 20.00 },
    { amount: 80 + Math.random() * 150, description: 'Equipment purchase', vatRate: 20.00 },
    { amount: 25 + Math.random() * 40, description: 'Marketing & advertising', vatRate: 20.00 },
    { amount: 30 + Math.random() * 30, description: 'Software subscription', vatRate: 20.00 },
    { amount: 50 + Math.random() * 100, description: 'Professional services', vatRate: 20.00 },
    { amount: 20 + Math.random() * 30, description: 'Phone & internet', vatRate: 20.00 },
    { amount: 100 + Math.random() * 200, description: 'Materials & supplies', vatRate: 20.00 },
  ];
  
  // Add business-specific expenses
  if (businessType === 'trades') {
    expenseTypes.push({ amount: 150 + Math.random() * 300, description: 'Building materials', vatRate: 20.00 });
    expenseTypes.push({ amount: 80 + Math.random() * 120, description: 'Tool maintenance', vatRate: 20.00 });
  } else if (businessType === 'transport') {
    expenseTypes.push({ amount: 60 + Math.random() * 80, description: 'Vehicle maintenance', vatRate: 20.00 });
    expenseTypes.push({ amount: 40 + Math.random() * 60, description: 'Vehicle insurance', vatRate: 0 });
  } else if (businessType === 'creative') {
    expenseTypes.push({ amount: 40 + Math.random() * 80, description: 'Stock photos & assets', vatRate: 20.00 });
    expenseTypes.push({ amount: 50 + Math.random() * 100, description: 'Design software', vatRate: 20.00 });
  }
  
  return expenseTypes[index % expenseTypes.length];
};
