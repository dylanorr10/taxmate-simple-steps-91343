import { useState } from "react";
import { Plus, X, FilePlus, PlusCircle, Camera, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const QuickAddFab = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const actions = [
    { icon: FilePlus, label: "Invoice", to: "/log", color: "text-primary" },
    { icon: PlusCircle, label: "Expense", to: "/log", color: "text-warning" },
    { icon: Camera, label: "Receipt", color: "text-success", onClick: () => {
      toast({ title: "Coming soon", description: "Receipt scanning coming soon!" });
      setIsExpanded(false);
    }},
    { icon: Car, label: "Mileage", to: "/mileage", color: "text-info" },
  ];

  return (
    <div className="fixed right-6 bottom-24 z-40">
      {/* Action buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mb-3 items-end animate-fade-in">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            const content = (
              <button
                onClick={action.onClick}
                className={`flex items-center gap-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pl-4 pr-5 py-3 hover:-translate-y-0.5 tap-feedback ${
                  idx === 0 ? "animate-scale-in" : ""
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm font-semibold text-foreground">{action.label}</span>
              </button>
            );

            return action.to ? (
              <Link key={action.label} to={action.to}>
                {content}
              </Link>
            ) : (
              <div key={action.label}>{content}</div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 tap-feedback hover:-translate-y-0.5 ${
          isExpanded ? "rotate-45" : ""
        }`}
        aria-label="Quick add"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
