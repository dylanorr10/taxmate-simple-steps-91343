import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessType: "",
    incomeEstimate: "",
    recordKeeping: "",
  });

  const totalScreens = 4;
  const progress = ((currentScreen + 1) / totalScreens) * 100;

  const handleNext = () => {
    if (currentScreen < totalScreens - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };


  // Screen 1: Basic Info
  const BasicInfoScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 pt-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            First, let's meet you
          </h2>
          <p className="text-muted-foreground">
            We'll use this to personalize your experience
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              What's your name?
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="e.g., Sarah Johnson"
              className="h-12 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="your@email.com"
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              We'll send you important updates and reminders
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Create a password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              placeholder="••••••••"
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              At least 8 characters
            </p>
          </div>

          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Why we need this
                </p>
                <p className="text-xs text-muted-foreground">
                  Your email helps us send deadline reminders and keep your
                  account secure. We never spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <div className="flex space-x-3">
          <button
            onClick={handleBack}
            className="px-6 py-3.5 border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              !formData.name || !formData.email || !formData.password
            }
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Screen 2: Business Type
  const BusinessTypeScreen = () => {
    const businessTypes = [
      {
        id: "trades",
        label: "Trades & Manual Work",
        icon: "🔧",
        examples: "Electrician, Plumber, Builder",
      },
      {
        id: "creative",
        label: "Creative & Tech",
        icon: "💻",
        examples: "Designer, Developer, Photographer",
      },
      {
        id: "professional",
        label: "Professional Services",
        icon: "💼",
        examples: "Consultant, Accountant, Tutor",
      },
      {
        id: "health",
        label: "Health & Beauty",
        icon: "💆",
        examples: "Trainer, Hairdresser, Therapist",
      },
      {
        id: "transport",
        label: "Transport & Delivery",
        icon: "🚗",
        examples: "Taxi, Courier, Delivery",
      },
      {
        id: "other",
        label: "Something Else",
        icon: "✨",
        examples: "Tell us what you do",
      },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 px-6 pt-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What do you do?
            </h2>
            <p className="text-muted-foreground">
              This helps us give you relevant tax tips
            </p>
          </div>

          <div className="space-y-3">
            {businessTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => updateFormData("businessType", type.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  formData.businessType === type.id
                    ? "border-accent bg-accent/5 shadow-md"
                    : "border-border hover:border-accent/50 bg-card"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{type.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {type.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {type.examples}
                    </p>
                  </div>
                  {formData.businessType === type.id && (
                    <CheckCircle className="w-6 h-6 text-accent" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="px-6 py-3.5 border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.businessType}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Screen 3: Income & Record Keeping
  const IncomeRecordsScreen = () => {
    const incomeRanges = [
      {
        id: "under20k",
        label: "Under £20,000",
        description: "MTD from April 2028",
      },
      {
        id: "20to30k",
        label: "£20,000 - £30,000",
        description: "MTD from April 2028",
      },
      {
        id: "30to50k",
        label: "£30,000 - £50,000",
        description: "MTD from April 2027",
      },
      {
        id: "50to85k",
        label: "£50,000 - £85,000",
        description: "MTD from April 2026",
      },
      {
        id: "over85k",
        label: "Over £85,000",
        description: "MTD from April 2026",
      },
    ];

    const recordMethods = [
      { id: "paper", label: "Paper receipts & notebooks", icon: "📝" },
      { id: "spreadsheet", label: "Excel or Google Sheets", icon: "📊" },
      { id: "software", label: "Another accounting app", icon: "💻" },
      { id: "mix", label: "A mix of methods", icon: "🔀" },
      {
        id: "nothing",
        label: "Not tracking yet (no judgment!)",
        icon: "🤷",
      },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 px-6 pt-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Let's talk money
            </h2>
            <p className="text-muted-foreground">
              Don't worry, rough estimates are fine
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                What's your yearly income roughly?
              </label>
              <div className="space-y-2">
                {incomeRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => updateFormData("incomeEstimate", range.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                      formData.incomeEstimate === range.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {range.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {range.description}
                        </p>
                      </div>
                      {formData.incomeEstimate === range.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                How do you track expenses now?
              </label>
              <div className="space-y-2">
                {recordMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => updateFormData("recordKeeping", method.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                      formData.recordKeeping === method.id
                        ? "border-accent bg-accent/5 shadow-md"
                        : "border-border hover:border-accent/50 bg-card"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{method.icon}</span>
                      <p className="font-medium text-foreground flex-1">
                        {method.label}
                      </p>
                      {formData.recordKeeping === method.id && (
                        <CheckCircle className="w-5 h-5 text-accent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="px-6 py-3.5 border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={
                !formData.incomeEstimate || !formData.recordKeeping
              }
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Almost Done!</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Screen 4: Success & Next Steps
  const SuccessScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            You're all set, {formData.name?.split(" ")[0] || "there"}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to stress-free tax management
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6 mb-6 border-2 border-accent/10">
          <h3 className="font-bold text-foreground mb-4 text-lg">
            Here's what happens next:
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-accent font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Learn the basics
                </p>
                <p className="text-sm text-muted-foreground">
                  Quick tutorials explaining tax concepts in plain English
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-accent font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Start tracking income
                </p>
                <p className="text-sm text-muted-foreground">
                  Record jobs and see your earnings grow
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-accent font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Track your expenses
                </p>
                <p className="text-sm text-muted-foreground">
                  Snap receipts and log costs to maximize deductions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border-2 border-primary/10 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Your MTD deadline reminder is set
              </p>
              <p className="text-sm text-muted-foreground">
                We'll email you before submissions are due. No more surprises!
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          Need help? Our support team is here 7 days a week
        </p>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={handleComplete}
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-lg"
        >
          <span>Go to Dashboard</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const screens = [
    <BasicInfoScreen key="basic" />,
    <BusinessTypeScreen key="business" />,
    <IncomeRecordsScreen key="income" />,
    <SuccessScreen key="success" />,
  ];

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col shadow-2xl">
      {/* Progress Bar */}
      {currentScreen > 0 && currentScreen < totalScreens && (
        <div className="px-6 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentScreen} of {totalScreens}
            </span>
            <span className="text-sm font-medium text-accent">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Screen */}
      <div className="flex-1 overflow-hidden">{screens[currentScreen]}</div>
    </div>
  );
};

export default Onboarding;
