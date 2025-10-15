import { LucideIcon } from "lucide-react";

interface StepCardProps {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
}

export const StepCard = ({ number, icon: Icon, title, description, isLast }: StepCardProps) => {
  return (
    <div className="relative flex flex-col items-center text-center space-y-4 group">
      {/* Connecting line */}
      {!isLast && (
        <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 -z-10" />
      )}
      
      {/* Step number badge */}
      <div className="relative">
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 group-hover:border-primary transition-all duration-300 group-hover:scale-110">
          <Icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-primary">
          {number}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-xs">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
