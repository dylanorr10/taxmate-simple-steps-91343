import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ExpandableSection } from "./ExpandableSection";
import { HelpTooltip } from "./HelpTooltip";

interface MTDGaugeProps {
  score: number;
}

const MTDGauge = ({ score }: MTDGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [score]);

  const getMessage = () => {
    if (score >= 80) return "Looking brilliant! 🎉";
    if (score >= 50) return "You're getting there!";
    return "Let's build this together";
  };

  return (
    <Card className="p-6 shadow-card hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            <HelpTooltip
              term="MTD Readiness"
              explanation="Making Tax Digital (MTD) is HMRC's requirement to keep digital tax records and submit VAT returns using compatible software. Your readiness score shows how well your records meet these requirements."
              icon="📊"
              tooltipId="mtd"
            />
          </div>
          <div className="font-bold text-2xl">{animatedScore}% Ready</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Next submission</div>
          <div className="text-base font-bold text-foreground">6 weeks</div>
        </div>
      </div>
      
      <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-4 rounded-full bg-gradient-to-r from-accent to-success transition-all duration-1000 ease-out" 
          style={{ width: `${animatedScore}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{getMessage()}</p>
        {score >= 80 && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">All set!</span>
          </div>
        )}
        {score < 80 && (
          <Link to="/settings">
            <Button size="sm" variant="outline">
              Complete Setup
            </Button>
          </Link>
        )}
      </div>

      <ExpandableSection title="What is MTD readiness?">
        <p className="leading-relaxed mb-3">
          Making Tax Digital (MTD) requires you to keep digital records and submit VAT returns 
          using compatible software. Your readiness score reflects:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Complete business details</li>
          <li>HMRC connection status</li>
          <li>VAT registration</li>
          <li>Transaction categorization</li>
        </ul>
      </ExpandableSection>
    </Card>
  );
};

export default MTDGauge;
