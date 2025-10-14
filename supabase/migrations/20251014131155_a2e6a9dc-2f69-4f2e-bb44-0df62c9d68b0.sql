-- Add navigation items preference to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nav_items JSONB DEFAULT '["dashboard", "log", "mileage", "learn"]'::jsonb;