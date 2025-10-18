-- Add profile_complete and demo_mode flags to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS demo_mode boolean DEFAULT false;