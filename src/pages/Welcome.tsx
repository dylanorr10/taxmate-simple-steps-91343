import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const founderTypes = [
  { id: "saas_ai", label: "Building a SaaS / AI product", emoji: "🤖" },
  { id: "agency", label: "Agency / consultancy", emoji: "💼" },
  { id: "creator", label: "Content / creator business", emoji: "🎬" },
  { id: "ecommerce", label: "Ecommerce / DTC", emoji: "🛒" },
  { id: "freelance", label: "Freelance services", emoji: "💻" },
  { id: "other_digital", label: "Other digital business", emoji: "🚀" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      sessionStorage.setItem("founderTypes", JSON.stringify(selected));
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Welcome to Reelin 🚀
          </h1>
          <p className="text-xl text-muted-foreground">
            Your first finance hire — built for founders
          </p>
        </div>

        <Card className="p-6 shadow-card flex-1 flex flex-col border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What are you building?
            </h2>
            <p className="text-muted-foreground text-lg">
              Pick all that apply — we'll tailor the lessons and expense categories to you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 flex-1">
            {founderTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 relative ${
                  selected.includes(t.id)
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {selected.includes(t.id) && (
                  <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary" />
                )}
                <div className="text-5xl mb-3">{t.emoji}</div>
                <div className="text-sm font-semibold text-foreground">
                  {t.label}
                </div>
              </button>
            ))}
          </div>

          <Button
            size="xl"
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="w-full text-lg h-14"
          >
            Continue ({selected.length} selected)
          </Button>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Know what to claim. Know what you owe. Stay HMRC-ready while you build. 🎯
        </p>
      </div>
    </div>
  );
};

export default Welcome;
