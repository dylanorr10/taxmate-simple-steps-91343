-- Add invoice tracking fields to income_transactions
ALTER TABLE public.income_transactions 
ADD COLUMN client_name TEXT,
ADD COLUMN client_email TEXT,
ADD COLUMN invoice_number TEXT,
ADD COLUMN due_date DATE,
ADD COLUMN payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'overdue'));

-- Create payment reminders tracking table
CREATE TABLE public.payment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  income_transaction_id UUID NOT NULL REFERENCES public.income_transactions(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('gentle', 'firm', 'final')),
  days_overdue INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_reminders
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_reminders
CREATE POLICY "Users can view their own reminders" 
ON public.payment_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" 
ON public.payment_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries on overdue invoices
CREATE INDEX idx_income_transactions_payment_status ON public.income_transactions(payment_status);
CREATE INDEX idx_income_transactions_due_date ON public.income_transactions(due_date);
CREATE INDEX idx_payment_reminders_transaction ON public.payment_reminders(income_transaction_id);