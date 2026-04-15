
-- Add vehicle_type and delivery_platforms to profiles
ALTER TABLE public.profiles 
ADD COLUMN vehicle_type text,
ADD COLUMN delivery_platforms text[] DEFAULT '{}';

-- Add platform field to mileage_trips for per-platform tracking
ALTER TABLE public.mileage_trips 
ADD COLUMN platform text;
