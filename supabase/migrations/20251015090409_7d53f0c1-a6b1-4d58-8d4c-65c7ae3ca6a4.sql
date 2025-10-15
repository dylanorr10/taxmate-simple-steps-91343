-- Create waitlist_signups table for landing page
CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  profession_interest TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notified BOOLEAN DEFAULT false NOT NULL,
  user_agent TEXT
);

-- Add email validation constraint
ALTER TABLE public.waitlist_signups 
ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add indexes for faster lookups
CREATE INDEX idx_waitlist_email ON public.waitlist_signups(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist_signups(created_at DESC);
CREATE INDEX idx_waitlist_notified ON public.waitlist_signups(notified) WHERE notified = false;

-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (anyone can join waitlist)
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public can SELECT count for counter (but not see emails)
CREATE POLICY "Anyone can view count"
ON public.waitlist_signups
FOR SELECT
TO anon, authenticated
USING (false);

-- Service role can view all signups
CREATE POLICY "Service role can view all signups"
ON public.waitlist_signups
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to get waitlist count (publicly accessible)
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.waitlist_signups;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_waitlist_count() TO anon, authenticated;