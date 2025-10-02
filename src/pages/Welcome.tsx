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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome to TaxMate! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Finally, tax software that speaks your language!
          </p>
        </div>

        <Card className="p-6 shadow-lg flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              What kind of work do you do?
            </h2>
            <p className="text-muted-foreground">
              This helps us tailor TaxMate to your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 flex-1">
            {professions.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setSelected(prof.id)}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                  selected === prof.id
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="text-4xl mb-2">{prof.emoji}</div>
                <div className="text-sm font-semibold text-foreground">
                  {prof.label}
                </div>
              </button>
            ))}
          </div>

          <Button
            size="xl"
            onClick={handleContinue}
            disabled={!selected}
            className="w-full"
          >
            Continue
          </Button>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          We'll help you get MTD ready with plenty of time to spare
        </p>
      </div>
    </div>
  );
};

export default Welcome;
