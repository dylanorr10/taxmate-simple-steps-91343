import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { Car, Home, Calculator, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SimplifiedExpensesSettings = () => {
  const { profile, updateProfile, isUpdating } = useProfile();

  return (
    <div className="space-y-6">
      {/* Mileage Method Election */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-muted-foreground" />
          <Label className="text-base font-medium">Vehicle Expenses Method</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Once you choose a method for a vehicle, you must use the same method for that vehicle for as long as you use it for your business.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how to calculate vehicle expense deductions
        </p>
        <RadioGroup
          value={profile?.mileage_method || 'simplified'}
          onValueChange={(value) => updateProfile({ mileage_method: value })}
          disabled={isUpdating}
          className="grid gap-3"
        >
          <Label
            htmlFor="mileage-simplified"
            className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="simplified" id="mileage-simplified" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Simplified Mileage</p>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use HMRC flat rates: 45p/mile (first 10,000), then 25p/mile
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">No receipts needed</Badge>
                <Badge variant="outline" className="text-xs">Easy tracking</Badge>
              </div>
            </div>
          </Label>
          <Label
            htmlFor="mileage-actual"
            className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="actual" id="mileage-actual" className="mt-1" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Actual Costs</p>
              <p className="text-sm text-muted-foreground mt-1">
                Track fuel, insurance, repairs, and depreciation separately
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Requires receipts</Badge>
                <Badge variant="outline" className="text-xs">May claim more</Badge>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Home Office Method Election */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          <Label className="text-base font-medium">Home Office Expenses Method</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>If using actual costs, you'll need to calculate the business proportion of your household expenses.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how to calculate work-from-home deductions
        </p>
        <RadioGroup
          value={profile?.home_office_method || 'simplified'}
          onValueChange={(value) => updateProfile({ home_office_method: value })}
          disabled={isUpdating}
          className="grid gap-3"
        >
          <Label
            htmlFor="home-simplified"
            className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="simplified" id="home-simplified" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Simplified Flat Rate</p>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                HMRC rates based on monthly hours worked from home
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">£10</p>
                  <p className="text-muted-foreground">25-50 hrs</p>
                </div>
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">£18</p>
                  <p className="text-muted-foreground">51-100 hrs</p>
                </div>
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">£26</p>
                  <p className="text-muted-foreground">101+ hrs</p>
                </div>
              </div>
            </div>
          </Label>
          <Label
            htmlFor="home-actual"
            className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="actual" id="home-actual" className="mt-1" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Actual Costs (Proportion)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Calculate business % of rent, utilities, broadband, etc.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Requires records</Badge>
                <Badge variant="outline" className="text-xs">May claim more</Badge>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Info callout */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Calculator className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">How simplified expenses work</p>
            <p className="text-muted-foreground">
              HMRC's simplified expense rates let you claim fixed amounts without keeping detailed receipts. 
              This is often easier and can result in similar or better deductions for most sole traders.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
