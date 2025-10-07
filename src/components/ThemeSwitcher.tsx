import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Check } from "lucide-react";

const ThemeSwitcher = () => {
  const { currentPalette, setPalette, palettes } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Color Palette</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a color scheme that suits your style
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {palettes.map((palette) => {
          const isActive = currentPalette.id === palette.id;
          
          return (
            <Card
              key={palette.id}
              onClick={() => setPalette(palette.id)}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg relative ${
                isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex gap-2 h-12">
                  <div
                    className="flex-1 rounded-md transition-all"
                    style={{ backgroundColor: `hsl(${palette.colors.background})` }}
                    title="Background"
                  />
                  <div
                    className="flex-1 rounded-md transition-all"
                    style={{ backgroundColor: `hsl(${palette.colors.card})` }}
                    title="Card"
                  />
                  <div
                    className="flex-1 rounded-md transition-all"
                    style={{ backgroundColor: `hsl(${palette.colors.primary})` }}
                    title="Primary"
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {palette.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {palette.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
