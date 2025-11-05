import { supabase } from "@/integrations/supabase/client";
import { addMonths, subMonths, startOfMonth, addDays } from "date-fns";

export const generateDemoData = async (userId: string, businessType: string) => {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 2); // Changed to 2 to include current month
  
  // Generate income transactions (2-4 per month, realistic amounts with invoice data)
  const incomeTransactions = [];
  let invoiceCounter = 1;
  
  // Payment status distribution: 60% paid, 20% pending, 20% overdue
  const statusDistribution = ['paid', 'paid', 'paid', 'pending', 'overdue'];
  
  // Generate for 3 months including current month (November)
  for (let i = 0; i < 3; i++) {
    const monthStart = addMonths(threeMonthsAgo, i);
    const transactionsThisMonth = 2 + Math.floor(Math.random() * 3); // 2-4 transactions
    
    for (let j = 0; j < transactionsThisMonth; j++) {
      const amount = businessType === 'trades' 
        ? 800 + Math.random() * 2200 // £800-£3000 for trades
        : businessType === 'transport'
        ? 400 + Math.random() * 800 // £400-£1200 for transport
        : 1000 + Math.random() * 4000; // £1000-£5000 for others
      
      const transactionDate = addDays(monthStart, 5 + j * 7);
      const clientData = getClientData(businessType, j);
      const paymentStatus = statusDistribution[j % statusDistribution.length];
      
      // Calculate due date based on payment status
      let dueDate: Date;
      if (paymentStatus === 'paid') {
        dueDate = addDays(transactionDate, 30); // 30 days payment terms
      } else if (paymentStatus === 'pending') {
        dueDate = addDays(today, 7 + Math.floor(Math.random() * 7)); // 7-14 days in future
      } else {
        // Overdue - create specific scenarios for testing
        if (invoiceCounter === 1) {
          dueDate = addDays(today, -3); // 3 days overdue (gentle)
        } else if (invoiceCounter === 2) {
          dueDate = addDays(today, -12); // 12 days overdue (firm)
        } else if (invoiceCounter === 3) {
          dueDate = addDays(today, -35); // 35 days overdue (final)
        } else {
          dueDate = addDays(today, -(5 + Math.floor(Math.random() * 25))); // 5-30 days ago
        }
      }
      
      incomeTransactions.push({
        user_id: userId,
        amount: Math.round(amount * 100) / 100,
        description: getIncomeDescription(businessType, j),
        transaction_date: transactionDate.toISOString().split('T')[0],
        vat_rate: 20.00,
        client_name: clientData.name,
        client_email: clientData.email,
        invoice_number: `INV-${String(invoiceCounter).padStart(3, '0')}`,
        due_date: dueDate.toISOString().split('T')[0],
        payment_status: paymentStatus
      });
      
      invoiceCounter++;
    }
  }
  
  // Generate expense transactions (5-8 per month, varied categories)
  const expenseTransactions = [];
  // Generate for 3 months including current month (November)
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

const getClientData = (businessType: string, index: number): { name: string; email: string } => {
  const clients = {
    trades: [
      { name: 'Riverside Property Management', email: 'accounts@riverside-pm.co.uk' },
      { name: 'Green Valley Homes', email: 'billing@greenvalley.com' },
      { name: 'Oak Construction Ltd', email: 'finance@oakconstruction.co.uk' },
      { name: 'Premier Estates', email: 'payments@premierestates.com' }
    ],
    creative: [
      { name: 'StartupCo', email: 'billing@startupco.io' },
      { name: 'Digital Dynamics Agency', email: 'accounts@digitaldynamics.com' },
      { name: 'Brand Builders Ltd', email: 'finance@brandbuilders.co.uk' },
      { name: 'Creative Solutions', email: 'payments@creativesolutions.com' }
    ],
    professional: [
      { name: 'Johnson & Associates', email: 'accounts@johnson-assoc.co.uk' },
      { name: 'Riverside Consulting', email: 'billing@riversideconsult.com' },
      { name: 'Summit Advisory Group', email: 'finance@summitadvisory.co.uk' },
      { name: 'Nexus Professional Services', email: 'payments@nexuspro.com' }
    ],
    health: [
      { name: 'Wellness Studio', email: 'admin@wellnessstudio.co.uk' },
      { name: 'Peak Performance Gym', email: 'accounts@peakperformance.com' },
      { name: 'Vitality Health Center', email: 'billing@vitalityhealth.co.uk' },
      { name: 'Active Life Sports', email: 'finance@activelifesports.com' }
    ],
    transport: [
      { name: 'Swift Logistics', email: 'accounts@swiftlogistics.co.uk' },
      { name: 'Metro Deliveries Ltd', email: 'billing@metrodeliveries.com' },
      { name: 'Express Courier Services', email: 'finance@expresscourier.co.uk' },
      { name: 'Prime Transport Group', email: 'payments@primetransport.com' }
    ],
    other: [
      { name: 'General Business Ltd', email: 'accounts@generalbiz.co.uk' },
      { name: 'Professional Services Inc', email: 'billing@profservices.com' },
      { name: 'Enterprise Solutions', email: 'finance@enterprisesolutions.co.uk' },
      { name: 'Business Partners Group', email: 'payments@bizpartners.com' }
    ]
  };
  
  const options = clients[businessType as keyof typeof clients] || clients.other;
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
