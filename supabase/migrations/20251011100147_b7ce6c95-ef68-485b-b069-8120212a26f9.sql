-- Create table to track user learning progress
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0,
  saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own learning progress"
  ON public.user_learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress"
  ON public.user_learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress"
  ON public.user_learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table to track daily tips shown to users
CREATE TABLE IF NOT EXISTS public.daily_tips_shown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tip_id TEXT NOT NULL,
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dismissed BOOLEAN DEFAULT false,
  opened_full_lesson BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.daily_tips_shown ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own daily tips"
  ON public.daily_tips_shown FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily tips"
  ON public.daily_tips_shown FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tips"
  ON public.daily_tips_shown FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table to track tooltip interactions
CREATE TABLE IF NOT EXISTS public.tooltip_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tooltip_id TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tooltip_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tooltip interactions"
  ON public.tooltip_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tooltip interactions"
  ON public.tooltip_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX idx_learning_progress_lesson_id ON public.user_learning_progress(lesson_id);
CREATE INDEX idx_daily_tips_user_id ON public.daily_tips_shown(user_id);
CREATE INDEX idx_daily_tips_shown_at ON public.daily_tips_shown(shown_at);
CREATE INDEX idx_tooltip_interactions_user_id ON public.tooltip_interactions(user_id);