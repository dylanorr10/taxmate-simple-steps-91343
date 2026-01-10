-- Create table for tax adjustments (capital allowances, accruals, prepayments)
CREATE TABLE public.tax_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('capital_allowance', 'accrual', 'prepayment', 'depreciation', 'private_use', 'disallowable', 'other')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_addition BOOLEAN NOT NULL DEFAULT false,
  asset_name TEXT,
  asset_value NUMERIC,
  asset_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for End of Period Statements
CREATE TABLE public.eops_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'amended')),
  
  -- Financial summary
  total_income NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  total_adjustments NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  
  -- Tax calculation
  personal_allowance NUMERIC DEFAULT 12570,
  taxable_profit NUMERIC NOT NULL DEFAULT 0,
  tax_due NUMERIC NOT NULL DEFAULT 0,
  
  -- Declarations
  accounts_finalised BOOLEAN DEFAULT false,
  all_income_declared BOOLEAN DEFAULT false,
  all_expenses_claimed BOOLEAN DEFAULT false,
  adjustments_reviewed BOOLEAN DEFAULT false,
  
  -- Submission details
  submitted_at TIMESTAMP WITH TIME ZONE,
  hmrc_submission_id TEXT,
  submission_receipt TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, tax_year)
);

-- Enable RLS
ALTER TABLE public.tax_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eops_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_adjustments
CREATE POLICY "Users can view their own tax adjustments" 
ON public.tax_adjustments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax adjustments" 
ON public.tax_adjustments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax adjustments" 
ON public.tax_adjustments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax adjustments" 
ON public.tax_adjustments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for eops_submissions
CREATE POLICY "Users can view their own EOPS" 
ON public.eops_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own EOPS" 
ON public.eops_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own EOPS" 
ON public.eops_submissions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_tax_adjustments_updated_at
BEFORE UPDATE ON public.tax_adjustments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eops_submissions_updated_at
BEFORE UPDATE ON public.eops_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();