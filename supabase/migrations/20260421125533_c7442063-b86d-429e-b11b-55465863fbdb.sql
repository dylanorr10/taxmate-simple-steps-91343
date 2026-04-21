-- 1. Storage bucket for handoff packs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('handoff-packs', 'handoff-packs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only read their own files (path: {user_id}/{filename})
CREATE POLICY "Users can read their own handoff packs"
ON storage.objects FOR SELECT
USING (bucket_id = 'handoff-packs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service role can write handoff packs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'handoff-packs');

-- 2. Audit table for handoff exports
CREATE TABLE public.handoff_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  transaction_count INTEGER DEFAULT 0,
  receipt_count INTEGER DEFAULT 0,
  health_score INTEGER,
  expires_at TIMESTAMPTZ NOT NULL,
  sent_to_email TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handoff_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own handoff exports"
ON public.handoff_exports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own handoff exports"
ON public.handoff_exports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own handoff exports"
ON public.handoff_exports FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_handoff_exports_user_id ON public.handoff_exports(user_id);
CREATE INDEX idx_handoff_exports_created_at ON public.handoff_exports(created_at DESC);

CREATE TRIGGER update_handoff_exports_updated_at
BEFORE UPDATE ON public.handoff_exports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Period close lock: track when a tax period was last handed off
ALTER TABLE public.tax_periods
ADD COLUMN IF NOT EXISTS handoff_sent_at TIMESTAMPTZ;