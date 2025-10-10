-- Create transaction_rules table
CREATE TABLE public.transaction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_pattern TEXT NOT NULL,
  description_pattern TEXT,
  action TEXT NOT NULL CHECK (action IN ('income', 'expense', 'ignore')),
  vat_rate NUMERIC DEFAULT 20.00,
  confidence_level TEXT DEFAULT 'user_defined',
  times_applied INTEGER DEFAULT 0,
  last_applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enabled BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.transaction_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own rules"
ON public.transaction_rules
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rules"
ON public.transaction_rules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rules"
ON public.transaction_rules
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rules"
ON public.transaction_rules
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_transaction_rules_user_id ON public.transaction_rules(user_id);
CREATE INDEX idx_transaction_rules_enabled ON public.transaction_rules(enabled) WHERE enabled = true;