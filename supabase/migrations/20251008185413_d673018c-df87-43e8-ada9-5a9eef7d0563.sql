-- Create TrueLayer connections table
CREATE TABLE public.truelayer_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.truelayer_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own connections"
ON public.truelayer_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
ON public.truelayer_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
ON public.truelayer_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
ON public.truelayer_connections
FOR DELETE
USING (auth.uid() = user_id);

-- Create bank transactions table
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.truelayer_connections(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  merchant_name TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bank transactions"
ON public.bank_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank transactions"
ON public.bank_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank transactions"
ON public.bank_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank transactions"
ON public.bank_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create transaction mappings table
CREATE TABLE public.transaction_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_transaction_id UUID NOT NULL REFERENCES public.bank_transactions(id) ON DELETE CASCADE,
  income_transaction_id UUID REFERENCES public.income_transactions(id) ON DELETE SET NULL,
  expense_transaction_id UUID REFERENCES public.expense_transactions(id) ON DELETE SET NULL,
  mapping_type TEXT NOT NULL CHECK (mapping_type IN ('income', 'expense', 'ignored')),
  confidence_score NUMERIC,
  user_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mappings"
ON public.transaction_mappings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bank_transactions
    WHERE bank_transactions.id = transaction_mappings.bank_transaction_id
    AND bank_transactions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own mappings"
ON public.transaction_mappings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bank_transactions
    WHERE bank_transactions.id = transaction_mappings.bank_transaction_id
    AND bank_transactions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own mappings"
ON public.transaction_mappings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bank_transactions
    WHERE bank_transactions.id = transaction_mappings.bank_transaction_id
    AND bank_transactions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own mappings"
ON public.transaction_mappings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.bank_transactions
    WHERE bank_transactions.id = transaction_mappings.bank_transaction_id
    AND bank_transactions.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_truelayer_connections_user_id ON public.truelayer_connections(user_id);
CREATE INDEX idx_bank_transactions_user_id ON public.bank_transactions(user_id);
CREATE INDEX idx_bank_transactions_connection_id ON public.bank_transactions(connection_id);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions(status);
CREATE INDEX idx_transaction_mappings_bank_transaction_id ON public.transaction_mappings(bank_transaction_id);

-- Create trigger for updating updated_at on truelayer_connections
CREATE TRIGGER update_truelayer_connections_updated_at
BEFORE UPDATE ON public.truelayer_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();