-- Create learning_paths table for different tracks
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'primary',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  lesson_ids UUID[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Paths are publicly readable
CREATE POLICY "Learning paths are publicly readable" 
ON public.learning_paths 
FOR SELECT 
USING (true);

-- Create user_path_progress table
CREATE TABLE public.user_path_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_lesson_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, path_id)
);

-- Enable RLS
ALTER TABLE public.user_path_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own path progress" 
ON public.user_path_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own path progress" 
ON public.user_path_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own path progress" 
ON public.user_path_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own path progress" 
ON public.user_path_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_learning_paths_updated_at
BEFORE UPDATE ON public.learning_paths
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_path_progress_updated_at
BEFORE UPDATE ON public.user_path_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();