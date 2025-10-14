import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calculator, FileText, Calendar, Receipt } from "lucide-react";

interface QuickRefCardProps {
  title: string;
  description: string;
  icon?: 'calculator' | 'file' | 'calendar' | 'receipt';
  onUse?: () => void;
  onDownload?: () => void;
}

const iconMap = {
  calculator: Calculator,
  file: FileText,
  calendar: Calendar,
  receipt: Receipt,
};

export const QuickRefCard = ({ title, description, icon = 'file', onUse, onDownload }: QuickRefCardProps) => {
  const Icon = iconMap[icon];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
          <div className="flex gap-2">
            {onUse && (
              <Button size="sm" onClick={onUse} className="text-xs h-8">
                Use Now
              </Button>
            )}
            {onDownload && (
              <Button size="sm" variant="outline" onClick={onDownload} className="text-xs h-8">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
