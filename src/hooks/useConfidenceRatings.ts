import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConfidenceRating {
  id: string;
  user_id: string;
  action_type: string;
  confidence_level: number;
  was_correct: boolean | null;
  context_data: any;
  created_at: string;
}

interface ConfidenceStats {
  totalRatings: number;
  averageConfidence: number;
  accuracyRate: number;
  improvementRate: number;
  lastMonthAccuracy: number;
}

export const useConfidenceRatings = () => {
  const queryClient = useQueryClient();

  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ["confidence-ratings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_confidence_ratings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ConfidenceRating[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["confidence-stats", ratings.length],
    queryFn: () => {
      if (ratings.length === 0) {
        return {
          totalRatings: 0,
          averageConfidence: 0,
          accuracyRate: 0,
          improvementRate: 0,
          lastMonthAccuracy: 0,
        };
      }

      const ratingsWithCorrectness = ratings.filter(r => r.was_correct !== null);
      const totalRatings = ratingsWithCorrectness.length;
      
      if (totalRatings === 0) {
        return {
          totalRatings: 0,
          averageConfidence: 0,
          accuracyRate: 0,
          improvementRate: 0,
          lastMonthAccuracy: 0,
        };
      }

      const averageConfidence = ratings.reduce((sum, r) => sum + r.confidence_level, 0) / ratings.length;
      const correctRatings = ratingsWithCorrectness.filter(r => r.was_correct).length;
      const accuracyRate = (correctRatings / totalRatings) * 100;

      // Calculate last month accuracy
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const lastMonthRatings = ratingsWithCorrectness.filter(
        r => new Date(r.created_at) >= oneMonthAgo
      );
      const lastMonthCorrect = lastMonthRatings.filter(r => r.was_correct).length;
      const lastMonthAccuracy = lastMonthRatings.length > 0 
        ? (lastMonthCorrect / lastMonthRatings.length) * 100 
        : accuracyRate;

      const improvementRate = lastMonthAccuracy - accuracyRate;

      return {
        totalRatings,
        averageConfidence: Math.round(averageConfidence * 10) / 10,
        accuracyRate: Math.round(accuracyRate),
        improvementRate: Math.round(improvementRate),
        lastMonthAccuracy: Math.round(lastMonthAccuracy),
      };
    },
    enabled: ratings.length > 0,
  });

  const addRating = useMutation({
    mutationFn: async ({
      actionType,
      confidenceLevel,
      contextData,
    }: {
      actionType: string;
      confidenceLevel: number;
      contextData?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_confidence_ratings")
        .insert({
          user_id: user.id,
          action_type: actionType,
          confidence_level: confidenceLevel,
          context_data: contextData,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ConfidenceRating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confidence-ratings"] });
    },
  });

  const updateRatingCorrectness = useMutation({
    mutationFn: async ({
      ratingId,
      wasCorrect,
    }: {
      ratingId: string;
      wasCorrect: boolean;
    }) => {
      const { error } = await supabase
        .from("user_confidence_ratings")
        .update({ was_correct: wasCorrect })
        .eq("id", ratingId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["confidence-ratings"] });
      
      // Show encouraging message based on correctness
      if (variables.wasCorrect) {
        toast.success("Great self-awareness! 🎯", {
          description: "You knew what you knew. That's a valuable skill!",
        });
      } else {
        toast("Learning moment! 💡", {
          description: "Recognizing knowledge gaps helps you grow.",
        });
      }
    },
  });

  return {
    ratings,
    stats: stats || {
      totalRatings: 0,
      averageConfidence: 0,
      accuracyRate: 0,
      improvementRate: 0,
      lastMonthAccuracy: 0,
    },
    isLoading,
    addRating: addRating.mutate,
    updateRatingCorrectness: updateRatingCorrectness.mutate,
    isAddingRating: addRating.isPending,
  };
};
