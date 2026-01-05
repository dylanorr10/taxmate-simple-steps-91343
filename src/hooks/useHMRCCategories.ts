import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HMRCCategory {
  id: string;
  code: string;
  display_name: string;
  type: 'income' | 'expense';
  description: string | null;
  icon: string | null;
  order_index: number;
}

export const useHMRCCategories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["hmrc-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hmrc_categories")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as HMRCCategory[];
    },
    staleTime: Infinity, // Categories are static reference data
  });

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const getCategoryById = (id: string | null) => {
    if (!id) return null;
    return categories.find(c => c.id === id) || null;
  };

  const getCategoryByCode = (code: string) => {
    return categories.find(c => c.code === code) || null;
  };

  return {
    categories,
    expenseCategories,
    incomeCategories,
    isLoading,
    getCategoryById,
    getCategoryByCode,
  };
};
