import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHMRCCategories, HMRCCategory } from "@/hooks/useHMRCCategories";
import { 
  Package, Car, Users, Building, Wrench, Phone, Megaphone, 
  Landmark, Briefcase, MoreHorizontal, ShoppingBag, TrendingUp, PlusCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Package,
  Car,
  Users,
  Building,
  Wrench,
  Phone,
  Megaphone,
  Landmark,
  Briefcase,
  MoreHorizontal,
  ShoppingBag,
  TrendingUp,
  PlusCircle,
};

interface HMRCCategoryPickerProps {
  type: 'income' | 'expense';
  value: string | null;
  onChange: (categoryId: string | null, category: HMRCCategory | null) => void;
  className?: string;
  placeholder?: string;
}

export const HMRCCategoryPicker = ({ 
  type, 
  value, 
  onChange, 
  className,
  placeholder = "Select category..."
}: HMRCCategoryPickerProps) => {
  const { expenseCategories, incomeCategories, isLoading, getCategoryById } = useHMRCCategories();

  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const selectedCategory = getCategoryById(value);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 h-10 px-3 border rounded-md bg-muted", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  return (
    <Select 
      value={value || undefined}
      onValueChange={(val) => {
        const category = getCategoryById(val);
        onChange(val, category);
      }}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (
            <span className="flex items-center gap-2">
              {selectedCategory.icon && iconMap[selectedCategory.icon] && (
                (() => {
                  const Icon = iconMap[selectedCategory.icon];
                  return <Icon className="h-4 w-4" />;
                })()
              )}
              <span>{selectedCategory.display_name}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => {
          const Icon = category.icon ? iconMap[category.icon] : null;
          return (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <div className="flex flex-col">
                  <span>{category.display_name}</span>
                  {category.description && (
                    <span className="text-xs text-muted-foreground">
                      {category.description}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
