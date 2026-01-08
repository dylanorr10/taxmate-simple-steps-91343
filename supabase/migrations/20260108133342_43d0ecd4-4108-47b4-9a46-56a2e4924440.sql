-- Add simplified expenses preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mileage_method text DEFAULT 'simplified' CHECK (mileage_method IN ('simplified', 'actual')),
ADD COLUMN IF NOT EXISTS home_office_method text DEFAULT 'simplified' CHECK (home_office_method IN ('simplified', 'actual'));

-- Create home office claims table for monthly tracking
CREATE TABLE public.home_office_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  claim_month DATE NOT NULL, -- First day of the month
  hours_worked INTEGER NOT NULL DEFAULT 0, -- Monthly hours worked from home
  method text NOT NULL DEFAULT 'simplified' CHECK (method IN ('simplified', 'actual')),
  -- Simplified method fields
  flat_rate_amount DECIMAL(10,2), -- HMRC flat rate: £10, £18, or £26
  -- Actual method fields (for future)
  actual_costs DECIMAL(10,2),
  business_use_percent INTEGER DEFAULT 100,
  calculated_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  tax_period_id UUID REFERENCES public.tax_periods(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_month UNIQUE (user_id, claim_month)
);

-- Enable RLS
ALTER TABLE public.home_office_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own home office claims" 
ON public.home_office_claims FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own home office claims" 
ON public.home_office_claims FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own home office claims" 
ON public.home_office_claims FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own home office claims" 
ON public.home_office_claims FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_home_office_claims_updated_at
BEFORE UPDATE ON public.home_office_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();