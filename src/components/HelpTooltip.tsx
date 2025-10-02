import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  term: string;
  explanation: string;
  icon?: string;
}

export const HelpTooltip = ({ term, explanation, icon }: HelpTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
            <span className="font-medium">{term}</span>
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 bg-card border-2 border-primary/20">
          <div className="space-y-2">
            {icon && <div className="text-2xl">{icon}</div>}
            <p className="text-sm leading-relaxed text-foreground">{explanation}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
