interface ProfessionBadgeProps {
  icon: string;
  label: string;
}

export const ProfessionBadge = ({ icon, label }: ProfessionBadgeProps) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-200 cursor-default shadow-sm hover:shadow-md">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
};
