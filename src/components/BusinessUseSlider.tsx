import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessUseSliderProps {
  amount: number;
  businessUsePercent: number;
  onChange: (businessUsePercent: number, disallowableAmount: number) => void;
  className?: string;
}

export const BusinessUseSlider = ({ 
  amount, 
  businessUsePercent, 
  onChange,
  className 
}: BusinessUseSliderProps) => {
  const [percent, setPercent] = useState(businessUsePercent);

  useEffect(() => {
    setPercent(businessUsePercent);
  }, [businessUsePercent]);

  const handleChange = (value: number[]) => {
    const newPercent = value[0];
    setPercent(newPercent);
    const disallowable = amount * ((100 - newPercent) / 100);
    onChange(newPercent, disallowable);
  };

  const disallowableAmount = amount * ((100 - percent) / 100);
  const allowableAmount = amount * (percent / 100);
  const hasPersonalUse = percent < 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">
          Business Use
        </Label>
        <span className={cn(
          "text-sm font-semibold",
          percent === 100 ? "text-success" : "text-warning"
        )}>
          {percent}%
        </span>
      </div>
      
      <Slider
        value={[percent]}
        onValueChange={handleChange}
        max={100}
        min={0}
        step={5}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Personal use</span>
        <span>100% business</span>
      </div>

      {hasPersonalUse && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 space-y-2">
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Partial business use detected</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Allowable:</span>
              <span className="ml-1 font-medium text-success">
                £{allowableAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Disallowable:</span>
              <span className="ml-1 font-medium text-destructive">
                £{disallowableAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            The disallowable portion cannot be claimed as a business expense for tax purposes.
          </p>
        </div>
      )}

      {!hasPersonalUse && (
        <Badge variant="outline" className="text-success border-success/20 bg-success/5">
          ✓ 100% business use - fully deductible
        </Badge>
      )}
    </div>
  );
};
