import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  annualProfit: number;
}

export const ShouldYouGoLtdPrompt = ({ annualProfit }: Props) => {
  // Show only when profit > £30k (the rough sole trader → Ltd threshold)
  if (annualProfit < 30000) return null;

  return (
    <Card className="p-6 shadow-card hover-lift border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">
            Should you go Ltd?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Your profit is around £{annualProfit.toLocaleString("en-GB", { maximumFractionDigits: 0 })}. At this level, switching from sole trader to a Limited Company can save you thousands in tax. Worth a 5-minute read.
          </p>
          <Button asChild size="sm" variant="default">
            <Link to="/learn/founder-sole-trader-vs-ltd">
              Read the lesson
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ShouldYouGoLtdPrompt;
