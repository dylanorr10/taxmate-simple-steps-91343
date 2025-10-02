import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Onboarding = () => {
  const navigate = useNavigate();
  const [income, setIncome] = useState([50000]);
  const [businessName, setBusinessName] = useState("");
  const [paymentType, setPaymentType] = useState<string | null>(null);

  const handleComplete = () => {
    navigate("/dashboard");
  };

  const formatIncome = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMTDMessage = () => {
    if (income[0] >= 30000) {
      return {
        text: "You'll need MTD compliance by April 2026",
        color: "text-warning",
      };
    }
    return {
      text: "MTD won't apply to you yet, but we'll keep you ready!",
      color: "text-success",
    };
  };

  const paymentTypes = [
    { id: "cash", label: "Mainly Cash", emoji: "💵" },
    { id: "bank", label: "Bank Transfer", emoji: "🏦" },
    { id: "both", label: "Both", emoji: "💳" },
  ];

  const mtdMessage = getMTDMessage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Let's Get Your Taxes Sorted
          </h1>
          <p className="text-lg text-muted-foreground">
            Just a few quick questions
          </p>
        </div>

        <Card className="p-6 shadow-lg space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-name" className="text-base font-semibold">
                What's your business called?
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Your name is fine if you don't have a business name
              </p>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Dave's Electrical Services"
                className="h-12 text-base"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                About how much do you earn in a good year?
              </Label>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatIncome(income[0])}
                  </div>
                  <div className={`text-sm font-medium mt-2 ${mtdMessage.color}`}>
                    {mtdMessage.text}
                  </div>
                </div>
                <Slider
                  value={income}
                  onValueChange={setIncome}
                  min={10000}
                  max={100000}
                  step={5000}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>£10k</span>
                  <span>£100k</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                How do you mainly get paid?
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {paymentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPaymentType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${
                      paymentType === type.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="text-3xl mb-1">{type.emoji}</div>
                    <div className="text-xs font-medium text-foreground">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-success/10 border-success/20">
          <p className="text-center text-success font-medium">
            ✨ We'll help you track everything properly - no stress!
          </p>
        </Card>

        <Button
          size="xl"
          onClick={handleComplete}
          disabled={!businessName || !paymentType}
          className="w-full"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
