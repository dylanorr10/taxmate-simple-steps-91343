-- Create period_amendments table to track correction history
CREATE TABLE public.period_amendments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_period_id UUID NOT NULL REFERENCES public.tax_periods(id) ON DELETE CASCADE,
  amendment_type TEXT NOT NULL CHECK (amendment_type IN ('correction', 'late_submission', 'data_update')),
  reason TEXT,
  previous_income NUMERIC NOT NULL DEFAULT 0,
  previous_expenses NUMERIC NOT NULL DEFAULT 0,
  new_income NUMERIC NOT NULL DEFAULT 0,
  new_expenses NUMERIC NOT NULL DEFAULT 0,
  income_difference NUMERIC NOT NULL DEFAULT 0,
  expenses_difference NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.period_amendments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own period amendments" 
ON public.period_amendments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own period amendments" 
ON public.period_amendments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period amendments" 
ON public.period_amendments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period amendments" 
ON public.period_amendments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_period_amendments_tax_period ON public.period_amendments(tax_period_id);
CREATE INDEX idx_period_amendments_user ON public.period_amendments(user_id);