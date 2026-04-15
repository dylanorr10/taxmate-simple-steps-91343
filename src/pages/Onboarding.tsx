import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, Sparkles, Car, Bike } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getDefaultNavItems } from "@/data/navigationConfig";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    vehicleType: "",
    incomeEstimate: "",
    recordKeeping: "",
  });

  const totalScreens = 5;
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

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let experience_level = 'beginner';
      let vat_registered = false;
      
      if (formData.incomeEstimate === 'over85k') {
        experience_level = 'advanced';
        vat_registered = true;
      } else if (formData.incomeEstimate === '50to85k' || formData.incomeEstimate === '30to50k') {
        experience_level = 'intermediate';
      }

      // Retrieve selected platforms from Welcome page
      const storedPlatforms = sessionStorage.getItem("selectedPlatforms");
      const deliveryPlatforms = storedPlatforms ? JSON.parse(storedPlatforms) : [];

      const defaultNavItems = getDefaultNavItems('transport', experience_level);

      await supabase.from('profiles').update({
        business_type: 'transport',
        vehicle_type: formData.vehicleType,
        delivery_platforms: deliveryPlatforms,
        vat_registered,
        experience_level,
        nav_items: defaultNavItems,
        profile_complete: true,
        demo_mode: false
      }).eq('id', user.id);

      sessionStorage.removeItem("selectedPlatforms");

      toast({
        title: "Welcome aboard! 🚗",
        description: "Your driver account is ready. Start by logging your first trip."
      });

      navigate("/dashboard");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Screen 0: Welcome
  const WelcomeScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Welcome to Reelin 🚗
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Tax tracking built for delivery drivers
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Track Every Mile</p>
              <p className="text-sm text-muted-foreground">
                Log trips in seconds and see your tax deduction grow at 45p/mile
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-accent/5 p-4 rounded-xl border border-accent/10">
            <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Snap Fuel Receipts</p>
              <p className="text-sm text-muted-foreground">
                Photograph receipts at the pump — never lose a fuel claim again
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-secondary/5 p-4 rounded-xl border border-secondary/10">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">MTD Ready by 2026</p>
              <p className="text-sm text-muted-foreground">
                Stay compliant with Making Tax Digital — we handle the digital records
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          🔒 Your data is secure and encrypted
        </p>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>Let's Get Started</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

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
              placeholder="e.g., James"
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
              We'll send you tax deadline reminders
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
            disabled={!formData.name || !formData.email || !formData.password}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Screen 2: Vehicle Type
  const VehicleTypeScreen = () => {
    const vehicleTypes = [
      { id: "car", label: "Car", icon: "🚗", description: "Sedan, hatchback, SUV" },
      { id: "van", label: "Van", icon: "🚐", description: "Transit, Sprinter, Berlingo" },
      { id: "motorbike", label: "Motorbike", icon: "🏍️", description: "Motorcycle or scooter" },
      { id: "ebike", label: "E-Bike / Bicycle", icon: "🚲", description: "Electric or pedal bike" },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 px-6 pt-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What do you deliver in?
            </h2>
            <p className="text-muted-foreground">
              This affects how we calculate your mileage deductions
            </p>
          </div>

          <div className="space-y-3">
            {vehicleTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => updateFormData("vehicleType", type.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  formData.vehicleType === type.id
                    ? "border-accent bg-accent/5 shadow-md"
                    : "border-border hover:border-accent/50 bg-card"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{type.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                  </div>
                  {formData.vehicleType === type.id && (
                    <CheckCircle className="w-6 h-6 text-accent" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Mileage rates
                </p>
                <p className="text-xs text-muted-foreground">
                  Cars & vans: 45p/mile (first 10,000), then 25p/mile. Motorcycles: 24p/mile. Bicycles: 20p/mile.
                </p>
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
              disabled={!formData.vehicleType}
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
      { id: "under20k", label: "Under £20,000", description: "MTD from April 2028" },
      { id: "20to30k", label: "£20,000 - £30,000", description: "MTD from April 2028" },
      { id: "30to50k", label: "£30,000 - £50,000", description: "MTD from April 2027" },
      { id: "50to85k", label: "£50,000 - £85,000", description: "MTD from April 2026" },
      { id: "over85k", label: "Over £85,000", description: "MTD from April 2026" },
    ];

    const recordMethods = [
      { id: "paper", label: "Paper receipts in a glovebox", icon: "📝" },
      { id: "spreadsheet", label: "Excel or Google Sheets", icon: "📊" },
      { id: "software", label: "Another accounting app", icon: "💻" },
      { id: "nothing", label: "Not tracking yet (no judgment!)", icon: "🤷" },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 px-6 pt-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Let's talk earnings
            </h2>
            <p className="text-muted-foreground">
              Rough estimates are fine — this helps us set your MTD timeline
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                What's your yearly income roughly? (across all platforms)
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
                        <p className="font-semibold text-foreground">{range.label}</p>
                        <p className="text-xs text-muted-foreground">{range.description}</p>
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
                      <p className="font-medium text-foreground flex-1">{method.label}</p>
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
              disabled={!formData.incomeEstimate || !formData.recordKeeping}
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

  // Screen 4: Success
  const SuccessScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            You're all set, {formData.name?.split(" ")[0] || "driver"}! 🚗
          </h1>
          <p className="text-lg text-muted-foreground">
            Your driver account is ready to go
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6 mb-6 border-2 border-accent/10">
          <h3 className="font-bold text-foreground mb-4 text-lg">
            Here's what to do first:
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-accent font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Log your first trip</p>
                <p className="text-sm text-muted-foreground">
                  Takes 5 seconds — start building your mileage deduction
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-accent font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Snap a fuel receipt</p>
                <p className="text-sm text-muted-foreground">
                  Next time you fill up, photograph the receipt
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-accent font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Learn the basics</p>
                <p className="text-sm text-muted-foreground">
                  5-minute lessons on what you can claim as a delivery driver
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
                We'll remind you before quarterly submissions are due
              </p>
            </div>
          </div>
        </div>
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
    <WelcomeScreen key="welcome" />,
    <BasicInfoScreen key="basic" />,
    <VehicleTypeScreen key="vehicle" />,
    <IncomeRecordsScreen key="income" />,
    <SuccessScreen key="success" />,
  ];

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col shadow-2xl">
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

      <div className="flex-1 overflow-hidden">{screens[currentScreen]}</div>
    </div>
  );
};

export default Onboarding;
