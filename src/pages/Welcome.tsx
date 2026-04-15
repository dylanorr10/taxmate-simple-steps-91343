import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const platforms = [
  { id: "uber", label: "Uber / Uber Eats", emoji: "🚗" },
  { id: "deliveroo", label: "Deliveroo", emoji: "🛵" },
  { id: "amazon_flex", label: "Amazon Flex", emoji: "📦" },
  { id: "evri", label: "Evri / Parcelforce", emoji: "📬" },
  { id: "dpd_yodel", label: "DPD / Yodel", emoji: "🚚" },
  { id: "just_eat", label: "Just Eat / Stuart", emoji: "🍔" },
  { id: "other", label: "Other Platform", emoji: "📋" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      // Store selected platforms for onboarding to pick up
      sessionStorage.setItem("selectedPlatforms", JSON.stringify(selected));
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Welcome to Reelin! 🚗
          </h1>
          <p className="text-xl text-muted-foreground">
            Tax tracking built for delivery drivers
          </p>
        </div>

        <Card className="p-6 shadow-card flex-1 flex flex-col border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Which platforms do you deliver for?
            </h2>
            <p className="text-muted-foreground text-lg">
              Select all that apply — we'll personalise your experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 flex-1">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 relative ${
                  selected.includes(platform.id)
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {selected.includes(platform.id) && (
                  <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary" />
                )}
                <div className="text-5xl mb-3">{platform.emoji}</div>
                <div className="text-sm font-semibold text-foreground">
                  {platform.label}
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
          Track mileage, claim expenses, and stay HMRC-ready 🎯
        </p>
      </div>
    </div>
  );
};

export default Welcome;
