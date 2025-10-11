-- Create table for tracking user confidence ratings
CREATE TABLE IF NOT EXISTS public.user_confidence_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'transaction_category', 'vat_rate', 'rule_creation'
  confidence_level INTEGER NOT NULL CHECK (confidence_level >= 1 AND confidence_level <= 5),
  was_correct BOOLEAN,
  context_data JSONB, -- Store additional context like amount, category, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_confidence_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view their own confidence ratings
CREATE POLICY "Users can view their own confidence ratings"
  ON public.user_confidence_ratings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own confidence ratings
CREATE POLICY "Users can insert their own confidence ratings"
  ON public.user_confidence_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own confidence ratings
CREATE POLICY "Users can update their own confidence ratings"
  ON public.user_confidence_ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_confidence_ratings_user_date 
  ON public.user_confidence_ratings(user_id, created_at DESC);

CREATE INDEX idx_confidence_ratings_action 
  ON public.user_confidence_ratings(user_id, action_type);