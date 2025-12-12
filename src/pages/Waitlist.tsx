import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Waitlist = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Capture UTM params
  const utmSource = searchParams.get("utm_source") || null;
  const utmCampaign = searchParams.get("utm_campaign") || null;
  const utmMedium = searchParams.get("utm_medium") || null;

  useEffect(() => {
    // Fetch waitlist count
    const fetchCount = async () => {
      const { data, error } = await supabase.rpc('get_waitlist_count');
      if (!error && data) {
        setWaitlistCount(data);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .insert({
          email: email.trim().toLowerCase(),
          profession_interest: profession || null,
          utm_source: utmSource,
          utm_campaign: utmCampaign,
          utm_medium: utmMedium,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already on the waitlist!");
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success("You're on the list! 🎉");
      }
    } catch (error) {
      console.error("Waitlist signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[hsl(200,16%,24%)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white/5 border-white/10 p-8 text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're on the list! 🎉</h1>
          <p className="text-white/70 mb-6">
            We'll email you when Reelin is ready. Keep an eye on your inbox for early access and your free UK expenses checklist.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
            <p className="text-primary text-sm">
              <Sparkles className="h-4 w-4 inline mr-2" />
              Want to jump the queue? Share Reelin with a friend!
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(200,16%,24%)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="bg-white/5 border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/logo.jpg" alt="Reelin" className="h-10 w-10 rounded-full" />
              <span className="text-2xl font-bold text-primary">Reelin</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h1>
            <p className="text-white/70">
              Be the first to know when Reelin launches. Get early access + a free UK expenses checklist.
            </p>
          </div>

          {waitlistCount !== null && waitlistCount > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-6 flex items-center justify-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">
                {waitlistCount.toLocaleString()} business owners already waiting
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession" className="text-white">What best describes you? (optional)</Label>
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole-trader">Sole Trader</SelectItem>
                  <SelectItem value="limited-company">Limited Company Owner</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="side-hustle">Side Hustle</SelectItem>
                  <SelectItem value="thinking-about-it">Thinking About Starting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join the Waitlist"
              )}
            </Button>
          </form>

          <p className="text-xs text-white/40 text-center mt-6">
            We'll never spam you. Unsubscribe anytime.
          </p>
        </Card>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            No spam
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Unsubscribe anytime
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Free checklist
          </span>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
