import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const ExpandableSection = ({ title, children, defaultExpanded = false }: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-t border-border pt-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors tap-feedback"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="mt-3 text-sm text-muted-foreground animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
