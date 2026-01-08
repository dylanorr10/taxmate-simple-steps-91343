import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHomeOfficeClaims, calculateFlatRate, HMRC_HOME_OFFICE_RATES } from "@/hooks/useHomeOfficeClaims";
import { format, startOfMonth, subMonths, isSameMonth } from "date-fns";
import { Home, Plus, Trash2, TrendingUp, Clock, Calendar, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const HomeOfficeCalculator = () => {
  const { claims, isLoading, addClaim, isAdding, deleteClaim, isDeleting, taxYearTotals, last12Months } = useHomeOfficeClaims();
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [hoursWorked, setHoursWorked] = useState<string>("");
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickHours, setQuickHours] = useState<Record<string, string>>({});

  const previewRate = useMemo(() => {
    const hours = parseInt(hoursWorked) || 0;
    return calculateFlatRate(hours);
  }, [hoursWorked]);

  const handleAddClaim = () => {
    const hours = parseInt(hoursWorked);
    if (!hours || hours < 0) return;
    
    addClaim({
      claim_month: selectedMonth,
      hours_worked: hours,
    });
    setHoursWorked("");
  };

  const handleQuickEntry = (month: Date) => {
    const key = format(month, 'yyyy-MM');
    const hours = parseInt(quickHours[key]);
    if (!hours || hours < 0) return;
    
    addClaim({
      claim_month: month,
      hours_worked: hours,
    });
    setQuickHours(prev => ({ ...prev, [key]: "" }));
  };

  const currentTaxYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const currentYearTotal = taxYearTotals[currentTaxYear] || { totalDeduction: 0, monthsClaimed: 0 };

  const getClaimForMonth = (month: Date) => {
    return claims.find(c => isSameMonth(new Date(c.claim_month), month));
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Tax Year {currentTaxYear}/{currentTaxYear + 1}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">£{currentYearTotal.totalDeduction.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{currentYearTotal.monthsClaimed} months claimed</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Max Annual</span>
          </div>
          <p className="text-2xl font-bold text-foreground">£312</p>
          <p className="text-xs text-muted-foreground">12 × £26/month</p>
        </Card>
      </div>

      {/* Add Single Claim */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Log Home Office Hours</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Month</Label>
            <Select
              value={format(selectedMonth, 'yyyy-MM')}
              onValueChange={(v) => setSelectedMonth(new Date(v + '-01'))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {last12Months.map((month) => (
                  <SelectItem key={format(month, 'yyyy-MM')} value={format(month, 'yyyy-MM')}>
                    {format(month, 'MMMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Hours worked from home</Label>
            <Input
              type="number"
              placeholder="e.g. 80"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              min={0}
              max={744}
            />
          </div>
        </div>

        {/* Rate Preview */}
        {parseInt(hoursWorked) > 0 && (
          <div className={cn(
            "p-3 rounded-lg border",
            previewRate > 0 ? "bg-success/10 border-success/20" : "bg-muted border-border"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {previewRate > 0 ? `You can claim £${previewRate}` : 'Minimum 25 hours required'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {parseInt(hoursWorked) >= 101 ? '101+ hours = £26' :
                   parseInt(hoursWorked) >= 51 ? '51-100 hours = £18' :
                   parseInt(hoursWorked) >= 25 ? '25-50 hours = £10' :
                   `Need ${25 - parseInt(hoursWorked)} more hours`}
                </p>
              </div>
              {previewRate > 0 && (
                <Badge className="bg-success text-success-foreground">
                  HMRC Rate
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleAddClaim}
          disabled={!hoursWorked || parseInt(hoursWorked) < 25 || isAdding}
          className="w-full"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Claim
            </>
          )}
        </Button>
      </Card>

      {/* Quick Entry Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowQuickEntry(!showQuickEntry)}
        className="w-full"
      >
        <Clock className="w-4 h-4 mr-2" />
        {showQuickEntry ? 'Hide' : 'Show'} Quick Entry for All Months
      </Button>

      {/* Quick Entry Grid */}
      {showQuickEntry && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Quickly log hours for multiple months at once
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {last12Months.map((month) => {
              const key = format(month, 'yyyy-MM');
              const existingClaim = getClaimForMonth(month);
              
              return (
                <div 
                  key={key} 
                  className={cn(
                    "p-3 rounded-lg border",
                    existingClaim ? "bg-success/5 border-success/20" : "border-border"
                  )}
                >
                  <p className="text-xs font-medium text-foreground mb-2">
                    {format(month, 'MMM yyyy')}
                  </p>
                  {existingClaim ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-success">£{existingClaim.calculated_deduction}</p>
                        <p className="text-xs text-muted-foreground">{existingClaim.hours_worked}hrs</p>
                      </div>
                      <Check className="w-4 h-4 text-success" />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="hrs"
                        value={quickHours[key] || ''}
                        onChange={(e) => setQuickHours(prev => ({ ...prev, [key]: e.target.value }))}
                        className="h-8 text-sm"
                        min={0}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickEntry(month)}
                        disabled={!quickHours[key] || parseInt(quickHours[key]) < 25 || isAdding}
                        className="h-8 px-2"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Claims History */}
      {claims.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Recent Claims</h3>
          <div className="space-y-2">
            {claims.slice(0, 6).map((claim) => (
              <div 
                key={claim.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {format(new Date(claim.claim_month), 'MMMM yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {claim.hours_worked} hours worked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-semibold">
                    £{claim.calculated_deduction.toFixed(2)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteClaim(claim.id)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* HMRC Rates Reference */}
      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-medium text-foreground mb-3">HMRC Flat Rates Reference</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-background">
            <p className="text-lg font-bold text-foreground">£{HMRC_HOME_OFFICE_RATES.tier1.rate}</p>
            <p className="text-xs text-muted-foreground">25-50 hrs/month</p>
          </div>
          <div className="p-2 rounded bg-background">
            <p className="text-lg font-bold text-foreground">£{HMRC_HOME_OFFICE_RATES.tier2.rate}</p>
            <p className="text-xs text-muted-foreground">51-100 hrs/month</p>
          </div>
          <div className="p-2 rounded bg-background">
            <p className="text-lg font-bold text-foreground">£{HMRC_HOME_OFFICE_RATES.tier3.rate}</p>
            <p className="text-xs text-muted-foreground">101+ hrs/month</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
