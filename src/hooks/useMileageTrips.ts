import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MileageTrip {
  id: string;
  user_id: string;
  trip_date: string;
  distance_miles: number;
  trip_type: 'business' | 'personal';
  origin: string | null;
  destination: string | null;
  purpose: string | null;
  calculated_deduction: number;
  tax_period_id: string | null;
  created_at: string;
  updated_at: string;
}

// HMRC Simplified Expense Rates
const HMRC_RATE_FIRST_10K = 0.45; // 45p per mile for first 10,000 miles
const HMRC_RATE_AFTER_10K = 0.25; // 25p per mile after 10,000 miles
const THRESHOLD_MILES = 10000;

export const calculateDeduction = (distanceMiles: number, ytdBusinessMiles: number): number => {
  // Only business miles get deductions
  const milesBeforeThreshold = Math.max(0, THRESHOLD_MILES - ytdBusinessMiles);
  
  if (milesBeforeThreshold >= distanceMiles) {
    // All miles at 45p rate
    return distanceMiles * HMRC_RATE_FIRST_10K;
  } else if (milesBeforeThreshold > 0) {
    // Split between rates
    const milesAt45p = milesBeforeThreshold;
    const milesAt25p = distanceMiles - milesBeforeThreshold;
    return (milesAt45p * HMRC_RATE_FIRST_10K) + (milesAt25p * HMRC_RATE_AFTER_10K);
  } else {
    // All miles at 25p rate
    return distanceMiles * HMRC_RATE_AFTER_10K;
  }
};

export const useMileageTrips = () => {
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["mileage-trips"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("mileage_trips")
        .select("*")
        .eq("user_id", user.id)
        .order("trip_date", { ascending: false });

      if (error) throw error;
      return data as MileageTrip[];
    },
  });

  // Calculate year-to-date business miles for HMRC rate calculation
  const ytdBusinessMiles = trips
    .filter(t => {
      const tripDate = new Date(t.trip_date);
      const now = new Date();
      const taxYearStart = now.getMonth() >= 3 
        ? new Date(now.getFullYear(), 3, 6) // April 6th this year
        : new Date(now.getFullYear() - 1, 3, 6); // April 6th last year
      return t.trip_type === 'business' && tripDate >= taxYearStart;
    })
    .reduce((sum, t) => sum + Number(t.distance_miles), 0);

  const addTrip = useMutation({
    mutationFn: async (trip: {
      trip_date?: string;
      distance_miles: number;
      trip_type: 'business' | 'personal';
      origin?: string;
      destination?: string;
      purpose?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate deduction based on HMRC rates
      const deduction = trip.trip_type === 'business' 
        ? calculateDeduction(trip.distance_miles, ytdBusinessMiles)
        : 0;

      const { data, error } = await supabase
        .from("mileage_trips")
        .insert({
          user_id: user.id,
          trip_date: trip.trip_date || new Date().toISOString().split('T')[0],
          distance_miles: trip.distance_miles,
          trip_type: trip.trip_type,
          origin: trip.origin || null,
          destination: trip.destination || null,
          purpose: trip.purpose || null,
          calculated_deduction: deduction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mileage-trips"] });
      const deductionMsg = data.trip_type === 'business' 
        ? ` (£${Number(data.calculated_deduction).toFixed(2)} deduction)`
        : '';
      toast.success(`Trip saved: ${data.distance_miles} miles${deductionMsg}`);
    },
    onError: (error) => {
      toast.error(`Failed to save trip: ${error.message}`);
    },
  });

  const deleteTrip = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("mileage_trips")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-trips"] });
      toast.success("Trip deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete trip: ${error.message}`);
    },
  });

  const updateTrip = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MileageTrip> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Recalculate deduction if distance or type changed
      let calculatedDeduction = updates.calculated_deduction;
      if (updates.distance_miles !== undefined || updates.trip_type !== undefined) {
        const currentTrip = trips.find(t => t.id === id);
        const newDistance = updates.distance_miles ?? currentTrip?.distance_miles ?? 0;
        const newType = updates.trip_type ?? currentTrip?.trip_type ?? 'personal';
        calculatedDeduction = newType === 'business' 
          ? calculateDeduction(newDistance, ytdBusinessMiles)
          : 0;
      }

      const { data, error } = await supabase
        .from("mileage_trips")
        .update({ ...updates, calculated_deduction: calculatedDeduction })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-trips"] });
      toast.success("Trip updated");
    },
    onError: (error) => {
      toast.error(`Failed to update trip: ${error.message}`);
    },
  });

  // Statistics
  const totalMiles = trips.reduce((sum, t) => sum + Number(t.distance_miles), 0);
  const businessMiles = trips
    .filter(t => t.trip_type === 'business')
    .reduce((sum, t) => sum + Number(t.distance_miles), 0);
  const totalDeductions = trips
    .filter(t => t.trip_type === 'business')
    .reduce((sum, t) => sum + Number(t.calculated_deduction), 0);
  
  const thisMonthMiles = trips
    .filter(t => {
      const tripDate = new Date(t.trip_date);
      const now = new Date();
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.distance_miles), 0);

  // HMRC rate info
  const currentRate = ytdBusinessMiles >= THRESHOLD_MILES ? HMRC_RATE_AFTER_10K : HMRC_RATE_FIRST_10K;
  const milesUntilRateChange = Math.max(0, THRESHOLD_MILES - ytdBusinessMiles);

  return {
    trips,
    isLoading,
    addTrip: addTrip.mutate,
    isAdding: addTrip.isPending,
    deleteTrip: deleteTrip.mutate,
    isDeleting: deleteTrip.isPending,
    updateTrip: updateTrip.mutate,
    isUpdating: updateTrip.isPending,
    // Statistics
    totalMiles,
    businessMiles,
    totalDeductions,
    thisMonthMiles,
    ytdBusinessMiles,
    currentRate,
    milesUntilRateChange,
    HMRC_RATE_FIRST_10K,
    HMRC_RATE_AFTER_10K,
    THRESHOLD_MILES,
  };
};
