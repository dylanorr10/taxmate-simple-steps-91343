-- Create OAuth states table for HMRC OAuth flow
CREATE TABLE public.hmrc_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hmrc_oauth_states ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own oauth states"
  ON public.hmrc_oauth_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own oauth states"
  ON public.hmrc_oauth_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth states"
  ON public.hmrc_oauth_states FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all states (for edge function)
CREATE POLICY "Service role can manage all oauth states"
  ON public.hmrc_oauth_states
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');