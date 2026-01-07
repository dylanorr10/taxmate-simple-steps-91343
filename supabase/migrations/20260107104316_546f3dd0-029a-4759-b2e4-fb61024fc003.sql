-- Create mileage_trips table for MTD record keeping
CREATE TABLE public.mileage_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  distance_miles DECIMAL(10,2) NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('business', 'personal')),
  origin TEXT,
  destination TEXT,
  purpose TEXT,
  -- HMRC simplified expense calculation
  -- First 10,000 miles: 45p/mile, thereafter: 25p/mile
  calculated_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Link to tax period for quarterly reporting
  tax_period_id UUID REFERENCES public.tax_periods(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX idx_mileage_trips_user_id ON public.mileage_trips(user_id);
CREATE INDEX idx_mileage_trips_date ON public.mileage_trips(trip_date);
CREATE INDEX idx_mileage_trips_type ON public.mileage_trips(trip_type);

-- Enable RLS
ALTER TABLE public.mileage_trips ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own mileage trips"
ON public.mileage_trips FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mileage trips"
ON public.mileage_trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mileage trips"
ON public.mileage_trips FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mileage trips"
ON public.mileage_trips FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_mileage_trips_updated_at
BEFORE UPDATE ON public.mileage_trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();