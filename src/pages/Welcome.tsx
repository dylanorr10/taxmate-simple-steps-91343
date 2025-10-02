import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hammer, Car, Scissors, Store, FileText } from "lucide-react";

const professions = [
  { id: "trades", label: "Trades", icon: Hammer, emoji: "🔨" },
  { id: "delivery", label: "Delivery", icon: Car, emoji: "🚗" },
  { id: "services", label: "Services", icon: Scissors, emoji: "✂️" },
  { id: "shop", label: "Shop", icon: Store, emoji: "🏪" },
  { id: "other", label: "Other", icon: FileText, emoji: "📋" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent">
            Welcome to TaxMate! 👋
          </h1>
          <p className="text-xl text-foreground font-medium">
            Finally, tax software that speaks your language!
          </p>
        </div>

        <Card className="p-6 shadow-primary flex-1 flex flex-col bg-gradient-to-br from-white to-primary/5 border-primary/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What kind of work do you do?
            </h2>
            <p className="text-muted-foreground text-lg">
              This helps us tailor TaxMate to your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 flex-1">
            {professions.map((prof, idx) => {
              const gradients = ['gradient-success', 'gradient-accent', 'gradient-secondary', 'gradient-primary', 'from-info/80 to-accent/80 bg-gradient-to-br'];
              return (
                <button
                  key={prof.id}
                  onClick={() => setSelected(prof.id)}
                  className={`p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                    selected === prof.id
                      ? `${gradients[idx]} text-white border-0 shadow-primary`
                      : "border-border bg-card hover:border-primary/50 shadow-card"
                  }`}
                >
                  <div className="text-5xl mb-3">{prof.emoji}</div>
                  <div className={`text-sm font-bold ${selected === prof.id ? 'text-white' : 'text-foreground'}`}>
                    {prof.label}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            size="xl"
            onClick={handleContinue}
            disabled={!selected}
            className="w-full gradient-accent text-white border-0 shadow-accent text-lg h-14 disabled:opacity-50"
          >
            Continue
          </Button>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          We'll help you get MTD ready with plenty of time to spare 🎯
        </p>
      </div>
    </div>
  );
};

export default Welcome;
