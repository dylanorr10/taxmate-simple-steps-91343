import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Tag, Percent } from "lucide-react";
import { useState } from "react";

interface BulkActionsProps {
  selectedCount: number;
  onCategorize: (category: string) => void;
  onSetVAT: (rate: number) => void;
  onClearSelection: () => void;
}

export const BulkActions = ({ 
  selectedCount, 
  onCategorize, 
  onSetVAT, 
  onClearSelection 
}: BulkActionsProps) => {
  const [showActions, setShowActions] = useState(true);

  if (selectedCount === 0 || !showActions) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-card border-t shadow-lg p-4 flex items-center gap-3 z-40 animate-in slide-in-from-bottom">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>

        <Select onValueChange={onCategorize}>
          <SelectTrigger className="w-[140px]">
            <Tag className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="ignore">Ignore</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => onSetVAT(Number(val))}>
          <SelectTrigger className="w-[120px]">
            <Percent className="h-4 w-4 mr-2" />
            <SelectValue placeholder="VAT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0% VAT</SelectItem>
            <SelectItem value="5">5% VAT</SelectItem>
            <SelectItem value="20">20% VAT</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowActions(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
