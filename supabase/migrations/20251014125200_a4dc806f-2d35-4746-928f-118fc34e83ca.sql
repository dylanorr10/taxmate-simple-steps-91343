-- Add business context columns to profiles table
ALTER TABLE profiles ADD COLUMN business_type TEXT;
ALTER TABLE profiles ADD COLUMN vat_registered BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced'));

-- Add tracking columns to user_learning_progress
ALTER TABLE user_learning_progress ADD COLUMN source TEXT;
ALTER TABLE user_learning_progress ADD COLUMN completion_rate NUMERIC;