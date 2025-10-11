import { X, Gift, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DailyTip } from "@/data/dailyTips";

interface SurpriseTipProps {
  tip: DailyTip;
  onDismiss: () => void;
}

export const SurpriseTip = ({ tip, onDismiss }: SurpriseTipProps) => {
  const getStyle = () => {
    if (tip.isBonus) {
      return {
        gradient: "from-success/20 to-success/5",
        border: "border-success/40",
        icon: <Gift className="w-6 h-6 text-success" />,
        badge: "🎁 SURPRISE BONUS",
      };
    }
    if (tip.isEasterEgg) {
      return {
        gradient: "from-warning/20 to-warning/5",
        border: "border-warning/40",
        icon: <Sparkles className="w-6 h-6 text-warning" />,
        badge: "🥚 HIDDEN DISCOVERY",
      };
    }
    if (tip.isPro) {
      return {
        gradient: "from-primary/20 to-primary/5",
        border: "border-primary/40",
        icon: <Zap className="w-6 h-6 text-primary" />,
        badge: "⚡ PRO TIP",
      };
    }
    return {
      gradient: "from-primary/10 to-primary/5",
      border: "border-primary/20",
      icon: null,
      badge: "💡 Quick Tip",
    };
  };

  const style = getStyle();

  return (
    <Card 
      className={`fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 p-5 shadow-2xl border-2 ${style.border} bg-gradient-to-br ${style.gradient} animate-in slide-in-from-bottom-5 duration-500`}
    >
      <div className="flex items-start gap-3">
        {style.icon && (
          <div className="flex-shrink-0 mt-1">
            {style.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold mb-2 tracking-wide uppercase">
            {style.badge}
          </div>
          <p className="text-sm text-foreground leading-relaxed font-medium">
            {tip.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
