-- Add quarter preference and accounting basis to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS quarter_preference text DEFAULT 'calendar',
ADD COLUMN IF NOT EXISTS accounting_basis text DEFAULT 'cash';

-- Create tax_periods table for quarterly tracking
CREATE TABLE public.tax_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
  period_key TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  deadline_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'corrected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  total_income NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tax_year, quarter_number)
);

-- Enable RLS
ALTER TABLE public.tax_periods ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own tax periods"
ON public.tax_periods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax periods"
ON public.tax_periods FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax periods"
ON public.tax_periods FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax periods"
ON public.tax_periods FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tax_periods_updated_at
BEFORE UPDATE ON public.tax_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();