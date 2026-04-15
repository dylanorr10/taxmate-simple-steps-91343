import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface MileageStatsCardProps {
  totalMiles: number;
  totalDeduction: number;
}

const RATE_DROP_THRESHOLD = 10000;
const HIGH_RATE = 0.45;
const LOW_RATE = 0.25;

const MileageStatsCard = ({ totalMiles, totalDeduction }: MileageStatsCardProps) => {
  const milesUntilRateDrop = useMemo(() => {
    return Math.max(0, RATE_DROP_THRESHOLD - totalMiles);
  }, [totalMiles]);

  const rateDropped = totalMiles >= RATE_DROP_THRESHOLD;
  const progressPct = Math.min(100, (totalMiles / RATE_DROP_THRESHOLD) * 100);

  return (
    <Card className="p-6 shadow-card hover-lift animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Mileage This Year</h3>
        </div>
        <Link to="/mileage" className="text-sm text-primary font-medium hover:underline">
          Log trip
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-3xl font-bold text-foreground">{totalMiles.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">miles tracked</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-success">£{totalDeduction.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">deduction earned</div>
        </div>
      </div>

      {/* Rate drop progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {rateDropped ? "Rate dropped to 25p/mile" : `${milesUntilRateDrop.toLocaleString()} miles until rate drops`}
          </span>
          <span className="font-medium text-foreground">
            {rateDropped ? "25p/mile" : "45p/mile"}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${rateDropped ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>10,000 miles</span>
        </div>
      </div>
    </Card>
  );
};

export default MileageStatsCard;
